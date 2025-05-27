let gameState = {
    targetGrid: [],
    playerGrid: [],
    score: 0,
    gridSize: 6,
    buttonColors: [],
    leaderboard: [],
    currentRound: 0
};

// Function to generate the random target grid
function generateRandomGrid() {
    const grid = [];
    const totalCells = gameState.gridSize * gameState.gridSize;
    
    // Generate a pattern with some empty cells for variety
    for (let i = 0; i < totalCells; i++) {
        // 70% chance to have a color, 30% chance to be empty
        if (Math.random() < 0.7) {
            grid.push(gameState.buttonColors[Math.floor(Math.random() * gameState.buttonColors.length)]);
        } else {
            grid.push("none");
        }
    }
    
    gameState.targetGrid = grid;
    return grid;
}

// Function to get the target grid (for display during memorization phase)
function getTargetGrid() {
    return gameState.targetGrid;
}

// Function to get hidden grid (empty values for when pattern is hidden)
function getHiddenGrid() {
    return Array(gameState.targetGrid.length).fill("none");
}

// Function to set grid size and button colors
function setGridSize(size, colors) {
    gameState.gridSize = size;
    gameState.buttonColors = colors;
    gameState.targetGrid = []; // Reset target grid when size changes
}

// Function to check if the player's grid matches the target grid
function checkMatch(playerGrid) {
    if (!Array.isArray(playerGrid) || playerGrid.length !== gameState.targetGrid.length) {
        return false;
    }
    
    // Convert empty strings to "none" for comparison
    const normalizedPlayerGrid = playerGrid.map(cell => cell === "" ? "none" : cell);
    
    const match = normalizedPlayerGrid.every((color, idx) => color === gameState.targetGrid[idx]);
    
    if (match) {
        gameState.score += 100;  // Increment score for correct match
        gameState.currentRound++;
    }
    
    return match;
}

// Function to get current score
function getCurrentScore() {
    return gameState.score;
}

// Function to reset score
function resetScore() {
    gameState.score = 0;
    gameState.currentRound = 0;
}

// Function to add score to leaderboard
function addToLeaderboard(playerName) {
    if (!playerName || typeof playerName !== 'string') {
        return false;
    }
    
    gameState.leaderboard.push({ 
        name: playerName.trim(), 
        score: gameState.score,
        rounds: gameState.currentRound,
        date: new Date().toISOString()
    });
    
    // Sort leaderboard by score (highest first)
    gameState.leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    if (gameState.leaderboard.length > 10) {
        gameState.leaderboard = gameState.leaderboard.slice(0, 10);
    }
    
    return true;
}

// Function to get leaderboard
function getLeaderboard() {
    return gameState.leaderboard;
}

// Function to get current game state (for debugging)
function getGameState() {
    return {
        score: gameState.score,
        gridSize: gameState.gridSize,
        currentRound: gameState.currentRound,
        hasTargetGrid: gameState.targetGrid.length > 0
    };
}

export default {
    gameState,
    generateRandomGrid,
    getTargetGrid,
    getHiddenGrid,
    setGridSize,
    checkMatch,
    getCurrentScore,
    resetScore,
    addToLeaderboard,
    getLeaderboard,
    getGameState
};