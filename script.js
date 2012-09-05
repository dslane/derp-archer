/*
 * File Comment
 */

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var movePillar = false;
var center = canvas.width / 2;
var offset = 0;
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

var colorAlterTimer = 0;
var alterColor;

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

Drawable.prototype.draw = function() {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

Drawable.prototype.clear = function() {
	ctx.clearRect(this.x - this.width / 2 - 1, this.y - this.height/2 - 1, this.width + 2, this.height + 2);
}

Drawable.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var width = "width: " + this.width + " ";
	var height = "height: " + this.height + " ";
	var color = "color " + this.color + " ";
	return "Faller<" + origin + width + color + ">";
}

function Platform(leftColor, rightColor, center, y, width, height) {
	Drawable.call(this, undefined, center - width / 2, y, width, height);

	this.leftColor = leftColor;
	this.rightColor = rightColor;
	this.center = center;
	this.color = undefined;
}

Platform.prototype = new Drawable();
Platform.prototype.constructor = Platform;
Platform.prototype.leftColor = "black";
Platform.prototype.rightColor = "black";

Platform.prototype.draw = function() {
	ctx.fillStyle = this.leftColor;
	ctx.fillRect(this.x, this.y, this.width / 2, this.height);

	ctx.fillStyle = this.rightColor;
	ctx.fillRect(this.center, this.y, this.width / 2, this.height);

	ctx.fillStyle = "black"
	ctx.fillRect(this.center - 10, canvas.height - 15, 20, 5);
}

Platform.prototype.clear = function() {
	ctx.clearRect(this.x, this.y, this.width, this.height);
	ctx.clearRect(this.center - 10, canvas.height - 15, 20, 5);
}

Platform.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var center = "center: " + this.center + " ";
	var width = "width: " + this.width + " ";
	var height = "height: " + this.height + " ";
	return "Platform<" + origin + center + width + height + ">";
}

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

Faller.prototype.fall = function() {
	var ytime = sysTime - this.ty0;
	var xtime = sysTime - this.tx0;
	var newY = this.y0 + this.vy0 * ytime + .5 * this.a * ytime * ytime;
	var newX = this.x0 + this.vx0 * xtime;
	this.y = newY;
	this.x = newX;
}

Faller.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var width = "width: " + this.width + " ";
	var height = "height: " + this.height + " ";
	var color = "color " + this.color + " ";
	var velocity = "initial velocity: " + this.vy0 + " final velocity: " + this.vy0 + 2 * this.a * (sysTime - this.ty0) + " ";
	var acceleration = "acceleration: " + this.a;
	return "Faller<" + origin + width + height + color + velocity + acceleration + ">";
}

function Square(color, x, sideLength, y0, vy0, x0, vx0, a) {
	Faller.call(this, color, x, 0 - sideLength / 2, sideLength, sideLength, y0, vy0, x0, vx0, a);
	this.hasBounced = false;
	this.sideLength = sideLength;
}

Square.prototype = new Faller();
Square.prototype.constructor = Square;

Square.prototype.toString = function() {
	var origin = "(" + this.x + "," + this.y + ") ";
	var sideLength = "sideLength: " + this.sideLength + " ";
	var color = "color " + this.color + " ";
	var velocity = "initial velocity: " + this.vy0 + " final velocity: " + this.vy0 + 2 * this.a * (sysTime - this.ty0) + " ";
	var acceleration = "acceleration: " + this.a;
	return "Square<" + origin + sideLength + color + velocity + acceleration + ">";
}

function ColorAlterSquare(color, x, sideLength, y0, vy0, x0, vx0, a) {
	Square.call(this, color, x, sideLength, y0, vy0, x0, vx0, a);
}

ColorAlterSquare.prototype = new Square();
ColorAlterSquare.prototype.constructor = ColorAlterSquare;

ColorAlterSquare.prototype.draw = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;

	ctx.fillStyle = this.color;
	ctx.fillRect(sLeft, sTop, this.sideLength, this.sideLength);

	ctx.fillStyle = "black";
	ctx.fillRect(sLeft + this.sideLength / 4, sTop + this.sideLength / 4, this.sideLength / 2, this.sideLength / 2);
};

ColorAlterSquare.prototype.toString = function() {
	return "specialness :)";
}

function drawPillar(center) {

}

function clearPillar(center) {
	ctx.clearRect(center - canvas.width / 4, canvas.height - 10, canvas.width / 4, 10);
	ctx.clearRect(center, canvas.height - 10, canvas.width / 4, 10);
	ctx.clearRect(center - 10, canvas.height - 15, 20, 5);
}

