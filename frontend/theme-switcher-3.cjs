const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const globalReplacements = [
  // Slate backgrounds
  { regex: /bg-slate-950\/80/g, replacement: 'bg-[#fafbff]/90' },
  { regex: /bg-slate-950/g, replacement: 'bg-[#fafbff]' },
  { regex: /bg-slate-900\/50/g, replacement: 'bg-white/50' },
  { regex: /bg-slate-900/g, replacement: 'bg-[#ffffff]' },
  { regex: /bg-slate-800\/80/g, replacement: 'bg-[#f4f7fc]' },
  { regex: /bg-slate-800\/50/g, replacement: 'bg-[#f4f7fc]/50' },
  { regex: /bg-slate-800/g, replacement: 'bg-white' },
  { regex: /bg-slate-700/g, replacement: 'bg-[#e0e5f4]' },

  // Slate text
  { regex: /text-slate-100/g, replacement: 'text-[#090a23]' },
  { regex: /text-slate-200/g, replacement: 'text-[#171438]' },
  { regex: /text-slate-300/g, replacement: 'text-[#424a6b]' },
  { regex: /text-slate-400/g, replacement: 'text-[#596383]' },
  { regex: /text-slate-500/g, replacement: 'text-[#7b819b]' },
  { regex: /text-slate-600/g, replacement: 'text-[#7b819b]' },
  { regex: /text-slate-950/g, replacement: 'text-[#ffffff]' }, // Usually dark text on light badge -> light text on dark badge

  // Slate borders & divides
  { regex: /border-slate-800/g, replacement: 'border-[#edf0fb]' },
  { regex: /border-slate-700/g, replacement: 'border-[#e0e5f4]' },
  { regex: /border-slate-600/g, replacement: 'border-[#dceaff]' },
  { regex: /divide-slate-800/g, replacement: 'divide-[#edf0fb]' },
  { regex: /divide-slate-700/g, replacement: 'divide-[#e0e5f4]' },

  // Text white replacements where it acts as primary text color
  // Actually, we already did a pass. Let's just fix specific hover states
  { regex: /hover:text-white/g, replacement: 'hover:text-[#090a23]' },
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    globalReplacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Global Updated: ${filePath}`);
    }
  }
});
