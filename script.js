var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var movePillar = false;
var center = canvas.width / 2;
var offset = 0;
var sysTime = 0;
var purple = "#c267ff";
var orange = "#de3500";
var squareSide = 10;
//blaaaaah
var squares;
var numSquares;
var v0 = 10;
var gravity = 9.8;

var intervalId;
var timerDelay = 100;

function Square(color, velocity) {
	if (undefined === velocity)
		this.v0 = v0;
	else
		this.v0 = velocity;
	
	this.a = gravity;
	this.t0 = sysTime;
	this.y0 = 0;
	this.color = color;
	this.x = Math.random() * canvas.width;
	this.y = this.y0;
	this.hasBounced = false;
}

function drawPillar(center) {
	ctx.fillStyle = purple;
	ctx.fillRect(center - canvas.width / 4, canvas.height - 10, canvas.width / 4, 10);

	ctx.fillStyle = orange;
	ctx.fillRect(center, canvas.height - 10, canvas.width / 4, 10);

	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.fillRect(center - 10, canvas.height / 2, 20, canvas.height / 2);
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
	checkBounces();
	moveSquares();/*
	if (Math.random() * 1 > .9) {
		var num = Math.ceil(Math.random() * 2);
		var sColor;

		if (1 === num)
			sColor = orange;
		else
			sColor = purple;
		squares[numSquares++] = new Square(sColor);
	}*/
}

function moveSquares() {
	clearPillar(center);
	squares.forEach(function(square) {
		clearSquare(square);
		moveSquare(square);
		drawSquare(square);
	});
	drawPillar(center);
}

function checkBounces() {
	for (var i = 0; i < squares.length; i++) {
		var fSquare = squares[i];
		var sBottom = fSquare.y + squareSide / 2;
		var sTop = fSquare.y - squareSide / 2;
		var sRight = fSquare.x + squareSide / 2;
		var sLeft = fSquare.x - squareSide / 2;
		var baseLeft = center - canvas.width / 4;
		var baseRight = center + canvas.width / 4;
		var baseTop = canvas.height - 10;
		var timeUp;
		var tf;

		if (sBottom > baseTop && sTop < canvas.height) {
			if (sRight > baseLeft && sRight <= center) {
				if (fSquare.color === purple){
					squares.splice(i, 1);
					clearSquare(fSquare);
					clearPillar(center);
					drawPillar(center);
					numSquares--;
					//console.log("purple square at (" + fSquare.x + "," + fSquare.y + ") was caught.");
				}
				else {
					tf = Math.floor(sysTime - fSquare.t0 - 2);
					if (!fSquare.hasBounced)
						fSquare.v0 += (fSquare.a * tf);
					else {
						timeUp = (-1 * fSquare.v0) / fSquare.a
						fSquare.v0 = fSquare.a * (tf - timeUp);
					}
					fSquare.v0 = Math.floor(fSquare.v0);
					fSquare.v0 *= -1;
					console.log("v0 down: "  + fSquare.v0 + "\tt0 down: " + fSquare.t0 + "\t\nsystime: " + sysTime + "\ttimeUp: " + timeUp);
					fSquare.y0 = baseTop - squareSide / 2;
					fSquare.t0 = sysTime;
					fSquare.hasBounced = true;
				}
			}
			else if (sLeft < baseRight && sLeft >= center) {
				if (fSquare.color === orange){
					squares.splice(i, 1);
					clearSquare(fSquare);
					clearPillar(center);
					drawPillar(center);
					numSquares--;
					//console.log("orange square at (" + fSquare.x + "," + fSquare.y + ") was caught.");
				}
				else {
					tf = Math.floor(sysTime - fSquare.t0 - 2);
					if (!fSquare.hasBounced)
						fSquare.v0 += (fSquare.a * tf);
					else {
						timeUp = (-1 * fSquare.v0) / fSquare.a
						fSquare.v0 = fSquare.a * (tf - timeUp);
					}
					fSquare.v0 = Math.floor(fSquare.v0);
					fSquare.v0 *= -1;
					console.log("v0 down: "  + fSquare.v0 + "\tt0 down: " + fSquare.t0 + "\t\nsystime: " + sysTime + "\ttimeUp: " + timeUp);
					fSquare.y0 = baseTop - squareSide / 2;
					fSquare.t0 = sysTime;
					fSquare.hasBounced = true;
				}
			}
		}
	}
}

function clearSquare(square) {
	var sLeft = square.x - squareSide / 2;
	var sTop = square.y - squareSide / 2;
	ctx.clearRect(sLeft, sTop, squareSide, squareSide);
}

function moveSquare(square) {
	var time = sysTime - square.t0;
	var newY = square.y0 + square.v0 * time + .5 * square.a * time * time;
	square.y = newY;
}

function drawSquare(square) {
	sLeft = square.x - squareSide / 2;
	sTop = square.y - squareSide / 2;

	ctx.fillStyle = square.color;
	ctx.fillRect(sLeft, sTop, squareSide, squareSide);
}

canvas.onmousemove = function (event) {
	if (true === movePillar) {
		clearPillar(center);
		squares.forEach(function(x){
			drawSquare(x);
		});
		drawPillar(event.pageX - offset);
		center = event.pageX - offset;
		//console.log("center is " + center + ": purple (" + (center - canvas.width / 4) + "," + center + ") ; orange (" + center + "," + (center + canvas.width / 4) + ")");
	}
};

canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mousedown', onMouseDown, false);

drawPillar(center);
squares = [new Square(purple), new Square(orange)];
numSquares = 2;
intervalId = setInterval(onTimer, timerDelay);