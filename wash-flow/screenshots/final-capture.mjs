import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // We'll create a fresh page and context for each major section to avoid React state issues
  let browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  async function freshPage(viewport = { width: 1440, height: 900 }) {
    const ctx = await browser.newContext({
      locale: 'ar-SA',
      timezoneId: 'Asia/Riyadh',
      viewport,
      deviceScaleFactor: 2,
    });
    const p = await ctx.newPage();
    p.on('pageerror', err => console.log('  [PAGE_ERR]', err.message));
    return { page: p, context: ctx };
  }

  async function snap(page, name) {
    const buf = await page.screenshot({ fullPage: false });
    const filepath = join(__dirname, name);
    fs.writeFileSync(filepath, buf);
    console.log(`  [OK] ${name} (${buf.length} bytes)`);
  }

  async function loginAs(page, email) {
    await page.goto(URL + '/login', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    // Wait for the input to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', '123456');
    await sleep(300);
    await page.click('button:has-text("تسجيل الدخول")');
    await sleep(5000);
  }

  // ============================
  // 1. Desktop 1440
  // ============================
  console.log('\n=== 1. Desktop 1440 ===');
  let { page, context } = await freshPage({ width: 1440, height: 900 });
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await snap(page, 's01-services-desktop-1440.png');
  await context.close();

  // ============================
  // 2. Tablet 768
  // ============================
  console.log('\n=== 2. Tablet 768 ===');
  ({ page, context } = await freshPage({ width: 768, height: 1024 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await snap(page, 's02-services-tablet-768.png');
  await context.close();

  // ============================
  // 3. Mobile 390
  // ============================
  console.log('\n=== 3. Mobile 390 ===');
  ({ page, context } = await freshPage({ width: 390, height: 844 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await snap(page, 's03-services-mobile-390.png');
  await context.close();

  // ============================
  // 4. Mobile Filters Bottom Sheet
  // ============================
  console.log('\n=== 4. Mobile Filters ===');
  ({ page, context } = await freshPage({ width: 390, height: 844 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  // The filter button on mobile is the SlidersHorizontal icon button
  // It has no text, but has an SVG with class lucide-sliders-horizontal
  // Parent button has class "p-2.5 rounded-lg border"
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const filterBtn = btns.find(b => b.querySelector('.lucide-sliders-horizontal'));
    if (filterBtn) {
      filterBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
  await sleep(2500);
  await snap(page, 's04-filters-bottom-sheet.png');
  await context.close();

  // ============================
  // 5. Search Arabic (Desktop)
  // ============================
  console.log('\n=== 5. Search Arabic ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await page.fill('input[placeholder*="بحث"]', 'سيارة صغيرة');
  await sleep(2000);
  await snap(page, 's05-search-arabic.png');
  await context.close();

  // ============================
  // 6. Details Drawer
  // ============================
  console.log('\n=== 6. Details Drawer ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  // Click view button (first one visible on desktop)
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const viewBtn = btns.find(b => b.getAttribute('title') === 'عرض' && b.offsetParent !== null);
    if (viewBtn) viewBtn.click();
  });
  await sleep(2000);
  await snap(page, 's06-details-drawer.png');
  await context.close();

  // ============================
  // 7. Add Service Form
  // ============================
  console.log('\n=== 7. Add Service Form ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  // Click Add Service button using evaluate
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (addBtn) addBtn.click();
  });
  await sleep(2500);
  await snap(page, 's07-add-service-form.png');
  await context.close();

  // ============================
  // 8. Add Service Filled + Save Success
  // ============================
  console.log('\n=== 8. Add Service (filled) ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  // Open drawer
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (addBtn) addBtn.click();
  });
  await sleep(2500);
  // Fill form via direct DOM manipulation
  await page.evaluate(() => {
    // Find the drawer content
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return;
    const inputs = [...drawer.querySelectorAll('input')];
    // First text input = nameAr
    const textInputs = inputs.filter(i => i.type === 'text' && !i.dir);
    if (textInputs[0]) { textInputs[0].value = 'غسيل سوبر'; textInputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    // LTR input = nameEn
    const ltrInputs = inputs.filter(i => i.type === 'text' && i.dir === 'ltr');
    if (ltrInputs[0]) { ltrInputs[0].value = 'Super Wash'; ltrInputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    // Number inputs: price, duration, sortOrder
    const numInputs = inputs.filter(i => i.type === 'number');
    if (numInputs[0]) { numInputs[0].value = '50'; numInputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    if (numInputs[1]) { numInputs[1].value = '30'; numInputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await sleep(1000);
  await snap(page, 's07b-add-service-filled.png');

  // Click Save Button inside the drawer
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return;
    const btns = [...drawer.querySelectorAll('button')];
    const saveBtn = btns.find(b => b.textContent.includes('إضافة الخدمة'));
    if (saveBtn) saveBtn.click();
  });
  await sleep(3000);
  await snap(page, 's08-add-service-success.png');
  await context.close();

  // ============================
  // 9. Edit Service Form
  // ============================
  console.log('\n=== 9. Edit Service ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  // Click edit button
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const editBtn = btns.find(b => b.getAttribute('title') === 'تعديل' && b.offsetParent !== null);
    if (editBtn) editBtn.click();
  });
  await sleep(2500);
  await snap(page, 's09-edit-service-form.png');
  // Fill edited price
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return;
    const numInputs = [...drawer.querySelectorAll('input[type="number"]')];
    if (numInputs[0]) { numInputs[0].value = '55'; numInputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await sleep(1000);
  // Click save
  await page.evaluate(() => {
    const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
    if (!drawer) return;
    const btns = [...drawer.querySelectorAll('button')];
    const saveBtn = btns.find(b => b.textContent.includes('حفظ التعديلات'));
    if (saveBtn) saveBtn.click();
  });
  await sleep(3000);
  await snap(page, 's10-edit-service-success.png');
  await context.close();

  // ============================
  // 10. Disable Confirmation
  // ============================
  console.log('\n=== 10. Disable Confirmation ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'owner@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(3000);
  // Click toggle button
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const toggleBtn = btns.find(b => b.getAttribute('title') === 'تعطيل' && b.offsetParent !== null);
    if (toggleBtn) toggleBtn.click();
  });
  await sleep(2500);
  await snap(page, 's11-disable-confirmation-modal.png');

  // Confirm disable
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const confirmBtn = btns.find(b => b.textContent.includes('تأكيد التعطيل'));
    if (confirmBtn) confirmBtn.click();
  });
  await sleep(3000);
  await snap(page, 's12-service-disabled.png');
  await context.close();

  // ============================
  // 11. No Permission (Cashier)
  // ============================
  console.log('\n=== 11. No Permission ===');
  ({ page, context } = await freshPage({ width: 1440, height: 900 }));
  await loginAs(page, 'cashier@washflow.sa');
  await page.goto(URL + '/services', { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  const url = page.url();
  console.log('  Current URL:', url);
  await snap(page, 's13-no-permission-cashier.png');
  await context.close();

  await browser.close();
  console.log('\n=== ALL DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
