import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const allResponses = [];
page.on('response', resp => {
  allResponses.push({ url: resp.url(), status: resp.status(), type: resp.request().resourceType() });
});

await page.goto('http://127.0.0.1:2021/services', { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 5000));

// Get ALL HTML
const html = await page.content();

// Print all CSS links
const cssLinks = html.match(/<link[^>]*rel="stylesheet"[^>]*href="[^"]*"[^>]*>/g) || [];
console.log('=== CSS Links ===');
cssLinks.forEach(l => console.log(l));

// Print all preload links
const preloadLinks = html.match(/<link[^>]*rel="preload"[^>]*as="style"[^>]*>/g) || [];
console.log('\n=== Preload Links ===');
preloadLinks.forEach(l => console.log(l));

// Print all responses
console.log('\n=== All Responses ===');
allResponses.forEach(r => console.log(`${r.status} ${r.type} ${r.url.substring(0, 150)}`));

await browser.close();
