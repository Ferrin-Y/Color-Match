const svgNS = "http://www.w3.org/2000/svg";	
let colour = "skyblue"; // Default colour
let numberOfCubes = 6; // Default grid size
let gridArray = []; // Match grid elements
let cubes = []; // Player grid tracking objects
let colours = []; // Color options
let gameState = false; // Game running status
let timeRemaining = 5; // Countdown timer duration
let countdownInterval = null;
let currentScore = 0;
let currentRounds = 0;

const matchBoard = document.getElementById("glimpse"); // Match board (target grid)
const svg = document.getElementById("board"); // Player board (editable grid)
const slider = document.getElementById("difficulty"); // Difficulty slider
const startButton = document.getElementById("start"); // Start button
const submitButton = document.getElementById("submit"); // Submit button
const clearButton = document.getElementById("clear"); // Clear button
const quitButton = document.getElementById("quit"); // Quit button
const countdownDisplay = document.getElementById("countdown"); // Timer display
const scoreDisplay = document.getElementById("score"); // Score display
const messageDisplay = document.getElementById("message"); // Message display
const buttons = document.getElementsByClassName("button"); // Color buttons
const refreshLeaderboardBtn = document.getElementById("refreshLeaderboard"); // Refresh button

// Toast and Modal elements
const gameToast = new bootstrap.Toast(document.getElementById('gameToast'));
const toastMessage = document.getElementById('toastMessage');
const nameModal = new bootstrap.Modal(document.getElementById('nameModal'));
const playerNameInput = document.getElementById('playerNameInput');
const submitToLeaderboardBtn = document.getElementById('submitToLeaderboard');
const skipLeaderboardBtn = document.getElementById('skipLeaderboard');
const finalScoreDisplay = document.getElementById('finalScore');
const finalRoundsDisplay = document.getElementById('finalRounds');

/** Initializes the game by setting up buttons and default grids. */
function initializeGame() {
    setButtonColors(); // Ensure buttons have colors on page load
    makeGrid();  // Generate player grid
    makeMatch(); // Generate blank match grid
    submitButton.disabled = true; // Keep submit button disabled initially
    updateScore(0); // Initialize score display
    loadLeaderboard(); // Load initial leaderboard
}

/** Assigns colors to the buttons and saves them for later use. */
function setButtonColors() {
    colours = [];
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = buttons[i].id;
        buttons[i].setAttribute('title', buttons[i].id);
        colours.push(buttons[i].id);
    }
    // Set first button as selected by default
    if (buttons.length > 0) {
        colour = buttons[0].id;
        buttons[0].classList.add('selected');
    }
}

function getMousePositionSVG(event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM().inverse());
    return point;
}

/**
 * Creates an array of cube objects with their properties for tracking.
 * Each cube represents a grid cell on the game board.
 */
function cubeArray() {
    cubes = []; // Reset the cubes array
    for (let i = 1; i < numberOfCubes * numberOfCubes + 1; i++) {
        let c = document.getElementById("c" + i);
        if (c) {
            let cube = {
                x: parseInt(c.getAttribute("x")),
                y: parseInt(c.getAttribute("y")),
                width: parseInt(c.getAttribute("width")),
                height: parseInt(c.getAttribute("height")),
                id: c.id,
                Parent: false, // Track if this cell has a colored square
            };
            cubes.push(cube);
        }
    }
}

/**
 * Finds the cube on the grid that corresponds to the given point.
 * @param {DOMPoint} point - The point on the SVG (e.g., mouse position).
 * @returns {Object|null} The cube object if found; otherwise, null.
 */
function getGridID(point) {
    let x = parseInt(point.x);
    let y = parseInt(point.y);
    return cubes.find(
        (cube) =>
            x > cube.x &&
            x < cube.x + cube.width &&
            y > cube.y &&
            y < cube.y + cube.height
    );
}

