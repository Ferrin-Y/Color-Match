const svgNS = "http://www.w3.org/2000/svg";	
let colour = "cornflowerblue";
let intervals = null;
let currentSet = [];
let matches = [];
let reset = null;
let noCubes = 9;
let gridArray = [];
let colours = [];
let colourGrid=[];
const img = document.getElementById('glimpse');
const svg = document.getElementById("board");
let clock =document.getElementById("countdown");
let score = document.getElementById('score');

function getMousePositionSVG(event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM().inverse());
    return point;
}

function makeMatch(){
    let size = 160;
    id = 1;
    for (let i = 0; i < 3; i++) {
        y = i*size;
        for (let j = 0; j < 3; j++) {
            let child = document.createElementNS(svgNS,"rect");
            child.setAttribute("x",j*size)
            child.setAttribute('y',y)
            child.setAttribute('width',size)
            child.setAttribute('height',size)
            child.setAttribute('id',"i" + id)
            child.setAttribute('filled',false);
            child.setAttribute('rx',15);
            id++;
            gridArray.push(child);
            img.appendChild(child);
        }
    }
    console.log(gridArray);
}

function fillColors(){
    /*gridArray.forEach(grid => {
        let fill = colours[Math.floor(Math.random()*colours.length)]
        currentSet.push(fill)
        grid.setAttribute('fill',fill)
        grid.setAttribute('filled',true)
    });*/
    let gridColors = [];
    for (let i = 0; i < gridArray.length; i++) {
        let fill = colours[Math.floor(Math.random()*colours.length)];
        gridColors.push(fill)
        gridArray[i].setAttribute('fill',fill)
        gridArray[i].setAttribute('filled',true)  
    }
    currentSet = gridColors;
    return currentSet;
}



var cubes = [];
for (let i = 1; i < 10; i++) {
    let c = document.getElementById("c" + i);
    let cube = {   
        x: parseInt(c.getAttribute('x')),
        y: parseInt(c.getAttribute('y')),
        width: parseInt(c.getAttribute('width')),
        height: parseInt(c.getAttribute('height')),
        id: c.id,
        Parent: false
    }
    cubes.push(cube); 
}


function getGridID(point) {
    let x = parseInt(point.x);
    let y = parseInt(point.y);
    let foundCube = cubes.find(cube => 
        (x > cube.x) && (x < cube.x + cube.width) && (y > cube.y) && (y < cube.y + cube.height));
    return foundCube;
}


function addSquare(event){
    let point = getMousePositionSVG(event);
    let cube = getGridID(point)
    if(!(cube.Parent)){
        let child = document.createElementNS(svgNS,"rect");
        child.setAttribute("x",cube.x)
        child.setAttribute('y',cube.y)
        child.setAttribute('width',cube.width)
        child.setAttribute('height',cube.height)
        child.setAttribute('id',"p" + cube.id)
        child.setAttribute('fill', colour);
        child.setAttribute('rx',20)
        cube.Parent = true;
        svg.appendChild(child);
    }

}


function removeSquare(event){
    let point = getMousePositionSVG(event);
    let cube = getGridID(point)
    if(cube.Parent){
        let child = document.getElementById("p"+cube.id);
        cube.Parent=false;
        svg.removeChild(child);
    }
}



function getColors(){
    colourGrid=[];
    cubes.forEach(cube => {
        if(cube.Parent){
            let child = document.getElementById("p"+cube.id);
            colourGrid.push(child.getAttribute("fill"));
        }
        else{
            colourGrid.push("");
        }

    });
    return colourGrid;
}


function compareArray(arr1,arr2){
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}


function submit(){
    let resetTimer = document.getElementById('resTime');
    let message = document.getElementById('message');
    answer = getColors();
    str = "Sorry! You didn't match right!";
    console.log(answer);
    console.log(currentSet)
    if(compareArray(answer, currentSet)){
        str = "Good job! You got it!"
        score.innerText=parseInt(score.innerText)+(currentSet.filter(item => item !== "")).length*100;
    }

    img.classList.remove('flip');
    img.classList.add('back');
    message.innerText = str;
    setTimeout(function(){
        message.innerText="Next round in.."
        let time = 5;
        img.classList.remove('back');   
        if(reset!=null){
            clearInterval(reset);
        }

        reset = setInterval(function(){
            time=time-1;
            resetTimer.innerText=time;
            if(time<=0){
                clearInterval(reset);
                resetTimer.innerText="";
            }
        },1000)

        cubes.forEach(cube => {
            if(cube.Parent){
                svg.removeChild(document.getElementById("p"+cube.id));
                cube.Parent=false;
            }
        });
        gridArray.forEach(grid => {
            grid.setAttribute('filled',false);
            grid.setAttribute('fill',"")
        });
    },2000)

    setTimeout(function(){
        rounds();
    },7000)

}


function rounds(){
    str = "Make your match!"
    document.getElementById("message").innerText=str;
    currentSet = fillColors();
    let time = 4;
    img.classList.remove('flip')
    setTimeout(() => {
        img.classList.add('flip');
    }, 10);

    time=time-1;
    clock.innerText=time;
    if(intervals!=null){
        clearInterval(intervals);
    }

    intervals = setInterval(function(){
        time=time-1;
        clock.innerText=time;
        if(time<=0){
            clearInterval(intervals);
        }
    },1000)

}

function startGame(){
    score.innerText="0";
    rounds();
}


window.addEventListener("load", function() {
    svg.addEventListener("click", addSquare, false);
    svg.addEventListener("dblclick", removeSquare, false);
    document.getElementById("start").addEventListener('click',startGame)
    document.getElementById("submit").addEventListener('click',submit);
    var buttons = document.getElementsByClassName("button");
    for (i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = buttons[i].id;
        buttons[i].setAttribute('title',buttons[i].id);
        colours.push(buttons[i].id);
    }
    
    colours.push(...Array(4).fill(""));
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function (e){
            colour = this.id;
        })
    }
    makeMatch();
});