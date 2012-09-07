/*
 * File Comment, see
 */

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var movePillar = false;

var startScreen = true;
var mouseDownLoc = 0;
var sysTime = 0;
var purple = "#c267ff";
var orange = "#de3500";

var leftColor = purple;
var rightColor = orange;

var squares;
var platform;
var gravity = 9.8;
var frequencyBound = 0.968;

var intervalId;
var timerDelay = 100;
var score = 0;
var levelInterval = 10;
var levelUp = score + levelInterval;
var levelText = "More Blocks!";
var levelTextCtr = 0;
var pingLevelUp = false;
var misses = 10; 
var scoreText;
var missesText;
var fontHeight = 30;

var effectTimer = 0;
var squareAlterColor;

//Global variable for starting game
var startingGame = true;
/*
 * Drawable - Prototype for drawable objects.  Contains color to be drawn,
 * coordinates, and dimensions.
 */
function Drawable(color, x, y, width, height) {
	if (undefined != color)
		this.color = color;
	if (undefined != x)
		this.x = x;
	if (undefined != y)
		this.y = y;
	if (undefined != width)
		this.width = width;
	if (undefined != height)
		this.height = height;
}

Drawable.prototype.color = "black";
Drawable.prototype.x = 0;
Drawable.prototype.y = 0;
Drawable.prototype.width = 2;
Drawable.prototype.height = 2;

/*
 * draw - Function to draw a drawable based on its fields.
 */
Drawable.prototype.draw = function() {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

/*
 * clear - Function to clear a drawable based on its fields.
 */
Drawable.prototype.clear = function() {
	ctx.clearRect(this.x - this.width / 2 - 1, this.y - this.height/2 - 1, this.width + 2, this.height + 2);
}

/*
 * toString - toString for drawables for debugging purposes
 */
Drawable.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var width = "width: " + this.width + " ";
	var height = "height: " + this.height + " ";
	var color = "color " + this.color + " ";
	return "Faller<" + origin + width + color + ">";
}

/*
 * Platform - drawable object representing the paddle that the player attempts
 * to catch the blocks on
 */

function Platform(leftColor, rightColor, center, y, width, height) {
	Drawable.call(this, undefined, center - width / 2, y, width, height);

	this.leftColor = leftColor;
	this.rightColor = rightColor;
	this.center = center;
	this.color = undefined;

	this.restore();
}

Platform.prototype = new Drawable();
Platform.prototype.constructor = Platform;
Platform.prototype.leftColor = "black";
Platform.prototype.rightColor = "black";

Platform.prototype.restore = function() {
	this.leftColorStarts = [this.center - this.width / 2];
	this.leftColorLengths = [this.width / 2];
	this.rightColorStarts = [this.center];
	this.rightColorLengths = [this.width / 2];
}

Platform.prototype.absorbed = function(square) {
	var sBottom = square.y + square.sideLength / 2;
	var sTop = square.y - square.sideLength / 2;
	var sRight = square.x + square.sideLength / 2;
	var sLeft = square.x - square.sideLength / 2;
	var baseLeft = this.center - canvas.width / 4;
	var baseRight = this.center + canvas.width / 4;
	var baseTop = canvas.height - 10;
	
	switch (square.color) {
		case this.leftColor: {
			for (var i = 0; i < this.leftColorStarts.length; i++) {
				var left = this.leftColorStarts[i];
				var right = left + this.leftColorLengths[i];
				if (sLeft >= left && sRight <= right) { //In a colored segment
					console.log("absorb");
					return true;
				}
				else if (sLeft < baseLeft && sRight > left) { //Hanging off left edge
					console.log("absorb");
					return true;
				}
				else if (sRight > baseRight && sLeft < right) {//Hanging off right edge
					console.log("absorb");
					return true
				}
			}
			break;
		}
		case this.rightColor: {
			for (var i = 0; i < this.rightColorStarts.length; i++) {
				var left = this.rightColorStarts[i];
				var right = left + this.rightColorLengths[i];
				if (sLeft >= left && sRight <= right) {//In a colored segment
					console.log("absorb");
					return true;
				}
				else if (sLeft < baseLeft && sRight > left) {//Hanging off left edge
					console.log("absorb");
					return true;
				}
				else if (sRight > baseRight && sLeft < right) {//Hanging off right 
					console.log("absorb");
					return true
				}
			}
			break;
		}
		default:
			break;
	}
	console.log("bounce")
	return false;
}

/*
 * draw - Overrides the default draw method, in order to draw the platform
 */
