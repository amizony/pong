(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// -------------------------------------------
// Functions Library

function distance(Ax, Ay, Bx, By) {
  return Math.sqrt((Ax - Bx)*(Ax - Bx) + (Ay - By)*(Ay - By));
}

function intersect(Ax, Ay, Bx, By, abscissa) {
  return (By - Ay) / (Bx - Ax) * (abscissa - Ax) + Ay;
}

function calculateBounceAbscissa(Ax, Ay, tan) {
  return Math.sqrt((Ax*Ax + Ay*Ay) / (1 + tan*tan));
}


// -------------------------------------------
// Paddle Object

function Paddle(X, Y, maxSpeed) {
  this.positionX = X;
  this.positionY = Y;
  this.length = 100;
  this.width = 6;
  this.speed = maxSpeed;
  this.render = function() {
    context.beginPath();
    context.rect(this.positionX, this.positionY, this.width, this.length);
    context.fillStyle = "#000";
    context.fill();
  };
  this.move = function() {
    if (movingUp) {
      this.moveUp();
    }
    if (movingDown) {
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


// -------------------------------------------
// Ball Object

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
    var impact = {
      x: leftPaddle.positionX + leftPaddle.width,
      y: intersect(this.positionX - this.speed.x, this.positionY - this.speed.y, this.positionX, this.positionY, leftPaddle.positionX + leftPaddle.width)
    };
    if ((impact.y < leftPaddle.positionY) || (impact.y > leftPaddle.positionY + leftPaddle.length)) {
      console.alert("Outer paddle bounce");
    }
    this.speed.tan = 2 * Math.sqrt(3) * (impact.y - leftPaddle.positionY) / (leftPaddle.length) - Math.sqrt(3);
    var bounce = calculateBounceAbscissa(impact.x - this.positionX, impact.y - this.positionY, this.speed.tan);
    this.positionX = impact.x + bounce;
    this.positionY = impact.y + bounce*this.speed.tan;
    this.speed.x = -this.speed.x;

    this.bounceSpeedUp();
  };
  this.rightPaddleBounce = function() {
    var impact = {
      x: rightPaddle.positionX,
      y: intersect(this.positionX - this.speed.x, this.positionY - this.speed.y, this.positionX, this.positionY, rightPaddle.positionX)
    };
    if ((impact.y < rightPaddle.positionY) || (impact.y > rightPaddle.positionY + rightPaddle.length)) {
      console.alert("Outer paddle bounce");
    }
    this.speed.tan = -2 * Math.sqrt(3) * (impact.y - rightPaddle.positionY) / (rightPaddle.length) + Math.sqrt(3);
    var bounce = calculateBounceAbscissa(impact.x - this.positionX, impact.y - this.positionY, this.speed.tan);
    this.positionX = impact.x - bounce;
    this.positionY = impact.y + bounce*this.speed.tan;
    this.speed.x = -this.speed.x;

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
        if (this.positionX - this.speed.x > leftPaddle.positionX) {
          this.leftPaddleBounce();
        }
      }
    }

    if (this.positionX > rightPaddle.positionX) {
      if ((rightPaddle.positionY < Math.max(this.positionY, this.positionY - this.speed.y)) && (Math.min(this.positionY, this.positionY - this.speed.y) < rightPaddle.positionY + rightPaddle.length)) {
        if (this.positionX - this.speed.x < rightPaddle.positionX + rightPaddle.width) {
          this.rightPaddleBounce();
        }
      }
    }
    // game over
    if (this.positionX > canvas.xSize) {
      var nextRound = scoreTable.addPointLeft();
      this.initPos();
      if (nextRound) {
        this.initSpeed();
      } else {
        this.speed.x = 0;
        this.speed.y = 0;
      }
    } else if (this.positionX < 0) {
      var nextRound = scoreTable.addPointRight();
      this.initPos();
      if (nextRound) {
        this.initSpeed();
      } else {
        this.speed.x = 0;
        this.speed.y = 0;
      }
    }
  };
}


// -------------------------------------------
// AI

