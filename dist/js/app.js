(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var canvas = {
  xSize: 800,
  ySize: 600
};


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
  this.move = function() {
    if (mu) {
      this.moveUp();
    }
    if (md) {
      this.moveDown();
    }
  };
  this.moveUp = function(px) {
    if (typeof(px) == 'undefined') {
      px = this.speed;
    } else {
      px = Math.min(px, this.speed);
    }
    this.positionY -= px;
    if (this.positionY < 0) {
      this.positionY = 0;
    }
  };
  this.moveDown = function(px) {
    if (typeof(px) == 'undefined') {
      px = this.speed;
    } else {
      px = Math.min(px, this.speed);
  }
    this.positionY += this.speed;
    if (this.positionY > canvas.ySize - this.length) {
      this.positionY = canvas.ySize - this.length;
    }
  };
}

// ball

function Ball() {
  this.positionX = canvas.xSize / 2;
  this.positionY = canvas.ySize / 2;
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
    this.positionX = canvas.xSize / 2;
    this.positionY = Math.random() * (canvas.ySize / 2 -100) + 100;
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
    this.speed.norm += 0.1;
    this.calculateXYSpeed();
  };
  this.upBorderBounce = function() {
    this.positionY = -this.positionY;
    this.speed.y = -this.speed.y;
    this.calculateVectSpeed();
    this.bounceSpeedUp();
  };
  this.downBorderBounce = function() {
    this.positionY = canvas.ySize * 2 - this.positionY;
    this.speed.y = -this.speed.y;
    this.calculateVectSpeed();
    this.bounceSpeedUp();
  };
  this.leftPaddleBounce = function() {
    this.positionX = Math.max((leftPaddle.positionX + leftPaddle.width) * 2 - this.positionX, leftPaddle.positionX + leftPaddle.width);
    this.speed.x = -this.speed.x;
    this.calculateVectSpeed();
    this.speed.tan = 2 * Math.sqrt(3) * (this.positionY - leftPaddle.positionY) / (leftPaddle.length) - Math.sqrt(3);
    this.calculateXYSpeed();
    this.bounceSpeedUp();
  };
  this.rightPaddleBounce = function() {
    this.positionX = Math.min(rightPaddle.positionX * 2 - this.positionX, rightPaddle.positionX);
    this.speed.x = -this.speed.x;
    this.calculateVectSpeed();
    this.speed.tan = -2 * Math.sqrt(3) * (this.positionY - rightPaddle.positionY) / (rightPaddle.length) + Math.sqrt(3);
    this.calculateXYSpeed();
    this.bounceSpeedUp();
  };
  this.move = function() {
    this.positionX += this.speed.x;
    this.positionY += this.speed.y;

    if (this.positionY < 0) {
      this.upBorderBounce();
    }

    if (this.positionY > canvas.ySize) {
      this.downBorderBounce();
    }

    if (this.positionX < leftPaddle.positionX + leftPaddle.width) {
      if ((leftPaddle.positionY < Math.max(this.positionY, this.positionY - this.speed.y)) && (Math.min(this.positionY, this.positionY - this.speed.y) < leftPaddle.positionY + leftPaddle.length)) {
        this.leftPaddleBounce();
      }
    }

    if (this.positionX > rightPaddle.positionX) {
      if ((rightPaddle.positionY < Math.max(this.positionY, this.positionY - this.speed.y)) && (Math.min(this.positionY, this.positionY - this.speed.y) < rightPaddle.positionY + rightPaddle.length)) {
        this.rightPaddleBounce();
      }
    }
    // game over
    if (this.positionX > canvas.xSize) {
      console.log("Player Wins!");
      this.initPos();
      this.initSpeed();
    } else if (this.positionX < 0) {
      console.log("CPU Wins!");
      this.initPos();
      this.initSpeed();
    }
  };
}

// AI

function AI() {
  this.act = function() {
    if ((rightPaddle.positionY + rightPaddle.length * 1/3) > gameBall.positionY) {
      rightPaddle.moveUp(Math.max(Math.round(Math.abs(rightPaddle.positionY + rightPaddle.length * 1/3 - gameBall.positionY))), 4);
    } else if ((rightPaddle.positionY + rightPaddle.length * 2/3) < gameBall.positionY) {
      rightPaddle.moveDown(Math.max(Math.round(Math.abs(rightPaddle.positionY + rightPaddle.length * 2/3 - gameBall.positionY))), 4);
    }
  };
}



// display

function render() {
  context.clearRect(0, 0, canvas.xSize, canvas.ySize);
  leftPaddle.move();
  leftPaddle.render();
  cpu.act();
  rightPaddle.render();
  gameBall.move();
  gameBall.render();
  frames += 1;
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

var rightPaddle = new Paddle(canvas.xSize - 20,200);

var gameBall = new Ball();

var cpu = new AI();

gameBall.initPos();
gameBall.initSpeed();


var frames = 0;
var fps = 0;

window.setInterval( function() {
  fps = frames;
  frames = 0;
  console.log(fps);
}, 1000);


// main

var gameCanvas = document.getElementById("game");

var context = gameCanvas.getContext("2d");

window.onload = animate(step);


var mu = false;
var md = false;

window.addEventListener("keydown", function(event) {
  if (event.keyCode == 38) {
    mu = true;
    md = false;
  }
  if (event.keyCode == 40) {
    md = true;
    mu = false;
  }
}, false);

window.addEventListener("keyup", function(event) {
  if (event.keyCode == 38) {
    mu = false;
  }
  if (event.keyCode == 40) {
    md = false;
  }
}, false);

},{}]},{},[1]);