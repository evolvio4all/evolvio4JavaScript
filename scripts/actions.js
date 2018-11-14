Creature.prototype.eat = function (tile) {
	let eat = this.output[2];

	if (eat < minEatPower) {
		this.energyGraph.eat.push(0);
		return;
	}

	this.maxSpeed *= eatingSpeed;

	let tenergy = -energy.eat * eat;
	let eatAmount = eat * eatPower * Math.pow(tile.food / maxTileFood, eatDiminishingRate);

	if (tile.food - eatAmount < 0) {
		tile.food = 0;
	} else if (tile.food > 0) {
		tile.food -= eatAmount;
	}

	tenergy += eatAmount * eatEffeciency;
	this.energy += tenergy;

	this.energyGraph.eat.push(tenergy);
};

Creature.prototype.metabolize = function () {
	let scale = 0;
	scale = Math.min(Math.pow(this.age / metabolismScaleTime, metabolismScaleScale), 1);

	let tenergy = -(scale * (maxMetabolism - minMetabolism) + minMetabolism);
	this.energy += tenergy;

	this.energyGraph.metabolism.push(tenergy);
};

Creature.prototype.move = function () {
	let tenergy = -energy.rotate * Math.abs(this.output[1]) - Math.abs(this.output[0]) * energy.move;

	this.energy += tenergy;

	this.rotation += this.output[1] * rotationSpeed;
	this.rotation = this.rotation % (2 * Math.PI);

	let speed = this.maxSpeed * this.output[0];
	this.x += Math.cos(this.rotation) * speed;
	this.y += Math.sin(this.rotation) * speed;

	this.energyGraph.move.push(tenergy);
};

Creature.prototype.reproduce = function () {
	if (this.output[4] < minSpawnPower) {
		this.energyGraph.spawn.push(0);
		return;
	}

	let tenergy = 0;
  
	if (this.age > reproduceAge && this.reproduceTime > minReproduceTime) {
		for (let i = 0; i < this.children; i++) {
			if (this.energy > creatureEnergy * this.childEnergy) {
				let child = new Creature(this.x, this.y, this.species, this.speciesGeneration, this.color);

				child.eyes = [];
				let eyes = this.eyes.length;
				for (let i = 0; i < eyes; i++) {
					let eye = this.eyes[i];
					child.eyes.push(new child.eye(child, eye.angle, eye.distance));
				}

				child.mutability = {};
				for (let value in this.mutability) {
					child.mutability[value] = this.mutability[value];
				}

				child.energy = creatureEnergy * this.childEnergy * birthEffeciency;
				child.children = this.children;
				child.childEnergy = this.childEnergy;
				child.size = this.size;
				child.generation = this.generation + 1;

				child.mutate();

				child.createNeuralNetwork();
				child.copyNeuralNetwork(this);

				child.network.mutate();

				creatures.push(child);

				tenergy -= this.childEnergy * creatureEnergy;
				this.energy -= this.childEnergy * creatureEnergy;
				this.reproduceTime = 0;
			} else break;
		}
	}

	this.energyGraph.spawn.push(tenergy);
};

Creature.prototype.die = function () {
	if (specieslist[this.species]) {
	  let con = specieslist[this.species].contains.indexOf(this);
		specieslist[this.species].contains.splice(con, 1);
	  
	  if (specieslist[this.species].contains.length === 0) {
			delete specieslist[this.species];
		}
	  
		if (population <= minCreatures || firstGen <= minFirstGen) {
			this.randomize();
		} else {
			let pos = creatures.indexOf(this);
			creatures.splice(pos, 1);

			population--;
		}
	}
};

Creature.prototype.attack = function () {
	let att = this.output[3];

	if (att < minAttackPower) {
		this.energyGraph.attack.push(0);
		return;
	}

	let tenergy = -att * energy.attack;

	let length = creatures.length;
	for (let i = 0; i < length; i++) {
		creature = creatures[i];
		if (creature === this) continue;

		if (Math.floor((this.x + Math.cos(this.rotation) * tileSize) / tileSize) == Math.floor(creature.x / tileSize)) {
			if (Math.floor((this.y + Math.sin(this.rotation) * tileSize) / tileSize) == Math.floor(creature.y / tileSize)) {
				creature.energy -= att * attackPower;

				tenergy += att * attackPower * attackEffeciency;
			}
		}
	}

	this.energy += tenergy;

	this.energyGraph.attack.push(tenergy);
};