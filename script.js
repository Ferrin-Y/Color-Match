const svgNS = "http://www.w3.org/2000/svg";	
let color = "cornflowerblue";
let intervals = null;
let currentSet = [];
let matches = [];
let reset = null;
const img = document.getElementById('glimpse');
const svg = document.getElementById("board");
var clock =document.getElementById("countdown");
let score = document.getElementById('score');

function getMousePositionSVG(event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM().inverse());
    return point;
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
        (x > cube.x) && (x < cube.x + cube.width) &&
        (y > cube.y) && (y < cube.y + cube.height));
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
        child.setAttribute('fill', color);
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


let colorGrid=[];
function getColors(){
    colorGrid=[];
    cubes.forEach(cube => {
        if(cube.Parent){
            let child = document.getElementById("p"+cube.id);
            colorGrid.push(child.getAttribute("fill"));
        }
        else{
            colorGrid.push("");
        }

    });
    return colorGrid;
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
    if(compareArray(answer, currentSet[1])){
        str = "Good job! You got it!"
        score.innerText=parseInt(score.innerText)+100;  
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
    },2000)

    setTimeout(function(){
        rounds();
    },7000)

}


function rounds(){
    str = "Make your match!"
    document.getElementById("message").innerText=str;
    currentSet = matches[Math.floor(Math.random()*matches.length)];
    matches.splice(matches.indexOf(currentSet),1);
    img.src = currentSet[0];
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
    matches = [["images/1.png",['', 'cornflowerblue', '', '', 'palegreen', 'rebeccapurple', '', 'cornflowerblue', '']],["images/2.png",['', 'crimson', 'gold', 'gold', 'gold', '', '', 'palegreen', 'gold']],["images/3.png",['pink', '', 'pink', 'pink', 'crimson', 'pink', '', 'pink', '']],["images/4.png",['', 'gold', '', 'gold', 'cornflowerblue', 'gold', '', 'rebeccapurple', '']],['images/5.png',['cornflowerblue', 'cornflowerblue', '', 'cornflowerblue', 'crimson', 'palegreen', '', 'palegreen', 'palegreen']],["images/6.png",['pink', '', 'rebeccapurple', '', 'crimson', '', 'rebeccapurple', '', 'pink']]];
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
    }
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function (e){
            color = this.id;
        })
        
    }

});