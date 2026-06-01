const path = require('path');
const fs = require('fs');

const root = process.cwd();
const outDir = path.join(root, 'out');
const nextDir = path.join(root, '.next');
const nextServerApp = path.join(root, '.next', 'server', 'app');

console.log('=== HOSTINGER DEPLOYMENT SCRIPT ===');
console.log('Current working directory:', root);
console.log('');

console.log('Checking for out/ directory...');
console.log('outDir exists:', fs.existsSync(outDir));

if (!fs.existsSync(outDir)) {
  console.log('');
  console.log('out/ NOT found. Checking for .next/server/app...');
  if (fs.existsSync(nextServerApp)) {
    console.log('Found .next/server/app — copying to out/');
    fs.mkdirSync(outDir, { recursive: true });
    copyDirRecursive(nextServerApp, outDir);
    console.log('Done: out/ directory created from .next/server/app');
  } else {
    console.error('ERROR: Neither out/ nor .next/server/app found.');
    process.exit(1);
  }
} else {
  console.log('Found out/ directory — proceeding normally.');
}

console.log('');
console.log('Verifying out/index.html...');
if (!fs.existsSync(path.join(outDir, 'index.html'))) {
  console.error('ERROR: out/index.html still not found after copy!');
  process.exit(1);
}
console.log('out/index.html verified');

if (fs.existsSync(nextDir)) {
  console.log('Removing old .next/ directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

console.log('Moving out/ to .next/...');
fs.renameSync(outDir, nextDir);
console.log('Moved out/ -> .next/');

console.log('');
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

const pages = ['dashboard', 'pos', 'orders', 'invoices', 'services', 'suppliers',
                'purchases', 'expenses', 'utility-bills', 'employees', 'reports',
                'inventory', 'stock-movements', 'stock-adjustments', 'waste'];

console.log('');
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

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}