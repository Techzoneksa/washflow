import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:2021';
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'ar-SA' });

  // Login
  await page.goto(URL + '/login', { waitUntil: 'networkidle' });
  await sleep(3000);
  await page.fill('input[type="email"]', 'owner@washflow.sa');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("تسجيل الدخول")');
  await sleep(5000);

  await page.goto(URL + '/services', { waitUntil: 'networkidle' });
  await sleep(3000);

  // Method 1: Click via Playwright locator
  const addBtn = page.locator('button').filter({ hasText: 'إضافة خدمة' }).first();
  await addBtn.click();
  await sleep(2000);
  console.log('After Playwright click. Drawer open?', await page.evaluate(() => {
    return !!document.querySelector('.fixed.inset-0.z-50');
  }));

  // Close by clicking overlay if drawer is open
  const overlay = page.locator('.fixed.inset-0.z-50 .absolute.inset-0').first();
  if (await overlay.isVisible().catch(() => false)) {
    await overlay.click();
    await sleep(1000);
    console.log('  Closed overlay');
  }

  // Method 2: Click via native dispatchEvent
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (addBtn) {
      addBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      console.log('  Native click dispatched');
    } else {
      console.log('  Button not found!');
    }
  });
  await sleep(2000);
  console.log('After native click. Drawer open?', await page.evaluate(() => {
    return !!document.querySelector('.fixed.inset-0.z-50');
  }));
  
  // Close if open
  const overlay2 = page.locator('.fixed.inset-0.z-50 .absolute.inset-0').first();
  if (await overlay2.isVisible().catch(() => false)) {
    await overlay2.click();
    await sleep(1000);
    console.log('  Closed overlay');
  }

  // Method 3: Check if button has onClick handler
  const btnInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const addBtn = btns.find(b => b.textContent.includes('إضافة خدمة'));
    if (!addBtn) return { found: false };
    const attrs = {};
    for (const attr of addBtn.attributes) {
      attrs[attr.name] = attr.value.substring(0, 100);
    }
    return {
      found: true,
      id: addBtn.id,
      className: addBtn.className.substring(0, 100),
      tagName: addBtn.tagName,
      attributes: attrs,
      text: addBtn.textContent,
      disabled: addBtn.disabled,
      onclick: typeof addBtn.onclick,
      listeners: typeof addBtn.click,
      rect: {
        x: addBtn.getBoundingClientRect().x,
        y: addBtn.getBoundingClientRect().y,
        w: addBtn.getBoundingClientRect().width,
        h: addBtn.getBoundingClientRect().height,
      }
    };
  });
  console.log('\nButton info:', JSON.stringify(btnInfo, null, 2));

  // Method 4: Try clicking by coordinates
  if (btnInfo.found && btnInfo.rect) {
    console.log('\nTrying click by coordinates...');
    await page.mouse.click(btnInfo.rect.x + btnInfo.rect.w / 2, btnInfo.rect.y + btnInfo.rect.h / 2);
    await sleep(2000);
    console.log('After coordinate click. Drawer open?', await page.evaluate(() => {
      return !!document.querySelector('.fixed.inset-0.z-50');
    }));
  }

  await browser.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