/** Generates the player's grid based on `numberOfCubes`. */
function makeGrid() {
    svg.innerHTML = ''; // Clear existing grid
    
    let size = 900 / numberOfCubes;
    let id = 1;

    for (let i = 0; i < numberOfCubes; i++) {
        let y = i * size;
        for (let j = 0; j < numberOfCubes; j++) {
            let child = document.createElementNS(svgNS, "rect");
            child.setAttribute("x", j * size);
            child.setAttribute("y", y);
            child.setAttribute("width", size);
            child.setAttribute("height", size);
            child.setAttribute("id", "c" + id);
            child.setAttribute("stroke", "#333");
            child.setAttribute("stroke-width", 30 / numberOfCubes);
            child.setAttribute("rx", 30 / numberOfCubes);
            child.setAttribute("fill", "none"); // No fill before coloring
            id++;
            svg.appendChild(child);
        }
    }
    
    // Create the cube tracking array after grid is built
    cubeArray();
}

/** Generates an empty match grid before the game starts. */
function makeMatch() {
    matchBoard.innerHTML = ''; // Clear match grid
    gridArray = [];

    let size = 480 / numberOfCubes;
    let id = 1;

    for (let i = 0; i < numberOfCubes; i++) {
        let y = i * size;
        for (let j = 0; j < numberOfCubes; j++) {
            let child = document.createElementNS(svgNS, "rect");
            child.setAttribute("x", j * size);
            child.setAttribute("y", y);
            child.setAttribute("width", size);
            child.setAttribute("height", size);
            child.setAttribute("id", "i" + id);
            child.setAttribute("rx", 45 / numberOfCubes);
            child.setAttribute("stroke", "#333");
            child.setAttribute("stroke-width", 30 / numberOfCubes);
            child.setAttribute("fill", "none"); // No fill before game starts
            id++;
            matchBoard.appendChild(child);
            gridArray.push(child);
        }
    }
}

/** Starts the game and prepares the first round. */
function startGame() {
    gameState = true;
    currentRounds = 0;
    startButton.disabled = true;
    slider.disabled = true;
    submitButton.disabled = false;
    clearButton.disabled = false;
    showToastMessage("Game started! Memorize the pattern...", "success");

    // First reset the game
    fetch('/api/game/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
        // Then start the new round
        return fetch('/api/game/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridSize: numberOfCubes, buttonColors: colours })
        });
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data.matchGrid)) {
            console.log("Received Match Grid:", data.matchGrid);
            startRound(data.matchGrid);
            updateScore(0); // Update frontend score display
        } else {
            console.error("Error: Backend did not return a valid matchGrid.");
            showToastMessage("Error starting game. Please try again.", "danger");
        }
    })
    .catch(error => {
        console.error("Error starting game:", error);
        showToastMessage("Error connecting to server. Please try again.", "danger");
    });
}

/** Begins a round and fills the match grid with colors. */
function startRound(matchGrid) {
    currentRounds++;
    
    // Fill the match grid with colors
    gridArray.forEach((cell, index) => {
        cell.setAttribute("fill", matchGrid[index] || "none");
    });

    // Start the countdown timer
    timeRemaining = 5 + Math.floor(numberOfCubes/2);
    countdownDisplay.innerText = timeRemaining;
    showToastMessage("Memorize the pattern!", "info");

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(() => {
        timeRemaining--;
        countdownDisplay.innerText = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            clearMatchGrid(); // Hide match grid when timer runs out
            showToastMessage("Now recreate the pattern!", "danger");
        }
    }, 1000);
}

/** Clears the match grid when the timer runs out. */
function clearMatchGrid() {
    gridArray.forEach(cell => {
        cell.setAttribute("fill", "none"); // Make all cells blank
    });
}

/**
 * Adds a square to the grid at the clicked position.
 * The square is visually represented with the current `colour`.
 * @param {MouseEvent} event - The mouse click event on the SVG.
 */
