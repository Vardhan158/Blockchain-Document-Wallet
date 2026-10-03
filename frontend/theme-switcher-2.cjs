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

const replacements = [
  { regex: /bg-indigo-950/g, replacement: 'bg-[#6442ff]' },
  { regex: /text-slate-400/g, replacement: 'text-[#596383]' },
  { regex: /hover:bg-slate-800\/80/g, replacement: 'hover:bg-[#f4f7fc]' },
  { regex: /hover:text-slate-100/g, replacement: 'hover:text-[#090a23]' },
  { regex: /bg-indigo-500/g, replacement: 'bg-[#6442ff]' },
  { regex: /border-indigo-500/g, replacement: 'border-[#6442ff]' },
  { regex: /shadow-indigo-500\/10/g, replacement: 'shadow-[#6442ff]/10' },
  { regex: /text-sky-400/g, replacement: 'text-[#009df2]' },
  { regex: /bg-emerald-950\/80/g, replacement: 'bg-[#edfbf5]' },
  { regex: /border-emerald-500/g, replacement: 'border-[#c7f4e4]' },
  { regex: /bg-amber-950\/80/g, replacement: 'bg-[#fff8e4]' },
  { regex: /border-amber-500/g, replacement: 'border-[#fff0ca]' },
  { regex: /bg-red-950\/80/g, replacement: 'bg-[#fff0f2]' },
  { regex: /border-red-500/g, replacement: 'border-[#ffd3dc]' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800/g, replacement: 'bg-white' },
  { regex: /border-slate-700/g, replacement: 'border-[#edf0fb]' },
  { regex: /text-slate-300/g, replacement: 'text-[#424a6b]' },
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/className=(["`])(.*?)\1/g, (match, quote, classes) => {
      let newClasses = classes;
      replacements.forEach(r => {
        newClasses = newClasses.replace(r.regex, r.replacement);
      });
      return `className=${quote}${newClasses}${quote}`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated 2: ${filePath}`);
    }
  }
});
