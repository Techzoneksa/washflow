import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = 'http://127.0.0.1:2021';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('[1] Launching Playwright browser...');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Suppress console errors from the page
  page.on('pageerror', err => console.log('  [PAGE ERROR]', err.message));

  async function snap(name) {
    const buf = await page.screenshot({ fullPage: false });
    const filepath = join(__dirname, name);
    fs.writeFileSync(filepath, buf);
    console.log(`  [SNAP] ${name} (${buf.length} bytes)`);
  }

  async function click(text) {
    const btn = page.locator('button', { hasText: text }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click({ force: true }); return 'ok'; }
    return `nf: ${text}`;
  }

  async function resize(w, h) {
    await page.setViewportSize({ width: w, height: h });
    await sleep(1000);
  }

  async function closeAllOverlays() {
    // Press Escape multiple times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(200);
    }
    // Click any visible fixed overlays
    const overlays = page.locator('.fixed.inset-0.z-50, .fixed.inset-0\\ z-50');
    if (await overlays.first().isVisible().catch(() => false)) {
      await overlays.first().click({ force: true }).catch(() => {});
      await sleep(300);
    }
  }

  async function loginAs(email) {
    console.log(`  Navigating to login...`);
    await page.goto(`${URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('123456');
    await sleep(500);
    await click('تسجيل الدخول');
    await sleep(5000);
  }

  // ===== 1. LOGIN AS OWNER =====
  console.log('\n[2] Login as owner...');
  await loginAs('owner@washflow.sa');
  
  // Navigate to /services
  console.log('  Navigating to /services...');
  await page.goto(`${URL}/services`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);

  // ===== DESKTOP 1440 =====
  console.log('\n[3] Desktop 1440...');
  await resize(1440, 900);
  await sleep(2000);
  await snap('s01-services-desktop-1440.png');

  // ===== TABLET 768 =====
  console.log('\n[4] Tablet 768...');
  await resize(768, 1024);
  await sleep(2000);
  await snap('s02-services-tablet-768.png');

  // ===== MOBILE 390 =====
  console.log('\n[5] Mobile 390...');
  await resize(390, 844);
  await sleep(2000);
  await snap('s03-services-mobile-390.png');

  // ===== FILTERS BOTTOM SHEET =====
  console.log('\n[6] Filters Bottom Sheet...');
  const filterBtn = page.locator('button').filter({ has: page.locator('svg.lucide-sliders-horizontal') }).first();
  if (await filterBtn.isVisible()) {
    await filterBtn.click();
    await sleep(2000);
    await snap('s04-filters-bottom-sheet.png');
    await closeAllOverlays();
    await sleep(1000);
  }

  // ===== SEARCH ARABIC =====
  console.log('\n[7] Search tests...');
  await resize(1440, 900);
  await sleep(1500);
  // Search Arabic
  const searchInput = page.locator('input[placeholder*="بحث"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('سيارة صغيرة');
    await sleep(2000);
    await snap('s05-search-arabic.png');
    await searchInput.fill('');
    await sleep(1000);
  }

  // ===== DETAILS DRAWER =====
  console.log('\n[8] Details Drawer...');
  await closeAllOverlays();
  const viewBtn = page.locator('button[title="عرض"]').first();
  if (await viewBtn.isVisible()) {
    await viewBtn.click({ force: true });
    await sleep(2000);
    await snap('s06-details-drawer.png');
    await closeAllOverlays();
    await sleep(1000);
  }

  // ===== ADD SERVICE FORM =====
  console.log('\n[9] Add Service Form...');
  await closeAllOverlays();
  await click('إضافة خدمة');
  await sleep(2000);
  await snap('s07-add-service-form.png');

  // Fill the form
  const textInputs = page.locator('input[type="text"]');
  const textCount = await textInputs.count();
  if (textCount > 0) await textInputs.nth(0).fill('غسيل سوبر');
  if (textCount > 1) await textInputs.nth(1).fill('Super Wash');
  
  const numInputs = page.locator('input[type="number"]');
  const numCount = await numInputs.count();
  if (numCount > 0) await numInputs.nth(0).fill('50');
  if (numCount > 1) await numInputs.nth(1).fill('30');

  await sleep(500);
  await snap('s07b-add-service-filled.png');

  // Save
  await click('إضافة الخدمة');
  await sleep(3000);
  await snap('s08-add-service-success.png');
  await closeAllOverlays();

  // ===== EDIT SERVICE =====
  console.log('\n[10] Edit Service...');
  await closeAllOverlays();
  const editBtn = page.locator('button[title="تعديل"]').first();
  if (await editBtn.isVisible()) {
    await editBtn.click({ force: true });
    await sleep(2000);
    // Change price
    const editNumInputs = page.locator('input[type="number"]');
    if (await editNumInputs.count() > 0) await editNumInputs.nth(0).fill('55');
    await sleep(500);
    await snap('s09-edit-service-form.png');
    await click('حفظ التعديلات');
    await sleep(3000);
    await snap('s10-edit-service-success.png');
    await closeAllOverlays();
  }

  // ===== DISABLE CONFIRMATION =====
  console.log('\n[11] Disable Confirmation Modal...');
  await closeAllOverlays();
  const disableBtn = page.locator('button[title="تعطيل"]').first();
  if (await disableBtn.isVisible()) {
    await disableBtn.click({ force: true });
    await sleep(2000);
    await snap('s11-disable-confirmation-modal.png');
    await click('تأكيد التعطيل');
    await sleep(3000);
    await snap('s12-service-disabled.png');
    await closeAllOverlays();
  }

  // ===== NO PERMISSION (Cashier) =====
  console.log('\n[12] No Permission as Cashier...');
  await page.evaluate(() => sessionStorage.removeItem('wf_session'));
  await sleep(500);
  await page.goto(`${URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);
  await loginAs('cashier@washflow.sa');
  await page.goto(`${URL}/services`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);
  const currentUrl = page.url();
  console.log('  Current URL:', currentUrl);
  await snap('s13-no-permission-cashier.png');

  console.log('\n=== ALL SCREENSHOTS TAKEN ===');
  await browser.close();
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
