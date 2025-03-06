// models/gameModel.js

// Game state object (stored in memory)
let gameState = {
    targetGrid: [],       // The correct color pattern for this round
    playerGrid: [],       // The player's current grid
    score: 0,             // Player's score
    gridSize: 6,          // Default grid size
    buttonColors: [],     // Colors that the player can use
    leaderboard: []       // In-memory leaderboard (to be expanded later)
};

/**
 * Generates a random target grid using the available button colors.
 * @returns {string[]} An array representing the correct color pattern.
 */
function generateRandomGrid() {
    const grid = [];
    const totalCells = gameState.gridSize * gameState.gridSize;

    for (let i = 0; i < totalCells; i++) {
        // Pick a random color from the available button colors
        grid.push(gameState.buttonColors[Math.floor(Math.random() * gameState.buttonColors.length)]);
    }
    return grid;
}

/**
 * Updates the game state with the selected grid size and button colors.
 * @param {number} size - The grid size (number of cubes per row/column).
 * @param {string[]} colors - The available colors (based on button IDs).
 */
function setGridSize(size, colors) {
    gameState.gridSize = size;
    gameState.buttonColors = colors;
}

/**
 * Compares the player's grid with the target grid.
 * @param {string[]} playerGrid - The colors in the player's grid.
 * @returns {boolean} True if the player's grid matches the target grid.
 */
function checkMatch(playerGrid) {
    const match = playerGrid.every((color, idx) => color === gameState.targetGrid[idx]);
    
    // If the match is correct, increase the score
    if (match) {
        gameState.score += 100;  // Award points for a correct match
    }
    
    return match;
}

/**
 * Adds the player's score to the leaderboard.
 * @param {string} playerName - The name of the player.
 */
function addToLeaderboard(playerName) {
    gameState.leaderboard.push({ name: playerName, score: gameState.score });
    
    // Sort the leaderboard in descending order (highest score first)
    gameState.leaderboard.sort((a, b) => b.score - a.score);
}

// Export the functions so they can be used in the controller
module.exports = {
    gameState,
    generateRandomGrid,
    setGridSize,
    checkMatch,
    addToLeaderboard,
};
    