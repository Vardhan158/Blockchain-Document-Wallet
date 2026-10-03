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
  // Backgrounds
  { regex: /bg-slate-950/g, replacement: 'bg-[#fafbff]' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800/g, replacement: 'bg-white shadow-sm' }, // using shadow for cards instead of flat color
  { regex: /bg-slate-700/g, replacement: 'bg-[#f4f7fc]' },

  // Text Colors
  { regex: /text-slate-100/g, replacement: 'text-[#090a23]' },
  { regex: /text-slate-200/g, replacement: 'text-[#171438]' },
  { regex: /text-slate-300/g, replacement: 'text-[#424a6b]' },
  { regex: /text-slate-400/g, replacement: 'text-[#596383]' },
  { regex: /text-slate-500/g, replacement: 'text-[#7b819b]' },

  // Borders
  { regex: /border-slate-800/g, replacement: 'border-[#edf0fb]' },
  { regex: /border-slate-700/g, replacement: 'border-[#e0e5f4]' },
  { regex: /border-slate-600/g, replacement: 'border-[#dceaff]' },
  { regex: /divide-slate-800/g, replacement: 'divide-[#edf0fb]' },
  { regex: /divide-slate-700/g, replacement: 'divide-[#e0e5f4]' },

  // Ring / Focus
  { regex: /focus:border-indigo-500/g, replacement: 'focus:border-[#6442ff]' },
  { regex: /focus:ring-indigo-500/g, replacement: 'focus:ring-[#6442ff]' },

  // Primary colors (indigo -> #6442ff family)
  { regex: /text-indigo-400/g, replacement: 'text-[#6442ff]' },
  { regex: /text-indigo-500/g, replacement: 'text-[#6442ff]' },
  { regex: /bg-indigo-600/g, replacement: 'bg-[#6442ff]' },
  { regex: /hover:bg-indigo-500/g, replacement: 'hover:bg-[#5231e3]' },
  { regex: /bg-indigo-950\/30/g, replacement: 'bg-[#f1eeff]' },
  { regex: /bg-indigo-900\/20/g, replacement: 'bg-[#f1eeff]' },
  { regex: /border-indigo-500\/30/g, replacement: 'border-[#d3c9ff]' },
  { regex: /border-indigo-500/g, replacement: 'border-[#6442ff]' },

  // Status colors (Emerald)
  { regex: /bg-emerald-950\/30/g, replacement: 'bg-[#edfbf5]' },
  { regex: /border-emerald-500\/30/g, replacement: 'border-[#c7f4e4]' },
  { regex: /text-emerald-400/g, replacement: 'text-[#009963]' },
  { regex: /text-emerald-500/g, replacement: 'text-[#009963]' },
  { regex: /bg-emerald-500\/10/g, replacement: 'bg-[#edfbf5]' },

  // Status colors (Amber/Yellow)
  { regex: /bg-amber-950\/30/g, replacement: 'bg-[#fff8e4]' },
  { regex: /border-amber-500\/30/g, replacement: 'border-[#fff0ca]' },
  { regex: /text-amber-400/g, replacement: 'text-[#bd8100]' },
  { regex: /text-amber-500/g, replacement: 'text-[#bd8100]' },
  { regex: /bg-amber-500\/10/g, replacement: 'bg-[#fff8e4]' },

  // Status colors (Red)
  { regex: /bg-red-900\/20/g, replacement: 'bg-[#fff0f2]' },
  { regex: /border-red-500\/50/g, replacement: 'border-[#ffd3dc]' },
  { regex: /text-red-400/g, replacement: 'text-[#ef2547]' },
  { regex: /text-red-500/g, replacement: 'text-[#ef2547]' },
  { regex: /bg-red-500\/10/g, replacement: 'bg-[#fff0f2]' },

];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/className=(["`])(.*?)\1/g, (match, quote, classes) => {
      let newClasses = classes;

      // Fix text-white except on colored backgrounds
      if (newClasses.includes('text-white') && !newClasses.match(/bg-(indigo|red|emerald|amber|sky|blue|green)/)) {
        newClasses = newClasses.replace(/text-white/g, 'text-[#090a23]');
      }

      // Fix ring-offset
      if (newClasses.includes('ring-offset-slate-900')) {
          newClasses = newClasses.replace(/ring-offset-slate-900/g, 'ring-offset-white');
      }

      replacements.forEach(r => {
        newClasses = newClasses.replace(r.regex, r.replacement);
      });

      return `className=${quote}${newClasses}${quote}`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});
