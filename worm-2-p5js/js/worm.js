class Worm {
	constructor(_numSegments, _segmentSize, _location) {
		this.numSegments = _numSegments;
		this.segmentSize = _segmentSize;
		this.springs = [];
		this.particles = [];

		this.isDead = false;

		this.time = millis();
		this.wait = 2000;
		this.tick = false;

		this.location = new Vec2D(200, 200);
		this.velocity = new Vec2D(0, 0);

		this.springStrength = 0.0002;

		this.acceleration = new Vec2D(0, 0);
		this.maxspeed = 6;
		this.maxforce = 0.1;
		this.wandertheta = 0;
		this.targetLocation = this.location.copy();

		this.bodySize = 14;

		this.init(_location, "left");
	}

	
	init(_location, _direction) {
		for (let i = 0; i < this.numSegments; i++) {
			let particleWeight = 1 + (i * 0.3);
			let particlePosition = new Vec2D(_location.x, _location.y);
			switch(_direction) {
				case "right":
					particlePosition.set(_location.x + (i * this.segmentSize), _location.y);
					break;
				case "left":
					particlePosition.set(_location.x - (i * this.segmentSize), _location.y);
					break;
				case "top":
					particlePosition.set(_location.x, _location.y + (i * this.segmentSize));
					break;
				case "bottom":
					particlePosition.set(_location.x, _location.y - (i * this.segmentSize));
					break;
			}
			
			let particle = new VerletParticle2D(particlePosition, particleWeight);
			this.particles.push(particle);
			physics.addParticle(particle);
			physics.addBehavior(new AttractionBehavior(particle, this.segmentSize, -0.2, 0));

			if (i != 0) {
				let particleA = this.particles[i - 1];
				let particleB = this.particles[i];
				let spring = new VerletSpring2D(particleA, particleB, this.segmentSize, this.springStrength);
				this.springs.push(spring);
				physics.addSpring(spring);
			}
		}

		this.particles[0].lock();
	}


	kill() {
		for (let p of this.particles) {
			physics.removeParticle(p);
		}
		for (let s of this.springs) {
			physics.removeSpring(s);
		}
		this.particles.length = 0;
		this.springs.length = 0;
	}


	render() {
		noFill();
		strokeWeight(this.bodySize - 2);
		stroke('#C2C2C2');
		beginShape();		
		for (let p of this.particles) {
			vertex(p.x, p.y);
		}
		endShape();

		strokeWeight(this.bodySize - 4);
		stroke('#616161');
		beginShape();		
		for (let p of this.particles) {
			vertex(p.x, p.y);
		}
		endShape();
		
		
		for (let [i, p] of this.particles.entries()) {
			let dx = 0;
			let dy = 0;
			let v1 = new Vec2D(0, 0);
			let v2 = new Vec2D(0, 0);
			
			if (i == 0) {
				dx = this.particles[1].x - this.particles[0].x;
				dy = this.particles[1].y - this.particles[0].y;
			}
			else {
				dx = this.particles[i].x - this.particles[i-1].x;
				dy = this.particles[i].y - this.particles[i-1].y;
			}
			
			if (i == 0) {
				v1.set(this.particles[0].x, this.particles[0].y);
				v2.set(this.particles[1].x, this.particles[1].y);
			}
			else {
				v1.set(this.particles[i-1].x, this.particles[i-1].y);
				v2.set(this.particles[i].x, this.particles[i].y);
			}
			
			let dist = v1.sub(v2).magnitude();
			let thickness = this.segmentSize * (1 / norm(dist, 0, this.segmentSize));
			
			let angle = -atan2(dy, dx);
			let x1 = this.particles[i].x + sin(angle) * -thickness;
			let y1 = this.particles[i].y + cos(angle) * -thickness;
			let x2 = this.particles[i].x + sin(angle) * thickness;
			let y2 = this.particles[i].y + cos(angle) * thickness;
			
			noFill();
			strokeWeight(2);
			stroke('#FF0000');
			line(x1, y1, x2, y2);
			
			noStroke();
			fill('#F2F2F2');
			ellipse(p.x, p.y, this.bodySize, this.bodySize);
		}
		
		//for (int n = 0; n < numNodes; n++) {
		//	float dx;
		//	float dy;
		//	if (n == 0) {
		//		dx = node[1].x - node[0].x;
		//		dy = node[1].y - node[0].y;
		//	}
		//	else {
		//		dx = node[n].x - node[n - 1].x;
		//		dy = node[n].y - node[n - 1].y;
		//	}
		//	float angle = -atan2(dy, dx);
		//	float x1 = node[n].x + sin(angle) * -skinYspacing;
		//	float y1 = node[n].y + cos(angle) * -skinYspacing;
		//	float x2 = node[n].x + sin(angle) *  skinYspacing;
		//	float y2 = node[n].y + cos(angle) *  skinYspacing;
		//	float u = skinXspacing * n;
		//	vertex(x1, y1, u, 0);
		//	vertex(x2, y2, u, skin.height);
		//}
	}


	arrive(target) {
    	let desired = new Vec2D(target.x - this.location.x, target.y - this.location.y);
    	let d = desired.magnitude();
		desired.normalize();
		if (d < 100) {
			let m = map(d, 0, 100, 0, this.maxspeed);
			desired.scaleSelf(m);
		} else {
			desired.scaleSelf(this.maxspeed);
		}
		let steer = new Vec2D(desired.x - this.velocity.x, desired.y - this.velocity.y);
  		steer.limit(this.maxforce);
  		this.acceleration.addSelf(steer);
	}


	update() {
		if (millis() - this.time >= this.wait) {
			this.tick = !this.tick;
			this.time = millis();

			let wanderR = 30;
		    let wanderD = 20;
		    let change = 0.75;

		    this.wandertheta += random(-change, change);

		    let circleLocation = this.velocity.copy();
		    circleLocation.normalize();
		    circleLocation.scaleSelf(wanderD);
		    circleLocation.addSelf(this.location);

		    let circleOffset = new Vec2D(wanderR * cos(this.wandertheta), wanderR * sin(this.wandertheta));
		    this.targetLocation = circleLocation.addSelf(circleOffset).copy();
		}

		this.arrive(this.targetLocation);

		this.velocity.addSelf(this.acceleration);
		this.velocity.limit(this.maxspeed);
		this.location.addSelf(this.velocity);
		this.acceleration.scaleSelf(0);

		this.particles[0].set(this.location.x, this.location.y);

		this.checkBounds();
	}


	checkBounds() {
		let offset = this.segmentSize * this.numSegments + this.numSegments;
		if (this.location.x > width + offset) {
			console.log("outside right");
			this.location.x = -10;
			this.targetLocation = this.location.copy();
			this.velocity.scaleSelf(0);
			this.isDead = true;
			this.kill();
			this.init(this.location, "left");
		}
		if (this.location.x < -offset ) {
			console.log("outside left");
			this.location.x = width + 10;
			this.targetLocation = this.location.copy();
			this.velocity.scaleSelf(0);
			this.isDead = true;
			this.kill();
			this.init(this.location, "right");
		}
	 	if (this.location.y > height + offset) {
			console.log("outside bottom");
	 		this.location.y = -10;
	 		this.targetLocation = this.location.copy();
	 		this.velocity.scaleSelf(0);
			this.isDead = true;
			this.kill();
			this.init(this.location, "bottom");
		}
		if (this.location.y < -offset ) {
			console.log("outside top");
			this.location.y = height + 10;
			this.targetLocation = this.location.copy();
			this.velocity.scaleSelf(0);
			this.isDead = true;
			this.kill();
			this.init(this.location, "top");
		}
		this.isDead = false;
	}

}

