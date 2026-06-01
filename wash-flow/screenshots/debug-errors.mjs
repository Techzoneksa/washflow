import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: msg.type(), text: msg.text().substring(0, 200) });
    }
  });
  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', text: err.message.substring(0, 200) });
  });

  // Login
  await page.goto(URL + '/login', { waitUntil: 'networkidle' });
  await sleep(2000);
  await page.fill('input[type="email"]', 'owner@washflow.sa');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("تسجيل الدخول")');
  await sleep(5000);

  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(8000);
  
  console.log('Errors so far:', errors.length);
  errors.forEach((e, i) => console.log(i + ':', e.text));

  // Now try clicking view button
  const viewBtn = page.locator('button[title="عرض"]').first();
  console.log('\nView button:', await viewBtn.isVisible());
  
  // Click with Playwright and check if JS error occurs
  await viewBtn.click();
  await sleep(3000);
  
  console.log('Errors after click:', errors.length);
  errors.forEach((e, i) => console.log(i + ':', e.text));

  // Take screenshot
  await page.screenshot({ path: 'screenshots/debug-errors.png' });
  
  // Check if drawer is present
  const drawerCheck = await page.evaluate(() => {
    // Check for any element that might be a drawer
    const allDivs = document.querySelectorAll('div');
    for (const d of allDivs) {
      const cls = d.className || '';
      if (typeof cls === 'string' && cls.includes('z-50')) {
        return {
          cls: cls.substring(0, 100),
          children: d.children.length,
          firstChildCls: d.children[0]?.className?.substring(0, 80),
        };
      }
    }
    return null;
  });
  console.log('\nDrawer check:', JSON.stringify(drawerCheck));

  // Check what happens after clicking - is the table affected?
  const tableState = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const viewBtns = btns.filter(b => b.getAttribute('title') === 'عرض');
    return {
      count: viewBtns.length,
      firstVisible: viewBtns.length > 0 ? viewBtns[0].offsetParent !== null : false,
    };
  });
  console.log('View buttons:', JSON.stringify(tableState));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
