// paddles

function paddle(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.length = 100;
  this.width = 6;
  this.speed = 20;
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

// ball

function ball() {
  this.positionX = 400;
  this.positionY = 300;
  this.radius = 7;
  this.speed = {
    norm: 0,
    tan: 0,
    x: 0,
    y: 0
  };
  this.initSpeed = function () {
    this.speed.norm = 4;
    this.speed.tan = Math.min(Math.max(Math.random()*10 - 5, - Math.sqrt(3)), Math.sqrt(3));
    this.calculateXYSpeed();
    var randx = Math.random();
    if (randx > 0.5) {
      this.speed.x = -this.speed.x
    }
  };
  this.initPos = function() {
    this.positionX = 400;
    this.positionY = Math.random()*400 + 100;
  };
  this.calculateXYSpeed = function() {
    if (this.speed.x > 0) {
      this.speed.x = this.speed.norm / (Math.sqrt(1 + this.speed.tan * this.speed.tan));
    } else {
      this.speed.x = -this.speed.norm / (Math.sqrt(1 + this.speed.tan * this.speed.tan));
    }
    this.speed.y = this.speed.x * this.speed.tan;
  };
  this.calculateVectSpeed = function() {
    this.speed.norm = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
    this.speed.tan = this.speed.y / this.speed.x;
  };
  this.render = function() {
    var counterClockWise = true;
    context.beginPath();
    context.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI, counterClockWise);
    context.fillStyle = "#000";
    context.fill();
  };
  this.bounceSpeedUp = function() {
    this.calculateVectSpeed();
    this.speed.norm += 0.1;
    this.calculateXYSpeed();
    console.log(this.speed);
  };
  this.move = function() {
    this.positionX += this.speed.x;
    this.positionY += this.speed.y;

    // border bouncing
    if ((this.positionY > 600 - this.radius) || (this.positionY < 0 + this.radius)) {
      this.speed.y = -this.speed.y;
      this.speed.tan = -this.speed.tan;
      this.bounceSpeedUp();
    }
    leftPaddle.positionX + leftPaddle.width
    // left paddle bouncing
    if (((this.positionX - this.radius) < (leftPaddle.positionX + leftPaddle.width)) && (this.positionX > (leftPaddle.positionX + leftPaddle.width))) {
      if ((leftPaddle.positionY < this.positionY) && (this.positionY < (leftPaddle.positionY + leftPaddle.length))) {
        this.speed.x = -this.speed.x;
        this.bounceSpeedUp();
      }
    }

    // right paddle bouncing
    if (((this.positionX + this.radius) > rightPaddle.positionX) && (this.positionX < rightPaddle.positionX)) {
      if ((rightPaddle.positionY < this.positionY) && (this.positionY < (rightPaddle.positionY + rightPaddle.length))) {
        this.speed.x = -this.speed.x;
        this.bounceSpeedUp();
      }
    }

    // game over
    if ((this.positionX > 800 + this.radius) || (this.positionX < 0 - this.radius)) {
      this.speed.x = 0;
      this.speed.y = 0;
      console.log("Victory");
      this.initPos();
      this.initSpeed();
    }
  };
}



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


// init



var leftPaddle = new paddle(20,200);

var rightPaddle = new paddle(780,400);


var gameBall = new ball();

gameBall.initPos();
gameBall.initSpeed();
console.log(gameBall.speed);

var drawPending = false;

// main

var gameCanvas = document.getElementById("game");

var context = gameCanvas.getContext("2d");

window.onload = animate(step);

window.addEventListener("keydown", function(event) { leftPaddle.move(event, leftPaddle); }, false);
