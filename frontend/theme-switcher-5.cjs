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
  // Fix the active menu state mapping
  { regex: /bg-indigo-950/g, replacement: 'bg-[#6442ff]' },
  { regex: /bg-slate-800\/50/g, replacement: 'bg-[#f4f7fc]/50' },
  { regex: /bg-slate-800/g, replacement: 'bg-[#f4f7fc]' },
  { regex: /text-slate-100/g, replacement: 'text-[#090a23]' },
  { regex: /text-slate-200/g, replacement: 'text-[#090a23]' },
  { regex: /text-slate-400/g, replacement: 'text-[#596383]' },
  { regex: /text-slate-950/g, replacement: 'text-white' }, // e.g. amber badge text
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
      console.log(`Fix update: ${filePath}`);
    }
  }
});
