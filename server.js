// server.js
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

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Import the game controller
const gameController = require('./controllers/gameController');

// Define API routes
app.post('/api/game/start', gameController.startNewRound);  // Start a new game round
app.post('/api/game/submit', gameController.submitGame);    // Submit grid for comparison
app.get('/api/leaderboard', gameController.getLeaderboard); // Get leaderboard
app.post('/api/leaderboard', gameController.addScoreToLeaderboard); // Submit score

// Serve the index.html from views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
