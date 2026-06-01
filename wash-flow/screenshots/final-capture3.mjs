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
    return await browser.newContext({
      locale: 'ar-SA', timezoneId: 'Asia/Riyadh',
      viewport, deviceScaleFactor: 2,
    });
  }

  async function snap(page, name) {
    const buf = await page.screenshot({ fullPage: false });
    fs.writeFileSync(join(__dirname, name), buf);
    console.log(`  [OK] ${name}`);
  }

  async function loginAs(page, email, role) {
    await page.goto(URL + '/login', { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', '123456');
    
    // Intercept login response and inject session directly for reliability
    await page.evaluate(({ email: e, role: r }) => {
      sessionStorage.setItem('wf_session', JSON.stringify({
        user: { email: e, password: '', name: 'مستخدم', roles: [r] },
        selectedRole: r,
        loggedInAt: new Date().toISOString(),
      }));
    }, { email, role });
    
    await page.click('button:has-text("تسجيل الدخول")');
    await sleep(3000);
  }

  async function goToServices(page) {
    await page.goto(URL + '/services', { waitUntil: 'networkidle' });
    await sleep(4000);
    try { await page.waitForSelector('h1', { timeout: 5000 }); } catch {}
  }

  // Helper: Click a button by text content or title attribute
  async function clickButton(page, matcher) {
    return page.evaluate((m) => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => {
        if (!b.offsetParent || window.getComputedStyle(b).display === 'none') return false;
        if (m.title && b.getAttribute('title') === m.title) return true;
        if (m.text && b.textContent.includes(m.text)) return true;
        return false;
      });
      if (btn) { btn.click(); return 'clicked'; }
      return 'not found';
    }, matcher);
  }

  // ============================
  // 1-3: Viewport screenshots
  // ============================
  for (const [label, viewport, filename] of [
    ['Desktop 1440', { width: 1440, height: 900 }, 's01-services-desktop-1440.png'],
    ['Tablet 768', { width: 768, height: 1024 }, 's02-services-tablet-768.png'],
    ['Mobile 390', { width: 390, height: 844 }, 's03-services-mobile-390.png'],
  ]) {
    console.log(`\n=== ${label} ===`);
    const ctx = await createContext(viewport);
    const page = await ctx.newPage();
    await loginAs(page, 'owner@washflow.sa', 'owner');
    await goToServices(page);
    await snap(page, filename);
    await ctx.close();
  }

  // ============================
  // 4. Mobile Filters BottomSheet
  // ============================
  console.log('\n=== Mobile Filters ===');
  {
    const ctx = await createContext({ width: 390, height: 844 });
    const page = await ctx.newPage();
    await loginAs(page, 'owner@washflow.sa', 'owner');
    await goToServices(page);
    
    await page.evaluate(() => {
      const svg = document.querySelector('svg.lucide-sliders-horizontal');
      if (svg) {
        const btn = svg.closest('button');
        if (btn) btn.click();
      }
    });
    await sleep(3000);
    await snap(page, 's04-filters-bottom-sheet.png');
    await ctx.close();
  }

  // ============================
  // 5. Search
  // ============================
  console.log('\n=== Search ===');
  {
    const ctx = await createContext({ width: 1440, height: 900 });
    const page = await ctx.newPage();
    await loginAs(page, 'owner@washflow.sa', 'owner');
    await goToServices(page);
    
    await page.fill('input[placeholder*="بحث"]', 'سيارة صغيرة');
    await sleep(2000);
    await snap(page, 's05-search-arabic.png');
    await ctx.close();
  }

  // ============================
  // 6-8: Interactions on one page session
  // ============================
  console.log('\n=== Details + Add + Edit ===');
  {
    const ctx = await createContext({ width: 1440, height: 900 });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('  [ERR]', e.message));
    await loginAs(page, 'owner@washflow.sa', 'owner');
    await goToServices(page);

    // 6. Details Drawer
    console.log('  6. Details Drawer');
    await clickButton(page, { title: 'عرض' });
    await sleep(3000);
    await snap(page, 's06-details-drawer.png');

    // Close drawer
    await page.evaluate(() => {
      const overlay = document.querySelector('[class*="z-50"] [class*="bg-overlay"]');
      if (overlay) overlay.click();
    });
    await sleep(1500);

    // 7. Add Service - open drawer
    console.log('  7. Add Service Form');
    await clickButton(page, { text: 'إضافة خدمة' });
    await sleep(3000);
    await snap(page, 's07-add-service-form.png');

    // Fill via Playwright fill (inside drawer)
    await page.evaluate(() => {
      const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
      if (!drawer) return;
      const inputs = [...drawer.querySelectorAll('input')];
      
      inputs.forEach(inp => {
        if (inp.type === 'text' && !inp.dir && !inp.placeholder) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(inp, 'غسيل سوبر');
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (inp.type === 'text' && inp.dir === 'ltr') {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(inp, 'Super Wash');
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (inp.type === 'number') {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(inp, inp.placeholder.includes('الدقائق') ? '30' : '50');
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    await sleep(1000);
    await snap(page, 's07b-add-service-filled.png');

    // Save
    await page.evaluate(() => {
      const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
      if (!drawer) return;
      const btn = [...drawer.querySelectorAll('button')].find(b => b.textContent.includes('إضافة الخدمة'));
      if (btn) btn.click();
    });
    await sleep(3000);
    await snap(page, 's08-add-service-success.png');

    // 9. Edit Service
    console.log('  9. Edit Service');
    await clickButton(page, { title: 'تعديل' });
    await sleep(3000);
    await snap(page, 's09-edit-service-form.png');

    // Modify price
    await page.evaluate(() => {
      const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
      if (!drawer) return;
      const nums = [...drawer.querySelectorAll('input[type="number"]')];
      if (nums[0]) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(nums[0], '55');
        nums[0].dispatchEvent(new Event('input', { bubbles: true }));
        nums[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(1000);

    await page.evaluate(() => {
      const drawer = document.querySelector('[class*="fixed"][class*="z-50"]');
      if (!drawer) return;
      const btn = [...drawer.querySelectorAll('button')].find(b => b.textContent.includes('حفظ التعديلات'));
      if (btn) btn.click();
    });
    await sleep(3000);
    await snap(page, 's10-edit-service-success.png');

    await ctx.close();
  }

  // ============================
  // 10. Disable Modal  
  // ============================
  console.log('\n=== Disable ===');
  {
    const ctx = await createContext({ width: 1440, height: 900 });
    const page = await ctx.newPage();
    await loginAs(page, 'owner@washflow.sa', 'owner');
    await goToServices(page);

    await clickButton(page, { title: 'تعطيل' });
    await sleep(3000);
    await snap(page, 's11-disable-confirmation-modal.png');

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('تأكيد التعطيل'));
      if (btn) btn.click();
    });
    await sleep(3000);
    await snap(page, 's12-service-disabled.png');
    await ctx.close();
  }

  // ============================
  // 11. No Permission  
  // ============================
  console.log('\n=== No Permission ===');
  {
    const ctx = await createContext({ width: 1440, height: 900 });
    const page = await ctx.newPage();
    // Set session as cashier before loading
    await page.goto(URL + '/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      sessionStorage.setItem('wf_session', JSON.stringify({
        user: { email: 'cashier@washflow.sa', password: '', name: 'الكاشير', roles: ['cashier'] },
        selectedRole: 'cashier',
        loggedInAt: new Date().toISOString(),
      }));
    });
    await page.goto(URL + '/services', { waitUntil: 'networkidle' });
    await sleep(6000);
    const url = page.url();
    console.log('  URL after 6s:', url);
    if (url.includes('/no-permission') || url.includes('/pos')) {
      console.log('  Redirected successfully');
    }
    await snap(page, 's13-no-permission-cashier.png');
    await ctx.close();
  }

  await browser.close();
  console.log('\n=== ALL DONE ===');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
