// controllers/gameController.js
const gameModel = require('../models/gameModel');

/**
 * Starts a new game round.
 * - Receives grid size and button colors from the frontend.
 * - Generates a new target grid.
 * - Resets the player's grid and score.
 */
function startNewRound(req, res) {
    const { gridSize, buttonColors } = req.body; // Get grid size and colors from the frontend

    // Set the grid size and button colors in the game model
    gameModel.setGridSize(gridSize, buttonColors);

    // Generate a new target grid
    gameModel.gameState.targetGrid = gameModel.generateRandomGrid();

    // Reset player's grid and score
    gameModel.gameState.playerGrid = Array(gameModel.gameState.gridSize * gameModel.gameState.gridSize).fill("");
    gameModel.gameState.score = 0;

    // Store score in session so it persists
    req.session.score = gameModel.gameState.score;

    // Send the response with necessary game state
    res.json({
        gridSize: gameModel.gameState.gridSize,
        score: req.session.score,
    });
}

/**
 * Submits the player's grid for comparison.
 * - Compares the player's grid with the target grid.
 * - Updates the score if correct.
 */
function submitGame(req, res) {
    const { playerGrid } = req.body;

    // Compare player's grid with the target grid
    const match = gameModel.checkMatch(playerGrid);

    // Update session score
    req.session.score = gameModel.gameState.score;

    res.json({
        match,
        score: req.session.score,
    });
}

/**
 * Retrieves the current leaderboard.
 */
function getLeaderboard(req, res) {
    res.json(gameModel.gameState.leaderboard);
}

/**
 * Adds the player's score to the leaderboard.
 * - Player submits their name, and score is saved in the leaderboard.
 */
function addScoreToLeaderboard(req, res) {
    const { playerName } = req.body;
    
    // Add player to leaderboard
    gameModel.addToLeaderboard(playerName);

    res.json(gameModel.gameState.leaderboard);
}

// Export functions for use in server.js
module.exports = {
    startNewRound,
    submitGame,
    getLeaderboard,
    addScoreToLeaderboard,
};