function addSquare(event) {
    // if (!gameState) {
    //     console.log("Game not started - can't color");
    //     return;
    // }
    
    let point = getMousePositionSVG(event);
    let cube = getGridID(point);
    
    if (cube && !cube.Parent) {
        let child = document.createElementNS(svgNS, "rect");
        child.setAttribute("x", cube.x);
        child.setAttribute("y", cube.y);
        child.setAttribute("width", cube.width);
        child.setAttribute("height", cube.height);
        child.setAttribute("id", "p" + cube.id);
        child.setAttribute("fill", colour);
        child.setAttribute("stroke", "#333");
        child.setAttribute("stroke-width", (30 / numberOfCubes) * 2);
        child.setAttribute("rx", 60 / numberOfCubes);
        cube.Parent = true;
        svg.appendChild(child);
    }
}

/**
 * Removes a square from the grid at the clicked position.
 * @param {MouseEvent} event - The mouse double-click event on the SVG.
 */
function removeSquare(event) {
    //if (!gameState) return; // Only allow removing during game
    
    let point = getMousePositionSVG(event);
    let cube = getGridID(point);
    
    if (cube && cube.Parent) {
        let child = document.getElementById("p" + cube.id);
        if (child) {
            cube.Parent = false;
            svg.removeChild(child);
        }
    }
}

/** Clears all colors from the player grid. */
function clearGrid() {
    cubes.forEach(cube => {
        if (cube.Parent) {
            let child = document.getElementById("p" + cube.id);
            if (child) {
                svg.removeChild(child);
                cube.Parent = false;
            }
        }
    });
}

/** Submits the player's grid for scoring. */
function submitGrid() {
    if (!gameState) return;

    // Get current player grid state from the colored overlay squares
    const playerGrid = cubes.map(cube => {
        if (cube.Parent) {
            const coloredSquare = document.getElementById("p" + cube.id);
            return coloredSquare ? coloredSquare.getAttribute("fill") : "";
        }
        return "";
    });

    fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerGrid: playerGrid })
    })
    .then(response => response.json())
    .then(data => {
        if (data.match) {
            showToastMessage(`Perfect match! +${data.points * 100} points 🎉`, "success");
            updateScore(data.score);
            // Start next round after delay
            setTimeout(() => {
                startNextRound();
            }, 2000);
        } else {
            showToastMessage("Not quite right. Try again! 🤔", "warning");
            updateScore(data.score);
        }
    })
    .catch(error => {
        console.error("Error submitting grid:", error);
        showToastMessage("Error submitting. Please try again.", "danger");
    });
}

/** Starts the next round. */
function startNextRound() {
    clearGrid(); // Clear player grid
    showToastMessage("Next round starting...", "info");
    
    // Request new pattern
    fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridSize: numberOfCubes, buttonColors: colours })
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data.matchGrid)) {
            startRound(data.matchGrid);
        }
    })
    .catch(error => {
        console.error("Error starting next round:", error);
    });
}

/** Quits the current game and shows name input modal. */
function quitGame() {
    gameState = false;
    startButton.disabled = false;
    slider.disabled = false;
    submitButton.disabled = true;
    clearButton.disabled = true;
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    clearGrid();
    clearMatchGrid();
    countdownDisplay.innerText = "0";
    
    // Show game over modal
    finalScoreDisplay.textContent = currentScore;
    finalRoundsDisplay.textContent = currentRounds;
    playerNameInput.value = '';
    nameModal.show();
}

/** Submits score to leaderboard. */
function submitToLeaderboard() {
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showToastMessage("Please enter your name!", "warning");
        return;
    }
    
    if (playerName.length > 20) {
        showToastMessage("Name too long! Maximum 20 characters.", "warning");
        return;
    }

    fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: playerName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToastMessage("Added to leaderboard! 🏆", "success");
            loadLeaderboard(); // Refresh leaderboard
            nameModal.hide();
        } else {
            showToastMessage(data.error || "Failed to add to leaderboard", "danger");
        }
    })
    .catch(error => {
        console.error("Error submitting to leaderboard:", error);
        showToastMessage("Error submitting to leaderboard", "danger");
    });
}

