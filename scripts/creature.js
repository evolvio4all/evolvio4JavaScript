function Creature(x, y, s, c, spec, sgen, gen) {
	let tile = Math.floor(seededNoise() * spawnTiles.length);

	this.x = x || spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = y || spawnTiles[tile].y * tileSize + tileSize / 2 || 0;
  
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

	this.size = s || seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	
	this.energy = creatureEnergy;
  this.lastEnergy = creatureEnergy;
  
	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise() * (maxChildEnergy - minChildEnergy) + minChildEnergy;
	this.children = Math.floor(seededNoise() * (maxChildren - minChildren)) + minChildren;

	this.color = c || newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [0, 0, 0, 0, 0];

	this.eyes = this.makeEyes();

	this.createNeuralNetwork();

	this.geneticID = "";
	this.generation = gen || 0;
	this.species = spec;
	this.speciesGeneration = sgen || 0;
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
	let tile = Math.floor(seededNoise() * spawnTiles.length);

	this.x = spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = spawnTiles[tile].y * tileSize + tileSize / 2 || 0;
  
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
  
	this.size = seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = creatureEnergy;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise() * 0.6 + 0.2;
	this.children = Math.floor(seededNoise() * 10) + 1;

	this.color = newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [0, 0, 0, 0];

	this.generation = 0;
	this.speciesGeneration = 0;

	this.eyes = this.makeEyes();

	this.createNeuralNetwork();

	this.geneticID = "";

	this.species = undefined;
	this.species = this.setSpecies();
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

	let testInput = [];
	for (let i = 0; i < inputs; i++) {
		testInput.push(0.8);
	}

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

	let minGeneDiff = Infinity;
	for (let specie in specieslist) {
		let avgGeneticID = [];
		for (let i = 0; i < specieslist[specie].contains[0].geneticID.length; i++) {
			avgGeneticID.push(0);
		}

		for (let creature of specieslist[specie].contains) {
			for (let i = 0; i < creature.geneticID.length; i++) {
				avgGeneticID[i] += creature.geneticID[i];
			}
		}

		for (let gene of avgGeneticID) {
			gene /= specieslist[specie].contains.length;
		}

		var geneDiff = arrayDifference(geneticID, avgGeneticID);

		if (geneDiff < minGeneDiff) {
			minGeneDiff = geneDiff;
			if (minGeneDiff < speciesDiversity) {
				species = specie.split(" ")[0];
				this.speciesGeneration = specieslist[specie].contains[0].speciesGeneration;
			}
		}
	}

	if (species !== undefined) species = species.split(" ")[0];

	if (species === undefined || species == "undefined") {
		prefix = Math.floor(seededNoise() * prefixes.length);
		species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];

		while (specieslist[species] !== undefined) {
			prefix = Math.floor(seededNoise() * prefixes.length);
			species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];
		}

		specieslist[species] = {};
		specieslist[species].contains = [];
	} else {
		if (minGeneDiff >= speciesDiversity) {
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

			let rand = Math.floor(seededNoise() * 2);
			tempcolor[0] = Math.floor((Number(tempcolor[0]) + Math.floor(Number(speciesColorChange * minGeneDiff / speciesDiversity * seededNoise() * 0.5 + 0.5)) % 360)).toString();
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

	this.geneticID = geneticID;

	return species;
};

Math.clamp = function (num, min, max) {
	return Math.min(Math.max(num, min), max);
};

Creature.prototype.eye = function (parent, angle, distance) {
	this.parent = parent;
	this.angle = angle || seededNoise() * 2 * Math.PI;
	this.distance = distance || seededNoise() * (maxEyeDistance - this.parent.size) + this.parent.size;

	this.see = function () {
		let out;

		let pos = [~~((this.parent.x + Math.cos(this.parent.rotation + this.angle) * this.distance) / tileSize), ~~((this.parent.y + Math.sin(this.parent.rotation + this.angle) * this.distance) / tileSize)];

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
	let numEyes = Math.floor(seededNoise() * (maxInitEyes - minInitEyes + 1) + minInitEyes);

	for (let i = 0; i < numEyes; i++) {
		eyes.push(new this.eye(this));
	}

	return eyes;
}