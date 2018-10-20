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

	for (let i = 0; i < 3; i++) {
		this.feedForward(testInput);

		for (let neuronValue of this.network.forget.neurons[this.network.forget.neurons.length - 1]) {
			geneticID.push(neuronValue);
		}

		for (let neuronValue of this.network.decide.neurons[this.network.decide.neurons.length - 1]) {
			geneticID.push((neuronValue + 1) / 2);
		}

		for (let neuronValue of this.network.modify.neurons[this.network.modify.neurons.length - 1]) {
			geneticID.push(neuronValue);
		}

		for (let neuronValue of this.network.main.neurons[this.network.main.neurons.length - 1]) {
			geneticID.push(neuronValue);
		}
	}

	this.geneticID = geneticID;
	
	let minGeneDiff = Infinity;
	for (let specie in specieslist) {
		var geneDiff = arrayDifference(this.geneticID, specieslist[specie].contains[0].geneticID);

		if (geneDiff < minGeneDiff) {
			minGeneDiff = geneDiff;
			if (minGeneDiff < speciesDiversity) {
				species = specie.split(" ")[0];
				this.speciesGeneration = specieslist[specie].contains[0].speciesGeneration;
			}
		}
	}

	if (species === undefined || species == "undefined") {
		while (specieslist[species] !== undefined) {
			prefix = Math.floor(seededNoise(0, prefixes.length));
			species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];
		}

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
			tempcolor[0] = Math.floor((parseInt(tempcolor[0]) + Math.floor(speciesColorChange * minGeneDiff / speciesDiversity * seededNoise(0.5, 1))) % 360).toString();
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
	this.angle = angle || seededNoise(0, 2 * Math.PI);
	this.distance = distance || seededNoise(minEyeDistance, maxEyeDistance);

	this.see = function () {
		let out;

		let pos = [Math.floor((this.parent.x + Math.cos(this.parent.rotation + this.angle) * this.distance) / tileSize), Math.floor((this.parent.y + Math.sin(this.parent.rotation + this.angle) * this.distance) / tileSize)];

		if (pos[0] < 0 || pos[0] >= mapSize || pos[1] < 0 || pos[1] >= mapSize) return [0, "oob"];

		out = [map[pos[0]][pos[1]], "tile"];

		for (let creature of creatures) {
			if (creature == this.parent) continue;
			if (Math.floor(creature.x / tileSize) == pos[0]) {
				if (Math.floor(creature.y / tileSize) == pos[1]) {
					out = [creature, "creature"];
				}
			}
		}

		return out;
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