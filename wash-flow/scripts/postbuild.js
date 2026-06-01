const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'out');
const nextDir = path.join(root, '.next');

console.log('=== HOSTINGER DEPLOYMENT SCRIPT ===');

if (!fs.existsSync(outDir)) {
  console.error('ERROR: out/ directory not found.');
  process.exit(1);
}

console.log('out/ directory found — moving to .next/');

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
}

fs.renameSync(outDir, nextDir);
console.log('Moved out/ -> .next/');
console.log('=== DONE ===');