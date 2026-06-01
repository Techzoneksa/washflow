const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nextDir = path.join(root, '.next');
const outDir = path.join(root, 'out');

console.log('=== HOSTINGER DEPLOYMENT SCRIPT ===');
console.log('Checking static export output: out/');

if (!fs.existsSync(outDir)) {
  console.error('ERROR: out/ directory not found. Static export failed.');
  console.error('Make sure output: "export" is set in next.config.ts');
  process.exit(1);
}

console.log('Found out/ directory');

// Remove old .next if exists
if (fs.existsSync(nextDir)) {
  console.log('Removing old .next/ directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// Move out/ to .next/
console.log('Moving out/ to .next/...');
fs.renameSync(outDir, nextDir);
console.log('Moved out/ -> .next/');

// Verification checks
console.log('=== VERIFICATION ===');

const indexPath = path.join(nextDir, 'index.html');
const loginIndex = path.join(nextDir, 'login', 'index.html');
const staticDir = path.join(nextDir, '_next', 'static');

if (!fs.existsSync(indexPath)) {
  console.error('ERROR: .next/index.html not found after move!');
  process.exit(1);
}
console.log('.next/index.html verified');

if (!fs.existsSync(loginIndex)) {
  console.error('ERROR: .next/login/index.html not found after move!');
  process.exit(1);
}
console.log('.next/login/index.html verified');

if (!fs.existsSync(staticDir)) {
  console.error('ERROR: .next/_next/static not found after move!');
  process.exit(1);
}
console.log('.next/_next/static verified');

// List all pages
const pages = ['dashboard', 'pos', 'orders', 'invoices', 'services', 'suppliers',
                'purchases', 'expenses', 'utility-bills', 'employees', 'reports',
                'inventory', 'stock-movements', 'stock-adjustments', 'waste'];

console.log('Checking page directories...');
for (const page of pages) {
  const pagePath = path.join(nextDir, page, 'index.html');
  if (fs.existsSync(pagePath)) {
    console.log(`  .next/${page}/index.html verified`);
  } else {
    console.warn(`  WARNING: .next/${page}/index.html not found`);
  }
}

console.log('');
console.log('=== STATIC EXPORT READY FOR HOSTINGER ===');
console.log('Static export completed successfully!');
console.log('Output directory: .next/');
console.log('All static files are ready for deployment.');