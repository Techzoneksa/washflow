const fs = require('fs');
const path = require('path');

const root = process.cwd();
const nextDir = path.join(root, '.next');

console.log('=== HOSTINGER DEPLOYMENT SCRIPT ===');

if (!fs.existsSync(nextDir)) {
  console.error('ERROR: .next/ directory not found.');
  process.exit(1);
}

console.log('.next/ directory exists — ready for Hostinger Node.js.');
console.log('=== DONE ===');