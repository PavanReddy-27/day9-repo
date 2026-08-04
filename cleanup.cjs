const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf-8');
      if (c.includes('.css')) {
        // Remove import statements for css files, including commented out ones
        c = c.replace(/\/?\/?\s*import\s+['"].*\.css['"];?/g, '');
        fs.writeFileSync(p, c);
      }
    } else if (p.endsWith('.css')) {
      fs.unlinkSync(p);
    }
  });
}

walk('src/manager');
console.log('Cleanup complete');
