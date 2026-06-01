import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://127.0.0.1:2021/services', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 5000));

const html = await page.content();

// Find link tags with CSS
const linkPattern = /<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/g;
let match;
console.log('=== CSS Links ===');
while ((match = linkPattern.exec(html)) !== null) {
  console.log(match[1]);
}

// Find script tags
const scriptPattern = /<script[^>]*src="([^"]*)"[^>]*>/g;
console.log('\n=== Scripts ===');
while ((match = scriptPattern.exec(html)) !== null) {
  console.log(match[1]);
}

await browser.close();
