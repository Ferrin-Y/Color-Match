// controllers/gameController.js
const gameModel = require('../models/gameModel');

// Start a new game round
function startNewRound(req, res) {
    const { gridSize, buttonColors } = req.body;

    if (!gridSize || !Array.isArray(buttonColors) || buttonColors.length === 0) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    // Set the game parameters (grid size and colors)
    gameModel.setGridSize(gridSize, buttonColors);
    gameModel.gameState.targetGrid = gameModel.generateRandomGrid(); // Generate the secret grid

    // Respond with the grid size and button colors (but NOT the full answer)
    res.json({
        gridSize: gameModel.gameState.gridSize,
        buttonColors: gameModel.gameState.buttonColors,
        matchGrid: gameModel.getHiddenGrid() // Send a grid with hidden colors
    });
}


// Submit the player's grid for comparison
function submitGame(req, res) {
    const { playerGrid } = req.body;
    
    // Validate player grid
    if (!Array.isArray(playerGrid) || playerGrid.length !== gameModel.gameState.targetGrid.length) {
        return res.status(400).json({ error: "Invalid player grid" });
    }
    
    const match = gameModel.checkMatch(playerGrid); // Check if player's grid matches the target grid

    // Update session score after match
    req.session.score = gameModel.gameState.score;

    res.json({
        match,
        score: req.session.score
    });
}

// Get the leaderboard
function getLeaderboard(req, res) {
    res.json(gameModel.gameState.leaderboard);
}

// Add player's score to leaderboard
function addScoreToLeaderboard(req, res) {
    const { playerName } = req.body;

    if (!playerName) {
        return res.status(400).json({ error: "Player name is required" });
    }

    gameModel.addToLeaderboard(playerName); // Add score to leaderboard
    res.json(gameModel.gameState.leaderboard);
}

module.exports = {
    startNewRound,
    submitGame,
    getLeaderboard,
    addScoreToLeaderboard
};
