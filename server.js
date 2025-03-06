const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Set up session management
app.use(session({
    secret: 'your-secret-key',  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ✅ Serve static files from the public directory (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve the index.html correctly from views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
