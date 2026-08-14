const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /#(?:eef4ff|f3f4f6|fbfbff|f0fdfa|f5f5f5|f8faff|e0e7ff|dcfce7|ecfdf5|fff8e1|fff5f5|fef3c7|fffafa|f1f5f9|cbd5e1|d1d5db|e5e7eb)/gi, replace: 'var(--surface-solid)' },
  { regex: /rgba\(\s*255\s*,\s*152\s*,\s*0\s*,\s*0\.1\s*\)/g, replace: 'rgba(201, 155, 91, 0.1)' }, // warning light
  { regex: /rgba\(\s*76\s*,\s*175\s*,\s*80\s*,\s*0\.1\s*\)/g, replace: 'rgba(91, 146, 121, 0.1)' }, // success light
  { regex: /rgba\(\s*76\s*,\s*175\s*,\s*80\s*,\s*0\.2\s*\)/g, replace: 'rgba(91, 146, 121, 0.2)' },
  { regex: /rgba\(\s*237\s*,\s*108\s*,\s*2\s*,\s*0\.1\s*\)/g, replace: 'rgba(201, 155, 91, 0.1)' },
  
  // Specific colors mapped to theme variables
  { regex: /#3b82f6|#6366f1|#8b5cf6|#3730a3|#1e3a8a|#1e293b|#07111f|#0b1f33|#0e2f3a|#6a11cb|#36d1dc|#5b86e5/gi, replace: 'var(--primary)' },
  { regex: /#16a34a|#10b981|#00c853|#009624|#4caf50|#2e7d32|#11998e|#38ef7d|#00b09b|#96c93d/gi, replace: 'var(--success)' },
  { regex: /#f59e0b|#ff9800|#e65100|#f7971e|#ffd200/gi, replace: 'var(--warning)' },
  { regex: /#ef4444|#b91c1c|#ff1744|#c53030|#ff512f|#dd2476|#d32f2f|#c62828/gi, replace: 'var(--error)' },
  { regex: /#0f766e|#14b8a6|#0d5f59|#2dd4bf|#5eead4|#2193b0|#DBEAFE/gi, replace: 'var(--info)' },
  
  // Text colors
  { regex: /#1e293b|#000|#555|#3c4953/gi, replace: 'var(--text)' },
  { regex: /#9fb3c8|#4B5563/gi, replace: 'var(--text-light)' },
  { regex: /#edf1f5|#e2e8f0|#eef2f7|#ddd/gi, replace: 'var(--bg)' }, // Borders
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk('./src');
