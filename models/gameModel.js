// models/gameModel.js

let gameState = {
    targetGrid: [],
    playerGrid: [],
    score: 0,
    gridSize: 6,
    buttonColors: [],
    leaderboard: []
};

// Function to generate the random target grid
function generateRandomGrid() {
    const grid = [];
    const totalCells = gameState.gridSize * gameState.gridSize;
    for (let i = 0; i < totalCells; i++) {
        grid.push(gameState.buttonColors[Math.floor(Math.random() * gameState.buttonColors.length)]);
    }
    return grid;
}

function getHiddenGrid() {
    return Array(gameState.targetGrid.length).fill(""); // Empty values for frontend
}

// Function to set grid size and button colors
function setGridSize(size, colors) {
    gameState.gridSize = size;
    gameState.buttonColors = colors;
}

// Function to check if the player's grid matches the target grid
function checkMatch(playerGrid) {
    const match = playerGrid.every((color, idx) => color === gameState.targetGrid[idx]);
    if (match) {
        gameState.score += 100;  // Increment score for correct match
    }
    return match;
}

// Function to add score to leaderboard
function addToLeaderboard(playerName) {
    gameState.leaderboard.push({ name: playerName, score: gameState.score });
    gameState.leaderboard.sort((a, b) => b.score - a.score);  // Sort leaderboard by score
}

module.exports = {
    gameState,
    generateRandomGrid,
    getHiddenGrid,
    setGridSize
};
