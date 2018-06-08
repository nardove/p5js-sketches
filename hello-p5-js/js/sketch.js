
function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
	background(150, 130, 200);
	ellipse(mouseX, mouseY, 80, 80);
}

window.onresize = function() {
	resizeCanvas(window.innerWidth, window.innerHeight);
}