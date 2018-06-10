let physics, p1, p2;

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);

	physics = new VerletPhysics2D();
	physics.addBehavior(new GravityBehavior(new Vec2D(0, 0.5)));
	physics.setWorldBounds(new Rect(0, 0, width, height));

	p1 = new Particle(new Vec2D(width / 2, 20));
	p1.lock();

	p2 = new Particle(new Vec2D(width / 2 + 160, 20));

	let spring = new VerletSpring2D(p1, p2, 160, 0.01);

	physics.addParticle(p1);
	physics.addParticle(p2);
	physics.addSpring(spring);
}

function draw() {
	background(200);
	
	physics.update();

	stroke(20);
	strokeWeight(2);
	line(p1.x, p1.y, p2.x, p2.y);

	p1.display();
	p2.display();

	if (mouseIsPressed) {
		p2.lock();
		p2.x = mouseX;
		p2.y = mouseY;
		p2.unlock();
	}
}

window.onresize = function() {
	resizeCanvas(window.innerWidth, window.innerHeight);
}