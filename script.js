var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var movePillar = false;
var center = canvas.width / 2;
var offset = 0;
var sysTime = 0;
var purple = "#c267ff";
var orange = "#de3500";

var squares;
var numSquares;
var v0 = 10;
var gravity = 9.8;

var intervalId;
var timerDelay = 100;

function Square(color, sideLength, velocity) {
	if (undefined === color)
		this.color = "#FFFFFF";
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

	ctx.clearRect(sLeft, sTop, this.sideLength, this.sideLength);
};

Square.prototype.move = function() {
	var time = sysTime - this.t0;
	var newY = this.y0 + this.v0 * time + .5 * this.a * time * time;
	this.y = newY;
}

function drawPillar(center) {
	ctx.fillStyle = purple;
	ctx.fillRect(center - canvas.width / 4, canvas.height - 10, canvas.width / 4, 10);

	ctx.fillStyle = orange;
	ctx.fillRect(center, canvas.height - 10, canvas.width / 4, 10);

	ctx.fillStyle = "black"
	ctx.fillRect(center - 10, canvas.height - 20, 20, 10);
}

function clearPillar(center) {
	ctx.clearRect(center - canvas.width / 4, canvas.height - 10, canvas.width / 4, 10);
	ctx.clearRect(center, canvas.height - 10, canvas.width / 4, 10);
	ctx.clearRect(center - 10, canvas.height / 2, 20, canvas.height / 2);
}

function onMouseDown(event) {
    movePillar = true;
    offset = event.x - center;
}

function onMouseUp(event) {
    movePillar = false;
}

function onTimer() {
	sysTime += .1;
	clearThings();
	checkBounces();
	moveSquares();
	drawThings();

	if (Math.random() * 1 > .9) {
		var num = Math.ceil(Math.random() * 2);
		var sColor;

		if (1 === num)
			sColor = orange;
		else
			sColor = purple;
		squares.push(new Square(sColor));
	}
}

function moveSquares() {
	clearPillar(center);
	squares.forEach(function(square) {
		square.move();
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
			if (sBottom >= baseTop && square.v0 >= 0) { //Hit the platform
				if (sRight <= center && square.color === purple) { //Absorb
					squares.splice(i, 1);
				}
				else if (sLeft >= center && square.color === orange) { //Absorb
					squares.splice(i, 1);
				}
				else { //Bounce
					timeFloor = Math.floor(sysTime - square.t0 - 2);
					if (!square.hasBounced)
						square.v0 += (square.a * timeFloor);
					else {
						timeUp = (-1 * square.v0) / square.a
						square.v0 = square.a * (tf - timeUp);
					}
					square.v0 = Math.floor(square.v0);
					square.v0 *= -1;
					console.log("v0 down: "  + square.v0 + "\tt0 down: " + square.t0 + "\t\nsystime: " + sysTime + "\ttimeUp: " + timeUp);
					square.y0 = baseTop - square.sideLength / 2;
					square.t0 = sysTime;
					square.hasBounced = true;
				}
			}
		}
		else if (sTop >= canvas.height) { //Missed the platform
			squares.splice(i, 1);
		}
	}
}

function clearThings (square) {
	squares.forEach(function(square) {
		square.clear();
	})
	clearPillar(center);
};

function drawThings (square) {
	squares.forEach(function (square) {
		square.draw();
	})
	drawPillar(center);
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
squares = [new Square(purple, 10), new Square(orange, 10)];
numSquares = 2;
intervalId = setInterval(onTimer, timerDelay);