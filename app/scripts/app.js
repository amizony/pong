// paddles

function paddle(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.length = 100;
  this.width = 6;
  this.speed = 5;
  this.render = function() {
    context.beginPath();
    context.rect(this.positionX, this.positionY, this.width, this.length);
    context.fillStyle = "#000";
    context.fill();
  };
  this.move = function(event, paddle) {
    if (event.keyCode == 38) {
      paddle.positionY -= 5;
      if (paddle.positionY < 0) {
        paddle.positionY = 0;
      }
    }
    if (event.keyCode == 40) {
      paddle.positionY += 5;
      if (paddle.positionY > 600 - paddle.length) {
        paddle.positionY = 600 - paddle.length;
      }
    }

  };
}

var leftPaddle = new paddle(20,200);

var rightPaddle = new paddle(780,400);


// ball

function ball(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.radius = 7;
  this.speed = {
    norm: 4,
    tan: Math.max(Math.min(Math.random(), 2 + Math.sqrt(3)), 2 - Math.sqrt(3)),
    x: 0,
    y: 0
  };
  this.calculateSpeed = function() {
    this.speed.x = this.speed.norm / (Math.sqrt(1 + this.speed.tan * this.speed.tan));
    this.speed.y = this.speed.x * this.speed.tan;
  }
  this.render = function() {
    var counterClockWise = true;
    context.beginPath();
    context.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI, counterClockWise);
    context.fillStyle = "#000";
    context.fill();
  };
  this.move = function() {
    this.positionX += this.speed.x;
    this.positionY += this.speed.y;
    if ((this.positionY > 600 - this.radius) || (this.positionY < 0 + this.radius)) {
      this.speed.y = -this.speed.y;
    }
    if (this.positionX < (20 + this.radius + leftPaddle.width)) {
      if ((leftPaddle.positionY < this.positionY) && (this.positionY < (leftPaddle.positionY + leftPaddle.length))) {
        this.speed.x = -this.speed.x;
      }
    }
    if (this.positionX > (780 - this.radius)) {
      if ((rightPaddle.positionY < this.positionY) && (this.positionY < (rightPaddle.positionY + rightPaddle.length))) {
        this.speed.x = -this.speed.x;
      }
    }
    if ((this.positionX > 800 + this.radius) || (this.positionX < 0 - this.radius)) {
      this.speed.x = 0;
      this.speed.y = 0;
      console.log("Victory");
      this.positionX = 400;
    }
  };
}

var gameBall = new ball(450,250);


// functions

function render() {
  drawPending = false;
  context.clearRect(0, 0, 800, 600);
  leftPaddle.render();
  rightPaddle.render();
  gameBall.move();
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


var drawPending = false;

window.onload = animate(step);

window.addEventListener("keydown", function(event) { leftPaddle.move(event, leftPaddle); }, false);

gameBall.calculateSpeed();
console.log(gameBall.speed);
