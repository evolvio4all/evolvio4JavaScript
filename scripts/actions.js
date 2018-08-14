Creature.prototype.eat = function (p) {
	let pos = p || this.getPosition();
	let tile = map[pos[0]][pos[1]];

	this.energy -= energy.eat * this.output[2];

	this.maxSpeed = maxCreatureSpeed / (1 + this.output[2] * eatSlowDown);

	if (tile.food - this.output[2] <= 0) {
		tile.food = 0;
		this.energy += tile.food * eatEffeciency;
	} else if (tile.food > 0) {
		tile.food -= this.output[2];
		this.energy += this.output[2] * this.size / maxCreatureSize * eatEffeciency;
	}
};

Creature.prototype.metabolize = function () {
	this.energy -= energy.metabolism * (this.age / (1000 / ageSpeed)) * (this.size / maxCreatureSize);
};

Creature.prototype.move = function () {
	this.energy -= energy.move * (this.size / maxCreatureSize) * (Math.abs(this.output[0]) + Math.abs(this.output[1]));

	this.x += this.output[0] * this.maxSpeed;
	this.y += this.output[1] * this.maxSpeed;
};

Creature.prototype.reproduce = function (t) {
	if (this.age > reproduceAge && this.reproduceTime > minReproduceTime) {
		for (let i = 0; i < this.children; i++) {
			if (this.energy < energy.birth * this.childEnergy) break;

			let child = new Creature(this.x + seededNoise() * 100 + 200, this.y + (i - this.children / 2) * 300, this.size);
			child.copyNeuralNetwork(this);
			child.color = this.color;
			child.energy = creatureEnergy * this.childEnergy * birthEffeciency;
			child.children = this.children / 2;
			child.generation = this.generation + 1;
			child.species = this.species;
			child.speciesGeneration = this.speciesGeneration;
			child.species = child.setSpecies();

			child.mutate();

			creatures.push(child);

			this.energy -= energy.birth * (this.childEnergy * creatureEnergy);
			this.reproduceTime = 0;
		}
	}

	population = creatures.length;
};

Creature.prototype.die = function () {
	if (population <= minCreatures) {
		this.randomize();
	} else {
		let pos = creatures.indexOf(this);
		creatures.splice(pos, 1);
		specieslist[this.species].contains.splice(specieslist[this.species].contains.indexOf(this), 1);
	}

	population = creatures.length;
};

Creature.prototype.attack = function () {
	let att = this.output[4];

	for (let creature of creatures) {
		if (creature === this) continue;

		if (Math.round(this.x / tileSize) == Math.round(creature.x / tileSize)) {
			if (Math.round(this.y / tileSize) == Math.round(creature.y / tileSize)) {
				creature.energy -= att * attackPower;
				this.energy -= energy.attack * (this.size / maxCreatureSize);

				this.energy += att * attackPower * attackEffeciency;
			}
		}
	}
};