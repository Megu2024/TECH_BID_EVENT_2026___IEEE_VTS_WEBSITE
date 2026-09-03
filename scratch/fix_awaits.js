const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace "await loadAllData();" with "loadAllData();" when preceded by some whitespace inside a function
content = content.replace(/(\s+)await loadAllData\(\);/g, '$1loadAllData();');

// Replace "await refreshQuestions();" with "refreshQuestions();"
content = content.replace(/(\s+)await refreshQuestions\(\);/g, '$1refreshQuestions();');

// Replace "await refreshTechCards();" with "refreshTechCards();"
content = content.replace(/(\s+)await refreshTechCards\(\);/g, '$1refreshTechCards();');

// Replace "await refreshProblems();" with "refreshProblems();"
content = content.replace(/(\s+)await refreshProblems\(\);/g, '$1refreshProblems();');

// Replace "await refreshImageSets();" with "refreshImageSets();"
content = content.replace(/(\s+)await refreshImageSets\(\);/g, '$1refreshImageSets();');

fs.writeFileSync(filePath, content);
console.log('Removed await from refresh functions in AdminDashboard.jsx');
