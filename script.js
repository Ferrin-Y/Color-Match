const svgNS = "http://www.w3.org/2000/svg";	
let colour = "cornflowerblue"; //Default colour
let timeIntervals = null; //interval for timer
let currentGridSet = []; //current svg grid
let resetInterval = null; //interval to reset game
let numberOfCubes = 6; //number of cubes in one axis on the grid
let gameState = false;
let gridArray = [];
let colours = []; //list of colours to fill match Board with
let colourGrid=[]; //grid of filled Colours
let cubes = []; //array of cube objects, used to refer to cube dimensions
let timerIDs = []; //array to hold IDs of intervals and timers
let buttons = []; //array of button objects
let clock = document.getElementById("countdown"); //countdown till next match
let score = document.getElementById('score'); //score tracker
let submitButton = document.getElementById('submit'); //submit button
const slider = document.getElementById('difficulty'); //slider for difficulty
const matchBoard = document.getElementById('glimpse'); //board that shows grid to be matched
const svg = document.getElementById("board"); //main svg board
const startButton = document.getElementById('start'); //start button


/**
 * Gets the mouse position relative to the SVG element.
 * @param {MouseEvent} event - The mouse event triggered on the SVG.
 * @returns {DOMPoint} The mouse position transformed to SVG coordinates.
 */
function getMousePositionSVG(event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM().inverse());
    return point;
}

/**
 * Creates a grid of cubes on the SVG board.
 * Removes any existing cubes and dynamically generates a new grid
 * based on the `numberOfCubes` value.
 */
function makeGrid() {
    for (let k = 0; k < cubes.length; k++) {
        let temp = document.getElementById("c" + (k + 1));
        temp.remove();
    }
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
            child.setAttribute("stroke-width", 30 / numberOfCubes);
            child.setAttribute("rx", 30 / numberOfCubes);
            id++;
            svg.appendChild(child);
        }
    }
    cubeArray();
}

/**
 * Creates a matching grid for the player to replicate.
 * Generates grid elements on the matchBoard container with random IDs and styles.
 */
function makeMatch() {
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
            child.setAttribute("filled", false);
            child.setAttribute("rx", 45 / numberOfCubes);
            child.setAttribute("stroke-width", 30 / numberOfCubes);
            id++;
            gridArray.push(child);
            matchBoard.appendChild(child);
        }
    }
    console.log(gridArray);
}

/**
 * Fills the matching grid with random colors from the `colours` array.
 * Updates the `currentGridSet` with the new grid colors.
 * @returns {string[]} The current set of grid colors.
 */
function fillColors() {
    let gridColors = [];
    for (let i = 0; i < gridArray.length; i++) {
        let fill = colours[Math.floor(Math.random() * colours.length)];
        gridColors.push(fill);
        gridArray[i].setAttribute("fill", fill);
        gridArray[i].setAttribute("filled", true);
    }
    currentGridSet = gridColors;
    return currentGridSet;
}

/**
 * Creates an array of cube objects with their properties for tracking.
 * Each cube represents a grid cell on the game board.
 */
