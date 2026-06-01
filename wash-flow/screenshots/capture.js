const http = require('http');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require(path.join('D:\\WFLOW POS\\wash-flow', 'node_modules', 'ws'));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:2021';
const PORT = 9222;
const DIR = __dirname;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    }).on('error', reject);
  });
}

async function main() {
  try { execSync('taskkill /F /IM chrome.exe 2>nul', { stdio: 'ignore' }); } catch {}
  await sleep(2000);

  console.log('[1] Starting Chrome...');
  const proc = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`, '--headless=new', '--disable-gpu', '--no-sandbox',
    '--remote-allow-origins=*', '--window-size=1440,900', `${URL}/login`,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});
  await sleep(6000);

  let wsUrl;
  for (let i = 0; i < 30; i++) {
    try {
      const targets = await fetchJSON(`http://localhost:${PORT}/json`);
      const page = targets.find(t => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch {}
    await sleep(1000);
  }
  if (!wsUrl) { console.log('[FAIL] No page target'); proc.kill(); return; }
  console.log('[OK] Page target found');

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
    setTimeout(() => reject(new Error('WS timeout')), 15000);
  });
  console.log('[OK] WebSocket connected');

  let msgId = 1;
  const pending = {};
  ws.on('message', data => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending[msg.id]) { pending[msg.id](msg.result); delete pending[msg.id]; }
  });
  ws.on('error', () => {});

  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending[id] = resolve;
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (pending[id]) { delete pending[id]; reject(new Error('Timeout: ' + method)); } }, 30000);
    });
  }

  async function js(expr) {
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true });
    return r?.result?.value;
  }

  async function click(text) {
    return js(`(()=>{const b=[...document.querySelectorAll('button')];const f=b.find(e=>e.textContent.trim().includes('${text}'));if(f){f.click();return'ok'}return'nf:${text}'})()`);
  }

  async function snap(name) {
    try {
      const r = await cdp('Page.captureScreenshot', { format: 'png' });
      if (r && r.data) {
        const buf = Buffer.from(r.data, 'base64');
        fs.writeFileSync(path.join(DIR, name), buf);
        console.log(`  [SNAP] ${name} (${buf.length} bytes)`);
      }
    } catch(e) { console.log(`  [FAIL] ${name}: ${e.message}`); }
  }

  async function resize(w, h) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: w < 768 });
    await sleep(1500);
  }

  // Wait for login page
  await sleep(3000);
  console.log('[2] On login page');

  // Login
  console.log('[3] Logging in...');
  await js(`document.querySelector('input[type="email"]').value='cashier@washflow.sa'`);
  await js(`document.querySelector('input[type="password"]').value='123456'`);
  await sleep(300);
  const clickResult = await click('تسجيل الدخول');
  console.log('  Click:', clickResult);
  await sleep(6000);

  const curUrl = await js('window.location.href');
  console.log('  URL:', curUrl);

  if (!curUrl || !curUrl.includes('/pos')) {
    console.log('  Navigating to /pos...');
    await js(`window.location.href = '${URL}/pos'`);
    await sleep(6000);
  }

  // === SCREENSHOTS ===
  console.log('\n[4] POS screenshots...');

  // Mobile 390
  console.log('\n--- Mobile 390 ---');
  await resize(390, 844);
  await snap('01-pos-mobile-390.png');

  // Add services
  console.log('  Adding services...');
  await click('سيارة صغيرة');
  await sleep(400);
  await click('سيارة كبيرة');
  await sleep(400);
  await click('غسيل داخلي');
  await sleep(400);
  await click('سيارة صغيرة');
  await sleep(400);
  // Add more
  await click('غسيل خارجي');
  await sleep(400);
  console.log('  5 items in cart');

  // Mobile cart bottom sheet
  await click('عرض السلة');
  await sleep(2000);
  await snap('02-mobile-cart-sheet.png');

  // Close sheet - click overlay
  await js(`document.querySelector('[class*="fixed"][class*="inset-0"][class*="z-50"]')?.click()`);
  await sleep(1000);

  // Tablet 768
  console.log('\n--- Tablet 768 ---');
  await resize(768, 1024);
  await snap('03-tablet-pos-768.png');

  // Desktop 1440
  console.log('\n--- Desktop 1440 ---');
  await resize(1440, 900);
  await snap('04-desktop-pos-1440.png');

  // Back to tablet for payment flow
  await resize(768, 1024);
  await sleep(500);

  // Select cash payment
  console.log('\n[5] Payment - Cash...');
  await click('نقدي');
  await sleep(1000);
  await snap('05-payment-cash-tablet.png');

  // Mixed payment
  console.log('[6] Payment - Mixed...');
  await click('دفع مختلط');
  await sleep(1500);
  await snap('06-payment-mixed-tablet.png');

  // Fill mixed amounts correctly
  await js(`const ips=document.querySelectorAll('input[type="number"]');if(ips.length>=3){ips[0].value='50';ips[1].value='30';ips[2].value='20'}`);
  await sleep(500);

  // Complete order
  console.log('[7] Completing order...');
  await click('إتمام الطلب');
  await sleep(6000);

  await snap('07-order-success-tablet.png');

  // Invoice
  console.log('[8] Invoice...');
  await click('عرض الفاتورة');
  await sleep(2000);
  await snap('08-invoice-tablet.png');

  // Mobile invoice
  await resize(390, 844);
  await sleep(1000);
  await snap('09-invoice-mobile.png');

  console.log('\n=== ALL 9 SCREENSHOTS TAKEN ===');
  ws.close();
  proc.kill();
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
