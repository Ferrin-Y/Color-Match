import express, { json, static as serverStatic } from 'express';
import session from 'express-session';
import { join } from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware to parse JSON
app.use(json());

// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Serve static files (CSS, JS, images)
app.use(serverStatic(join(__dirname, 'public')));

// Import the game controller
import gameController from './controllers/gameController.js';

// Define API routes
app.post('/api/game/start', gameController.startNewRound);  // Start a new game round
app.post('/api/game/submit', gameController.submitGame);    // Submit grid for comparison
app.get('/api/leaderboard', gameController.getLeaderboard); // Get leaderboard
app.post('/api/leaderboard', gameController.addScoreToLeaderboard); // Submit score

// Serve the index.html from views
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'views', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