Platform.prototype.draw = function() {
	var i;
	var left;
	var width;

	ctx.fillStyle = this.leftColor;
	for (i = 0; i < this.leftColorStarts.length; i++) {
		left = this.leftColorStarts[i];
		width = this.leftColorLengths[i];
		ctx.fillRect(left, this.y, width, this.height);
	};

	ctx.fillStyle = this.rightColor;
	for (i = 0; i < this.rightColorStarts.length; i++) {
		left = this.rightColorStarts[i];
		width = this.rightColorLengths[i];
		ctx.fillRect(left, this.y, width, this.height);
	};

	ctx.fillStyle = "black"
	ctx.fillRect(this.center - 10, this.y - 5, 20, 5);
}

/*
 * clear - overrides clear function for Platform object; clears platform
 */
Platform.prototype.clear = function() {
	ctx.clearRect(this.x, this.y, this.width, this.height);
	ctx.clearRect(this.center - 10, canvas.height - 15, 20, 5);
}

/*
 * toString - overrides toString function for Platform object
 * Converts to string for debugging purposes
 */
Platform.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var center = "center: " + this.center + " ";
	var width = "width: " + this.width + " ";
	var height = "height: " + this.height + " ";
	return "Platform<" + origin + center + width + height + ">";
}

/*
 * Faller - Prototype for any object that falls.  Takes standard drawable args,
 * as well as initial x and y coordinates, velocities in x and y direction, and
 * vertical acceleration
 */
function Faller(color, x, y, width, height, y0, vy0, x0, vx0, a) {
	Drawable.call(this, color, x, y, width, height);
	if (undefined != y0)
		this.y0 = y0
	if (undefined != vy0)
		this.vy0 = vy0;
	if (undefined != x0)
		this.x0 = x0;
	if (undefined != vx0)
		this.vx0 = vx0;
	if (undefined != a)
		this.a = a;

	this.tx0 = sysTime;
	this.ty0 = sysTime;
}

Faller.prototype = new Drawable();
Faller.prototype.constructor = Faller;
Faller.prototype.y0 = 0;
Faller.prototype.vy0 = 0;
Faller.prototype.x0 = canvas.width/2;
Faller.prototype.vx0 = 1;
Faller.prototype.a = gravity;

/*
 * fall - function to make Fallers fall; changes current x and y coordinates based
 * on velocity and acceleration.  Also checks for bounces on left and right of 
 * canvas, and reflects faller if it hits a wall.
 */
Faller.prototype.fall = function() {
	var time = sysTime - this.t0;

	if (this.x + this.width / 2 >= canvas.width) {
		this.vx0 = this.vx0 * -1;
		this.x0 = canvas.width - this.width / 2 - 1;
		this.tx0 = sysTime;
	}
	if (this.x - this.width / 2 <= 0) {
		this.vx0 = this.vx0 * -1;
		this.x0 = this.width / 2 + 1;
		this.tx0 = sysTime;
	}

	var ytime = sysTime - this.ty0;
	var xtime = sysTime - this.tx0;
	var newY = this.y0 + this.vy0 * ytime + .5 * this.a * ytime * ytime;
	var newX = this.x0 + this.vx0 * xtime;

	this.y = newY;
	this.x = newX;
}

/*
 * toString - Overrides function for drawable; converts faller to string for debugging
 * purposes.
 */
Faller.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var width = "width: " + this.width + " ";
	var height = "height: " + this.height + " ";
	var color = "color " + this.color + " ";
	var velocity = "initial velocity: " + this.vy0 + " final velocity: " + this.vy0 + 2 * this.a * (sysTime - this.ty0) + " ";
	var acceleration = "acceleration: " + this.a;
	return "Faller<" + origin + width + height + color + velocity + acceleration + ">";
}

/*
 * Square - instance of faller for a standard square.  Additional fields for side
 * length and boolean as to whether or not the square has bounced.
 */
function Square(color, x, sideLength, y0, vy0, x0, vx0, a) {
	Faller.call(this, color, x, 0 - sideLength / 2, sideLength, sideLength, y0, vy0, x0, vx0, a);
	this.hasBounced = false;
	this.sideLength = sideLength;
}

Square.prototype = new Faller();
Square.prototype.constructor = Square;

/*
 * toString - overrides toString function in drawable; converts square to string for
 * debugging purposes
 */
Square.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var sideLength = "sideLength: " + this.sideLength + " ";
	var color = "color " + this.color + " ";
	var velocity = "initial velocity: " + this.vy0 + " final velocity: " + this.vy0 + 2 * this.a * (sysTime - this.ty0) + " ";
	var acceleration = "acceleration: " + this.a;
	return "Square<" + origin + sideLength + color + velocity + acceleration + ">";
}

