const fs = require('fs');
const path = require('path');

const colorMap = {
  // Primary (Blue/Indigo variants)
  '#6366f1': 'var(--primary)',
  '#4f46e5': 'var(--primary-dark)',
  '#818cf8': 'var(--primary-light)',
  '#3730a3': 'var(--primary-dark)',
  '#c7d2fe': 'var(--primary-light)',
  
  // Secondary (Purple variants)
  '#8b5cf6': 'var(--secondary)',
  '#7C3AED': 'var(--secondary)',
  
  // Success (Green variants)
  '#10b981': 'var(--success)',
  '#10B981': 'var(--success)',
  '#16A34A': 'var(--success)',
  '#15803d': 'var(--success)',
  '#dcfce7': 'var(--success-bg)',
  '#16A34A22': 'var(--success-bg)',
  
  // Warning (Orange/Yellow variants)
  '#f59e0b': 'var(--warning)',
  '#D97706': 'var(--warning)',
  '#b45309': 'var(--warning)',
  '#fef3c7': 'var(--warning-bg)',
  '#D9770622': 'var(--warning-bg)',
  
  // Error (Red variants)
  '#ef4444': 'var(--error)',
  '#DC2626': 'var(--error)',
  '#dc2626': 'var(--error)',
  '#fef2f2': 'var(--error-bg)',
  '#DC262622': 'var(--error-bg)',
  
  // Info (Blue variants)
  '#3b82f6': 'var(--info)',
  '#2563EB': 'var(--info)',
  '#0891B2': 'var(--info)',
  '#0369a1': 'var(--info)',
  '#e0f2fe': 'var(--info-bg)',
  '#2563EB22': 'var(--info-bg)',
  
  // Neutral/Misc
  '#e2e8f0': 'var(--border)',
  '#f1f5f9': 'var(--border)',
  '#334155': 'var(--text)',
  '#1e293b': 'var(--text-h)',
  '#94a3b8': 'var(--text-light)',
  '#64748b': 'var(--text-light)',
  '#000000': 'var(--text-h)',
  '#020617': 'var(--text-h)',
  '#DB2777': 'var(--secondary)'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace all exact string matches of the keys
    for (const [hex, variable] of Object.entries(colorMap)) {
      // Create a global regex, case insensitive but be careful not to replace partial hexes
      // We will match quotes around them or just replace globally.
      const regex = new RegExp(hex, 'gi');
      content = content.replace(regex, variable);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log(`Updated colors in ${filePath}`);
    }
  }
});

console.log(`Modified ${modifiedCount} files.`);