function cubeArray() {
    cubes = [];
    for (let i = 1; i < numberOfCubes * numberOfCubes + 1; i++) {
        let c = document.getElementById("c" + i);
        let cube = {
            x: parseInt(c.getAttribute("x")),
            y: parseInt(c.getAttribute("y")),
            width: parseInt(c.getAttribute("width")),
            height: parseInt(c.getAttribute("height")),
            id: c.id,
            Parent: false,
        };
        cubes.push(cube);
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

/**
 * Adds a square to the grid at the clicked position.
 * The square is visually represented with the current `colour`.
 * @param {MouseEvent} event - The mouse click event on the SVG.
 */
function addSquare(event) {
    let point = getMousePositionSVG(event);
    let cube = getGridID(point);
    if (!cube.Parent) {
        let child = document.createElementNS(svgNS, "rect");
        child.setAttribute("x", cube.x);
        child.setAttribute("y", cube.y);
        child.setAttribute("width", cube.width);
        child.setAttribute("height", cube.height);
        child.setAttribute("id", "p" + cube.id);
        child.setAttribute("fill", colour);
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
    let point = getMousePositionSVG(event);
    let cube = getGridID(point);
    if (cube.Parent) {
        let child = document.getElementById("p" + cube.id);
        cube.Parent = false;
        svg.removeChild(child);
    }
}

/**
 * Retrieves the color configuration of the grid.
 * @returns {string[]} Array of colors representing the grid state.
 */
function getColors() {
    colourGrid = [];
    cubes.forEach((cube) => {
        if (cube.Parent) {
            let child = document.getElementById("p" + cube.id);
            colourGrid.push(child.getAttribute("fill"));
        } else {
            colourGrid.push("");
        }
    });
    return colourGrid;
}

/**
 * Compares two arrays to check if they are identical.
 * @param {string[]} arr1 - The first array.
 * @param {string[]} arr2 - The second array.
 * @returns {boolean} True if the arrays are identical; otherwise, false.
 */
function compareArray(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

/**
 * Clears the game board by removing all added squares.
 */
function clearBoard() {
    cubes.forEach((cube) => {
        if (cube.Parent) {
            svg.removeChild(document.getElementById("p" + cube.id));
            cube.Parent = false;
        }
    });
}

/**
 * Handles the submit action to check if the player's grid matches the target grid.
 * Updates the score and displays messages based on the result.
 */
function submit() {
    let resetTimer = document.getElementById("resTime");
    let message = document.getElementById("message");
    submitButton.disabled = true;
    let answer = getColors();
    let str = "Sorry! You didn't match right!";
    if (compareArray(answer, currentGridSet)) {
        str = "Good job! You got it!";
        score.innerText =
            parseInt(score.innerText) + 50 + currentGridSet.filter((item) => item !== "").length * 100; //incrementing score depending on how many colour grids were right
    }

    matchBoard.classList.remove("flip");
    matchBoard.classList.add("back");
    message.innerText = str;
    roundDelay = setTimeout(function () {
        message.innerText = "Next round in..";
        let time = 5;
        matchBoard.classList.remove("back");
        if (resetInterval != null) {
            clearInterval(resetInterval);
        }

        resetInterval = setInterval(function () {
            time = time - 1;
            resetTimer.innerText = time;
            if (time <= 0) {
                clearInterval(resetInterval);
                resetTimer.innerText = "";
            }
        }, 1000);
        timerIDs.push(resetInterval);

        clearBoard();

        gridArray.forEach((grid) => {
            grid.setAttribute("filled", false);
            grid.setAttribute("fill", "");
        }); //clearing ever fill in the array
    }, 2000);
    timerIDs.push(roundDelay);

    roundDuration = setTimeout(function () {
        rounds();
    }, 7000 + Math.max(0, numberOfCubes - 3) * 1.5);
    timerIDs.push(roundDuration);
}

/**
 * Delays the flipping animation by the given time.
 * @param {number} delay - The delay time in seconds.
 */
function flipDelay(delay) {
    document.documentElement.style.setProperty("--animation-delay", delay);
}

/**
 * Starts a new round of the game.
 * Displays the new target grid and sets up the timer for the player's turn.
 */
function rounds() {
    submitButton.disabled = false;
    let str = "Make your match!";

    document.getElementById("message").innerText = str;
    currentGridSet = fillColors();

    let time = 4 + Math.max(0, numberOfCubes - 3) * 2.5;
    matchBoard.classList.remove("flip");
    
    let addClass = setTimeout(() => {
        flipDelay(time + "s");
        matchBoard.classList.add("flip");
    }, 10);
    timerIDs.push(addClass);

    time = time - 1;
    clock.innerText = time;
    if (timeIntervals != null) {
        clearInterval(timeIntervals);
    }

    timeIntervals = setInterval(function () {
        time = time - 0.5;
        clock.innerText = time.toFixed(1);
        if (time <= 0) {
            clearInterval(timeIntervals);
        }
    }, 500);
    timerIDs.push(timeIntervals);
}

/**
 * Starts the game and initializes the first round.
 * Disables UI elements to prevent changes during the game.
 */
function startGame() {
    gameState = true;
    slider.disabled = gameState;
    score.innerText = "0";
    startButton.disabled = gameState;
    colourButtons();
    rounds();
}


/*
 *Setting empty colours depending on the number of cubes
 */
function colourButtons(){ 
    colours = [];
    for (i = 0; i < buttons.length; i++) { //getting list of colours from buttons
        buttons[i].style.backgroundColor = buttons[i].id;
        buttons[i].setAttribute('title', buttons[i].id);
        colours.push(buttons[i].id);
    }
    colours.push(...Array(numberOfCubes-1).fill(""));
}

window.addEventListener("load", function() {
    svg.addEventListener("click", addSquare, false);
    svg.addEventListener("dblclick", removeSquare, false);
    startButton.addEventListener('click',startGame);
    submitButton.addEventListener('click',submit);
    document.getElementById("clear").addEventListener('click',clearBoard);
    document.getElementById("quit").addEventListener('click', function(){
        gameState = false;
        slider.disabled = gameState;
        timerIDs.forEach((id) => {
            clearTimeout(id);
            clearInterval(id);
        }); 
        startButton.disabled = gameState;
        submitButton.disabled = !gameState;
    })

    buttons = document.getElementsByClassName("button");
    colourButtons();

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function (e){
            colour = this.id; //getting colour from the ID of the button
        })
    }

    slider.addEventListener('input', (event) => {
        const value = parseFloat(event.target.value);
        numberOfCubes = value;
        makeGrid();
        makeMatch();  
    });
    makeGrid();
    makeMatch();
});