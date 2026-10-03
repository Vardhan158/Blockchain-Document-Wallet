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
  { regex: /from-slate-800/g, replacement: 'from-white' },
  { regex: /ring-slate-950/g, replacement: 'ring-white' },
  { regex: /hover:bg-slate-600/g, replacement: 'hover:bg-[#dceaff]' },
  { regex: /hover:border-slate-500/g, replacement: 'hover:border-[#c7f4e4]' },
  { regex: /shadow-slate-900\/20/g, replacement: 'shadow-black/5' },
  { regex: /to-indigo-950\/30/g, replacement: 'to-[#f1eeff]' },
  { regex: /to-amber-950\/30/g, replacement: 'to-[#fff8e4]' },
  { regex: /to-emerald-950\/30/g, replacement: 'to-[#edfbf5]' },
  { regex: /to-red-950\/30/g, replacement: 'to-[#fff0f2]' },
  { regex: /shadow-indigo-950\/20/g, replacement: 'shadow-[#6442ff]/10' },
  { regex: /shadow-amber-950\/20/g, replacement: 'shadow-amber-500/10' },
  { regex: /shadow-emerald-950\/20/g, replacement: 'shadow-emerald-500/10' },
  { regex: /translate-x-full/g, replacement: 'translate-x-full' }, // Safe to keep
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    globalReplacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Final update: ${filePath}`);
    }
  }
});
