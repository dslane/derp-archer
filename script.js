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
var numSquares;
var v0 = 10;
var gravity = 9.8;

var intervalId;
var timerDelay = 100;
var score = 0;
var misses = 10;
var scoreText;
var missesText;
var fontHeight = 30;

var colorAlterTimer = 0;
var alterColor;

function Square(color, sideLength, velocity) {
	if (undefined === color)
		this.color = "#000000";
	else
		this.color = color;

	if (undefined === sideLength)
		this.sideLength = 10;
	else
		this.sideLength = sideLength;

	if (undefined === velocity)
		this.v0 = v0;
	else
		this.v0 = velocity;
	
	this.a = gravity;
	this.t0 = sysTime;
	this.y0 = 0;

	this.x = Math.random() * canvas.width;
	this.y = this.y0;
	this.hasBounced = false;

	this.type = "Plain";
}

Square.prototype.toString = function() {
	return "Square<(" + this.x + "," + this.y + ") color: " + this.color + " sideLength: " + this.sideLength + ">";
}

Square.prototype.draw = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;

	ctx.fillStyle = this.color;
	ctx.fillRect(sLeft, sTop, this.sideLength, this.sideLength);
};

Square.prototype.clear = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;

	ctx.clearRect(sLeft - 1, sTop - 1, this.sideLength + 2, this.sideLength + 2);
};

Square.prototype.move = function() {
	var time = sysTime - this.t0;
	var newY = this.y0 + this.v0 * time + .5 * this.a * time * time;
	this.y = newY;
}

function ColorAlterSquare(color, sideLength, velocity) {
	Square.call(this, color, sideLength, velocity);
	this.type = "CAS";
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
	ctx.fillStyle = leftColor;
	ctx.fillRect(center - canvas.width / 4, canvas.height - 10, canvas.width / 4, 10);

	ctx.fillStyle = rightColor;
	ctx.fillRect(center, canvas.height - 10, canvas.width / 4, 10);

	ctx.fillStyle = "black"
	ctx.fillRect(center - 10, canvas.height - 15, 20, 5);
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

	if (colorAlterTimer > 0) {
		colorAlterTimer -= .1
		console.log(colorAlterTimer);
	} else if (colorAlterTimer <= 0) {
		leftColor = purple;
		rightColor = orange;
	}

	if (Math.random() * 1 > .9) {
		var num = Math.ceil(Math.random() * 2);
		var color;

		if (colorAlterTimer > 0)
			color = alterColor;
		else if (1 === num)
			color = leftColor;
		else
			color = rightColor;

		squares.push(new Square(color));
	}
}

/* Function to display score and remaining misses */
function drawText(){
	ctx.font = "20px Arial";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.fillStyle = "green";

	/* Construct the score text, and write it on the canvas */
	scoreText = "Score: " + score;
	ctx.fillText(scoreText, canvas.width, 0);

	/* Do the same for the misses */
	missesText = "Misses: " + misses;
	ctx.fillText(missesText, canvas.width, fontHeight);
}

function clearText(){
	scoreWidth = ctx.measureText(scoreText).width;
	missesWidth = ctx.measureText(missesText).width;
	height = fontHeight;

	ctx.clearRect(canvas.width - scoreWidth, 0, scoreWidth, height);
	ctx.clearRect(canvas.width - missesWidth, height, missesWidth, height);

}

function moveSquares() {
	clearPillar(center);
	squares.forEach(function(Square) {
		Square.move();
	});
}

function checkBounces() {
	for (var i = 0; i < squares.length; i++) {
		var square = squares[i];
		var sBottom = square.y + square.sideLength / 2;
		var sTop = square.y - square.sideLength / 2;
		var sRight = square.x + square.sideLength / 2;
		var sLeft = square.x - square.sideLength / 2;
		var baseLeft = center - canvas.width / 4;
		var baseRight = center + canvas.width / 4;
		var baseTop = canvas.height - 10;
		var timeUp;
		var timeFloor;

		if (sLeft < baseRight && sRight > baseLeft) {
			if (sBottom >= baseTop) { //Hit the platform
				if (sRight <= center && square.color === leftColor) { //Absorb
					console.log("absorb: " + square.toString());
					squares.splice(i, 1);
					score++;
					if (square.type === "CAS") {
						colorAlterTimer = 5;
						rightColor = leftColor;
						alterColor = leftColor;
						squares.forEach(function(squareToChange) {
							squareToChange.color = square.color;
						});
					}
				}
				else if (sLeft >= center && square.color === rightColor) { //Absorb
					console.log("absorb: " + square.toString());
					squares.splice(i, 1);
					if (square.type === "CAS") {
						colorAlterTimer = 5;
						leftColor = rightColor;
						alterColor = rightColor;
						squares.forEach(function(squareToChange) {
							squareToChange.color = square.color;
						});
					}

				}
				else if (leftColor === rightColor && leftColor === square.color) { //Absorb
					console.log("absorb: " + square.toString());
					squares.splice(i, 1);
					score++;
				}
				else { //Bounce
					console.log("bounce: " + square.toString());
					if (square.type === "CAS") {
						colorAlterTimer = 5;
						squares.splice(i, 1);
						if (square.color === leftColor) {
							alterColor = leftColor;
							leftColor = rightColor
						}
						else {
							alterColor = rightColor;
							rightColor = leftColor;
						}
						squares.forEach(function(squareToChange) {
							squareToChange.color = square.color;
						});
						continue;
					}

					if (square.hasBounced && square.v0 > -10) { //EXPLOOOOOOOODE!!!!!!!!
						squares.splice(i, 1);
					}
					timeFloor = Math.floor(sysTime - square.t0 - 2);
					if (!square.hasBounced)
						square.v0 += (square.a * timeFloor);
					else {
						timeUp = (-1 * square.v0) / square.a
						square.v0 = square.a * (timeFloor - timeUp);
					}
					square.v0 = Math.floor(square.v0);
					square.v0 *= -1;
					console.log("v0 down: "  + square.v0 + "\tt0 down: " + square.t0 + "\t\nsystime: " + sysTime + "\ttimeUp: " + timeUp);
					square.y0 = baseTop - square.sideLength / 2 - 1;
					square.t0 = sysTime;
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

function clearThings (Square) {
	squares.forEach(function(Square) {
		Square.clear();
	})
	clearPillar(center);
	clearText();
};

function drawThings (Square) {
	squares.forEach(function (Square) {
		Square.draw();
	})
	drawPillar(center);
	drawText();
}

function onMouseDown(event) {
    movePillar = true;
    offset = event.pageX - center;
}

function onMouseUp(event) {
    movePillar = false;
}

canvas.onmousemove = function (event) {
	if (true === movePillar) {
		clearThings();
		center = event.pageX - offset;
		drawThings();
		//console.log("center is " + center + ": purple (" + (center - canvas.width / 4) + "," + center + ") ; orange (" + center + "," + (center + canvas.width / 4) + ")");
	}
};

canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mousedown', onMouseDown, false);

drawPillar(center);
squares = [new Square(leftColor, 10), new Square(rightColor, 10), new ColorAlterSquare(rightColor)];
numSquares = 2;
intervalId = setInterval(onTimer, timerDelay);