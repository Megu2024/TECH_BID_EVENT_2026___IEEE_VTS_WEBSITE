let app;
try {
    // Local dev structure
    app = require('../server/server.js');
} catch (err) {
    // Vercel Build Output API structure
    app = require('./server/server.js');
}
module.exports = app;