/*
 * ColorAlterSquare - Special square object that changes color of paddle depending
 * on where it as called.  Appears with different sprite
 */
function ColorAlterSquare(color, x, sideLength, y0, vy0, x0, vx0, a) {
	Square.call(this, color, x, sideLength, y0, vy0, x0, vx0, a);
}

ColorAlterSquare.prototype = new Square();
ColorAlterSquare.prototype.constructor = ColorAlterSquare;

/*
 * draw - overrides draw function in drawable; Draws the square as usual, but with
 * a black box in the center to indicate it is special
 */
ColorAlterSquare.prototype.draw = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;
	var innerColor = platform.leftColor;

	ctx.fillStyle = this.color;
	ctx.fillRect(sLeft, sTop, this.sideLength, this.sideLength);


	if (this.color === platform.leftColor)
		innerColor = platform.rightColor;
	ctx.fillStyle = innerColor;
	ctx.fillRect(sLeft + this.sideLength / 4, sTop + this.sideLength / 4, this.sideLength / 2, this.sideLength / 2);
};

/*
 * toString - overrides toString function in drawable; converts to string (provides special
 * message for special square) for debugging purposes
 */
ColorAlterSquare.prototype.toString = function() {
	return "specialness :)";
}

function CheckerboardSquare(color, x, sideLength, y0, vy0, x0, vx0, a) {
	Square.call(this, color, x, sideLength, y0, vy0, x0, vx0, a);
}

CheckerboardSquare.prototype = new Square();
CheckerboardSquare.prototype.constructor = CheckerboardSquare;

CheckerboardSquare.prototype.draw = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;
	var innerColor = platform.leftColor;

	ctx.fillStyle = this.color;
	ctx.fillRect(sLeft, sTop, this.sideLength, this.sideLength);
	
	if (this.color === platform.leftColor)
		innerColor = platform.rightColor;
	ctx.fillStyle = innerColor;
	ctx.fillRect(sLeft + this.sideLength / 4, sTop + this.sideLength / 4, this.sideLength / 4, this.sideLength / 4);
	ctx.fillRect(sLeft + this.sideLength / 2, sTop + this.sideLength / 2, this.sideLength / 4, this.sideLength / 4);
}

function getGlowFactor(time) {
	var cyclePoint = (time * 10) % 10; //Get's the tenth's digit
}

/*
 * onTimer - called at regular intervals to clear, adjust, and redraw graphics
 */
function onTimer() {
  if (misses === 0) { 
    loseGame();
    return;
  };
  sysTime += .1;
	clearThings();
	checkBounces();
	moveSquares();
	drawThings();
  
	//Increase frequency if score is high enough
	if (score >= levelUp){
		frequencyBound -= 0.02;
		levelUp += levelInterval;
		pingLevelUp = true;
	}

	if (effectTimer > 0) {
		effectTimer -= .1
	} else if (effectTimer <= 0) {
		platform.restore();
	}

	//Generate squares
	var gen = Math.random();
	var color;
	if (gen > frequencyBound) {
		var num = Math.ceil(Math.random() * 10);
		var size = Math.random() * 30 + 10;
		var x0 = Math.random() * canvas.width;
		var vx0 = Math.random() * 30 - 5;

		if (effectTimer > 0){
			squares.push(new Square(squareAlterColor, x0, size, undefined, undefined, x0, vx0));
		}
		else if ((1 <= num) && (8 >= num)){
			if (4 >= num){
				color = platform.leftColor;
			}
			else{
				color = platform.rightColor;
			}
			console.log(color);
			squares.push(new Square(color, x0, size, undefined, undefined, x0, vx0));
		}
		else if (num == 9){
			if (Math.random() < 0.5){
				color = platform.leftColor;
			}
			else{
				color = platform.rightColor;
			}
			squares.push(new ColorAlterSquare(color, x0, size, undefined, undefined, x0, vx0));
		}
		else if (num == 10) {
			if (Math.random() < 0.3) {
				color = platform.leftColor;
			}
			else {
				color = platform.rightColor;
			}
			squares.push(new CheckerboardSquare(color, x0. size, undefined, undefined, x0, vx0));
		}
	}
}

/* 
 * drawText - Function to draw score, misses remaining, and levelup notices.
 */
