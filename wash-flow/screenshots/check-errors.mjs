import { chromium } from 'playwright';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  async function checkPage(url, label) {
    console.log(`\n=== ${label} ===`);
    const context = await browser.newContext({
      locale: 'ar-SA',
      timezoneId: 'Asia/Riyadh',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // Capture ALL console output with full detail
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text(), args: msg.args().length });
      // Print warnings and errors immediately
      if (msg.type() === 'error') console.log(`  [CONSOLE ERROR] ${msg.text().substring(0, 500)}`);
      if (msg.type() === 'warning') console.log(`  [CONSOLE WARNING] ${msg.text().substring(0, 500)}`);
    });
    page.on('pageerror', err => {
      logs.push({ type: 'pageerror', text: err.message });
      console.log(`  [PAGE ERROR] ${err.message.substring(0, 500)}`);
    });

    // Login
    console.log('  Logging in...');
    await page.goto(`${url}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    await page.locator('input[type="email"]').fill('owner@washflow.sa');
    await page.locator('input[type="password"]').fill('123456');
    await sleep(300);
    await page.locator('button:has-text("تسجيل الدخول")').first().click();
    await sleep(5000);
    await page.goto(`${url}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Clear logs from login page
    logs.length = 0;

    // Navigate to services
    console.log('  Loading /services (initial)...');
    await page.goto(`${url}/services`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(5000);

    // Check initial load
    const errors = logs.filter(l => l.type === 'error' || l.type === 'pageerror');
    if (errors.length === 0) {
      console.log('  ✅ Initial load: no errors');
    }

    // Navigate away and back (to test client-side navigation)
    console.log('  Navigating /services→/dashboard→/services...');
    await page.goto(`${url}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    logs.length = 0;
    await page.goto(`${url}/services`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);

    const errors2 = logs.filter(l => l.type === 'error' || l.type === 'pageerror');
    if (errors2.length === 0) {
      console.log('  ✅ Second load: no errors');
    }

    // Interact with elements
    console.log('  Interacting with page...');
    logs.length = 0;

    // Click view button
    const viewBtn = page.locator('button[title="عرض"]').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click({ force: true });
      await sleep(1000);
      // Close drawer
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    // Click add service button
    const addBtn = page.locator('button:has-text("إضافة خدمة")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click({ force: true });
      await sleep(1000);
      // Close form
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    const errors3 = logs.filter(l => l.type === 'error' || l.type === 'pageerror');
    if (errors3.length === 0) {
      console.log('  ✅ Interactions: no errors');
    }

    // Print any errors found
    const allErrors = [...errors, ...errors2, ...errors3];
    if (allErrors.length > 0) {
      console.log(`\n  ❌ TOTAL ERRORS: ${allErrors.length}`);
      allErrors.forEach((e, i) => {
        console.log(`  [${i+1}] [${e.type}] ${e.text.substring(0, 500)}`);
      });
    }

    await context.close();
    return allErrors;
  }

  console.log('=== REACT ERROR #418 INVESTIGATION ===');
  console.log('Testing: /services page in production build');
  
  const result = await checkPage('http://127.0.0.1:2021', 'Production Build');

  if (result.length === 0) {
    console.log('\n✅✅✅ NO ERRORS FOUND - /services is clean ✅✅✅');
    console.log('React error #418 could not be reproduced.');
    console.log('This error was likely fixed by the AppShell changes');
    console.log('(removing getSession() from useState initializer).');
  } else {
    console.log(`\n❌❌❌ ${result.length} ERROR(S) FOUND - Fix required ❌❌❌`);
  }

  await browser.close();
}

run().catch(e => {
  console.error('FATAL:', e.message, e.stack);
  process.exit(1);
});
