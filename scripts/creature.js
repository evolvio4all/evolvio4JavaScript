function Creature(x, y, spec, specGen) {
	let tile = Math.floor(seededNoise(0, spawnTiles.length));

	this.x = x || spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = y || spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

	this.mutability = {
		brain: seededNoise(minMutability.brain, maxMutability.brain),
		children: seededNoise(minMutability.children, maxMutability.children),
		childEnergy: seededNoise(minMutability.childEnergy, maxMutability.childEnergy),
		size: seededNoise(minMutability.size, maxMutability.size),
		eyes: {
			number: seededNoise(minMutability.eyes.number, maxMutability.eyes.number),
			angle: seededNoise(minMutability.eyes.angle, maxMutability.eyes.angle),
			distance: seededNoise(minMutability.eyes.distance, maxMutability.eyes.distance)
		},
		mutability: seededNoise(minMutability.mutability, maxMutability.mutability)
	};

	this.energyGraph = {
		move: [],
		eat: [],
		attack: [],
		spawn: [],
		metabolism: [],
		gain: [],
		loss: [],
		net: [],
		gross: []
	};

	this.size = seededNoise(minCreatureSize, maxCreatureSize);

	this.energy = creatureEnergy / 2;
	this.lastEnergy = creatureEnergy / 2;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise(minChildEnergy, maxChildEnergy);
	this.children = Math.floor(seededNoise(minChildren, maxChildren));

	this.color = newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [];

	this.eyes = this.makeEyes();

	this.createNeuralNetwork();

	this.geneticID = "";
	this.generation = 0;
	this.species = spec;
	this.speciesGeneration = specGen || 0;
	this.species = this.setSpecies();

	this.rotation = 0;

	this.select = function () {
		if (mouse.down.x > this.x * zoomLevel - cropx - this.size * zoomLevel - selectSizeAddition * zoomLevel && mouse.down.x < this.x * zoomLevel - cropx + this.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y < this.y * zoomLevel - cropy + this.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y > this.y * zoomLevel - cropy - this.size * zoomLevel - selectSizeAddition * zoomLevel) {
			return true;
		}

		return false;
	};
}

Creature.prototype.tick = function () {
	this.age++;
	this.reproduceTime++;
};

Creature.prototype.randomize = function () {
	let tile = Math.floor(seededNoise(0, spawnTiles.length));

	this.x = spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

	this.mutability = {
		brain: seededNoise(minMutability.brain, maxMutability.brain),
		children: seededNoise(minMutability.children, maxMutability.children),
		childEnergy: seededNoise(minMutability.childEnergy, maxMutability.childEnergy),
		size: seededNoise(minMutability.size, maxMutability.size),
		eyes: {
			number: seededNoise(minMutability.eyes.number, maxMutability.eyes.number),
			angle: seededNoise(minMutability.eyes.angle, maxMutability.eyes.angle),
			distance: seededNoise(minMutability.eyes.distance, maxMutability.eyes.distance)
		},
		mutability: seededNoise(minMutability.mutability, maxMutability.mutability)
	};

	this.energyGraph = {
		move: [],
		eat: [],
		attack: [],
		spawn: [],
		metabolism: [],
		gain: [],
		loss: [],
		net: [],
		gross: []
	};

	this.size = seededNoise(minCreatureSize, maxCreatureSize);

	this.energy = creatureEnergy / 2;
	this.lastEnergy = creatureEnergy / 2;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise(minChildEnergy, maxChildEnergy);
	this.children = Math.floor(seededNoise(minChildren, maxChildren));

	this.color = newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [];

	this.eyes = this.makeEyes();

	this.createNeuralNetwork();

	this.geneticID = "";
	this.generation = 0;
	this.species = undefined;
	this.speciesGeneration = 0;
	this.species = this.setSpecies();

	this.rotation = 0;
};

Creature.prototype.getPosition = function () {
	let x = Math.floor(this.x / tileSize);
	let y = Math.floor(this.y / tileSize);

	return [x, y];
};

