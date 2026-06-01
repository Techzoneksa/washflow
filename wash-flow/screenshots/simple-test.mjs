import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });

  // === TEST 1: Basic page load and click ===
  console.log('=== TEST 1 ===');
  let ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  let page = await ctx.newPage();

  // Set session directly to skip login
  await page.goto(URL + '/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('wf_session', JSON.stringify({
      user: { email: 'owner@washflow.sa', password: '', name: 'المالك', roles: ['owner'] },
      selectedRole: 'owner',
      loggedInAt: new Date().toISOString(),
    }));
  });
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  console.log('  Page loaded at:', page.url());
  
  // Wait various amounts and try clicking
  for (const waitTime of [2000, 5000, 10000]) {
    console.log(`\n  Waiting ${waitTime}ms before click...`);
    await sleep(waitTime);
    
    // Try Playwright click
    const viewBtn = page.locator('button[title="عرض"]').first();
    const visible = await viewBtn.isVisible();
    console.log('  Button visible:', visible);
    
    if (visible) {
      await viewBtn.click();
      await sleep(2000);
      const hasDrawer = await page.evaluate(() => {
        return document.querySelector('[class*="z-50"]') !== null;
      });
      console.log('  Drawer detected:', hasDrawer);
      
      if (hasDrawer) {
        await page.screenshot({ path: 'screenshots/test1-wait' + waitTime + '.png' });
        break;
      }
    }
  }

  await ctx.close();

  // === TEST 2: Login flow and then click ===
  console.log('\n=== TEST 2 ===');
  ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page = await ctx.newPage();

  await page.goto(URL + '/login', { waitUntil: 'networkidle' });
  await sleep(2000);
  await page.fill('input[type="email"]', 'owner@washflow.sa');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("تسجيل الدخول")');
  await sleep(3000);
  
  console.log('  After login URL:', page.url());
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(10000); // 10 second wait
  
  console.log('  Services page loaded');
  const viewBtn2 = page.locator('button[title="عرض"]').first();
  console.log('  Visible:', await viewBtn2.isVisible());
  await viewBtn2.click();
  await sleep(3000);
  
  const hasDrawer2 = await page.evaluate(() => {
    return document.querySelector('[class*="z-50"]') !== null;
  });
  console.log('  Drawer detected:', hasDrawer2);
  
  if (hasDrawer2) {
    await page.screenshot({ path: 'screenshots/test2-drawer.png' });
    console.log('  Screenshot saved');
  }

  await ctx.close();
  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
