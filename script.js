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
var score = 0;
var misses = 10;
var scoreText;
var missesText;
var fontHeight = 30;

function fSquare(color, sideLength, velocity) {
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

fSquare.prototype.toString = function() {
	return "fSquare<(" + this.x + "," + this.y + ") color: " + this.color + " sideLength: " + this.sideLength + ">";
}

fSquare.prototype.draw = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;

	ctx.fillStyle = this.color;
	ctx.fillRect(sLeft, sTop, this.sideLength, this.sideLength);
};

fSquare.prototype.clear = function() {
	var sLeft = this.x - this.sideLength / 2;
	var sTop = this.y - this.sideLength / 2;

	ctx.clearRect(sLeft, sTop, this.sideLength, this.sideLength);
};

fSquare.prototype.move = function() {
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
	ctx.fillRect(center - 10, canvas.height - 15, 20, 5);
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
		squares.push(new fSquare(sColor));
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
	squares.forEach(function(fSquare) {
		fSquare.move();
	});
}

function checkBounces() {
	for (var i = 0; i < squares.length; i++) {
		var fSquare = squares[i];
		var sBottom = fSquare.y + fSquare.sideLength / 2;
		var sTop = fSquare.y - fSquare.sideLength / 2;
		var sRight = fSquare.x + fSquare.sideLength / 2;
		var sLeft = fSquare.x - fSquare.sideLength / 2;
		var baseLeft = center - canvas.width / 4;
		var baseRight = center + canvas.width / 4;
		var baseTop = canvas.height - 10;
		var timeUp;
		var timeFloor;

		if (sLeft < baseRight && sRight > baseLeft) {
			if (sBottom >= baseTop) { //Hit the platform
				if (sRight <= center && fSquare.color === purple) { //Absorb
					console.log("absorb: " + fSquare.toString());
					squares.splice(i, 1);
					score++;
				}
				else if (sLeft >= center && fSquare.color === orange) { //Absorb
					console.log("absorb: " + fSquare.toString());
					squares.splice(i, 1);
					score++;
				}
				else { //Bounce
					console.log("bounce: " + fSquare.toString());
					timeFloor = Math.floor(sysTime - fSquare.t0 - 2);
					if (!fSquare.hasBounced)
						fSquare.v0 += (fSquare.a * timeFloor);
					else {
						timeUp = (-1 * fSquare.v0) / fSquare.a
						fSquare.v0 = fSquare.a * (timeFloor - timeUp);
					}
					fSquare.v0 = Math.floor(fSquare.v0);
					fSquare.v0 *= -1;
					console.log("v0 down: "  + fSquare.v0 + "\tt0 down: " + fSquare.t0 + "\t\nsystime: " + sysTime + "\ttimeUp: " + timeUp);
					fSquare.y0 = baseTop - fSquare.sideLength / 2 - 1;
					fSquare.t0 = sysTime;
					fSquare.hasBounced = true;
				}
			}
		}
		else if (sTop >= canvas.height) { //Missed the platform
			squares.splice(i, 1);
			misses--;
		}
	}
}

function clearThings (fSquare) {
	squares.forEach(function(fSquare) {
		fSquare.clear();
	})
	clearPillar(center);
	clearText();
};

function drawThings (fSquare) {
	squares.forEach(function (fSquare) {
		fSquare.draw();
	})
	drawPillar(center);
	drawText();
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
squares = [new fSquare(purple, 10), new fSquare(orange, 10)];
numSquares = 2;
intervalId = setInterval(onTimer, timerDelay);