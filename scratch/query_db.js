const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, '..', 'server.js');
if (fs.existsSync(serverJsPath)) {
  const content = fs.readFileSync(serverJsPath, 'utf8');
  const lines = content.split('\n');
  console.log("Searching for 'authenticateToken' inside server.js...");
  lines.forEach((line, idx) => {
    if (line.includes('authenticateToken')) {
      console.log(`LINE ${idx + 1}: ${line.trim()}`);
    }
  });
} else {
  console.log("server.js not found!");
}



