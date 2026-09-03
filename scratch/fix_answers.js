const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'ParticipantDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the completed status block
content = content.replace(/eventStatus\?\.quizAnswersVisible \? \([\s\S]*?\) : \(/g, 'false ? (null) : (');

// Replace the pending status block
content = content.replace(/\{eventStatus\?\.quizAnswersVisible[\s\S]*?Check Quiz Answers 📝\s*<\/button>\s*\)\}/g, '');

fs.writeFileSync(filePath, content);
console.log('Cleaned ParticipantDashboard');
