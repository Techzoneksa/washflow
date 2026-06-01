import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2022'; // dev server
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const allMessages = [];
  page.on('console', msg => {
    allMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    allMessages.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  // Set session and navigate
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

  console.log('=== ALL CONSOLE MESSAGES ===');
  for (const m of allMessages) {
    if (m.type === 'pageerror') {
      console.log('\n[PAGE_ERROR]', m.text);
      if (m.stack) console.log('  Stack:', m.stack.substring(0, 2000));
    } else {
      console.log(`[${m.type}]`, m.text.substring(0, 300));
    }
  }

  // Also check for errors in the React tree
  const reactErrors = allMessages.filter(m => {
    return m.text.includes('react') || m.text.includes('React') || 
           m.text.includes('error') || m.text.includes('Error') ||
           m.text.includes('hydration') || m.text.includes('Hydration') ||
           m.text.includes('418') || m.text.includes('#418');
  });
  
  console.log('\n=== REACT-RELATED MESSAGES ===');
  for (const m of reactErrors) {
    console.log(`[${m.type}]`, m.text.substring(0, 500));
  }

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
