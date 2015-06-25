(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// -------------------------------------------
// Functions Library

function quad(n) {
  return n * n;
}

function distance(Ax, Ay, Bx, By) {
  return Math.sqrt(quad(Ax - Bx) + quad(Ay - By));
}

function intersect(Ax, Ay, Bx, By, abscissa) {
  return (By - Ay) / (Bx - Ax) * (abscissa - Ax) + Ay;
}

function calculateBounceAbscissa(Ax, Ay, tan) {
  return Math.sqrt((quad(Ax) + quad(Ay)) / (1 + quad(tan)));
}

function convertColor(rgb) {
  var r = rgb[0].toString(16);
  var g = rgb[1].toString(16);
  var b = rgb[2].toString(16);
  return "#" + r + g + b ;
}

function randomTangent() {
  return Math.min(Math.max(Math.random() * 10 - 5, - Math.sqrt(3)), Math.sqrt(3));
}



// -------------------------------------------
// Paddle

function Paddle(X, Y) {
  var position = {
    x: X,
    y: Y
  };
  var length = 100;
  var width = 6;
  var speed = 8;
  var movingUp = false;
  var movingDown = false;

  function moveUp() {
    if (typeof(movingUp) == 'number') {
      movingUp = Math.min(movingUp, speed);
    } else {
      movingUp = speed;
    }
    position.y -= movingUp;
    if (position.y < 0) {
      position.y = 0;
    }
  }

  function moveDown() {
    if (typeof(movingDown) == 'number') {
      movingDown = Math.min(movingDown, speed);
    } else {
      movingDown = speed;
    }
    position.y += movingDown;
    if (position.y > canvas.ySize - length) {
      position.y = canvas.ySize - length;
    }
  }

  return {
    render: function() {
      var counterClockWise = true;
      context.beginPath();
      context.rect(position.x, position.y + width/2, width, length - width);
      context.arc(position.x + width/2, position.y + width/2, width/2, 0, Math.PI, counterClockWise);
      context.arc(position.x + width/2, position.y - width/2 + length, width/2, 2*Math.PI, Math.PI, !counterClockWise);
      context.fillStyle = "#eee";
      context.fill();
    },

    getStatus: function() {
      return {
        position: position,
        length: length,
        width: width,
        speed: speed
      };
    },

    move: function() {
      if (movingUp) {
        moveUp();
      }
      if (movingDown) {
        moveDown();
      }
    },

    requestMoveUp: function(order) {
      if (order) {
        movingUp = order;
        movingDown = false;
      } else {
        movingUp = false;
      }
    },

    requestMoveDown: function(order) {
      if (order) {
        movingDown = order;
        movingUp = false;
      } else {
        movingDown = false;
      }
    }
  };
}



// -------------------------------------------
// Ball

function Ball() {
  var position = {
    x: canvas.xSize/2,
    y: -10
  };
  var radius = 7;
  var color = [0, 15, 0];
  var bounceCount = 0;
  var speed = {
    norm: 0,
    tan: 0,
    x: 0,
    y: 0
  };

  function calculateXYSpeed() {
    var sign = (speed.x < 0);
    speed.x = speed.norm / (Math.sqrt(1 + quad(speed.tan)));
    if (sign) {
      speed.x = -speed.x
    }
    speed.y = speed.x * speed.tan;
  }

  function calculateVectSpeed() {
    speed.norm = Math.sqrt(quad(speed.x) + quad(speed.y));
    speed.tan = speed.y / speed.x;
  }

  function changeColor() {
    bounceCount += 1;
    if (bounceCount == 5) {
      bounceCount = 0;
      if (color[0] < 15) {
        color[0] = Math.min(color[0] + 3, 15);
      } else if (color[1] > 0) {
        color[1] = Math.max(color[1] - 3, 0);
      }
    }
  }

  function bounceSpeedUp() {
    speed.norm += 0.1;
    calculateXYSpeed();
    changeColor();
  }

  function upBorderBounce() {
    position.y = -position.y;
    speed.y = -speed.y;
    calculateVectSpeed();
    bounceSpeedUp();
  }

  function downBorderBounce() {
    position.y = 2*canvas.ySize - position.y;
    speed.y = -speed.y;
    calculateVectSpeed();
    bounceSpeedUp();
  }

  function leftPaddleBounce(leftPad) {
    var impact = {
      x: leftPad.position.x + leftPad.width,
      y: intersect(position.x - speed.x, position.y - speed.y, position.x, position.y, leftPad.position.x + leftPad.width)
    };
    if ((impact.y < leftPad.position.y) || (impact.y > leftPad.position.y + leftPad.length)) {
      console.log("Outer paddle bounce");
    }
    speed.tan = 2*Math.sqrt(3) * (impact.y - leftPad.position.y) / (leftPad.length) - Math.sqrt(3);
    var bounce = calculateBounceAbscissa(impact.x - position.x, impact.y - position.y, speed.tan);
    position.x = impact.x + bounce;
    position.y = impact.y + bounce * speed.tan;
    speed.x = -speed.x;

    bounceSpeedUp();
  }

  function rightPaddleBounce(rightPad) {
    var impact = {
      x: rightPad.position.x,
      y: intersect(position.x - speed.x, position.y - speed.y, position.x, position.y, rightPad.position.x)
    };
    if ((impact.y < rightPad.position.y) || (impact.y > rightPad.position.y + rightPad.length)) {
      console.log("Outer paddle bounce");
    }
    speed.tan = -2*Math.sqrt(3) * (impact.y - rightPad.position.y) / (rightPad.length) + Math.sqrt(3);
    var bounce = calculateBounceAbscissa(impact.x - position.x, impact.y - position.y, speed.tan);
    position.x = impact.x - bounce;
    position.y = impact.y + bounce * speed.tan;
    speed.x = -speed.x;

    bounceSpeedUp();
  }

  return {
    initSpeed: function () {
      speed.norm = 4;
      speed.tan = randomTangent();
      calculateXYSpeed();
      var tossCoin = (Math.random() > 0.5);
      if (tossCoin) {
        speed.x = -speed.x
      }
    },

    initPos: function() {
      position.x = canvas.xSize/2;
      position.y = Math.random() * (canvas.ySize/2 -100) + 100;
    },

    render: function() {
      var counterClockWise = true;
      context.beginPath();
      context.arc(position.x, position.y, radius, 0, 2*Math.PI, counterClockWise);
      context.fillStyle = convertColor(color);
      context.fill();
    },

    getStatus: function() {
      return {
        position: position,
        speed: speed,
        radius: radius
      };
    },

    move: function() {
      var leftPad = leftPaddle.getStatus();
      var rightPad = rightPaddle.getStatus();
      position.x += speed.x;
      position.y += speed.y;

      if (position.y < 0) {
        upBorderBounce();
      }

      if (position.y > canvas.ySize) {
        downBorderBounce();
      }

      if (position.x < leftPad.position.x + leftPad.width) {
        if ((leftPad.position.y < Math.max(position.y, position.y - speed.y)) && (Math.min(position.y, position.y - speed.y) < leftPad.position.y + leftPad.length)) {
          if (position.x - speed.x > leftPad.position.x) {
            leftPaddleBounce(leftPad);
          }
        }
      }

      if (position.x > rightPad.position.x) {
        if ((rightPad.position.y < Math.max(position.y, position.y - speed.y)) && (Math.min(position.y, position.y - speed.y) < rightPad.position.y + rightPad.length)) {
          if (position.x - speed.x < rightPad.position.x + rightPad.width) {
            rightPaddleBounce(rightPad);
          }
        }
      }

      if (position.x > canvas.xSize) {
        var nextRound = scoreCounter.addPointLeft();
        this.initPos();
        color = [0,15,0];
        if (nextRound) {
          this.initSpeed();
        } else {
          speed.x = 0;
          speed.y = 0;
        }
      } else if (position.x < 0) {
        var nextRound = scoreCounter.addPointRight();
        this.initPos();
        color = [0,15,0];
        if (nextRound) {
          this.initSpeed();
        } else {
          speed.x = 0;
          speed.y = 0;
        }
      }
    }
  };
}



// -------------------------------------------
// AI

function AI() {
  var maxSpeed = 4;
  return {
    decide: function() {
      rightPaddle.requestMoveUp(false);
      rightPaddle.requestMoveDown(false);
      var cpuPad = rightPaddle.getStatus();
      var ball = gameBall.getStatus();
      if ((cpuPad.position.y + cpuPad.length * 1/3) > ball.position.y) {
        rightPaddle.requestMoveUp(Math.min(Math.round(Math.abs(cpuPad.position.y + cpuPad.length * 1/3 - ball.position.y)), maxSpeed));
      } else if ((cpuPad.position.y + cpuPad.length * 2/3) < ball.position.y) {
        rightPaddle.requestMoveDown(Math.min(Math.round(Math.abs(cpuPad.position.y + cpuPad.length * 2/3 - ball.position.y)), maxSpeed));
      }
    }
  };
}



// -------------------------------------------
// Score Count

function ScoreCounter(player1, player2) {
  var leftPlayer = player1;
  var rightPlayer = player2;
  var leftScore = 0;
  var rightScore = 0;

  function updateDisplay() {
    var left = document.getElementById("left");
    left.innerHTML = leftPlayer + "<br>" + leftScore;

    var right = document.getElementById("right");
    right.innerHTML = rightPlayer + "<br>" + rightScore;
  }

  return {
    getLeftPlayer: function() {
      return leftPlayer;
    },

    getRightPlayer: function() {
      return rightPlayer;
    },

    getLeftScore: function() {
      return leftScore;
    },

    getRightScore: function() {
      return rightScore;
    },

    addPointLeft: function() {
      leftScore += 1;
      updateDisplay();
      if (leftScore > 1) {
        menu.victory();
        return false;
      } else {
        return true;
      }
    },

    addPointRight: function() {
      rightScore += 1;
      updateDisplay();
      if (rightScore > 1) {
        menu.victory();
        return false;
      } else {
        return true;
      }
    },

    resetScore: function() {
      leftScore = 0;
      rightScore = 0;
      updateDisplay();
    }
  };
}



// -------------------------------------------
// Engine

function Engine() {

  function calculate() {
    leftPaddle.move();
    rightPaddle.move();
    gameBall.move();
  }

  function render() {
    context.clearRect(0, 0, canvas.xSize, canvas.ySize);
    if (gameState != "menu") {
      leftPaddle.render();
      rightPaddle.render();

      if (gameState == "playing") {
        gameBall.render();
      } else if (gameState == "gameover") {
        menu.renderVictory();
      } else if (gameState == "pause") {
        menu.renderPause();
      }
    }
    frames += 1;
  }

  function step() {
    if (gameState == "playing") {
      cpu.decide();
      calculate();
    }
    render();
    animate(step);
  }

  var animate = window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(callback) { window.setTimeout(callback, 1000/60) };

  return {
    run: function() {
      animate(step);
    }
  };
}



// -------------------------------------------
// Game Menu

function Menu() {

  return {
    newGame: function() {
      leftPaddle = new Paddle(20, 250);
      rightPaddle = new Paddle(canvas.xSize - 26, 250);
      gameBall = new Ball();
      gameBall.initPos();
      gameBall.initSpeed();
      cpu = new AI();
      scoreCounter = new ScoreCounter("Player", "CPU");
      scoreCounter.resetScore();
      gameState = "playing";
      document.getElementById("menu").style.display = "none";
    },

    renderPause: function() {
      context.font = "bold 40px sans-serif";
      context.fillText("Game paused", 280, 300);

      context.font = "15px sans-serif";
      context.fillText("Press <spacebar> to continue", 315, 325);
      context.fillText("or <m> to return to menu", 333, 340);
    },

    victory: function() {
      gameState = "gameover";
    },

    renderVictory: function() {
      context.font = "bold 40px sans-serif";
      if (scoreCounter.getLeftScore() > scoreCounter.getRightScore()) {
        context.fillText(scoreCounter.getLeftPlayer() + " wins!", 300, 300);
      } else {
        context.fillText(scoreCounter.getRightPlayer() + " wins!", 300, 300);
      }
      context.font = "15px sans-serif";
      context.fillText("Press <spacebar> to start a new game", 275, 325);
      context.fillText("or <m> to return to menu", 315, 340);
    }
  };
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
var scoreCounter;

// fps count
var frames = 0;
var fps = 0;

// engine
var engine = new Engine();
var menu = new Menu();


window.setInterval( function() {
  var fpsPosition = document.getElementById("fps-div");
  fps = "fps: " + frames;
  frames = 0;
  fpsPosition.innerHTML = fps;
}, 1000);

window.onload = engine.run();



// -------------------------------------------
// Keys Inputs

    // key pressed
window.addEventListener("keydown", function(event) {
  // up key
  if (event.keyCode == 38) {
    leftPaddle.requestMoveUp(true);
  }
  // down key
  if (event.keyCode == 40) {
    leftPaddle.requestMoveDown(true);
  }
  // spacebar
  if (event.keyCode == 32) {
    if (gameState == "playing") {
      gameState = "pause";
    } else if (gameState == "pause") {
      gameState = "playing";
    } else if (gameState == "gameover") {
      menu.newGame();
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
    leftPaddle.requestMoveUp(false);
  }
  // down key
  if (event.keyCode == 40) {
    leftPaddle.requestMoveDown(false);
  }
}, false);



// -------------------------------------------
// Menu Inputs

document.getElementById("bt1").addEventListener("click", menu.newGame);

},{}]},{},[1]);