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

  // ===== LOGIN AS OWNER =====
  await sleep(3000);
  console.log('[2] On login page - logging in as owner...');
  await js(`document.querySelector('input[type="email"]').value='owner@washflow.sa'`);
  await js(`document.querySelector('input[type="password"]').value='123456'`);
  await sleep(300);
  let r = await click('تسجيل الدخول');
  console.log('  Click result:', r);
  await sleep(6000);

  let curUrl = await js('window.location.href');
  console.log('  URL:', curUrl);

  if (!curUrl || !curUrl.includes('/services')) {
    console.log('  Navigating to /services...');
    await js(`window.location.href = '${URL}/services'`);
    await sleep(6000);
  }

  // ===== SCREENSHOTS =====
  console.log('\n[3] Services page screenshots...');

  // Desktop 1440
  console.log('\n--- Desktop 1440 ---');
  await resize(1440, 900);
  await sleep(2000);
  await snap('s01-services-desktop-1440.png');

  // Tablet 768
  console.log('\n--- Tablet 768 ---');
  await resize(768, 1024);
  await sleep(2000);
  await snap('s02-services-tablet-768.png');

  // Mobile 390
  console.log('\n--- Mobile 390 ---');
  await resize(390, 844);
  await sleep(2000);
  await snap('s03-services-mobile-390.png');

  // ===== FILTERS BOTTOM SHEET (Mobile) =====
  console.log('\n[4] Filters Bottom Sheet...');
  // Click the filter icon (SlidersHorizontal button)
  await js(`document.querySelector('button svg.lucide-sliders-horizontal')?.closest('button')?.click()`);
  await sleep(2000);
  await snap('s04-filters-bottom-sheet.png');
  // Close the sheet
  await js(`document.querySelector('[class*="fixed"][class*="inset-0"]')?.click()`);
  await sleep(1000);

  // ===== SEARCH =====
  console.log('\n[5] Testing search...');
  // Switch to desktop for search test
  await resize(1440, 900);
  await sleep(1500);
  // Search Arabic
  await js(`const inp = document.querySelector('input[placeholder*="بحث"]'); if(inp) { inp.value = 'سيارة صغيرة'; inp.dispatchEvent(new Event('input', {bubbles:true})); }`);
  await sleep(2000);
  await snap('s05-search-arabic.png');
  // Clear search
  await js(`const inp = document.querySelector('input[placeholder*="بحث"]'); if(inp) { inp.value = ''; inp.dispatchEvent(new Event('input', {bubbles:true})); }`);
  await sleep(1000);

  // ===== DETAILS DRAWER =====
  console.log('\n[6] Details Drawer...');
  // Click the first eye/view button in the table
  await js(`document.querySelector('button[title="عرض"]')?.click()`);
  await sleep(2000);
  await snap('s06-details-drawer.png');
  // Close drawer
  await js(`document.querySelector('[class*="fixed"][class*="inset-0"]')?.click()`);
  await sleep(1000);

  // ===== ADD SERVICE FORM =====
  console.log('\n[7] Add Service Form...');
  await click('إضافة خدمة');
  await sleep(2000);
  // Fill form
  await js(`const inputs = document.querySelectorAll('input'); const n = [...inputs].find(i => i.type === 'text' && !i.dir); if(n) n.value = 'غسيل سوبر'; n?.dispatchEvent(new Event('input', {bubbles:true}));`);
  await sleep(300);
  await js(`const inputs = document.querySelectorAll('input[dir="ltr"]'); if(inputs[0]) { inputs[0].value = 'Super Wash'; inputs[0].dispatchEvent(new Event('input', {bubbles:true})); }`);
  await sleep(300);
  await js(`const inputs = document.querySelectorAll('input[type="number"]'); if(inputs[0]) { inputs[0].value = '50'; inputs[0].dispatchEvent(new Event('input', {bubbles:true})); }`);
  await sleep(300);
  await js(`const inputs = document.querySelectorAll('input[type="number"]'); if(inputs[1]) { inputs[1].value = '30'; inputs[1].dispatchEvent(new Event('input', {bubbles:true})); }`);
  await sleep(300);
  await snap('s07-add-service-form.png');
  // Save
  await click('إضافة الخدمة');
  await sleep(3000);
  await snap('s08-add-service-success.png');

  // ===== EDIT SERVICE =====
  console.log('\n[8] Edit Service Form...');
  // Click the first pencil/edit button
  await js(`document.querySelector('button[title="تعديل"]')?.click()`);
  await sleep(2000);
  // Change price
  await js(`const inputs = document.querySelectorAll('input[type="number"]'); if(inputs[0]) { inputs[0].value = '55'; inputs[0].dispatchEvent(new Event('input', {bubbles:true})); }`);
  await sleep(500);
  await snap('s09-edit-service-form.png');
  // Save edit
  await click('حفظ التعديلات');
  await sleep(3000);
  await snap('s10-edit-service-success.png');

  // ===== DISABLE CONFIRMATION =====
  console.log('\n[9] Disable Confirmation Modal...');
  // Click toggle button
  await js(`document.querySelector('button[title="تعطيل"]')?.click()`);
  await sleep(2000);
  await snap('s11-disable-confirmation-modal.png');
  // Confirm disable
  await click('تأكيد التعطيل');
  await sleep(3000);
  await snap('s12-service-disabled.png');

  // ===== NO PERMISSION (Cashier) =====
  console.log('\n[10] Switching to cashier...');
  // We need to login as cashier. Clear session and navigate to login
  await js(`sessionStorage.removeItem('wf_session')`);
  await sleep(500);
  await js(`window.location.href = '${URL}/login'`);
  await sleep(4000);
  // Login as cashier
  await js(`document.querySelector('input[type="email"]').value='cashier@washflow.sa'`);
  await js(`document.querySelector('input[type="password"]').value='123456'`);
  await sleep(300);
  r = await click('تسجيل الدخول');
  console.log('  Login cashier:', r);
  await sleep(4000);
  // Try to access /services
  await js(`window.location.href = '${URL}/services'`);
  await sleep(5000);
  await snap('s13-no-permission-cashier.png');

  console.log('\n=== ALL 13 SCREENSHOTS TAKEN ===');
  ws.close();
  proc.kill();
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
