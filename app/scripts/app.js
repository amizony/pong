// basic grid for visual
function drawGrid() {
  for (var x = 10; x < 800; x += 10) {
    context.moveTo(x, 0);
    context.lineTo(x, 600);
  }
  for (var y = 10; y < 600; y += 10) {
    context.moveTo(0, y);
    context.lineTo(800, y);
  }
  context.strokeStyle = "#eee";
  context.stroke();
}

// paddles

function paddle(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.length = 100;
  this.width = 6;
  this.render = function() {
    context.beginPath();
    context.rect(this.positionX, this.positionY, this.width, this.length);
    context.fillStyle = "#000";
    context.fill();
  };
}

var leftPaddle = new paddle(20,200);

var rightPaddle = new paddle(780,200);


// ball

function ball(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.radius = 7;
  this.render = function() {
    var counterClockWise = true;
    context.beginPath();
    context.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI, counterClockWise);
    context.fillStyle = "#000";
    context.fill();
  };
}

var gameBall = new ball(450,250);


// functions

function render() {
  drawPending = false;
  leftPaddle.render();
  rightPaddle.render();
  gameBall.render();
}

var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback) { window.setTimeout(callback, 1000/60) };


function step() {
  if (!drawPending) {
    drawPending = true;
    render();
    animate(step);
  }
}

// main

var gameCanvas = document.getElementById("game");

var context = gameCanvas.getContext("2d");

drawGrid();


var drawPending = false;

window.onload = animate(step);
