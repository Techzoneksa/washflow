import { chromium } from 'playwright';
const URL = 'http://127.0.0.1:2021';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Capture all console messages with full details
  page.on('console', msg => {
    const args = msg.args();
    const argTexts = args.map(a => a.toString().substring(0, 200)).join(' | ');
    console.log(`[CONSOLE ${msg.type()}] ${msg.text().substring(0, 300)}`);
    if (msg.type() === 'error' && args.length > 0) {
      console.log(`  Args: ${argTexts.substring(0, 500)}`);
    }
  });

  // Capture page errors with full stack
  page.on('pageerror', err => {
    console.log(`\n[PAGE_ERROR] ${err.message}`);
    console.log(`  Stack: ${err.stack}`);
  });

  // Set session
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('wf_session', JSON.stringify({
      user: { email: 'owner@washflow.sa', password: '', name: 'المالك', roles: ['owner'] },
      selectedRole: 'owner',
      loggedInAt: new Date().toISOString(),
    }));
  });

  // Test each page
  const pages = ['/dashboard', '/services', '/pos', '/orders', '/invoices', '/settings'];
  for (const route of pages) {
    console.log(`\n========== Testing ${route} ==========`);
    await page.goto(URL + route, { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Check react error container
    const hasError = await page.evaluate(() => {
      return document.querySelector('[data-reactroot]') === null && 
             document.querySelector('#__next')?.children.length > 0;
    });
    console.log(`Page loaded: ${await page.url()}`);
  }

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
