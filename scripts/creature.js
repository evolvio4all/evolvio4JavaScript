function Creature(x, y, s, c, spec, sgen, gen) {
  let tile = Math.floor(seededNoise() * spawnTiles.length);
  
	this.x = x || spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
	this.y = y || spawnTiles[tile].y * tileSize + tileSize / 2 || 0;
  
	this.size = s || seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = 100;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise() * 0.6 + 0.2;
	this.children = Math.floor(seededNoise() * 10) + 1;

	this.color = c || newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [0, 0, 0, 0, 0];

	this.generation = gen || 0;
	this.speciesGeneration = sgen || 0;

	this.network = {};
	this.createNeuralNetwork();

	this.geneticID = "";

	this.species = spec;
	this.species = this.setSpecies();

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

	this.size = seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = 100;

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

	this.network = {};
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

	let testInput = [];
	for (let i = 0; i < inputs; i++) {
		testInput.push(0.8);
	}

	this.feedForward(testInput);

	for (let neuronValue of this.network.forget.neurons[forgetLayers.length - 1]) {
		geneticID.push(neuronValue);
	}

	for (let neuronValue of this.network.decide.neurons[decideLayers.length - 1]) {
		geneticID.push((neuronValue + 1) / 2);
	}

	for (let neuronValue of this.network.modify.neurons[modifyLayers.length - 1]) {
		geneticID.push(neuronValue);
	}

	for (let neuronValue of this.network.main.neurons[layers.length - 1]) {
		geneticID.push(neuronValue);
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
				species = specie;
				this.speciesGeneration = specieslist[species].contains[0].speciesGeneration;
			}
		}
	}

	if (species === undefined) {
		prefix = Math.floor(seededNoise() * prefixes.length);
		species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];

		while (specieslist[species] !== undefined) {
			prefix = Math.floor(seededNoise() * prefixes.length);
			species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];
		}

		specieslist[species] = {};
		specieslist[species].contains = [];
	} else {
		prefix = prefixes.indexOf(species.split(" ")[0]);
		species = prefixes[prefix] + " " + suffixes[Math.min(this.speciesGeneration, suffixes.length - 1)];
		for (let i = 1; i <= Math.floor(this.speciesGeneration / (suffixes.length - 1)); i++) {
			species += " " + suffixes[Math.min(this.speciesGeneration - (suffixes.length - 1) * i, (suffixes.length - 2))];
		}

		if (minGeneDiff >= speciesDiversity) {
			this.speciesGeneration++;
			if (this.speciesGeneration < suffixes.length) species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];
			else {
				species = prefixes[prefix] + " " + suffixes[suffixes.length - 1];
				for (let i = 1; i <= Math.floor(this.speciesGeneration / (suffixes.length - 1)); i++) {
					species += " " + suffixes[Math.min(this.speciesGeneration - (suffixes.length - 1) * i, (suffixes.length - 2))];
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
		}
	}

	specieslist[species].contains.push(this);

	this.geneticID = geneticID;
  
	return species;
};

Math.clamp = function (num, min, max) {
	return Math.min(Math.max(num, min), max);
};