function onTimer() {
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

	if (colorAlterTimer > 0) {
		colorAlterTimer -= .1
		console.log(colorAlterTimer);
	} else if (colorAlterTimer <= 0) {
		platform.leftColor = purple;
		platform.rightColor = orange;
	}

	//Generate squares
	var gen = Math.random();
	var color;
	if (gen > frequencyBound) {
		var num = Math.ceil(Math.random() * 10);
		var size = Math.random() * 30 + 10;
		var x0 = Math.random() * canvas.width;
		var vx0 = Math.random() * 30 - 15;

		if (colorAlterTimer > 0){
			color = alterColor;
			squares.push(new Square(color, x0, size, undefined, undefined, x0, vx0));
		}
		else if ((1 <= num) && (9 >= num)){
			if (4 >= num){
				color = platform.leftColor;
			}
			else{
				color = platform.rightColor;
			}
			console.log(color);
			squares.push(new Square(color, x0, size, undefined, undefined, x0, vx0));
		}
		else{
			if (Math.random() < 0.5){
				color = platform.leftColor;
			}
			else{
				color = platform.rightColor;
			}
			squares.push(new ColorAlterSquare(color, x0, size, undefined, undefined, x0, vx0));
		}
	}
}

/* Function to display score and remaining misses */
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

function moveSquares() {
	clearPillar(center);
	squares.forEach(function(square) {
		square.fall();
	});
}

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
		var timeFloor;

		if (sLeft < baseRight && sRight > baseLeft) {
			if (sBottom >= baseTop) { //Hit the platform
				if (sRight <= platform.center && square.color === platform.leftColor) { //Absorb
					console.log("absorb: " + square.toString());
					squares.splice(i, 1);
					score++;
					if (square instanceof ColorAlterSquare) {
						colorAlterTimer = 5;
						platform.rightColor = platform.leftColor;
						alterColor = platform.leftColor;
						squares.forEach(function(squareToChange) {
							squareToChange.color = square.color;
						});
					}
				}
				else if (sLeft >= platform.center && square.color === platform.rightColor) { //Absorb
					console.log("absorb: " + square.toString());
					squares.splice(i, 1);
					score++;
					if (square instanceof ColorAlterSquare) {
						colorAlterTimer = 5;
						platform.leftColor = platform.rightColor;
						alterColor = platform.rightColor;
						squares.forEach(function(squareToChange) {
							squareToChange.color = square.color;
						});
					}

				}
				else if (platform.leftColor === platform.rightColor && platform.leftColor === square.color) { //Absorb
					console.log("absorb: " + square.toString());
					squares.splice(i, 1);
					score++;
				}
				else { //Bounce
					console.log("bounce: " + square.toString());
					if (square instanceof ColorAlterSquare) {
						colorAlterTimer = 5;
						squares.splice(i, 1);
						if (square.color === platform.leftColor) {
							alterColor = platform.leftColor;
							platform.leftColor = platform.rightColor
						}
						else {
							alterColor = platform.rightColor;
							platform.rightColor = platform.leftColor;
						}
						squares.forEach(function(squareToChange) {
							squareToChange.color = square.color;
						});
						continue;
					}

					if (square.hasBounced && square.vy0 > -10) { //EXPLOOOOOOOODE!!!!!!!!
						squares.splice(i, 1);
						score -= 5;
					}
					timeFloor = Math.floor(sysTime - square.ty0 - 2);
					if (!square.hasBounced)
						square.vy0 += (square.a * timeFloor);
					else {
						timeUp = (-1 * square.vy0) / square.a
						square.vy0 = square.a * (timeFloor - timeUp);
					}
					square.vy0 = Math.floor(square.vy0);
					square.vy0 *= -1;
					console.log("vy0 down: "  + square.vy0 + "\tty0 down: " + square.ty0 + "\t\nsystime: " + sysTime + "\ttimeUp: " + timeUp);
					square.y0 = baseTop - square.sideLength / 2 - 1;
					square.ty0 = sysTime;
					square.hasBounced = true;
				}
			}
		}
		else if (sTop >= canvas.height) { //Missed the platform
			squares.splice(i, 1);
			misses--;
		}
	}
}

function clearThings () {
	squares.forEach(function(square) {
		square.clear();
	})
	platform.clear();
	clearText();
};

function drawThings () {
	squares.forEach(function (square) {
		square.draw();
	})
	platform.draw();
	drawText();
}

function onMouseDown(event) {
    movePillar = true;
    offset = event.pageX - platform.center;
}

function onMouseUp(event) {
    movePillar = false;
}

canvas.onmousemove = function (event) {
	if (true === movePillar) {
		clearThings();
		platform.center = event.pageX - offset;
		platform.x = platform.center - platform.width / 2;
		drawThings();
		//console.log("center is " + center + ": purple (" + (center - canvas.width / 4) + "," + center + ") ; orange (" + center + "," + (center + canvas.width / 4) + ")");
	}
};

canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mousedown', onMouseDown, false);

platform = new Platform(purple, orange, canvas.width / 2, canvas.height - 10, canvas.width / 2, 10);
squares = [new Square(leftColor, canvas.width / 3, 10)];
intervalId = setInterval(onTimer, timerDelay);

//For addition to construction of squares for testing
//, new Square(rightColor, 2 * canvas.width / 3, 10), new ColorAlterSquare(rightColor, Math.random() * canvas.width, 15)
