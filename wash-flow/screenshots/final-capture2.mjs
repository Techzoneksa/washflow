import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  async function createContext(viewport = { width: 1440, height: 900 }) {
    const ctx = await browser.newContext({
      locale: 'ar-SA',
      timezoneId: 'Asia/Riyadh',
      viewport,
      deviceScaleFactor: 2,
    });
    return ctx;
  }

  async function snap(page, name) {
    const buf = await page.screenshot({ fullPage: false });
    const filepath = join(__dirname, name);
    fs.writeFileSync(filepath, buf);
    console.log(`  [OK] ${name} (${buf.length} bytes)`);
  }

  async function loginAndGoToServices(ctx, viewport) {
    const page = await ctx.newPage();
    page.on('pageerror', err => console.log('  [PAGE_ERR]', err.message));
    
    await page.goto(URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'owner@washflow.sa');
    await page.fill('input[type="password"]', '123456');
    await sleep(300);
    await page.click('button:has-text("تسجيل الدخول")');
    await sleep(5000);
    
    await page.goto(URL + '/services', { waitUntil: 'networkidle', timeout: 30000 });
    // Wait long enough for React hydration
    await sleep(5000);
    
    // Wait for page header title to ensure rendering
    try {
      await page.waitForSelector('h1:has-text("الخدمات والأسعار")', { timeout: 10000 });
    } catch {}
    
    return page;
  }

  // ============================
  // 1. Desktop 1440
  // ============================
  console.log('\n=== 1. Desktop 1440 ===');
  let ctx = await createContext({ width: 1440, height: 900 });
  let page = await loginAndGoToServices(ctx);
  await snap(page, 's01-services-desktop-1440.png');

  // ============================
  // 2. Tablet 768
  // ============================
  console.log('\n=== 2. Tablet 768 ===');
  let ctx2 = await createContext({ width: 768, height: 1024 });
  let page2 = await loginAndGoToServices(ctx2);
  await snap(page2, 's02-services-tablet-768.png');

  // ============================
  // 3. Mobile 390
  // ============================
  console.log('\n=== 3. Mobile 390 ===');
  let ctx3 = await createContext({ width: 390, height: 844 });
  let page3 = await loginAndGoToServices(ctx3);
  await snap(page3, 's03-services-mobile-390.png');

  // ============================
  // 4. Mobile Filters Bottom Sheet
  // ============================
  console.log('\n=== 4. Mobile Filters ===');
  // On mobile, the filter button has an SVG with class lucide-sliders-horizontal
  // Try using getByRole or text-free locator
  await page3.evaluate(() => {
    // Find the button that has SVG with sliders-horizontal class
    const btns = [...document.querySelectorAll('button')];
    const filterBtn = btns.find(b => {
      const svg = b.querySelector('svg.lucide-sliders-horizontal, svg[class*="sliders-horizontal"]');
      return !!svg && window.getComputedStyle(b).display !== 'none';
    });
    if (filterBtn) {
      console.log('Found filter button, clicking...');
      filterBtn.click();
      return 'found';
    }
    return 'not found: ' + btns.filter(b => window.getComputedStyle(b).display !== 'none').length + ' visible buttons';
  });
  await sleep(3000);
  await snap(page3, 's04-filters-bottom-sheet.png');
  await ctx3.close();

  // ============================
  // 5. Search (Desktop)
  // ============================
  console.log('\n=== 5. Search Arabic ===');
  await page.fill('input[placeholder*="بحث"]', 'سيارة صغيرة');
  await sleep(2000);
  await snap(page, 's05-search-arabic.png');

  // Clear search for next actions
  await page.fill('input[placeholder*="بحث"]', '');
  await sleep(1000);

  // ============================
  // 6. Details Drawer
  // ============================
  console.log('\n=== 6. Details Drawer ===');
  // Find visible view button in the table
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const viewBtn = btns.find(b => {
      return b.getAttribute('title') === 'عرض' && 
             b.offsetParent !== null && 
             window.getComputedStyle(b).display !== 'none';
    });
    if (viewBtn) { viewBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page, 's06-details-drawer.png');

  // Close the drawer by clicking overlay
  await page.evaluate(() => {
    const overlay = document.querySelector('[class*="fixed"] [class*="inset-0"][class*="bg-overlay"]');
    if (overlay) overlay.click();
  });
  await sleep(1500);

  // ============================
  // 7. Add Service Form
  // ============================
  console.log('\n=== 7. Add Service Form ===');
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة') && b.offsetParent !== null);
    if (addBtn) { addBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page, 's07-add-service-form.png');

  // Fill form via evaluate (inside the drawer)
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return 'no drawer';
    const inputs = [...drawer.querySelectorAll('input')];
    // nameAr
    const textInputs = inputs.filter(i => i.type === 'text' && !i.dir);
    if (textInputs[0]) { 
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(textInputs[0], 'غسيل سوبر');
      textInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
    // nameEn  
    const ltrInputs = inputs.filter(i => i.type === 'text' && i.dir === 'ltr');
    if (ltrInputs[0]) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(ltrInputs[0], 'Super Wash');
      ltrInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
    // price
    const numInputs = inputs.filter(i => i.type === 'number');
    if (numInputs[0]) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(numInputs[0], '50');
      numInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
    return 'ok';
  });
  await sleep(1000);
  await snap(page, 's07b-add-service-filled.png');

  // Save the service
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return 'no drawer';
    const btns = [...drawer.querySelectorAll('button')];
    const saveBtn = btns.find(b => b.textContent.includes('إضافة الخدمة'));
    if (saveBtn) { saveBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page, 's08-add-service-success.png');

  // ============================
  // 9. Edit Service
  // ============================
  console.log('\n=== 9. Edit Service ===');
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const editBtn = btns.find(b => b.getAttribute('title') === 'تعديل' && b.offsetParent !== null);
    if (editBtn) { editBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page, 's09-edit-service-form.png');

  // Modify price
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return 'no drawer';
    const numInputs = [...drawer.querySelectorAll('input[type="number"]')];
    if (numInputs[0]) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(numInputs[0], '55');
      numInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await sleep(1000);

  // Save edit
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return 'no drawer';
    const btns = [...drawer.querySelectorAll('button')];
    const saveBtn = btns.find(b => b.textContent.includes('حفظ التعديلات'));
    if (saveBtn) { saveBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page, 's10-edit-service-success.png');
  await ctx.close();

  // ============================
  // 10. Disable Service
  // ============================
  console.log('\n=== 10. Disable Confirmation ===');
  let ctx10 = await createContext({ width: 1440, height: 900 });
  let page10 = await loginAndGoToServices(ctx10);
  
  await page10.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const toggleBtn = btns.find(b => b.getAttribute('title') === 'تعطيل' && b.offsetParent !== null);
    if (toggleBtn) { toggleBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page10, 's11-disable-confirmation-modal.png');

  // Confirm
  await page10.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const confirmBtn = btns.find(b => b.textContent.includes('تأكيد التعطيل'));
    if (confirmBtn) { confirmBtn.click(); return 'clicked'; }
    return 'not found';
  });
  await sleep(3000);
  await snap(page10, 's12-service-disabled.png');
  await ctx10.close();

  // ============================
  // 11. No Permission (Cashier)
  // ============================
  console.log('\n=== 11. No Permission ===');
  let ctx11 = await createContext({ width: 1440, height: 900 });
  let page11 = await ctx11.newPage();
  await page11.goto(URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  await page11.fill('input[type="email"]', 'cashier@washflow.sa');
  await page11.fill('input[type="password"]', '123456');
  await sleep(300);
  await page11.click('button:has-text("تسجيل الدخول")');
  await sleep(5000);
  
  await page11.goto(URL + '/services', { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(8000);  // Extra long wait for redirect
  const currentUrl = page11.url();
  console.log('  URL after 8s:', currentUrl);
  await snap(page11, 's13-no-permission-cashier.png');
  await ctx11.close();

  await browser.close();
  console.log('\n=== ALL DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
