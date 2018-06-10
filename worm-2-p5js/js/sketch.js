let gui;
let physics, worm;

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);

	physics = new VerletPhysics2D();
	physics.addBehavior(new GravityBehavior(new Vec2D(0, 0)));
	// physics.setWorldBounds(new Rect(0, 0, width, height));
	physics.setDrag(0.02);
	// physics.setTimeStep(2);

	worm = new Worm(8, 15, new Vec2D(200, 200));

	gui = new dat.GUI();
	gui.add(physics, "drag").min(0.8).max(1).step(0.01);
	gui.add(worm, "wait").min(1000).max(5000).step(500);
	gui.add(worm, "maxspeed");
	gui.add(worm, "maxforce");
	gui.add(worm, "springStrength").min(0.0001).max(0.01).step(0.0001);
	gui.close();
}

function draw() {
	background('#414141');
	
	physics.update();

	if (worm.isDead == false) {
		worm.update();
		worm.render();
	}
}

function mousePressed() {
	// worm.particles[2].set(new Vec2D(mouseX, mouseY));
}

window.onresize = function() {
	resizeCanvas(window.innerWidth, window.innerHeight);
}