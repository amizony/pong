# Pong

A replica of the Pong game built during my apprenticeship at [Bloc.io](www.bloc.io).

Demo is available on Heroku: [Pong](http://my-little-pong-game.herokuapp.com/).


## Technologies

HTML5 application built with [Grunt](gruntjs.com) and using only HTML5, CSS and Javascript.


## Features

* Pong game
* Several AI difficulty level
* Two players mode
* Paddle's movement influencing the bounce


## Quick start

Install

1. [grunt](gruntjs.com): `npm install -g grunt-cli`.
2. install dependencies: `npm install`.

Run `grunt` to launch a local server you can then access on port 3000 of localhost.


## How to play

#### Game Controls

* `spacebar` for pausing the game

Player 1:
* `e` for moving up
* `d` for moving down

Player 2:
* `p` for moving up
* `l` for moving down

#### What are the ball's colors?

Blue: the ball is not moving but will be soon launched.  
Yellow: the ball is moving normally.  
Green: the ball has a medium speed decrease until next bounce on a border.  
Orange: the ball has a medium speed increase until next bounce on a paddle.  
Red: the ball has a huge speed increase until next bounce on a paddle.

#### How does the bounce work?

When hitting the paddle, the ball has always a fixed bouncing angle.
* If the paddle is idle: the bounce angle is fixed (30&#176;) and the ball speed comes back to normal.
* If the paddle moves in the same direction as the ball: you do a *lift*. The ball is slowed down (temporary), has big bouncing angle (45&#176;). And the ball has a special effect released on the next bounce on a border.
* If the paddle moves in the opposite direction of the ball: you do a *smash*. The ball moves faster (temporary) and has a small bouncing angle (15&#176;).
* If the ball hits the extremity of the paddle: the ball speed comes back to normal, and the bouncing angle is the biggest (60&#176;). The bounce in not influenced by the paddle's movement in this case.

When hitting the border:
* If the ball was lifted (a green ball): the bouncing angle is random (a great way to surprise your adversary), and the ball got a medium speed increase (temporary).
* For other balls: the bouncing angle stay the same, and the speed too.

Additionally, after each bounce the base speed of the ball increases slightly.


## About the code

The game is drawn on a HTML canvas element, the interface is composed of HTML DOM elements displayed alongside or on top of the canvas and the CSS provides some colors and style.
And then the Javascript code makes everything work.

I used a constructor (with public and privileged methods) for each object (paddle, ball) or entity (game engine, AI, collider, etc.).
The game engine updates the state (position and speed) of each object and renders it at each step - or animation frame.
And I use events to react to the player's inputs.

Lastly there is a lot of math in the code to ensure the best behaviour for each object.
