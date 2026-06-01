import { chromium } from 'playwright';
const URL = 'http://127.0.0.1:2022'; // dev server
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 } });

  async function checkPage(label, path) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', err => {
      errors.push({ type: 'pageerror', text: err.message, stack: err.stack?.substring(0, 2000) });
    });

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      sessionStorage.setItem('wf_session', JSON.stringify({
        user: { email: 'owner@washflow.sa', password: '', name: 'المالك', roles: ['owner'] },
        selectedRole: 'owner',
        loggedInAt: new Date().toISOString(),
      }));
    });
    
    await page.goto(URL + path, { waitUntil: 'networkidle' });
    await sleep(5000);

    console.log(`\n[${label}] ${path}`);
    if (errors.length === 0) {
      console.log('  ✅ No errors');
    } else {
      for (const e of errors) {
        console.log(`  ❌ [${e.type}]`, e.text);
        if (e.stack) console.log('  Stack:', e.stack);
      }
    }
    
    await page.close();
  }

  await checkPage('Dashboard', '/dashboard');
  await checkPage('Services', '/services');

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
