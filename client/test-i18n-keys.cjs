// Automated parity test for i18n translation files
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));
const ml = JSON.parse(fs.readFileSync(path.join(localesDir, 'ml.json'), 'utf8'));

function getFlattenedKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getFlattenedKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const enKeys = getFlattenedKeys(en);
const hiKeys = getFlattenedKeys(hi);
const mlKeys = getFlattenedKeys(ml);

console.log(`\n🔍 Verifying i18n translation key parity across EN, HI, ML...`);
console.log(`  - en.json keys: ${enKeys.length}`);
console.log(`  - hi.json keys: ${hiKeys.length}`);
console.log(`  - ml.json keys: ${mlKeys.length}`);

let hasErrors = false;

// Check missing in HI
const missingInHi = enKeys.filter((k) => !hiKeys.includes(k));
if (missingInHi.length > 0) {
  console.error(`❌ Keys in en.json missing in hi.json:`, missingInHi);
  hasErrors = true;
}

// Check extra in HI
const extraInHi = hiKeys.filter((k) => !enKeys.includes(k));
if (extraInHi.length > 0) {
  console.error(`❌ Keys in hi.json missing in en.json:`, extraInHi);
  hasErrors = true;
}

// Check missing in ML
const missingInMl = enKeys.filter((k) => !mlKeys.includes(k));
if (missingInMl.length > 0) {
  console.error(`❌ Keys in en.json missing in ml.json:`, missingInMl);
  hasErrors = true;
}

// Check extra in ML
const extraInMl = mlKeys.filter((k) => !enKeys.includes(k));
if (extraInMl.length > 0) {
  console.error(`❌ Keys in ml.json missing in en.json:`, extraInMl);
  hasErrors = true;
}

if (hasErrors) {
  console.error(`\n💥 i18n key parity check FAILED! Translation files are out of sync.\n`);
  process.exit(1);
} else {
  console.log(`\n✅ SUCCESS: All ${enKeys.length} translation keys match 100% across EN, HI, and ML!\n`);
  process.exit(0);
}
