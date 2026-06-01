import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'ar-SA' });

  async function loginAs(email) {
    await page.goto(URL + '/login', { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("تسجيل الدخول")');
    await sleep(5000);
  }

  await loginAs('owner@washflow.sa');

  // First take a screenshot BEFORE going to services
  // Just to confirm the approach works

  // Go to services
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Check what classes look like on the body/root
  const bodyClasses = await page.evaluate(() => document.body.className);
  console.log('Body classes:', bodyClasses);

  // Check if the app shell sidebar wrapper has the right classes
  const sidebarCheck = await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div')];
    const fixed = divs.filter(d => d.className.includes('fixed') && d.className.includes('inset'));
    return fixed.map(d => ({ tag: d.tagName, cls: d.className.substring(0, 120) }));
  });
  console.log('Fixed/inset divs:', JSON.stringify(sidebarCheck));

  // Click "عرض" button
  console.log('\nClicking "عرض"...');
  const viewBtn = page.locator('button[title="عرض"]').first();
  console.log('  count:', await viewBtn.count());
  if (await viewBtn.count() > 0) {
    console.log('  visible:', await viewBtn.isVisible());
    await viewBtn.click({ timeout: 5000 });
    await sleep(2000);
    
    // Check for drawer again
    const afterClick = await page.evaluate(() => {
      // Look for ANY element with 'fixed' and 'z-50' in className
      const all = document.querySelectorAll('*');
      const results = [];
      for (const el of all) {
        const cls = (el.className || '');
        if (typeof cls === 'string' && cls.includes('fixed') && cls.includes('z-50')) {
          results.push({
            tag: el.tagName,
            cls: cls.substring(0, 100),
            children: el.children.length,
            text: (el.textContent || '').substring(0, 60),
          });
        }
      }
      return results;
    });
    console.log('  Fixed z-50:', JSON.stringify(afterClick));
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/test-drawer.png' });
    console.log('  Screenshot saved');
  }

  // Now try the "إضافة خدمة" button
  console.log('\nClicking "إضافة خدمة"...');
  // Using evaluate with React to dispatch the click
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const btn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (btn) {
      btn.click();
    }
  });
  await sleep(2000);
  
  const afterAddClick = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results = [];
    for (const el of all) {
      const cls = (el.className || '');
      if (typeof cls === 'string' && cls.includes('fixed') && cls.includes('z-50')) {
        results.push({
          tag: el.tagName,
          cls: cls.substring(0, 120),
        });
      }
    }
    return results;
  });
  console.log('  Fixed z-50 after add click:', JSON.stringify(afterAddClick));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
