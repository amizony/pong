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

function convertColor(rgb) {
  var r = rgb[0].toString(16);
  var g = rgb[1].toString(16);
  var b = rgb[2].toString(16);
  return "#" + r + g + b ;
}


// -------------------------------------------
// Paddle Object

function Paddle(X, Y) {
  this.positionX = X;
  this.positionY = Y;
  this.length = 100;
  this.width = 6;
  this.speed = 8;
  this.render = function() {
    var counterClockWise = true;
    context.beginPath();
    context.rect(this.positionX, this.positionY + this.width/2, this.width, this.length - this.width);
    context.arc(this.positionX + this.width/2, this.positionY + this.width/2, this.width/2, 0, Math.PI, counterClockWise);
    context.arc(this.positionX + this.width/2, this.positionY - this.width/2 + this.length, this.width/2, 2*Math.PI, Math.PI, !counterClockWise);
    context.fillStyle = "#eee";
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
  this.positionX = -10;
  this.positionY = -10;
  this.radius = 7;
  this.color = [0, 15, 0];
  this.bounceCount = 0;
  this.speed = {
    norm: 0,
    tan: 0,
    x: 0,
    y: 0
  };
  this.initSpeed = function () {
    this.speed.norm = 4;
    this.speed.tan = Math.min(Math.max(Math.random() * 10 - 5, - Math.sqrt(3)), Math.sqrt(3));
    this.calculateXYSpeed();
    var randx = Math.random();
    if (randx > 0.5) {
      this.speed.x = -this.speed.x
    }
  };
  this.initPos = function() {
    this.positionX = canvas.xSize/2;
    this.positionY = Math.random() * (canvas.ySize/2 -100) + 100;
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
  this.changeColor = function() {
    this.bounceCount += 1;
    if (this.bounceCount == 5) {
      this.bounceCount = 0;
      if (this.color[0] < 15) {
        this.color[0] = Math.min(this.color[0] + 3, 15);
      } else if (this.color[1] > 0) {
        this.color[1] = Math.max(this.color[1] - 3, 0);
      }
    }
  };
  this.render = function() {
    var counterClockWise = true;
    context.beginPath();
    context.arc(this.positionX, this.positionY, this.radius, 0, 2*Math.PI, counterClockWise);
    context.fillStyle = convertColor(this.color);
    context.fill();
  };
  this.bounceSpeedUp = function() {
    this.speed.norm += 0.1;
    this.calculateXYSpeed();
    this.changeColor();
  };
  this.upBorderBounce = function() {
    this.positionY = -this.positionY;
    this.speed.y = -this.speed.y;
    this.calculateVectSpeed();
    this.bounceSpeedUp();
  };
  this.downBorderBounce = function() {
    this.positionY = 2*canvas.ySize - this.positionY;
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
      console.log("Outer paddle bounce");
    }
    this.speed.tan = 2*Math.sqrt(3) * (impact.y - leftPaddle.positionY) / (leftPaddle.length) - Math.sqrt(3);
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
      console.log("Outer paddle bounce");
    }
    this.speed.tan = -2*Math.sqrt(3) * (impact.y - rightPaddle.positionY) / (rightPaddle.length) + Math.sqrt(3);
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
      this.color = [0,15,0];
      if (nextRound) {
        this.initSpeed();
      } else {
        this.speed.x = 0;
        this.speed.y = 0;
      }
    } else if (this.positionX < 0) {
      var nextRound = scoreTable.addPointRight();
      this.initPos();
      this.color = [0,15,0];
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
  this.maxSpeed = 4;
  this.decide = function() {
    if ((rightPaddle.positionY + rightPaddle.length * 1/3) > gameBall.positionY) {
      rightPaddle.moveUp(Math.min(Math.round(Math.abs(rightPaddle.positionY + rightPaddle.length * 1/3 - gameBall.positionY)), this.maxSpeed));
    } else if ((rightPaddle.positionY + rightPaddle.length * 2/3) < gameBall.positionY) {
      rightPaddle.moveDown(Math.min(Math.round(Math.abs(rightPaddle.positionY + rightPaddle.length * 2/3 - gameBall.positionY)), this.maxSpeed));
    }
  };
}


// -------------------------------------------
// Score Count

function ScoreCounter(player1, player2) {
  this.leftPlayer = player1;
  this.rightPlayer = player2;
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
    var left = document.getElementById("left");
    left.innerHTML = this.leftPlayer + "<br>" + this.leftScore;

    var right = document.getElementById("right");
    right.innerHTML = this.rightPlayer + "<br>" + this.rightScore;
  };
  this.victory = function() {
    gameState = "gameover";
  };
  this.render = function() {
    context.font = "bold 40px sans-serif";
    if (this.leftScore > this.rightScore) {
      context.fillText(this.leftPlayer + " wins!", 325, 300);
    } else {
      context.fillText(this.rightPlayer + " wins!", 300, 300);
    }
    context.font = "15px sans-serif";
    context.fillText("Press <spacebar> to start a new game", 275, 325);
    context.fillText("or <m> to return to menu", 315, 340);

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
  if (gameState == "playing") {
    leftPaddle.move();
    cpu.decide();
    gameBall.move();
  }
}

function render() {
  context.clearRect(0, 0, canvas.xSize, canvas.ySize);
  if (gameState != "menu") {
    leftPaddle.render();
    rightPaddle.render();

    if (gameState == "playing") {
      gameBall.render();
    } else if (gameState == "gameover") {
      scoreTable.render();
    } else if (gameState == "pause") {
      pauseRender();
    }
  }
  frames += 1;
}


// -------------------------------------------
// Game Initialisation

/*
game state:
  playing
  pause
  menu
  gameover
*/
var gameState = "menu";


// canvas
var canvas = {
  xSize: 800,
  ySize: 600
};
var gameCanvas = document.getElementById("game");
gameCanvas.style.background = "#111";
var context = gameCanvas.getContext("2d");

// paddles
var leftPaddle;
var rightPaddle;

// ball
var gameBall;

// ai
var cpu;

// score
var scoreTable;


// fps count
var frames = 0;
var fps = 0;

// player inputs
var movingUp = false;
var movingDown = false;



// -------------------------------------------
// Game Menu

function newGame() {
  leftPaddle = new Paddle(20, 250);
  leftPaddle.render();
  rightPaddle = new Paddle(canvas.xSize - 26, 250);
  rightPaddle.render();
  gameBall = new Ball();
  gameBall.initPos();
  gameBall.initSpeed();
  cpu = new AI();
  scoreTable = new ScoreCounter("Player", "CPU");
  scoreTable.updateDisplay();
  gameState = "playing";
  document.getElementById("menu").style.display = "none";
}

document.getElementById("bt1").addEventListener("click", newGame);

function pauseRender() {
  context.font = "bold 40px sans-serif";
  context.fillText("Game paused", 280, 300);

  context.font = "15px sans-serif";
  context.fillText("Press <spacebar> to continue", 315, 325);
  context.fillText("or <m> to return to menu", 333, 340);

}




// -------------------------------------------
// Main

// fps count
window.setInterval( function() {
  var fpsPosition = document.getElementById("fps-div");
  fps = "fps: " + frames;
  frames = 0;
  fpsPosition.innerHTML = fps;
}, 1000);

window.onload = animate(step);




// -------------------------------------------
// Keys Inputs

    // key pressed
window.addEventListener("keydown", function(event) {
  // up key
  if (event.keyCode == 38) {
    movingUp = true;
    movingDown = false;
  }
  // down key
  if (event.keyCode == 40) {
    movingDown = true;
    movingUp = false;
  }
  // spacebar
  if (event.keyCode == 32) {
    if (gameState == "playing") {
      gameState = "pause";
    } else if (gameState == "pause") {
      gameState = "playing";
    } else if (gameState == "gameover") {
      newGame();
    }
  }
  // m key
  if ((event.keyCode == 77)) {
    if ((gameState == "pause") || (gameState == "gameover")) {
      document.getElementById("menu").style.display = "initial";
      gameState = "menu";
    }
  }
}, false);

    // key released
window.addEventListener("keyup", function(event) {
  // up key
  if (event.keyCode == 38) {
    movingUp = false;
  }
  // down key
  if (event.keyCode == 40) {
    movingDown = false;
  }
}, false);

},{}]},{},[1]);