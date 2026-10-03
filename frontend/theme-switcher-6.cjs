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
  { regex: /bg-white font-bold/g, replacement: 'bg-[#6442ff] font-extrabold shadow-sm' },
  { regex: /text-white bg-white/g, replacement: 'text-white bg-[#6442ff]' },

  // Also fix the icons turning invisible/purple on active purple background!
  // It's tricky to do blindly, so we'll just fix the specific bad states in AdminNavigation and Sidebar
];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    globalReplacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });

    // Custom fix for Dashboard icon text color when active
    content = content.replace(/<Activity size={16} className="text-\[#6442ff\] flex-shrink-0" \/>/g, '<Activity size={16} className={`flex-shrink-0 ${isActive ? "text-white" : "text-[#6442ff]"}`} />');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Final Sidebar Fix update: ${filePath}`);
    }
  }
});
