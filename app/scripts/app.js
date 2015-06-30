// -------------------------------------------
// Functions Library

function quad(n) {
  return n * n;
}

function distance(Ax, Ay, Bx, By) {
  return Math.sqrt(quad(Ax - Bx) + quad(Ay - By));
}

function intersectX(Ax, Ay, Bx, By, abscissa) {
  return (By - Ay) / (Bx - Ax) * (abscissa - Ax) + Ay;
}

function intersectY(Ax, Ay, Bx, By, ordinate) {
  return (Bx - Ax) / (By - Ay) * (ordinate - Ay) + Ax;
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
  return Math.min(Math.max(Math.random() * 4 - 2, - 1), 1);
}

function sign(x) {
  return x / Math.abs(x);
}

// -------------------------------------------
// Collider

function Collider() {
  function upCollosion() {
    var ball = gameBall.getStatus();
    return (ball.position.y < 0);
  }

  function downCollision() {
    var ball = gameBall.getStatus();
    return (ball.position.y > canvas.ySize);
  }

  function leftPaddleCollision() {
    var ball = gameBall.getStatus();
    var leftPad = leftPaddle.getStatus();
    var collide = false;
    if (ball.position.x < leftPad.position.x + leftPad.width) {
      if ((leftPad.position.y < Math.max(ball.position.y, ball.position.y - ball.speed.y)) && (Math.min(ball.position.y, ball.position.y - ball.speed.y) < leftPad.position.y + leftPad.length)) {
        if (ball.position.x - 2 * ball.speed.x > leftPad.position.x) {
          collide = true;
        }
      }
    }
    return collide;
  }

  function rightPaddleCollision() {
    var ball = gameBall.getStatus();
    var rightPad = rightPaddle.getStatus();
    var collide = false;
    if (ball.position.x > rightPad.position.x) {
      if ((rightPad.position.y < Math.max(ball.position.y, ball.position.y - ball.speed.y)) && (Math.min(ball.position.y, ball.position.y - ball.speed.y) < rightPad.position.y + rightPad.length)) {
        if (ball.position.x - 2 * ball.speed.x < rightPad.position.x + rightPad.width) {
          collide = true;
        }
      }
    }
    return collide;
  }

  function leftOffLimit() {
    var ball = gameBall.getStatus();
    return (ball.position.x < 0);
  }

  function rightOffLimit() {
    var ball = gameBall.getStatus();
    return (ball.position.x > canvas.xSize);
  }

  return {
    resolve: function() {
      if (upCollosion()) {
        gameBall.upBorderBounce();
      }

      if (downCollision()) {
        gameBall.downBorderBounce();
      }

      if (leftPaddleCollision()) {
        gameBall.leftPaddleBounce();
      }

      if (rightPaddleCollision()) {
        gameBall.rightPaddleBounce();
      }

      if (rightOffLimit()) {
        var nextRound = scoreCounter.addPointLeft();
        gameBall.initPos();
        if (nextRound) {
          gameBall.initSpeed();
        } else {
          gameBall.freeze();
        }
      }

      if (leftOffLimit()) {
        var nextRound = scoreCounter.addPointRight();
        gameBall.initPos();
        if (nextRound) {
          gameBall.initSpeed();
        } else {
          gameBall.freeze();
        }
      }
    }
  }
}



// -------------------------------------------
// Paddle

