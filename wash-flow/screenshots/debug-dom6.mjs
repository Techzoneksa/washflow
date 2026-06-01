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
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Try all possible click methods on the add button
  const addBtn = page.locator('button').filter({ hasText: 'إضافة خدمة' }).first();

  console.log('Method 1: Playwright click()');
  await addBtn.click();
  await sleep(2000);
  console.log('  Drawer:', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));
  
  if (await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'))) {
    await page.evaluate(() => document.querySelector('.fixed.inset-0.z-50 .absolute.inset-0')?.click());
    await sleep(1000);
    console.log('  Closed');
  }

  console.log('Method 2: Native el.click()');
  await addBtn.evaluate(el => el.click());
  await sleep(2000);
  console.log('  Drawer:', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));

  if (await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'))) {
    await page.evaluate(() => document.querySelector('.fixed.inset-0.z-50 .absolute.inset-0')?.click());
    await sleep(1000);
    console.log('  Closed');
  }

  console.log('Method 3: dispatchEvent');
  await addBtn.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
  await sleep(2000);
  console.log('  Drawer:', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));

  if (await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'))) {
    await page.evaluate(() => document.querySelector('.fixed.inset-0.z-50 .absolute.inset-0')?.click());
    await sleep(1000);
    console.log('  Closed');
  }

  // Now try the view button
  console.log('\nNow testing view button (that worked before):');
  const viewBtn = page.locator('button[title="عرض"]').first();
  console.log('  exists:', await viewBtn.count() > 0);
  await viewBtn.click();
  await sleep(2000);
  console.log('  Drawer:', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));

  if (await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'))) {
    await page.evaluate(() => document.querySelector('.fixed.inset-0.z-50 .absolute.inset-0')?.click());
    await sleep(1000);
    console.log('  Closed');
  }

  // Let me try to understand WHY "عرض" works but "إضافة خدمة" doesn't
  // Maybe the issue is that "إضافة خدمة" button is inside a form or something?
  console.log('\nChecking parent elements...');
  const parentInfo = await addBtn.evaluate(el => {
    const parent = el.parentElement;
    return {
      tag: parent?.tagName,
      id: parent?.id,
      class: parent?.className?.substring(0, 100),
      parentTag: parent?.parentElement?.tagName,
      parentClass: parent?.parentElement?.className?.substring(0, 100),
    };
  });
  console.log('Parent info:', JSON.stringify(parentInfo));

  // Let me also check if the button dispatches a custom event
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('إضافة خدمة'));
    if (btn) {
      const origClick = btn.onclick;
      console.log('  onclick:', typeof origClick);
      // Add a click listener to debug
      btn.addEventListener('click', (e) => {
        console.log('  Button CLICKED:', e.type, e.bubbles, e.cancelable);
      });
    }
  });
  await sleep(500);
  
  // Click again
  await addBtn.click();
  await sleep(2000);
  console.log('  Drawer:', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
