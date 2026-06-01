const fs = require('fs');
const path = require('path');

const root = process.cwd();
const nextDir = path.join(root, '.next');
const outDir = path.join(root, 'out');

console.log('=== HOSTINGER DEPLOYMENT SCRIPT ===');
console.log('Current working directory:', root);
console.log('');

// Debug: list root directory contents
console.log('Directory listing (root):');
try {
  const items = fs.readdirSync(root);
  items.forEach(item => {
    const itemPath = path.join(root, item);
    const stat = fs.statSync(itemPath);
    console.log(`  ${stat.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`);
  });
} catch (e) {
  console.log('  Error reading root:', e.message);
}

console.log('');
console.log('Checking for out/ directory...');
console.log('outDir path:', outDir);
console.log('outDir exists:', fs.existsSync(outDir));

console.log('');
console.log('Checking for .next/ directory...');
console.log('nextDir path:', nextDir);
console.log('nextDir exists:', fs.existsSync(nextDir));

// Check various possible locations
console.log('');
console.log('Searching for index.html in common locations:');
const possibleIndexPaths = [
  path.join(root, 'out', 'index.html'),
  path.join(root, '.next', 'index.html'),
  path.join(root, 'index.html'),
  path.join(root, '.next', 'server', 'app', 'index.html'),
];
possibleIndexPaths.forEach(p => {
  console.log(`  ${p} -> ${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`);
});

if (!fs.existsSync(outDir)) {
  console.log('');
  console.log('ERROR: out/ directory not found.');
  console.log('Static export may have failed or output to different location.');
  console.log('');
  console.log('Checking if .next/server/app exists (non-static build):');
  const serverAppIndex = path.join(root, '.next', 'server', 'app', 'index.html');
  if (fs.existsSync(serverAppIndex)) {
    console.log('WARNING: Found .next/server/app/index.html - this is a dynamic build, not static export!');
    console.log('This means output: "export" may not be working correctly in Hostinger environment.');
  }
  process.exit(1);
}

console.log('');
console.log('Found out/ directory');
console.log('out/ contents:');
try {
  const outItems = fs.readdirSync(outDir);
  outItems.forEach(item => {
    const itemPath = path.join(outDir, item);
    const stat = fs.statSync(itemPath);
    console.log(`  ${stat.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`);
  });
} catch (e) {
  console.log('  Error reading out/:', e.message);
}
console.log('');
console.log('Checking out/index.html...');
const outIndexHtml = path.join(outDir, 'index.html');
console.log(`out/index.html exists: ${fs.existsSync(outIndexHtml)}`);
if (fs.existsSync(outIndexHtml)) {
  console.log('out/index.html FOUND');
} else {
  console.log('out/index.html NOT FOUND');
  console.log('Checking for any index.html in out/ subdirectories...');
  function findIndexHtml(dir, depth = 0) {
    if (depth > 3) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isFile() && item === 'index.html') {
          console.log(`  FOUND: ${itemPath}`);
        } else if (stat.isDirectory()) {
          findIndexHtml(itemPath, depth + 1);
        }
      }
    } catch (e) {}
  }
  findIndexHtml(outDir);
}

if (fs.existsSync(nextDir)) {
  console.log('Removing old .next/ directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

console.log('Moving out/ to .next/...');
try {
  fs.renameSync(outDir, nextDir);
  console.log('Moved out/ -> .next/');
} catch (e) {
  console.error('Rename failed:', e.message);
  console.error('Trying copy+delete instead...');
  copyDirRecursive(outDir, nextDir);
  fs.rmSync(outDir, { recursive: true, force: true });
  console.log('Copied out/ -> .next/ (and deleted original)');
}

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

console.log('');
console.log('=== AFTER MOVE: .next/ contents ===');
try {
  const nextItems = fs.readdirSync(nextDir);
  nextItems.forEach(item => {
    const itemPath = path.join(nextDir, item);
    const stat = fs.statSync(itemPath);
    console.log(`  ${stat.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`);
  });
} catch (e) {
  console.log('  Error reading .next/:', e.message);
}
console.log('');
console.log('Checking .next/_next/...');
const nextNextDir = path.join(nextDir, '_next');
if (fs.existsSync(nextNextDir)) {
  console.log('.next/_next/ exists');
  try {
    const nextNextItems = fs.readdirSync(nextNextDir);
    nextNextItems.forEach(item => {
      const itemPath = path.join(nextNextDir, item);
      const stat = fs.statSync(itemPath);
      console.log(`  ${stat.isDirectory() ? '[DIR]' : '[FILE]'} ${item}`);
    });
  } catch (e) {
    console.log('  Error reading .next/_next/:', e.message);
  }
} else {
  console.log('.next/_next/ NOT FOUND');
}
console.log('');
console.log('Checking .next/index.html...');
const nextIndexHtml = path.join(nextDir, 'index.html');
console.log(`.next/index.html exists: ${fs.existsSync(nextIndexHtml)}`);

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