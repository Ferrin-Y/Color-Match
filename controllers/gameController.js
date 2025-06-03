import gameModel from '../models/gameModel.js';

const { 
    setGridSize, 
    generateRandomGrid, 
    gameState, 
    getCurrentScore, 
    checkMatch, 
    getLeaderboard, 
    addToLeaderboard, 
    getGameState, 
    resetScore 
} = gameModel;

// Start a new game round
function startNewRound(req, res) {
    try {
        const { gridSize, buttonColors } = req.body;

        // Validate input
        if (!gridSize || !Array.isArray(buttonColors) || buttonColors.length === 0) {
            return res.status(400).json({ error: "Invalid input data" });
        }

        if (gridSize < 1 || gridSize > 11) {
            return res.status(400).json({ error: "Grid size must be between 1 and 11" });
        }

        // Set the game parameters
        setGridSize(gridSize, buttonColors);
        
        // Generate new target grid
        const targetGrid = generateRandomGrid();

        console.log("Generated target grid:", targetGrid);

        // Send the target grid to display during memorization phase
        res.json({
            gridSize: gameState.gridSize,
            buttonColors: gameState.buttonColors,
            matchGrid: targetGrid, // Send actual target grid for display
            score: getCurrentScore()
        });

    } catch (error) {
        console.error("Error starting new round:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Submit the player's grid for comparison
function submitGame(req, res) {
    try {
        const { playerGrid } = req.body;
        
        // Validate player grid
        if (!Array.isArray(playerGrid)) {
            return res.status(400).json({ error: "Player grid must be an array" });
        }

        if (playerGrid.length !== gameState.targetGrid.length) {
            return res.status(400).json({ 
                error: "Player grid size doesn't match target grid size",
                expected: gameState.targetGrid.length,
                received: playerGrid.length
            });
        }
        
        console.log("Player grid:", playerGrid);
        console.log("Target grid:", gameState.targetGrid);
        
        // Check if player's grid matches the target grid
        const result = checkMatch(playerGrid);
        const match = result.match;
        const matchedCount = result.matchedCount;
        const currentScore = getCurrentScore();

        console.log("Match result:", match, "Score:", currentScore);

        // Update session score
        if (!req.session.score) {
            req.session.score = 0;
        }
        req.session.score = currentScore;

        res.json({
            match,
            score: currentScore,
            targetGrid: gameState.targetGrid, // Send target grid for reference
            points: matchedCount
        });

    } catch (error) {
        console.error("Error submitting game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get the leaderboard
function getLeaderboardData(req, res) {
    try {
        const leaderboard = getLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Add player's score to leaderboard
function addScoreToLeaderboard(req, res) {
    try {
        const { playerName } = req.body;

        if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
            return res.status(400).json({ error: "Valid player name is required" });
        }

        if (playerName.trim().length > 20) {
            return res.status(400).json({ error: "Player name too long (max 20 characters)" });
        }

        const success = addToLeaderboard(playerName.trim());
        
        if (!success) {
            return res.status(400).json({ error: "Failed to add to leaderboard" });
        }

        const leaderboard = getLeaderboard();
        res.json({
            success: true,
            leaderboard: leaderboard,
            message: "Score added to leaderboard!"
        });

    } catch (error) {
        console.error("Error adding to leaderboard:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get current game state (for debugging)
function getGameStateData(req, res) {
    try {
        const state = getGameState();
        res.json(state);
    } catch (error) {
        console.error("Error getting game state:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Reset game score
function resetGame(req, res) {
    try {
        resetScore();
        req.session.score = 0;
        res.json({ 
            success: true, 
            message: "Game reset successfully",
            score: 0
        });
    } catch (error) {
        console.error("Error resetting game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export default {
    startNewRound,
    submitGame,
    getLeaderboard: getLeaderboardData,
    addScoreToLeaderboard,
    getGameState: getGameStateData,
    resetGame
};