function drawText(){
	var fontSize;
	ctx.font = (fontHeight + "px Arial");
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.fillStyle = "green";

	/* Construct the score text, and write it on the canvas */
	scoreText = "Score: " + score;
	ctx.fillText(scoreText, canvas.width, 0);

	/* Do the same for the misses */
	missesText = "Misses: " + misses;
	ctx.fillText(missesText, canvas.width, fontHeight);

	/* Print levelup */
	if(pingLevelUp){
		fontSize = 20 + Math.ceil(levelTextCtr/3);
		ctx.font = (fontSize + "px Arial");
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "rgba(0, 128, 128, 0.6)";

		ctx.fillText(levelText, canvas.width/2, canvas.height/2);
	}
}

/*
 * clearText - Function to clear the text drawn in drawText
 */
function clearText(){
	var fontSize;
	ctx.font = (fontHeight + "px Arial");
	var scoreWidth = ctx.measureText(scoreText).width;
	var missesWidth = ctx.measureText(missesText).width;
	var height = fontHeight;
	ctx.clearRect(canvas.width - scoreWidth, 0, scoreWidth, height);
	ctx.clearRect(canvas.width - missesWidth, height, missesWidth, height);

	if(pingLevelUp){
		fontSize = 20 + Math.ceil(levelTextCtr/3);
		ctx.font = (fontSize + "px Arial");
		var levelWidth = ctx.measureText(levelText).width;

		ctx.clearRect(canvas.width/2 - levelWidth/2, canvas.height/2 - fontSize/2, levelWidth, fontSize + 1);

		if((++levelTextCtr) > 100){
			levelTextCtr = 0;
			pingLevelUp = false;
		}
	}
}

/*
 * moveSquares - Function to move each square
 */
function moveSquares() {
	squares.forEach(function(square) {
		square.fall();
	});
}

/*
 * checkBounces - Function to determine if squares have hit paddle or gone off screen.
 * Causes squares to bounce, be absorbed, or disappear, and adjusts score/misses appropriately.
 */
function checkBounces() {
	for (var i = 0; i < squares.length; i++) {
		var square = squares[i];
		var sBottom = square.y + square.sideLength / 2;
		var sTop = square.y - square.sideLength / 2;
		var sRight = square.x + square.sideLength / 2;
		var sLeft = square.x - square.sideLength / 2;
		var baseLeft = platform.center - canvas.width / 4;
		var baseRight = platform.center + canvas.width / 4;
		var baseTop = canvas.height - 10;
		var timeUp;
		var time;

		if (sLeft < baseRight && sRight > baseLeft && sBottom >= baseTop) {
			if (platform.absorbed(square)) {
				squares.splice(i, 1);
				score++;
				if (square instanceof ColorAlterSquare) {
					console.log("Absorbed ColorAlterSquare");
					colorAlterPlatform(square.color);
					colorAlterSquares(square.color);
				}
			}
			else {
				if (square instanceof ColorAlterSquare) {
					squares.splice(i, 1);
					if (square.color === platform.leftColor) {
						colorAlterPlatform(platform.rightColor);
					}
					else {
						colorAlterPlatform(platform.leftColor);
					}
					colorAlterSquares(square.color);
				}

				if (square.hasBounced && square.vy0 > -10) { //EXPLOOOOOOOODE!!!!!!!!
					console.log("explode");
					squares.splice(i, 1);
					score -= 5;
				}

				time = Math.floor(sysTime - square.ty0 - 2);
				if (!square.hasBounced)
					square.vy0 += (square.a * time);
				else {
					timeUp = (-1 * square.vy0) / square.a
					square.vy0 = square.a * (time - timeUp);
				}

				square.vy0 = Math.floor(square.vy0) * -1;
				square.y0 = baseTop - square.sideLength / 2 - 1;
				square.ty0 = sysTime;
				square.hasBounced = true;
				console.log(square);
			}
		}
		else if (sBottom >= canvas.height) {
			console.log("miss");
			squares.splice(i, 1);
			misses--;
    }
	}
}

function colorAlterPlatform(color) {
	if (color === this.leftColor) {
		console.log("Coloring all left");
		platform.leftColorStarts = [platform.center - platform.width / 2];
		platform.leftColorLengths = [platform.width];
		platform.rightColorStarts = [];
		platform.rightColorLengths = [];
	} else {
		console.log("Coloring all right");
		platform.leftColorStarts = [];
		platform.leftColorLengths = [];
		platform.rightColorStarts = [platform.center - platform.width / 2];
		platform.rightColorLengths = [platform.width];
	}
	effectTimer = 5;
}

function colorAlterSquares(color) {
	squareAlterColor = color;
	squares.forEach(function(square) {
		square.color = color;
	});
}