/** Loads and displays the leaderboard. */
function loadLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(data => {
        displayLeaderboard(data);
    })
    .catch(error => {
        console.error("Error loading leaderboard:", error);
        document.getElementById('leaderboardContent').innerHTML = `
            <div class="text-center text-danger">
                <i class="bi bi-exclamation-triangle"></i>
                <p>Error loading leaderboard</p>
            </div>
        `;
    });
}

/** Displays the leaderboard data. */
function displayLeaderboard(leaderboardData) {
    const container = document.getElementById('leaderboardContent');
    
    if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-trophy"></i>
                <p>No scores yet. Be the first!</p>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive">';
    html += '<table class="table table-dark table-sm table-striped">';
    html += `
        <thead>
            <tr class="text-warning">
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Score</th>
                <th scope="col">Rounds</th>
                <th scope="col">Date</th>
            </tr>
        </thead>
        <tbody>
    `;

    leaderboardData.forEach((entry, index) => {
        const date = new Date(entry.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const position = index + 1;
        let rankIcon = '';
        if (position === 1) rankIcon = '<i class="bi bi-trophy-fill text-warning"></i>';
        else if (position === 2) rankIcon = '<i class="bi bi-award-fill text-secondary"></i>';
        else if (position === 3) rankIcon = '<i class="bi bi-award-fill text-warning"></i>';
        else rankIcon = position;

        html += `
            <tr>
                <td>${rankIcon}</td>
                <td class="fw-bold">${escapeHtml(entry.name)}</td>
                <td class="text-success">${entry.score}</td>
                <td class="text-info">${entry.rounds}</td>
                <td class="text-muted small">${date}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/** Escapes HTML to prevent XSS. */
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

/** Updates the score display. */
function updateScore(newScore) {
    currentScore = newScore;
    scoreDisplay.innerText = currentScore;
}

/** Shows a message to the user (legacy support). */
function showMessage(message) {
    messageDisplay.innerText = message;
}

/** Shows a toast message with different styles. */
function showToastMessage(message, type = 'primary') {
    toastMessage.textContent = message;
    const toast = document.getElementById('gameToast');
    
    // Remove existing type classes
    toast.classList.remove('primary', 'success', 'warning', 'danger', 'info');
    
    toast.classList.add(type);
    
    gameToast.show();
    
    // Also update legacy message display
    showMessage(message);
}

/** Updates grid size dynamically when slider is moved. */
slider.addEventListener("input", () => {
    if (!gameState) { // Only allow changes when game is not running
        numberOfCubes = parseInt(slider.value);
        makeGrid();
        makeMatch();
    }
});

/** Sets selected color when a button is clicked. */
Array.from(buttons).forEach(button => {
    button.addEventListener("click", () => {
        // Remove selected class from all buttons
        Array.from(buttons).forEach(btn => btn.classList.remove('selected'));
        // Add selected class to clicked button
        button.classList.add('selected');
        colour = button.id;
    });
});

/** Modal event listeners */
submitToLeaderboardBtn.addEventListener('click', submitToLeaderboard);
skipLeaderboardBtn.addEventListener('click', () => {
    nameModal.hide();
    showToastMessage(`Game ended. Final score: ${currentScore}`, "info");
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitToLeaderboard();
    }
});

refreshLeaderboardBtn.addEventListener('click', loadLeaderboard);

/** Event Listeners */
window.addEventListener("load", initializeGame);
svg.addEventListener("click", addSquare);
svg.addEventListener("dblclick", removeSquare);
startButton.addEventListener("click", startGame);
submitButton.addEventListener("click", submitGrid);
clearButton.addEventListener("click", clearGrid);
quitButton.addEventListener("click", quitGame);