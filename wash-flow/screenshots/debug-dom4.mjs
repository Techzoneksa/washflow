import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'ar-SA' });

  page.on('console', msg => console.log('  [BROWSER]', msg.type(), msg.text().substring(0, 200)));
  page.on('pageerror', err => console.log('  [PAGE_ERROR]', err.message));

  // Login
  await page.goto(URL + '/login', { waitUntil: 'networkidle' });
  await sleep(3000);
  await page.fill('input[type="email"]', 'owner@washflow.sa');
  await page.fill('input[type="password"]', '123456');

  // Intercept the login flow to know when navigation happens
  page.once('framenavigated', async () => {
    console.log('  Navigated away from login page');
  });

  await page.click('button:has-text("تسجيل الدخول")');
  await sleep(5000);

  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Try clicking using multiple strategies
  console.log('\n--- Testing click strategies ---');

  // Strategy 1: CSS selector with text
  console.log('\nStrategy 1: text selector');
  const btn1 = page.locator('text=إضافة خدمة').first();
  console.log('  exists:', await btn1.count() > 0);
  console.log('  visible:', await btn1.isVisible().catch(() => false));
  await btn1.click({ timeout: 5000 }).then(() => console.log('  clicked OK')).catch(e => console.log('  click error:', e.message.substring(0, 100)));
  await sleep(2000);
  console.log('  drawer open?', await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50')));

  // Close if open
  if (await page.evaluate(() => !!document.querySelector('.fixed.inset-0.z-50'))) {
    await page.evaluate(() => { document.querySelector('.fixed.inset-0.z-50 .absolute.inset-0')?.click(); });
    await sleep(1000);
    console.log('  Closed drawer');
  }

  // Let's try to check if the button actually responds to clicks by adding a temporary listener
  console.log('\n--- Checking if button receives events ---');
  const clickResult = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('إضافة خدمة'));
    if (!btn) return 'not found';
    
    let clicked = false;
    const handler = () => { clicked = true; };
    btn.addEventListener('click', handler);
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    btn.removeEventListener('click', handler);
    return 'click dispatched, was captured: ' + clicked;
  });
  console.log('  DispatchEvent:', clickResult);

  // If that works, the issue is React not processing the event
  // Let's try to directly trigger the React handler
  console.log('\n--- Direct React state manipulation ---');
  const reactResult = await page.evaluate(() => {
    // Try to find React fiber and call the handler
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('إضافة خدمة'));
    if (!btn) return 'btn not found';
    
    // Get React fiber key
    const keys = Object.keys(btn).filter(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
    return JSON.stringify(keys);
  });
  console.log('  React keys:', reactResult);

  // Try to find all buttons with text content
  const allBtnTexts = await page.evaluate(() => {
    return [...document.querySelectorAll('button')].map(b => ({
      text: (b.textContent || '').trim().substring(0, 50),
      cls: b.className.substring(0, 40),
      reactKeys: Object.keys(b).filter(k => k.startsWith('__react')),
      hasHandler: typeof b.__reactProps$?.onClick === 'function' || typeof b.click === 'function',
    }));
  });
  console.log('\nAll buttons:');
  allBtnTexts.forEach((b, i) => console.log(i + ':', JSON.stringify(b)));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
