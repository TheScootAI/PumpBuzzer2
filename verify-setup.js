#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PumpBuzzer setup...\n');

const checks = {
  '📦 Root package.json': () => fs.existsSync('package.json'),
  '📦 Backend package.json': () => fs.existsSync('backend/package.json'),
  '📦 Frontend package.json': () => fs.existsSync('frontend/package.json'),
  '📦 Root node_modules': () => fs.existsSync('node_modules'),
  '📦 Backend node_modules': () => fs.existsSync('backend/node_modules'),
  '📦 Frontend node_modules': () => fs.existsSync('frontend/node_modules'),
  '⚙️ Backend .env.example': () => fs.existsSync('backend/.env.example'),
  '⚙️ Frontend .env.example': () => fs.existsSync('frontend/.env.example'),
  '📁 Backend source files': () => fs.existsSync('backend/server.js'),
  '📁 Frontend source files': () => fs.existsSync('frontend/src/App.tsx'),
  '🎨 CSS files': () => fs.existsSync('frontend/src/components/AuthForms.css'),
};

let allPassed = true;

Object.entries(checks).forEach(([name, check]) => {
  const passed = check();
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (!passed) allPassed = false;
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All setup checks passed!');
  console.log('\n📋 Next steps:');
  console.log('1. Set up your Discord bot (see SETUP.md)');
  console.log('2. Copy .env.example files and configure them');
  console.log('3. Run: cd backend && npm run init-db');
  console.log('4. Run: npm run dev');
  console.log('\n🚀 Happy pumping!');
} else {
  console.log('❌ Some setup checks failed.');
  console.log('\n🔧 Try running:');
  console.log('- npm run install:all');
  console.log('- Check the README.md for detailed setup instructions');
}

console.log('\n📖 For detailed setup instructions, see:');
console.log('- SETUP.md (quick 5-minute guide)');
console.log('- README.md (comprehensive guide)');