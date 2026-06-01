import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'ar-SA' });

  // Login
  await page.goto(URL + '/login', { waitUntil: 'networkidle' });
  await sleep(3000);
  await page.fill('input[type="email"]', 'owner@washflow.sa');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("تسجيل الدخول")');
  await sleep(5000);

  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Try clicking "إضافة خدمة" using Playwright click
  console.log('Clicking "إضافة خدمة"...');
  const addBtn = page.locator('button').filter({ hasText: 'إضافة خدمة' });
  console.log('  Button exists:', await addBtn.count() > 0);
  console.log('  Button visible:', await addBtn.first().isVisible());
  await addBtn.first().click();
  await sleep(2000);

  // Now check what's on the page
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('\nBODY TEXT (first 1000 chars):');
  console.log(bodyText);

  // Check for overlay
  const overlays = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results = [];
    for (const el of all) {
      const cls = el.className || '';
      if (typeof cls === 'string' && cls.includes('fixed') && cls.includes('inset-0')) {
        results.push({ tag: el.tagName, cls: cls.substring(0, 100), children: el.children.length });
      }
    }
    return results;
  });
  console.log('\nFIXED INSET-0 ELEMENTS:', overlays.length);
  overlays.forEach((o, i) => console.log(i + ':', JSON.stringify(o)));

  // Check all visible inputs
  const visibleInputs = await page.evaluate(() => {
    return [...document.querySelectorAll('input')].filter(i => i.offsetParent !== null).map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      value: i.value,
    }));
  });
  console.log('\nVISIBLE INPUTS:', visibleInputs.length);
  visibleInputs.forEach((i, idx) => console.log(idx + ':', JSON.stringify(i)));

  // Check for h2 with form title
  const h2s = await page.evaluate(() => {
    return [...document.querySelectorAll('h2')].map(h => h.textContent);
  });
  console.log('\nH2s:', JSON.stringify(h2s));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
