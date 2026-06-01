import { chromium } from 'playwright';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const URL = 'http://127.0.0.1:2021';

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  async function login() {
    await page.goto(`${URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    await page.locator('input[type="email"]').fill('owner@washflow.sa');
    await page.locator('input[type="password"]').fill('123456');
    await sleep(300);
    await page.locator('button:has-text("تسجيل الدخول")').first().click();
    await sleep(5000);
  }

  async function testPage(path) {
    console.log(`\nTesting ${path}...`);
    errors.length = 0;
    await page.goto(`${URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    const status = await page.evaluate(() => document.title);
    if (errors.length === 0) {
      console.log(`  ✅ Loaded: "${status}", no errors`);
    } else {
      console.log(`  ❌ Errors: ${errors.length}`);
      errors.forEach(e => console.log(`     ${e.substring(0, 200)}`));
    }
    return errors.length === 0;
  }

  await login();

  let allPass = true;
  for (const path of ['/suppliers', '/purchases']) {
    const ok = await testPage(path);
    if (!ok) allPass = false;
  }

  // Test permissions: cashier should be blocked
  console.log('\nTesting cashier permissions...');
  await page.evaluate(() => sessionStorage.removeItem('wf_session'));
  await sleep(500);
  await page.goto(`${URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  await page.locator('input[type="email"]').fill('cashier@washflow.sa');
  await page.locator('input[type="password"]').fill('123456');
  await sleep(300);
  await page.locator('button:has-text("تسجيل الدخول")').first().click();
  await sleep(5000);

  for (const path of ['/suppliers', '/purchases']) {
    errors.length = 0;
    await page.goto(`${URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    const url = page.url();
    if (url.includes('/no-permission')) {
      console.log(`  ✅ Cashier blocked from ${path}: redirects to /no-permission`);
    } else {
      console.log(`  ❌ Cashier NOT blocked from ${path}: at ${url}`);
      allPass = false;
    }
  }

  await browser.close();
  console.log(`\n${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  process.exit(allPass ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(1); });
