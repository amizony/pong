(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// paddles

function Paddle(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.length = 100;
  this.width = 6;
  this.speed = 10;
  this.render = function() {
    context.beginPath();
    context.rect(this.positionX, this.positionY, this.width, this.length);
    context.fillStyle = "#000";
    context.fill();
  };
  this.move = function(event) {
    if (event.keyCode == 38) {
      this.positionY -= this.speed;
      if (this.positionY < 0) {
        this.positionY = 0;
      }
    }
    if (event.keyCode == 40) {
      this.positionY += this.speed;
      if (this.positionY > 600 - this.length) {
        this.positionY = 600 - this.length;
      }
    }

  };
}

// ball

function Ball() {
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
  this.borderBouncing = function() {
    this.speed.y = -this.speed.y;
    this.speed.tan = -this.speed.tan;
  };
  this.paddleBouncing = function(paddle) {
    this.speed.x = -this.speed.x;
    this.calculateVectSpeed();
    this.speed.tan = 2 * Math.sqrt(3) * (this.positionY - paddle.positionY) / (paddle.length) - Math.sqrt(3);
    if (paddle.positionX > 400) {
      this.speed.tan = -this.speed.tan;
    }
    this.calculateXYSpeed();
  };
  this.move = function() {
    this.positionX += this.speed.x;
    this.positionY += this.speed.y;

    // border bouncing
    if ((this.positionY > 600 - this.radius) || (this.positionY < 0 + this.radius)) {
      this.borderBouncing();
      this.bounceSpeedUp();
    }
    leftPaddle.positionX + leftPaddle.width
    // left paddle bouncing
    if (((this.positionX - this.radius) < (leftPaddle.positionX + leftPaddle.width)) && (this.positionX > (leftPaddle.positionX + leftPaddle.width))) {
      if ((leftPaddle.positionY < this.positionY) && (this.positionY < (leftPaddle.positionY + leftPaddle.length))) {
        this.positionX = leftPaddle.positionX + leftPaddle.width + this.radius;
        this.paddleBouncing(leftPaddle);
        this.bounceSpeedUp();
      }
    }

    // right paddle bouncing
    if (((this.positionX + this.radius) > rightPaddle.positionX) && (this.positionX < rightPaddle.positionX)) {
      if ((rightPaddle.positionY < this.positionY) && (this.positionY < (rightPaddle.positionY + rightPaddle.length))) {
        this.positionX = rightPaddle.positionX - this.radius;
        this.paddleBouncing(rightPaddle);
        this.bounceSpeedUp();
      }
    }

    // game over
    if ((this.positionX > 800 + this.radius) || (this.positionX < 0 - this.radius)) {
      console.log("Victory");
      this.initPos();
      this.initSpeed();
    }
  };
}



// functions

function render() {
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
  var renderNextFrame = new Promise(function(resolve, reject) {
    resolve(render());
  });
  renderNextFrame.then(function() { animate(step); });
}


// init



var leftPaddle = new Paddle(20,200);

var rightPaddle = new Paddle(780,50);
rightPaddle.length=500;

var gameBall = new Ball();

gameBall.initPos();
gameBall.initSpeed();
console.log(gameBall.speed);

// main

var gameCanvas = document.getElementById("game");

var context = gameCanvas.getContext("2d");

window.onload = animate(step);

window.addEventListener("keydown", function(event) { leftPaddle.move.apply(leftPaddle, [event]); }, false);

},{}]},{},[1]);