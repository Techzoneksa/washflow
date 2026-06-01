import { chromium } from 'playwright';
const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', err => { errors.push(err.message); console.log('  [PAGE_ERR]', err.message); });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [CONSOLE_ERR]', msg.text().substring(0, 150));
  });

  // Set session directly
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('wf_session', JSON.stringify({
      user: { email: 'owner@washflow.sa', password: '', name: 'المالك', roles: ['owner'] },
      selectedRole: 'owner',
      loggedInAt: new Date().toISOString(),
    }));
  });
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(5000);
  console.log('URL:', page.url());

  // Check for console errors
  console.log('Page errors:', errors.length);

  // Try clicking the view button using Playwright's native method
  console.log('\nClicking view button...');
  const viewBtn = page.getByRole('button', { name: /عرض/i }).first();
  console.log('Count:', await viewBtn.count());
  console.log('Visible:', await viewBtn.isVisible());
  
  if (await viewBtn.count() > 0) {
    await viewBtn.click();
    await sleep(3000);
    
    // Check drawer
    const drawer = await page.evaluate(() => {
      return document.querySelector('[class*="z-50"]') !== null;
    });
    console.log('Drawer open:', drawer);
    
    // Take screenshot regardless
    await page.screenshot({ path: 'screenshots/prod-test-drawer.png' });
    console.log('Screenshot saved');
  }

  // Also try clicking directly via JS
  console.log('\nTrying click via evaluate...');
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const viewBtn = btns.find(b => b.getAttribute('title') === 'عرض' && b.offsetParent !== null);
    if (viewBtn) { 
      console.log('Found view button, clicking...');
      viewBtn.click(); 
    }
  });
  await sleep(3000);
  
  const drawer2 = await page.evaluate(() => {
    return document.querySelector('[class*="z-50"]') !== null;
  });
  console.log('Drawer open after evaluate:', drawer2);

  // Try ALL button click approaches
  console.log('\nTrying ALL click approaches...');
  for (const approach of [
    'playwright-locator', 
    'evaluate-click',
    'evaluate-dispatch',
  ]) {
    console.log(`\n  Approach: ${approach}`);
    
    // Navigate fresh
    await page.goto(URL + '/services', { waitUntil: 'networkidle' });
    await sleep(5000);
    
    if (approach === 'playwright-locator') {
      await page.getByRole('button', { name: /عرض/i }).first().click();
    } else if (approach === 'evaluate-click') {
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => 
          b.getAttribute('title') === 'عرض' && b.offsetParent !== null
        );
        if (btn) {
          console.log('  Found button, dispatching click');
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
      });
    } else if (approach === 'evaluate-dispatch') {
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => 
          b.getAttribute('title') === 'عرض' && b.offsetParent !== null
        );
        if (btn) {
          // Try to call React's onClick handler directly
          const props = Object.keys(btn).find(k => k.startsWith('__reactProps'));
          if (props) {
            console.log('  Found React props:', props);
          }
        }
      });
    }
    
    await sleep(3000);
    const isOpen = await page.evaluate(() => document.querySelector('[class*="z-50"]') !== null);
    console.log(`  Drawer open: ${isOpen}`);
  }

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
