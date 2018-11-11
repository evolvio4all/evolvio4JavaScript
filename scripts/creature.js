function Creature(x, y, spec, specGen, color) {
	let tile = Math.floor(seededNoise(0, spawnTiles.length));

	this.x = x || spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = y || spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

	this.velocity = {
		x: 0,
		y: 0
	};

	this.mutability = {
		brain: 0,
		children: 0,
		childEnergy: 0,
		size: 0,
		eyes: {
			number: 0,
			angle: 0,
			distance: 0
		},
		mutability: 0
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

	this.size = 0;

	this.energy = 0;
	this.lastEnergy = 0;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = 0;
	this.children = 0;

	this.color = color || newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [];

	this.eyes = this.makeEyes();

	this.createNeuralNetwork();

	this.geneticID = "";
	this.generation = 0;
	this.speciesGeneration = specGen || 0;
	this.species = this.setSpecies(spec);

	this.rotation = 0;

	this.select = function () {
		if (mouse.down.x > this.x * zoomLevel - cropx - this.size * zoomLevel - selectSizeAddition * zoomLevel && mouse.down.x < this.x * zoomLevel - cropx + this.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y < this.y * zoomLevel - cropy + this.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y > this.y * zoomLevel - cropy - this.size * zoomLevel - selectSizeAddition * zoomLevel) {
			return true;
		}

		return false;
	};

	population++;
}

Creature.prototype.tick = function () {
	this.age++;
	this.reproduceTime++;
};

Creature.prototype.randomize = function () {
	let tile = Math.floor(seededNoise(0, spawnTiles.length));

	this.x = spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

	this.velocity = {
		x: 0,
		y: 0
	};

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
	this.species = "undefined";
	this.speciesGeneration = 0;
	this.species = this.setSpecies();

	this.rotation = 0;
};

Creature.prototype.getPosition = function () {
	let x = Math.floor(this.x / tileSize);
	let y = Math.floor(this.y / tileSize);

	return [x, y];
};

Creature.prototype.setSpecies = function (species) {
	let geneticID = [];
	let prefix = "";
	let spGen = this.speciesGeneration;

	this.spIn = species;

	let network = this.network;
	for (let i = 0; i < 1; i++) {
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

	if (species == "undefined" || species === undefined) {
		let tries = 0;
		while (specieslist[species] !== undefined && tries < 10 || species == "undefined" || species === undefined) {
			tries++;
			prefix = Math.floor(seededNoise(0, prefixes.length));
			species = prefixes[prefix] + " " + suffixes[0];
		}

		if (tries == 100) species = "Dud " + suffixes[0];

		specieslist[species] = {};
		specieslist[species].contains = [];

	} else {
		let minGeneDiff = Infinity;
		let newSpecies;

		for (let specie in specieslist) {
			let specieCreature = specieslist[specie].contains[0];

			let geneDiff = arrayDifference(this.geneticID, specieCreature.geneticID);

			if (geneDiff < minGeneDiff) {
				minGeneDiff = geneDiff;

				newSpecies = specie;
			}
		}

		if (minGeneDiff < speciesDiversity) {
			species = newSpecies.split(" ")[0];
			this.speciesGeneration = specieslist[newSpecies].contains[0].speciesGeneration;
			
		} else {
			species = species.split(" ")[0];
			this.speciesGeneration++;

			let tempcolor = this.color.replace("hsl(", "").replace(")", "").split(",");
			tempcolor[0] = Math.floor((parseInt(tempcolor[0]) + speciesColorChange * minGeneDiff / speciesDiversity * seededNoise(-1, 1)) % 360);
			this.color = "hsl(" + tempcolor.join(",") + ")";
		}

		if (this.speciesGeneration < 40) {
			for (let i = 0; i < Math.floor(this.speciesGeneration / suffixes.length) + 1; i++) {
				species += " " + suffixes[Math.min(this.speciesGeneration - suffixes.length * i, suffixes.length - 1)];
			}
		} else {
			species += " " + this.speciesGeneration;
		}
	}

	if (specieslist[species] === undefined) {
		specieslist[species] = {};
		specieslist[species].contains = [];
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

		for (let i = 0; i < population; i++) {
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
	let numEyes = Math.floor(seededNoise(minInitEyes, maxInitEyes + 1));

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
	let pos = this.getPosition();
	let tile = map[pos[0]][pos[1]];

	this.maxSpeed = maxCreatureSpeed;

	this.eat(tile);

	if (tile.type == 0) {
		this.maxSpeed *= swimmingSpeed;
	}

	this.attack();
	this.reproduce();
	this.metabolize();
	this.tick();
	this.move();
}

function spawnCreatures(num) {
	for (let i = 0; i < num; i++) {
		creatures.push(new Creature());
		creatures[i].die(); // to randomize the creature
	}
}