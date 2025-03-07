
const fs = require('fs');
const path = require('path');

console.log('Verifying Netlify build compatibility...');

// Check if dist directory exists
if (!fs.existsSync(path.resolve('./dist'))) {
  console.error('❌ dist directory not found. Run npm run build first.');
  process.exit(1);
}

// Check if index.html exists in dist
const indexPath = path.resolve('./dist/index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html not found.');
  process.exit(1);
}

// Read index.html content
const indexContent = fs.readFileSync(indexPath, 'utf-8');

// Check for absolute paths
const absolutePaths = indexContent.match(/(src|href)="\//g);
if (absolutePaths) {
  console.error('❌ Absolute paths found in index.html:');
  console.error(absolutePaths);
  console.error('Paths should be relative (starting with ./)');
} else {
  console.log('✅ No absolute paths found in index.html');
}

// Check for gptengineer.js script
if (!indexContent.includes('cdn.gpteng.co/gptengineer.js')) {
  console.error('❌ Lovable script is missing in index.html');
} else {
  console.log('✅ Lovable script is present in index.html');
}

// Check for _redirects file
const redirectsPath = path.resolve('./dist/_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.error('❌ _redirects file not found in dist');
} else {
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
  if (!redirectsContent.includes('/* /index.html 200')) {
    console.error('❌ _redirects file does not contain the SPA redirect rule');
  } else {
    console.log('✅ _redirects file contains the correct SPA redirect rule');
  }
}

// Check for _headers file
const headersPath = path.resolve('./dist/_headers');
if (!fs.existsSync(headersPath)) {
  console.warn('⚠️ _headers file not found in dist - this is optional but recommended');
} else {
  console.log('✅ _headers file is present in dist');
}

console.log('\nVerification complete. If all checks passed, your build should be compatible with Netlify deployment.');
