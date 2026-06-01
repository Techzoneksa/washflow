const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const DIR = 'D:\\WFLOW POS\\wash-flow\\screenshots';

function fetch(u) {
  return new Promise((res, rej) => {
    http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej);
  });
}

async function main() {
  console.log('[1] Connecting to Chrome...');
  const targets = await fetch('http://localhost:9223/json');
  const page = targets.find(t => t.type === 'page');
  if (!page) { console.log('No page target'); return; }
  console.log('  WS:', page.webSocketDebuggerUrl.substring(0, 60));

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); setTimeout(() => rej('WS timeout'), 15000); });
  console.log('  Connected!');

  let id = 1;
  const pending = {};
  ws.on('message', d => {
    const m = JSON.parse(d.toString());
    if (m.id && pending[m.id]) { pending[m.id](m.result); delete pending[m.id]; }
  });

  function cdp(method, params = {}) {
    return new Promise((res, rej) => {
      const cid = id++;
      pending[cid] = res;
      ws.send(JSON.stringify({ id: cid, method, params }));
      setTimeout(() => { if (pending[cid]) { delete pending[cid]; rej('Timeout: ' + method); } }, 30000);
    });
  }

  async function js(expr) {
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true });
    return r?.result?.value;
  }

  async function snap(name) {
    try {
      const r = await cdp('Page.captureScreenshot', { format: 'png' });
      if (r && r.data) {
        fs.writeFileSync(path.join(DIR, name), Buffer.from(r.data, 'base64'));
        console.log('  [SNAP] ' + name);
      }
    } catch (e) { console.log('  [FAIL] ' + name + ': ' + e.message); }
  }

  async function resize(w, h) {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: w < 768 });
    await sleep(1000);
  }

  async function clickText(text) {
    return js("(() => { const b = [...document.querySelectorAll('button')]; const f = b.find(e => e.textContent.includes('" + text + "')); if (f) { f.click(); return 1; } return 0; })()");
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Wait for initial page
  await sleep(3000);

  let url = await js('window.location.href');
  console.log('[2] URL:', url ? url.substring(0, 80) : 'unknown');

  // Navigate to login if needed
  if (!url || !url.includes('/login')) {
    console.log('  Navigating to login...');
    await js("window.location.href = 'http://127.0.0.1:2021/login'");
    await sleep(5000);
  }

  // Login
  console.log('[3] Logging in...');
  await js("document.querySelector('input[type=email]').value = 'cashier@washflow.sa'");
  await js("document.querySelector('input[type=password]').value = '123456'");
  await sleep(500);
  const clicked = await clickText('تسجيل الدخول');
  console.log('  Click result: ' + clicked);
  await sleep(6000);

  url = await js('window.location.href');
  console.log('  URL after login: ' + (url ? url.substring(0, 80) : 'unknown'));

  // Navigate to POS if needed
  if (!url || !url.includes('/pos')) {
    console.log('  Navigating to POS...');
    await js("window.location.href = 'http://127.0.0.1:2021/pos'");
    await sleep(6000);
  }

  // ===== SCREENSHOTS =====
  console.log('\n[4] POS Screenshots');

  // Mobile 390
  console.log('\n--- Mobile 390 ---');
  await resize(390, 844);
  await snap('01-pos-mobile-390.png');
  console.log('  URL now: ' + ((await js('window.location.href')) || '').substring(0, 60));

  // Try adding services on mobile
  const r1 = await clickText('صغيرة');
  console.log('  Click small car: ' + r1);
  await sleep(400);
  const r2 = await clickText('كبيرة');
  console.log('  Click large car: ' + r2);
  await sleep(400);
  const r3 = await clickText('داخلي');
  console.log('  Click interior: ' + r3);
  await sleep(400);
  const r4 = await clickText('صغيرة');
  console.log('  Click small car again: ' + r4);
  await sleep(500);

  // Mobile cart
  const r5 = await clickText('السلة');
  console.log('  Click cart: ' + r5);
  await sleep(2000);
  await snap('02-mobile-cart-sheet.png');

  // Tablet
  console.log('\n--- Tablet 768 ---');
  await resize(768, 1024);
  await snap('03-tablet-pos-768.png');

  // Desktop
  console.log('\n--- Desktop 1440 ---');
  await resize(1440, 900);
  await snap('04-desktop-pos-1440.png');

  // Back to tablet for payment
  await resize(768, 1024);
  await sleep(500);

  // Payment
  console.log('\n[5] Payment Screenshots');
  await clickText('نقدي');
  await sleep(1000);
  console.log('  Cash selected');
  await snap('05-payment-cash-tablet.png');

  await clickText('مختلط');
  await sleep(1500);
  console.log('  Mixed selected');
  await snap('06-payment-mixed-tablet.png');

  // Fill amounts
  await js("var ips = document.querySelectorAll('input[type=number]'); if (ips.length >= 3) { ips[0].value = '50'; ips[1].value = '30'; ips[2].value = '20'; }");
  await sleep(300);

  // Complete order
  console.log('\n[6] Complete Order');
  await clickText('إتمام');
  await sleep(6000);
  await snap('07-order-success-tablet.png');

  // Invoice
  console.log('\n[7] Invoice');
  await clickText('الفاتورة');
  await sleep(2000);
  await snap('08-invoice-tablet.png');

  await resize(390, 844);
  await sleep(1000);
  await snap('09-invoice-mobile.png');

  console.log('\n=== ALL 9 SCREENSHOTS DONE ===');
  ws.close();
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