Creature.prototype.setSpecies = function () {
	let geneticID = [];
	let species = this.species;
	let prefix = "";
	let spGen = this.speciesGeneration;

	this.spIn = species;

	let network = this.network;
	for (let i = 0; i < 3; i++) {
		this.feedForward(testInput);

		let forgetOutputs = network.forget.neurons[network.forget.neurons.length - 1];
		for (let i = 0; i < forgetOutputs.length; i++) {
			geneticID.push(forgetOutputs[i]);
		}

		let decideOutputs = network.decide.neurons[network.decide.neurons.length - 1];
		for (let i = 0; i < decideOutputs.length; i++) {
			geneticID.push((decideOutputs[i] + 1) / 2);
		}

		let modifyOutputs = network.modify.neurons[network.modify.neurons.length - 1];
		for (let i = 0; i < modifyOutputs.length; i++) {
			geneticID.push(modifyOutputs[i]);
		}

		let mainOutputs = network.main.neurons[network.main.neurons.length - 1];
		for (let i = 0; i < mainOutputs.length; i++) {
			geneticID.push(mainOutputs[i]);
		}
	}

	this.geneticID = geneticID;

	let minGeneDiff = Infinity;
	for (let specie in specieslist) {
		let speciesL = specieslist[specie];
		var geneDiff = arrayDifference(this.geneticID, speciesL.contains[0].geneticID);

		if (geneDiff < minGeneDiff) {
			minGeneDiff = geneDiff;

			if (minGeneDiff < speciesDiversity) {
				species = specie.split(" ")[0];
				this.speciesGeneration = speciesL.contains[0].speciesGeneration;
			}
		}
	}

	if (species === undefined) {
	  let tries = 0;
		while (specieslist[species] !== undefined && tries < 100) {
		  tries++;
			prefix = Math.floor(seededNoise(0, prefixes.length));
			species = prefixes[prefix] + " " + suffixes[0];
		}
		
		if (tries == 100) species = "Dud Unus";
		
		specieslist[species] = {};
		specieslist[species].contains = [];
	} else {
		species = species.split(" ")[0];

		this.minGeneDiff = minGeneDiff;

		if (this.minGeneDiff >= speciesDiversity) {
			this.speciesGeneration++;

			if (this.speciesGeneration < suffixes.length) species += " " + suffixes[this.speciesGeneration];
			else {
				if (this.speciesGeneration < 40) {
					for (let i = 0; i < Math.floor(this.speciesGeneration / suffixes.length) + 1; i++) {
						species += " " + suffixes[Math.min(this.speciesGeneration - suffixes.length * i, (suffixes.length - 1))];
					}
				} else {
					species += " " + this.speciesGeneration;
				}
			}

			if (specieslist[species] === undefined) {
				specieslist[species] = {};
				specieslist[species].contains = [];
			}

			let tempcolor = this.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");

			let rand = Math.floor(seededNoise(0, 2));
			tempcolor[0] = Math.floor(((tempcolor[0] - 0) + Math.floor(speciesColorChange * minGeneDiff / speciesDiversity * seededNoise(0.5, 1))) % 360).toString();
			this.color = "hsl(" + tempcolor.join(",") + ")";
		} else {
			if (this.speciesGeneration < 40) {
				for (let i = 0; i < Math.floor(this.speciesGeneration / suffixes.length) + 1; i++) {
					species += " " + suffixes[Math.min(this.speciesGeneration - suffixes.length * i, (suffixes.length - 1))];
				}
			} else {
				species += " " + this.speciesGeneration;
			}
		}
	}

	specieslist[species].contains.push(this);

	return species;
};

Math.clamp = function (num, min, max) {
	return Math.min(Math.max(num, min), max);
};

Creature.prototype.eye = function (parent, angle, distance) {
	this.parent = parent;
	this.x = Math.floor(seededNoise(-initEyeDistanceH, initEyeDistanceH)) * tileSize;
	this.y = Math.floor(seededNoise(-initEyeDistanceV, initEyeDistanceV)) * tileSize;

	this.angle = angle || Math.atan2(this.y, this.x);
	this.distance = distance || Math.sqrt(this.x * this.x + this.y * this.y);

	this.see = function () {
		let out;
		let tile;

		let pos = [Math.floor((this.parent.x + Math.cos(this.parent.rotation + this.angle) * this.distance) / tileSize), Math.floor((this.parent.y + Math.sin(this.parent.rotation + this.angle) * this.distance) / tileSize)];
		let row = map[pos[0]];
		if (row) {
			tile = row[pos[1]];
			if (tile == undefined) return [0, "oob"];
		} else return [0, "oob"];

		let length = creatures.length;
		for (let i = 0; i < length; i++) {
			let creature = creatures[i];

			if (creature == this.parent) continue;
			if (Math.floor(creature.x / tileSize) == pos[0] && Math.floor(creature.y / tileSize) == pos[1]) {
				return [creature, "creature"];
			}
		}

		if (tile.type == 1) return [tile, "tile"];

		return [tile, "water"];
	}
}

Creature.prototype.makeEyes = function () {
	let eyes = [];
	let numEyes = Math.floor(seededNoise(minInitEyes, maxInitEyes));

	for (let i = 0; i < numEyes; i++) {
		eyes.push(new this.eye(this));
	}

	return eyes;
}

Creature.prototype.see = function () {
	let eyes = this.eyes.length;
	let output = [];
	for (let i = 0; i < eyes; i++) {
		let eye = this.eyes[i];
		let sight = eye.see();

		if (sight[1] == "tile") {
			output.push(sight[0].food / maxTileFood);
			output.push(Math.max(60 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 40, 50) / 360);
		} else if (sight[1] == "water") {
			output.push(0);
			output.push(220 / 360);
		} else if (sight[1] == "creature") {
			output.push(sight[0].energy / creatureEnergy);
			output.push(((sight[0].color.split(",")[0].replace("hsl(", "") - 0) % 360) / 360);
		} else if (sight[1] == "oob") {
			output.push(sight[0]);
			output.push(sight[0]);
		}
	}

	return output;
}

Creature.prototype.act = function () {
  this.eat();
	this.attack();
	this.reproduce();
	this.metabolize();
	this.tick();
	this.move();
}