function checkerboardPlatform() {
	var left = platform.center - platform.width / 2;
	platform.leftColorStarts = [left , left + 2 * platform.width / 6, left + 4 * platform.width / 6];
	platform.leftColorLengths = [platform.width / 6, platform.width / 6, platform.width / 6];
	platform.rightColorStarts = [left + platform.width / 6, left + 3 * platform.width / 6, left + 5 * platform.width / 6];
	platform.rightColorLengths = [platform.width / 6, platform.width / 6, platform.width / 6];
	effectTimer = 5;
}

/*
 * clearThings - Wrapper function to call each clear function
 */
function clearThings () {
	squares.forEach(function(square) {
		square.clear();
	})
	platform.clear();
	clearText();
};

/*
 * loseGame - Tell the user that they lost the game
 */
function loseGame() {  
  clearInterval(intervalId);
  clearThings();
  drawLoseScreen();
};

function drawLoseScreen() {
  fontSize = 20 + Math.ceil(levelTextCtr/3);
  ctx.font = (fontSize + "px Arial");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgb(0, 128, 128, 0.6)";
  scoreText = "Your Score: " + score;

  ctx.fillText("YOU LOSE", canvas.width/2, canvas.height/2-100);
  ctx.fillText(scoreText, canvas.width/2, canvas.height/2); 
  ctx.fillText("Click to play again", canvas.width/2, canvas.height/2+100);
};

/*
 * clearCanvas
 */
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/*
 * drawThings - Wrapper function to call each draw function
 */
function drawThings () {
	squares.forEach(function (square) {
		square.draw();
	})
	platform.draw();
	drawText();
}

/*
 * onMouseDown - function to move center platform on mousedown
 */
function onMouseDown(event) {
    if (misses === 0 || startingGame) {
      begin();
    }
    movePillar = true;
    mouseDownLoc = event.pageX;
}

/*
 * onMouseUp - function to cause platform to stop moving on mouseup
 */
function onMouseUp(event) {
    movePillar = false;
}

/*
 * bind onmousemove to function to move platform
 */
canvas.onmousemove = function (event) {
  if (misses === 0) {
    return; 
  } 
  if (true === movePillar) {
		clearThings();
		var offset = event.pageX - mouseDownLoc;
		mouseDownLoc = event.pageX;
		platform.center += offset;
		platform.x += offset;

		for (var i = 0; i < platform.leftColorStarts.length; i++) {
			platform.leftColorStarts[i] += offset;
		}
		
		for (var i = 0; i < platform.rightColorStarts.length; i++) {
			platform.rightColorStarts[i] += offset;
		}

		drawThings();
		//console.log("center is " + platform.center + ": purple (" + (platform.center - canvas.width / 4) + "," + platform + ") ; orange (" + platform.center + "," + (platform.center + canvas.width / 4) + ")");
	}
};

function onKeyPress (event) {
	if ("s".charCodeAt(0) === event.keyCode) {
		console.log("S!!!");
	}
}

/*
 * Everthing for start screen
 */
function Button(color, x, y, width, height, text){
	
}

begin();


function drawLoseScreen() {
  fontSize = 20 + Math.ceil(levelTextCtr/3);
  ctx.font = (fontSize + "px Arial");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgb(0, 128, 128, 0.6)";
  scoreText = "Your Score: " + score;

  ctx.fillText("YOU LOSE", canvas.width/2, canvas.height/2-100);
  ctx.fillText(scoreText, canvas.width/2, canvas.height/2); 
  ctx.fillText("Click to play again", canvas.width/2, canvas.height/2+100);
};


function drawStartScreen() {
  fontSize = 20 + Math.ceil(levelTextCtr/3);
  ctx.font = (fontSize + "px Arial");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgb(0, 128, 128, 0.6)";

  ctx.fillText("Welcome to block game", canvas.width/2, canvas.height/2-100);
  ctx.fillText("Click to play", canvas.width/2, canvas.height/2+100);
};

function begin(){
  if (startingGame) {
    drawStartScreen();
    startingGame = false; 
  }
  //Clear Screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Reset score and misses	
  misses = 10;
  score = 0; 
   
  canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('keydown', onKeyPress, false);
	canvas.setAttribute('tabindex', '0');
	canvas.focus();

	platform = new Platform(purple, orange, canvas.width / 2, canvas.height - 10, canvas.width / 2, 10);
	squares = [new Square(leftColor, canvas.width / 3, 10)];
	intervalId = setInterval(onTimer, timerDelay);
}

//For addition to construction of squares for testing
//, new Square(rightColor, 2 * canvas.width / 3, 10), new ColorAlterSquare(rightColor, Math.random() * canvas.width, 15)