function Paddle(X, Y, padColor) {
  var position = {
    x: X,
    y: Y
  };
  var length = 100;
  var width = 6;
  var maxSpeed = 8;
  var movingUp = false;
  var movingDown = false;
  var color = padColor;

  function moveUp() {
    if (typeof(movingUp) == "number") {
      movingUp = Math.min(movingUp, maxSpeed);
    } else {
      movingUp = maxSpeed;
    }
    position.y -= movingUp;
    if (position.y < 0) {
      position.y = 0;
    }
  }

  function moveDown() {
    if (typeof(movingDown) == "number") {
      movingDown = Math.min(movingDown, maxSpeed);
    } else {
      movingDown = maxSpeed;
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
      context.fillStyle = color;
      context.fill();
    },

    getStatus: function() {
      var s = 0;
      if (movingUp) {
        s = -movingUp;
      }
      if (movingDown) {
        s = movingDown;
      }
      return {
        position: position,
        length: length,
        width: width,
        maxSpeed: maxSpeed,
        speed: s
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
    },

    changeColor: function() {
      unlockedColor = "#60D";
      color = unlockedColor;
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
  var speed = {
    norm: 0,
    bonus:0,
    tan: 0,
    lift: false,
    x: 0,
    y: 0
  };
  var colorSpeedStep = 4;

  function calculateXYSpeed() {
    var signX = (speed.x < 0);
    speed.x = (speed.norm + speed.bonus) / (Math.sqrt(1 + quad(speed.tan)));
    if (signX) {
      speed.x = -speed.x
    }
    speed.y = speed.x * speed.tan;
  }

  function calculateVectSpeed() {
    speed.norm = Math.round(Math.sqrt(quad(speed.x) + quad(speed.y)) * 10) / 10 - speed.bonus;
    speed.tan = speed.y / speed.x;
  }

  function calculateColor() {
    if (speed.norm > 20) {
      leftPaddle.changeColor();
    }
    if (speed.norm > 17) {
      return [0, 0, 15];
    }
    if (speed.lift) {
      return [0, 15, 0];
    }
    if (speed.bonus > speed.norm / 4) {
      return [15, 3, 0];
    } else if (speed.bonus > 0) {
      return [15, 10, 0];
    } else {
      return [15, 15, 0];
    }
  }

  function bounceSpeedUp(s) {
    speed.norm += s;
    calculateXYSpeed();
  }

  return {
    freeze: function() {
      speed.x = 0;
      speed.y = 0;
    },

    initSpeed: function () {
      speed.norm = 4;
      speed.bonus = 0;
      speed.tan = randomTangent();
      speed.lift = false;
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
      context.fillStyle = convertColor(calculateColor());
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
      position.x += speed.x;
      position.y += speed.y;
    },

    upBorderBounce: function() {
      if (speed.lift) {
        var impact = {
          x: intersectY(position.x - speed.x, position.y - speed.y, position.x, position.y, 0),
          y: 0
        }
        speed.lift = false;
        speed.bonus = -speed.bonus;
        speed.tan = sign(speed.x) * Math.abs(randomTangent());
        calculateXYSpeed();
        var bounce = calculateBounceAbscissa(impact.y - position.y, impact.x - position.x, 1 / speed.tan);
        position.x = impact.x + bounce * speed.tan;
        position.y = impact.y + bounce;
      } else {
        position.y = -position.y;
        speed.y = -speed.y;
        calculateVectSpeed();
      }
      bounceSpeedUp(0.1);
    },

    downBorderBounce: function() {
      if (speed.lift) {
        var impact = {
          x: intersectY(position.x - speed.x, position.y - speed.y, position.x, position.y, canvas.ySize),
          y: canvas.ySize
        }
        speed.lift = false;
        speed.bonus = -speed.bonus;
        speed.tan = -sign(speed.x) * Math.abs(randomTangent());
        calculateXYSpeed();
        var bounce = calculateBounceAbscissa(impact.y - position.y, impact.x - position.x, 1 / speed.tan);
        position.x = impact.x + bounce * speed.tan;
        position.y = impact.y + bounce;
      } else {
        position.y = 2*canvas.ySize - position.y;
        speed.y = -speed.y;
        calculateVectSpeed();
      }
      bounceSpeedUp(0.1);
    },

    leftPaddleBounce: function() {
      var leftPad = leftPaddle.getStatus();
      var impact = {
        x: leftPad.position.x + leftPad.width,
        y: intersectX(position.x - speed.x, position.y - speed.y, position.x, position.y, leftPad.position.x + leftPad.width)
      };
      if ((impact.y < leftPad.position.y) || (impact.y > leftPad.position.y + leftPad.length)) {
        console.log("Outer paddle bounce");
      }
      speed.x = -speed.x;
      speed.lift = false;
      speed.bonus = 0;
      if (impact.y - leftPad.position.y < leftPad.length * 1/10) {
        speed.tan = -Math.sqrt(3);
      } else if (impact.y - leftPad.position.y < leftPad.length * 9/10) {
        if (speed.y * leftPad.speed > 0) {
          speed.bonus = - speed.norm / 5;
          speed.lift = true;
          speed.tan = -sign(speed.tan) * 1;
        } else if (speed.y * leftPad.speed < 0) {
          speed.bonus = speed.norm / 3;
          speed.tan = -sign(speed.tan) * (2 - Math.sqrt(3));
        } else {
          speed.tan = -sign(speed.tan) * 1 / Math.sqrt(3);
        }
      } else {
        speed.tan = Math.sqrt(3);
      }
      bounceSpeedUp(0.1);
      var bounce = calculateBounceAbscissa(impact.x - position.x, impact.y - position.y, speed.tan);
      position.x = impact.x + bounce;
      position.y = impact.y + bounce * speed.tan;
    },

    rightPaddleBounce: function() {
      var rightPad = rightPaddle.getStatus();
      var impact = {
        x: rightPad.position.x,
        y: intersectX(position.x - speed.x, position.y - speed.y, position.x, position.y, rightPad.position.x)
      };
      if ((impact.y < rightPad.position.y) || (impact.y > rightPad.position.y + rightPad.length)) {
        console.log("Outer paddle bounce");
      }
      speed.x = -speed.x;
      speed.lift = false;
      speed.bonus = 0;
      if (impact.y - rightPad.position.y < rightPad.length * 1/10) {
        speed.tan = Math.sqrt(3);
      } else if (impact.y - rightPad.position.y < rightPad.length * 9/10) {
        if (speed.y * rightPad.speed > 0) {
          speed.bonus = - speed.norm / 5;
          speed.lift = true;
          speed.tan = -sign(speed.tan) * 1;
        } else if (speed.y * rightPad.speed < 0) {
          speed.bonus = speed.norm / 3;
          speed.tan = -sign(speed.tan) * (2 - Math.sqrt(3));
        } else {
          speed.tan = -sign(speed.tan) * 1 / Math.sqrt(3);
        }
      } else {
        speed.tan = -Math.sqrt(3);
      }
      bounceSpeedUp(0.1);
      var bounce = calculateBounceAbscissa(impact.x - position.x, impact.y - position.y, speed.tan);
      position.x = impact.x - bounce;
      position.y = impact.y + bounce * speed.tan;
    }

  };
}



// -------------------------------------------
// AI

function AI(difficulty) {
  var easyMaxSpeed = 4;
  var mediumMaxSpeed = 7;

  function bouncing() {
    var cpuPad = rightPaddle.getStatus();
    var ball = gameBall.getStatus();
    if (ball.position.x + ball.speed.x > cpuPad.position.x) {
      return true;
    }
    return false;
  }

  if (difficulty == "easy") {
    return {
      decide: function() {
        var epsilon = 1;
        rightPaddle.requestMoveUp(false);
        rightPaddle.requestMoveDown(false);
        var cpuPad = rightPaddle.getStatus();
        var ball = gameBall.getStatus();
        if (!bouncing()) {
          if ((cpuPad.position.y + cpuPad.length * 1/2) > ball.position.y + ball.speed.y + epsilon) {
            rightPaddle.requestMoveUp(Math.min(Math.round(Math.abs(cpuPad.position.y + cpuPad.length * 1/2 - ball.position.y - ball.speed.y)), easyMaxSpeed));
          } else if ((cpuPad.position.y + cpuPad.length * 1/2) < ball.position.y + ball.speed.y - epsilon) {
            rightPaddle.requestMoveDown(Math.min(Math.round(Math.abs(cpuPad.position.y + cpuPad.length * 1/2 - ball.position.y - ball.speed.y)), easyMaxSpeed));
          }
        }
      }
    };
  } else if (difficulty == "medium") {
    return {
      decide: function() {
        var epsilon = 1;
        rightPaddle.requestMoveUp(false);
        rightPaddle.requestMoveDown(false);
        var cpuPad = rightPaddle.getStatus();
        var ball = gameBall.getStatus();
        if (!bouncing()) {
          if ((cpuPad.position.y + cpuPad.length * 1/2) > ball.position.y + ball.speed.y + epsilon) {
            rightPaddle.requestMoveUp(Math.min(Math.round(Math.abs(cpuPad.position.y + cpuPad.length * 1/2 - ball.position.y - ball.speed.y)), mediumMaxSpeed));
          } else if ((cpuPad.position.y + cpuPad.length * 1/2) < ball.position.y + ball.speed.y - epsilon) {
            rightPaddle.requestMoveDown(Math.min(Math.round(Math.abs(cpuPad.position.y + cpuPad.length * 1/2 - ball.position.y - ball.speed.y)), mediumMaxSpeed));
          }
        } else {
          var rand = Math.random();
          if (rand > 0.666) {
            rightPaddle.requestMoveUp(true);
          } else if (rand > 0.333) {
            rightPaddle.requestMoveDown(true);
          }
        }
      }
    };
  } else if (difficulty == "hard") {
    var randPos = 0;
    return {
      decide: function() {
        var cpuPad = rightPaddle.getStatus();
        var ball = gameBall.getStatus();

        if (ball.speed.x < 0) {
          aim = canvas.ySize/2 - cpuPad.length/2;
          randPos = 0;
        } else {
          this.reflect();
        }

        this.goto(aim);
      },

      goto: function(aim) {
        var cpuPad = rightPaddle.getStatus();
        var epsilon = 1;
        rightPaddle.requestMoveUp(false);
        rightPaddle.requestMoveDown(false);

        if (cpuPad.position.y > aim + epsilon) {
          rightPaddle.requestMoveUp(Math.round(Math.abs(cpuPad.position.y-aim)));
        } else if (cpuPad.position.y < aim - epsilon){
          rightPaddle.requestMoveDown(Math.round(Math.abs(cpuPad.position.y-aim)));
        }
      },

      reflect: function() {
        cpuPad = rightPaddle.getStatus();
        ball = gameBall.getStatus();

        if (ball.speed.lift) {
          ball.speed.tan = sign(ball.speed.tan) / Math.sqrt(3);
        }

        var impact = this.findImpact();
        aim = impact - cpuPad.length/2;

        if (bouncing()) {
          randPos = Math.random() * cpuPad.length - cpuPad.length/2;
        }
        aim += randPos;
      },

      findImpact: function() {
        cpuPad = rightPaddle.getStatus();
        ball = gameBall.getStatus();

        var impact = intersectX(ball.position.x - ball.speed.x, ball.position.y - ball.speed.y, ball.position.x, ball.position.y, cpuPad.position.x);

        while ((impact < 0 ) || (impact > canvas.ySize)) {
          if (impact < 0) {
            impact = -impact;
          }
          if (impact > canvas.ySize) {
            impact = canvas.ySize*2 - impact;
          }
        }
        return impact;
      }
    };
  }
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
    getLeftTable: function() {
      return [leftPlayer, leftScore];
    },

    getRightTable: function() {
      return [rightPlayer, rightScore];
    },

    addPointLeft: function() {
      leftScore += 1;
      updateDisplay();
      if (leftScore > 1) {
        menu.gameover(leftPlayer);
        return false;
      } else {
        return true;
      }
    },

    addPointRight: function() {
      rightScore += 1;
      updateDisplay();
      if (rightScore > 1) {
        menu.gameover(rightPlayer);
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
    collider.resolve();
  }

  function render() {
    context.clearRect(0, 0, canvas.xSize, canvas.ySize);
    if (gameState != "menu") {
      if (gameState == "playing") {
        gameBall.render();
      }
      leftPaddle.render();
      rightPaddle.render();
    }
    frames += 1;
  }

  function step() {
    if (gameState == "playing") {
      if (cpu) {
        cpu.decide();
      }
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

  var leftPlayer;
  var rightPlayer;

  function setGame(opponent) {
    switch (opponent) {
      case "2players":
        leftPlayer = "Player 1";
        rightPlayer = "Player 2";
        cpu = null;
        break;
      case "easy":
        leftPlayer = "Player";
        rightPlayer = "Slow CPU";
        cpu = new AI(opponent);
        break;
      case "medium":
        leftPlayer = "Player";
        rightPlayer = "CPU";
        cpu = new AI(opponent);
        break;
      case "hard":
        leftPlayer = "Player";
        rightPlayer = "Smart CPU";
        cpu = new AI(opponent);
        break;
    }
  }

  function launchGame() {
    leftPaddle = new Paddle(20, 250, unlockedColor);
    rightPaddle = new Paddle(canvas.xSize - 26, 250, "#eee");
    gameBall = new Ball();
    gameBall.initPos();
    gameBall.initSpeed();
    scoreCounter = new ScoreCounter(leftPlayer, rightPlayer);
    scoreCounter.resetScore();
    gameState = "playing";
    document.getElementById("main").style.display = "none";
    document.getElementById("victory").style.display = "none";
    document.getElementById("ailist").style.display = "none";
  }

  return {
    displayAI: function() {
      document.getElementById("main").style.display = "none";
      document.getElementById("ailist").style.display = "initial";
    },
    easyAI: function() {
      setGame("easy");
      launchGame();
    },
    mediumAI: function() {
      setGame("medium");
      launchGame();
    },
    hardAI: function() {
      setGame("hard");
      launchGame();
    },
    twoPlayers: function() {
      setGame("2players");
      launchGame();
    },
    activateBonus: function() {
      console.log("Not yet implemented.");
    },
    pause: function() {
      document.getElementById("pause").style.display = "initial";
      document.getElementById("pause-h").style.color = "yellow";
      gameState = "pause";
    },
    resumeGame: function () {
      document.getElementById("pause-h").style.color = "#111";
      document.getElementById("pause").style.display = "none";
      gameState = "playing";
    },
    returnMenu: function() {
      document.getElementById("pause").style.display = "none";
      document.getElementById("victory").style.display = "none";
      document.getElementById("main").style.display = "initial";
      gameState = "menu";
    },
    gameover: function(winner) {
      document.getElementById("victory").style.display = "initial";
      document.getElementById("win-h").style.color = "yellow";
      document.getElementById("winner").innerHTML = "<span> " + winner + " wins! </span>";
      gameState = "gameover";
    },
    newGame: function() {
      document.getElementById("win-h").style.color = "#111";
      launchGame();
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
var context = gameCanvas.getContext("2d");

// paddles
var leftPaddle;
var rightPaddle;
var unlockedColor = "#eee";

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
var collider = new Collider();
var menu = new Menu();

document.getElementById("ailist").style.display = "none";
document.getElementById("pause").style.display = "none";
document.getElementById("victory").style.display = "none";


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
  // e key (player 1)
  if (event.keyCode == 69) {
    leftPaddle.requestMoveUp(true);
  }
  // d key (player 1)
  if (event.keyCode == 68) {
    leftPaddle.requestMoveDown(true);
  }

  // p key (player 2)
  if ((event.keyCode == 80) && !cpu) {
    rightPaddle.requestMoveUp(true);
  }
  // l key (player 2)
  if ((event.keyCode == 76) && !cpu) {
    rightPaddle.requestMoveDown(true);
  }

  // spacebar
  if (event.keyCode == 32) {
    if (gameState == "playing") {
      menu.pause();
    } else if (gameState == "pause") {
      menu.resumeGame();
    } else if (gameState == "gameover") {
      menu.newGame();
    }
  }
  // m key
  if ((event.keyCode == 77)) {
    if ((gameState == "pause") || (gameState == "gameover")) {
      menu.returnMenu();
    }
  }
}, false);

    // key released
window.addEventListener("keyup", function(event) {
  // e key (player 2)
  if (event.keyCode == 69) {
    leftPaddle.requestMoveUp(false);
  }
  // d key (player 2)
  if (event.keyCode == 68) {
    leftPaddle.requestMoveDown(false);
  }

  // p key (player 2)
  if ((event.keyCode == 80) && !cpu) {
    rightPaddle.requestMoveUp(false);
  }
  // l key (player 2)
  if ((event.keyCode == 76) && !cpu) {
    rightPaddle.requestMoveDown(false);
  }
}, false);



// -------------------------------------------
// Menu Inputs

document.getElementById("displayai").addEventListener("click", menu.displayAI);
document.getElementById("ai1").addEventListener("click", menu.easyAI);
document.getElementById("ai2").addEventListener("click", menu.mediumAI);
document.getElementById("ai3").addEventListener("click", menu.hardAI);
document.getElementById("2p").addEventListener("click", menu.twoPlayers);
document.getElementById("bonus").addEventListener("click", menu.activateBonus);
document.getElementById("continue").addEventListener("click", menu.resumeGame);
document.getElementById("retmenu1").addEventListener("click", menu.returnMenu);
document.getElementById("retmenu2").addEventListener("click", menu.returnMenu);
document.getElementById("newgame").addEventListener("click", menu.newGame);



// -------------------------------------------
// Menu hover

document.getElementById("displayai").addEventListener("mouseover", function() { document.getElementById("displayai-h").style.color = "yellow"; });
document.getElementById("displayai").addEventListener("mouseout", function() { document.getElementById("displayai-h").style.color = "#111"; });
document.getElementById("ai1").addEventListener("mouseover", function() { document.getElementById("ai1-h").style.color = "yellow"; });
document.getElementById("ai1").addEventListener("mouseout", function() { document.getElementById("ai1-h").style.color = "#111"; });
document.getElementById("ai2").addEventListener("mouseover", function() { document.getElementById("ai2-h").style.color = "yellow"; });
document.getElementById("ai2").addEventListener("mouseout", function() { document.getElementById("ai2-h").style.color = "#111"; });
document.getElementById("ai3").addEventListener("mouseover", function() { document.getElementById("ai3-h").style.color = "yellow"; });
document.getElementById("ai3").addEventListener("mouseout", function() { document.getElementById("ai3-h").style.color = "#111"; });
document.getElementById("2p").addEventListener("mouseover", function() { document.getElementById("2p-h").style.color = "yellow"; });
document.getElementById("2p").addEventListener("mouseout", function() { document.getElementById("2p-h").style.color = "#111"; });
document.getElementById("bonus").addEventListener("mouseover", function() { document.getElementById("bonus-h").style.color = "yellow"; });
document.getElementById("bonus").addEventListener("mouseout", function() { document.getElementById("bonus-h").style.color = "#111"; });
document.getElementById("continue").addEventListener("mouseover", function() { document.getElementById("continue-h").style.color = "yellow"; });
document.getElementById("continue").addEventListener("mouseout", function() { document.getElementById("continue-h").style.color = "#111"; });
document.getElementById("retmenu1").addEventListener("mouseover", function() { document.getElementById("retmenu1-h").style.color = "yellow"; });
document.getElementById("retmenu1").addEventListener("mouseout", function() { document.getElementById("retmenu1-h").style.color = "#111"; });
document.getElementById("newgame").addEventListener("mouseover", function() { document.getElementById("newgame-h").style.color = "yellow"; });
document.getElementById("newgame").addEventListener("mouseout", function() { document.getElementById("newgame-h").style.color = "#111"; });
document.getElementById("retmenu2").addEventListener("mouseover", function() { document.getElementById("retmenu2-h").style.color = "yellow"; });
document.getElementById("retmenu2").addEventListener("mouseout", function() { document.getElementById("retmenu2-h").style.color = "#111"; });
