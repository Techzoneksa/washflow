const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'out');
const nextDir = path.join(root, '.next');

if (fs.existsSync(outDir)) {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
  fs.renameSync(outDir, nextDir);
  console.log('Moved out/ -> .next/');
} else {
  console.error('ERROR: out/ directory not found. Static export failed.');
  process.exit(1);
}
