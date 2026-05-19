const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const dbLink = '<a href="database.html" class="nav-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>Database Admin</a>';

for (const file of files) {
  if (file === 'database.html' || file === 'dashboard.html') continue; // dashboard already processed or skip db

  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match the notes link and its leading whitespace
  const regex = /^([ \t]*<a href="notes\.html".*?<\/a>)/m;
  
  if (regex.test(content) && !content.includes('database.html')) {
    content = content.replace(regex, (match, p1) => {
      const indent = p1.match(/^[ \t]*/)[0];
      return p1 + '\n' + indent + dbLink;
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  }
}
