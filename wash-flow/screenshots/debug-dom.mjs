import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'ar-SA' });

  // Login as owner
  await page.goto(URL + '/login', { waitUntil: 'networkidle' });
  await sleep(3000);
  await page.fill('input[type="email"]', 'owner@washflow.sa');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("تسجيل الدخول")');
  await sleep(5000);

  // Go to services
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Check desktop buttons
  const buttons = await page.evaluate(() => {
    return [...document.querySelectorAll('button')].map(b => ({
      text: b.textContent.trim().substring(0, 50),
      cls: (b.className || '').substring(0, 60),
      visible: b.offsetParent !== null,
    }));
  });
  console.log('DESKTOP BUTTONS:');
  buttons.forEach((b, i) => console.log(i + ':', JSON.stringify(b.text), 'visible:', b.visible));

  // Switch to mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(2000);

  const mobileBtns = await page.evaluate(() => {
    return [...document.querySelectorAll('button')].map(b => ({
      text: b.textContent.trim().substring(0, 50),
      visible: b.offsetParent !== null,
    }));
  });
  console.log('\nMOBILE BUTTONS:');
  mobileBtns.forEach((b, i) => console.log(i + ':', JSON.stringify(b.text), 'visible:', b.visible));

  // Check for filter button specifically
  const filterBtn = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const found = btns.find(b => b.querySelector('.lucide-sliders-horizontal') || 
      (b.innerHTML || '').includes('sliders'));
    if (found) return { text: found.textContent.trim().substring(0, 50), html: found.innerHTML.substring(0, 100) };
    return null;
  });
  console.log('\nFilter button:', JSON.stringify(filterBtn));

  // Check drawer structure - open add form
  await page.setViewportSize({ width: 1440, height: 900 });
  await sleep(1000);

  // Click add service via evaluate
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (addBtn) addBtn.click();
  });
  await sleep(2000);

  // Check inputs inside drawer
  const inputs = await page.evaluate(() => {
    return [...document.querySelectorAll('input')].map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      dir: i.dir,
      visible: i.offsetParent !== null,
      label: i.closest('div')?.previousElementSibling?.textContent?.trim().substring(0, 30) || '',
    }));
  });
  console.log('\nINPUTS:');
  inputs.forEach((i, idx) => console.log(idx + ':', JSON.stringify(i)));

  // Check selects
  const selects = await page.evaluate(() => {
    return [...document.querySelectorAll('select')].map(s => ({
      visible: s.offsetParent !== null,
      options: [...s.options].map(o => o.text).join(', ').substring(0, 100),
    }));
  });
  console.log('\nSELECTS:', selects.length);
  selects.forEach((s, i) => console.log(i + ':', JSON.stringify(s)));

  // Check for modals/drawers
  const overlays = await page.evaluate(() => {
    return [...document.querySelectorAll('[class*="fixed"][class*="inset-0"]')].map(el => ({
      tag: el.tagName,
      cls: (el.className || '').substring(0, 80),
      children: el.children.length,
    }));
  });
  console.log('\nOVERLAYS:');
  overlays.forEach((o, i) => console.log(i + ':', JSON.stringify(o)));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
