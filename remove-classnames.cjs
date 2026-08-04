const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf-8');
      const orig = c;
      // Remove className="..."
      c = c.replace(/className="[^"]*"/g, '');
      // Remove className={'...'} 
      c = c.replace(/className=\{['"][^'"]*['"]\}/g, '');
      if (c !== orig) {
        fs.writeFileSync(p, c);
      }
    }
  });
}

walk('src/manager');
console.log('ClassNames removed');
