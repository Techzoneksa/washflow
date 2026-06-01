import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'ar-SA' });

  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('webpack-hmr')) return;
    console.log('  [BROWSER]', msg.type(), msg.text().substring(0, 200));
  });

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

  // Check what React internal properties exist on buttons
  const reactProps = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (!addBtn) return 'not found';
    const keys = Object.getOwnPropertyNames(addBtn).filter(k => !k.startsWith('on') && !['constructor','blur','click','focus','setAttribute','getAttribute','removeAttribute','hasAttribute','matches','closest','getBoundingClientRect','querySelector','querySelectorAll','scrollIntoView'].includes(k));
    return keys;
  });
  console.log('Button properties:', JSON.stringify(reactProps));

  // Try force click
  console.log('\nTrying force click...');
  const addBtn = page.locator('button').filter({ hasText: 'إضافة خدمة' }).first();
  await addBtn.click({ force: true });
  await sleep(2000);
  console.log('Drawer open?', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));

  // Try direct React fiber manipulation
  console.log('\nTrying React fiber access...');
  const fiberResult = await page.evaluate(() => {
    const rootEl = document.getElementById('__next');
    if (!rootEl) return 'no __next';
    const rootKeys = Object.keys(rootEl).filter(k => k.startsWith('__react'));
    return { rootKeys, hasFiber: rootKeys.length > 0 };
  });
  console.log('Fiber result:', JSON.stringify(fiberResult));

  // Try accessing React internal root
  const rootKeys2 = await page.evaluate(() => {
    return Object.keys(document).filter(k => k.startsWith('__react'));
  });
  console.log('Document React keys:', JSON.stringify(rootKeys2));

  // Try window React keys
  const winKeys = await page.evaluate(() => {
    return Object.keys(window).filter(k => k.startsWith('__react'));
  });
  console.log('Window React keys:', JSON.stringify(winKeys));

  // Check React version
  const reactVer = await page.evaluate(() => {
    try {
      const req = ['__REACT_DEVTOOLS_GLOBAL_HOOK__'];
      return 'React available';
    } catch { return 'Not available'; }
  });
  console.log('React:', reactVer);

  // Let's try to directly modify the page to simulate what we need
  // Add a service directly via mock data
  console.log('\nDirectly adding service via mock...');
  await page.evaluate(() => {
    // Access the mock-services module through window
    // Try to add a service through the browser's module system
    const script = document.createElement('script');
    script.textContent = `
      // Add a global function to trigger add
      window.__testAddService = function() {
        const event = new CustomEvent('test-add-service');
        document.dispatchEvent(event);
      };
    `;
    document.body.appendChild(script);
  });

  // Check the actual body HTML for the drawer pattern
  const drawerHtml = await page.evaluate(() => {
    // Check for any fixed/z-50 elements
    const all = document.querySelectorAll('*');
    const fixed = [];
    for (const el of all) {
      const cls = el.className || '';
      if (typeof cls === 'string' && cls.includes('fixed') && cls.includes('z-50')) {
        fixed.push(el.tagName + ': ' + cls.substring(0, 80));
      }
    }
    return fixed;
  });
  console.log('Fixed z-50 elements:', JSON.stringify(drawerHtml));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
