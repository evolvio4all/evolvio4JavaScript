function Creature(x, y, s, c) {
	this.x = x || seededNoise() * tileSize * mapSize;
	this.y = y || seededNoise() * tileSize * mapSize;

	this.size = s || seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = 100;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise() * 0.9 + 0.1;
	this.children = Math.floor(seededNoise() * 10) + 1;

	this.color = c || newColor();

	this.genes = [this.color, this.children, this.childEnergy];

	this.maxSpeed = maxCreatureSpeed;

	this.output = [0, 0, 0, 0, 0];

	this.generation = 0;
	this.speciesGeneration = 0;

	this.network = {};
	this.createNeuralNetwork();

	this.geneticID = "";

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
	this.x = seededNoise() * tileSize * mapSize;
	this.y = seededNoise() * tileSize * mapSize;

	this.size = seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = 100;

	this.age = 0;
	this.reproduceTime = 0;
	this.childEnergy = seededNoise() * 0.9 + 0.1;
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

	this.species = this.setSpecies();
};

Creature.prototype.getPosition = function () {
	let x = Math.floor(this.x / tileSize);
	let y = Math.floor(this.y / tileSize);

	return [x, y];
};

Creature.prototype.setSpecies = function () {
	let geneticID = "ID";
	let species = "";
	let prefix = "";

	if (this.species === undefined || this.species === "") {
		prefix = Math.floor(seededNoise() * prefixes.length);
		species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];
	} else {
		prefix = prefixes.indexOf(this.species.split(" ")[0]);
		if (prefix < 0) {
			console.log(this);
			pause = true;
		}
	}

	for (let layer of this.network.main.axons) {
		for (let connection of layer) {
			for (let axon of connection) {
				let pon = Math.round(Math.clamp(axon * 2, -1, 1) + 1);
				geneticID += pon;
			}
		}
	}

	for (let layer of this.network.forget.axons) {
		for (let connection of layer) {
			for (let axon of connection) {
				let pon = Math.round(Math.clamp(axon * 2, -1, 1) + 1);
				geneticID += pon;
			}
		}
	}

	for (let layer of this.network.decide.axons) {
		for (let connection of layer) {
			for (let axon of connection) {
				let pon = Math.round(Math.clamp(axon * 2, -1, 1) + 1);
				geneticID += pon;
			}
		}
	}

	for (let layer of this.network.modify.axons) {
		for (let connection of layer) {
			for (let axon of connection) {
				let pon = Math.round(Math.clamp(axon * 2, -1, 1) + 1);
				geneticID += pon;
			}
		}
	}

	if (specieslist[species] !== undefined) {
		let geneDiff = strDifference(geneticID, specieslist[species].geneticID);
		if (geneDiff >= speciesDiversity) {
			this.speciesGeneration++;
			if (this.speciesGeneration < suffixes.length) species = prefixes[prefix] + " " + suffixes[this.speciesGeneration];
			else {
				species = prefixes[prefix] + " " + suffixes[suffixes.length - 1];
				for (let i = 1; i <= Math.floor(this.speciesGeneration / 10); i++) {
					species += " " + suffixes[Math.min(this.speciesGeneration - 10 * i, 9)];
				}
			}

			if (specieslist[species] !== undefined) specieslist[species].contains.push(this);
			else {
				specieslist[species] = this;
				specieslist[species].contains = [];
			}

			let tempcolor = this.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");

			let rand = Math.floor(seededNoise() * 2);

			tempcolor[0] = Math.floor((Number(tempcolor[0]) + (speciesColorChange * geneDiff / speciesDiversity * seededNoise() * 0.5 + 0.5) % 360)).toString();
			this.color = "hsl(" + tempcolor.join(",") + ")";
		}
	} else {
		specieslist[species] = this;
		specieslist[species].contains = [];
	}

	specieslist[species].contains.push(this);

	this.geneticID = geneticID;

	for (let prop in specieslist) {
		if (specieslist[prop].contains.length === 0) {
			delete specieslist[prop];
		}
	}

	return species;
};

Math.clamp = function (num, min, max) {
	return Math.min(Math.max(num, min), max);
};