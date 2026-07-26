const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Building Dehqon Market Full-Stack Application ===');

try {
  console.log('1. Compiling Vite React Client...');
  execSync('npm run build --prefix client', { stdio: 'inherit' });

  console.log('2. Mirroring build output to root dist directory...');
  const srcDist = path.join(__dirname, 'client', 'dist');
  const destDist = path.join(__dirname, 'dist');

  if (fs.existsSync(destDist)) {
    fs.rmSync(destDist, { recursive: true, force: true });
  }

  fs.cpSync(srcDist, destDist, { recursive: true });
  console.log('=== Build completed successfully! ===');
} catch (err) {
  console.error('Build process failed:', err.message);
  process.exit(1);
}
