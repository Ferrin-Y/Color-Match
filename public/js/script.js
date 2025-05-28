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

/** Initializes the game by setting up buttons and default grids. */
function initializeGame() {
    setButtonColors(); // Ensure buttons have colors on page load
    makeGrid();  // Generate player grid
    makeMatch(); // Generate blank match grid
    submitButton.disabled = true; // Keep submit button disabled initially
    updateScore(0); // Initialize score display
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
    startButton.disabled = true;
    slider.disabled = true;
    submitButton.disabled = false;
    clearButton.disabled = false;
    showMessage("Game started! Memorize the pattern...");

    fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridSize: numberOfCubes, buttonColors: colours })
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data.matchGrid)) {
            console.log("Received Match Grid:", data.matchGrid);
            startRound(data.matchGrid); // Begin round with colors
        } else {
            console.error("Error: Backend did not return a valid matchGrid.");
            showMessage("Error starting game. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error starting game:", error);
        showMessage("Error connecting to server. Please try again.");
    });
}

/** Begins a round and fills the match grid with colors. */
function startRound(matchGrid) {
    // Fill the match grid with colors
    gridArray.forEach((cell, index) => {
        cell.setAttribute("fill", matchGrid[index] || "none");
    });

    // Start the countdown timer
    timeRemaining = 5;
    countdownDisplay.innerText = timeRemaining;
    showMessage("Memorize the pattern!");

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(() => {
        timeRemaining--;
        countdownDisplay.innerText = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            clearMatchGrid(); // Hide match grid when timer runs out
            showMessage("Now recreate the pattern!");
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
    if (!gameState) {
        console.log("Game not started - can't color");
        return;
    }
    
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
    if (!gameState) return; // Only allow removing during game
    
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
            showMessage("Perfect match! +100 points");
            updateScore(data.score);
            // Start next round after delay
            setTimeout(() => {
                startNextRound();
            }, 2000);
        } else {
            showMessage("Not quite right. Try again!");
            updateScore(data.score);
        }
    })
    .catch(error => {
        console.error("Error submitting grid:", error);
        showMessage("Error submitting. Please try again.");
    });
}

/** Starts the next round. */
function startNextRound() {
    clearGrid(); // Clear player grid
    showMessage("Next round starting...");
    
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

/** Quits the current game. */
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
    showMessage("Game ended. Final score: " + currentScore);
}

/** Updates the score display. */
function updateScore(newScore) {
    currentScore = newScore;
    scoreDisplay.innerText = currentScore;
}

/** Shows a message to the user. */
function showMessage(message) {
    messageDisplay.innerText = message;
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

/** Event Listeners */
window.addEventListener("load", initializeGame);
svg.addEventListener("click", addSquare);
svg.addEventListener("dblclick", removeSquare);
startButton.addEventListener("click", startGame);
submitButton.addEventListener("click", submitGrid);
clearButton.addEventListener("click", clearGrid);
quitButton.addEventListener("click", quitGame);