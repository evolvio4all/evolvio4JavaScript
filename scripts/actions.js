Creature.prototype.eat = function (p) {
	let pos = p || this.getPosition();
	let tile = map[pos[0]][pos[1]];

	if (this.output[2] <= minEatPower) {
		this.energyGraph.eat.push(0);
		return;
	}

	let tenergy = -energy.eat * this.output[2];

	this.energy -= energy.eat * this.output[2];

	this.maxSpeed = maxCreatureSpeed * eatingSpeed;

	if (tile.food - this.output[2] <= 0) {
		tile.food = 0;
		tenergy += (tile.food * eatEffeciency);
		this.energy += (tile.food * eatEffeciency);
	} else if (tile.food > 0) {
		tile.food -= this.output[2];
		tenergy += (this.output[2] * eatEffeciency);
		this.energy += (this.output[2] * eatEffeciency);
	}

	this.energyGraph.eat.push(tenergy);
};

Creature.prototype.metabolize = function () {
	let tenergy = -(this.age / lifeSpan) * (this.age / lifeSpan);
	this.energy -= (this.age / lifeSpan) * (this.age / lifeSpan);

	this.energyGraph.metabolism.push(tenergy);
};

Creature.prototype.move = function () {
	let tenergy = -energy.move * (Math.abs(this.output[1]) + Math.abs(this.output[0]));

	this.energy -= energy.move * (Math.abs(this.output[1]) + Math.abs(this.output[0]));

	this.rotation += (this.output[1] - this.output[0]) * rotationSpeed;

	this.rotation = this.rotation % (2 * Math.PI);

	this.x += Math.cos(this.rotation) * this.maxSpeed * (this.output[0] + this.output[1]) / 2;
	this.y += Math.sin(this.rotation) * this.maxSpeed * (this.output[0] + this.output[1]) / 2;

	this.energyGraph.move.push(tenergy);
};

Creature.prototype.reproduce = function (t) {
	let tenergy = 0;

	if (this.output[4] <= minSpawnPower) {
		this.energyGraph.spawn.push(0);
		return;
	}

	if (this.age > reproduceAge && this.reproduceTime > minReproduceTime) {
		for (let i = 0; i < this.children; i++) {
			if (this.energy < this.childEnergy) break;
			let child = new Creature(this.x + Math.round(seededNoise(-1.5, 1.5)) * tileSize, this.y + Math.round(seededNoise(-1.5, 1.5)) * tileSize, this.size, this.color, this.species, this.speciesGeneration, this.generation + 1);

			child.eyes = [];
			for (let eye of this.eyes) {
				child.eyes.push(new child.eye(child, eye.angle, eye.distance));
			}
      
      child.mutability = [];
			for (let value in this.mutability) {
				child.mutability[value] = this.mutability[value];
			}

			child.mutate();

			child.createNeuralNetwork();
			child.copyNeuralNetwork(this);

			child.energy = creatureEnergy * this.childEnergy * birthEffeciency;
			child.children = this.children;

			child.network.mutate();

			creatures.push(child);

			tenergy -= this.childEnergy * creatureEnergy;
			this.energy -= this.childEnergy * creatureEnergy;
			this.reproduceTime = 0;
		}
	}

	this.energyGraph.spawn.push(tenergy);

	population = creatures.length;
};

Creature.prototype.die = function () {
	if (population <= minCreatures || firstGen < minFirstGen) {

		try {
			specieslist[this.species].contains.splice(specieslist[this.species].contains.indexOf(this), 1);

			if (specieslist[this.species].contains.length === 0) {
				delete specieslist[this.species];
			}
		} catch (e) {
			console.error(this.species);
		}

		this.randomize();
	} else {
		let pos = creatures.indexOf(this);

		creatures.splice(pos, 1);

		try {
			specieslist[this.species].contains.splice(specieslist[this.species].contains.indexOf(this), 1);

			if (specieslist[this.species].contains.length === 0) {
				delete specieslist[this.species];
			}
		} catch (e) {
			console.error(this.species);
		}
	}

	population = creatures.length;
};

Creature.prototype.attack = function () {
	let att = this.output[3];

	if (att <= minAttackPower) {
		this.energyGraph.attack.push(0);
		return;
	}

	let tenergy = -att * energy.attack;

	this.energy -= att * energy.attack;

	for (let creature of creatures) {
		if (creature === this) continue;

		if (Math.round(this.x / tileSize) == Math.round(creature.x / tileSize)) {
			if (Math.round(this.y / tileSize) == Math.round(creature.y / tileSize)) {
				creature.energy -= att * attackPower;

				this.energy += att * attackPower * attackEffeciency;
				tenergy += att * attackPower * attackEffeciency;
			}
		}
	}

	this.energyGraph.attack.push(tenergy);
};