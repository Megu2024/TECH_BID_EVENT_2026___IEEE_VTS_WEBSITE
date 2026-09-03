const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Active Timing box
content = content.replace(/<div style=\{\{\s*padding: "6px 14px",\s*background: "rgba\(0, 240, 255, 0\.08\)",[\s\S]*?⏱️ \{currentTiming\}s \/ Question<\/strong>\s*<\/div>/, '');

// 2. Remove Row 1 (Quick Coins) and Row 2 (Quick Timing) completely
content = content.replace(/\{\/\* Row 1: Quick Coins Helper Presets \*\/\}[\s\S]*?\{\/\* VIEW 1: MULTI-QUESTION MATRIX/g, '{/* VIEW 1: MULTI-QUESTION MATRIX');

// 3. Remove the inner quick preset buttons for [10, 15, 20, 25, 30, 40, 50]
content = content.replace(/\{\/\* Quick preset buttons \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Timer & Single Save Control \*\/\}/g, '</div>\n\n                                                                            {/* Timer & Single Save Control */}');

fs.writeFileSync(filePath, content);
console.log('Cleaned up UI elements from AdminDashboard.jsx');
