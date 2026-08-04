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
      
      // Fix fontWeight={XYZ} without sx
      c = c.replace(/fontWeight=\{([0-9]+)\}/g, 'sx={{ fontWeight: $1 }}');
      // If there are two sx={{...}} props, we have a problem. Let's combine them.
      c = c.replace(/sx=\{\{ fontWeight: ([0-9]+) \}\}\s+sx=\{\{([^}]+)\}\}/g, 'sx={{ fontWeight: $1, $2 }}');
      c = c.replace(/sx=\{\{([^}]+)\}\}\s+sx=\{\{ fontWeight: ([0-9]+) \}\}/g, 'sx={{ $1, fontWeight: $2 }}');

      // Fix item xs={...} to size={{ xs: ... }}
      c = c.replace(/item xs=\{([0-9]+)\}/g, 'size={{ xs: $1 }}');
      c = c.replace(/item xs=\{([0-9]+)\} sm=\{([0-9]+)\}/g, 'size={{ xs: $1, sm: $2 }}');
      c = c.replace(/item xs=\{([0-9]+)\} md=\{([0-9]+)\}/g, 'size={{ xs: $1, md: $2 }}');
      c = c.replace(/item xs=\{([0-9]+)\} sm=\{([0-9]+)\} md=\{([0-9]+)\}/g, 'size={{ xs: $1, sm: $2, md: $3 }}');
      
      if (p.includes('Users.tsx')) {
        c = c.replace(/PaperProps=\{\{/g, 'slotProps={{ paper: {');
        c = c.replace(/\} \}\}/g, '} } }'); // this might be risky, let's do exact
        c = c.replace(/slotProps=\{\{ paper: \{ sx: \{ borderRadius: 3, p: 1 \} \}\}/g, 'slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}');
      }

      if (p.includes('LeaveRequests.tsx')) {
        c = c.replace(/Cancel/g, 'XCircle');
        c = c.replace(/Card,\s*/g, '');
      }

      if (c !== orig) {
        fs.writeFileSync(p, c);
      }
    }
  });
}

walk('src/pages');
console.log('Fixed TS errors in pages');
