import fs from 'fs';
import path from 'path';

function searchDir(dir, pattern, results = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f.endsWith('.test.js')) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full, pattern, results);
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          results.push(`${full}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
  return results;
}

const res = searchDir('./src', /mock|dummy|fake|sample|placeholder.*(account|data|user|tailor)|fallback/i);
console.log('--- FOUND IN SRC ---');
res.forEach(r => console.log(r));

const resServer = searchDir('./server', /mock|dummy|fake|sample|hardcode/i);
console.log('\n--- FOUND IN SERVER ---');
resServer.forEach(r => console.log(r));
