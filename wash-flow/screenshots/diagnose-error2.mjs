import { chromium } from 'playwright';
const URL = 'http://127.0.0.1:2021';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ar-SA', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Capture ALL requests and responses
  page.on('requestfailed', req => {
    console.log(`[REQ_FAILED] ${req.url()} - ${req.failure()?.errorText}`);
  });
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`[RESP_ERROR] ${resp.status()} ${resp.url().substring(0, 200)}`);
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[CONSOLE_ERR] ${msg.text().substring(0, 300)}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[PAGE_ERR] ${err.message}`);
    if (err.stack) {
      // Only show relevant frames
      const lines = err.stack.split('\n');
      for (const line of lines) {
        if (line.includes('/_next/')) console.log(`  ${line.trim().substring(0, 200)}`);
      }
    }
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

  // Test services page
  console.log('\n====== Testing /services ======');
  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 5000));

  // Check the rendered HTML for <html> tags
  const htmlContent = await page.evaluate(() => {
    // Check if there are any custom "HTML" elements
    const allElements = document.querySelectorAll('*');
    const htmlElements = [];
    for (const el of allElements) {
      if (el.tagName === 'HTML' && el !== document.documentElement) {
        htmlElements.push(el.outerHTML.substring(0, 100));
      }
    }
    return {
      totalElements: allElements.length,
      extraHtmlElements: htmlElements,
      hasReactRoot: !!document.getElementById('__next'),
      docElementTag: document.documentElement.tagName,
    };
  });
  console.log('DOM analysis:', JSON.stringify(htmlContent, null, 2));

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