function AI() {
  this.decide = function() {
    if ((rightPaddle.positionY + rightPaddle.length * 1/3) > gameBall.positionY) {
      rightPaddle.moveUp(Math.round(Math.abs(rightPaddle.positionY + rightPaddle.length * 1/3 - gameBall.positionY)));
    } else if ((rightPaddle.positionY + rightPaddle.length * 2/3) < gameBall.positionY) {
      rightPaddle.moveDown(Math.round(Math.abs(rightPaddle.positionY + rightPaddle.length * 2/3 - gameBall.positionY)));
    }
  };
}


// -------------------------------------------
// Score Count

function ScoreCounter() {
  this.leftScore = 0;
  this.rightScore = 0;
  this.addPointLeft = function() {
    this.leftScore += 1;
    this.updateDisplay();
    if (this.leftScore > 1) {
      this.victory("Player");
      return false;
    } else {
      return true;
    }
  };
  this.addPointRight = function() {
    this.rightScore += 1;
    this.updateDisplay();
    if (this.rightScore > 1) {
      this.victory("CPU");
      return false;
    } else {
      return true;
    }
  };
  this.updateDisplay = function() {
    var left = document.getElementById("left-score");
    left.innerHTML = this.leftScore;

    var right = document.getElementById("right-score");
    right.innerHTML = this.rightScore;
  };
  this.victory = function(side) {
    console.log(side + " wins!");
    playing = false;
  };
  this.render = function() {
    context.font = "bold 40px sans-serif";
    if (this.leftScore > this.rightScore) {
      context.fillText("You win!", 300, 300);
    } else {
      context.fillText("You loose!", 300, 300);
    }
    context.font = "15px sans-serif";
    context.fillText("Press <spacebar> to start a new game.", 275, 325);
  };
  this.resetScore = function() {
    this.leftScore = 0;
    this.rightScore = 0;
    this.updateDisplay();
  };
}


// -------------------------------------------
// Engine

var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback) { window.setTimeout(callback, 1000/60) };

function step() {

  var calculateNextFrame = new Promise(function(resolve, reject) {
    resolve(calculate());
  });

  var renderNextFrame = new Promise(function(resolve, reject) {
    resolve(render());
  });

  calculateNextFrame
    .then(function() { return renderNextFrame; })
    .then(function() { return animate(step); });
}

function calculate() {
  if (playing) {
    leftPaddle.move();
    cpu.decide();
    gameBall.move();
  }
}

function render() {
  context.clearRect(0, 0, canvas.xSize, canvas.ySize);
  leftPaddle.render();
  rightPaddle.render();
  if (playing) {
    gameBall.render();
  } else {
    scoreTable.render();
  }
  frames += 1;
}


// -------------------------------------------
// Game Initialisation

// canvas
var canvas = {
  xSize: 800,
  ySize: 600
};
var gameCanvas = document.getElementById("game");
var context = gameCanvas.getContext("2d");

// paddles
var paddleMaxSpeed = 8;
var leftPaddle = new Paddle(20, 200, paddleMaxSpeed);
var rightPaddle = new Paddle(canvas.xSize - 20, 200 ,paddleMaxSpeed / 2);

// ball
var gameBall = new Ball();
gameBall.initPos();
gameBall.initSpeed();

// ai
var cpu = new AI();

// score
var scoreTable = new ScoreCounter();
var playing = true;

// fps count
var frames = 0;
var fps = 0;

// player inputs
var movingUp = false;
var movingDown = false;


// -------------------------------------------
// Main

// fps count
window.setInterval( function() {
  var fpsPosition = document.getElementById("fps-div");
  fps = "fps: " + frames;
  frames = 0;
  fpsPosition.innerHTML = fps;
}, 1000);

// animation
window.onload = animate(step);

// player inputs
    // key pressed
window.addEventListener("keydown", function(event) {
  if (event.keyCode == 38) {
    movingUp = true;
    movingDown = false;
  }
  if (event.keyCode == 40) {
    movingDown = true;
    movingUp = false;
  }
  if ((event.keyCode == 32) && (playing === false)) {
    playing = true;
    gameBall.initSpeed();
    scoreTable.resetScore();
  }
}, false);

    // key released
window.addEventListener("keyup", function(event) {
  if (event.keyCode == 38) {
    movingUp = false;
  }
  if (event.keyCode == 40) {
    movingDown = false;
  }
}, false);

},{}]},{},[1]);