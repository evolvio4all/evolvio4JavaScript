function Creature(x, y, s, c) {
	this.x = x || Math.random() * display.width;
	this.y = y || Math.random() * display.height;

	this.size = s || Math.random() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = 100;
	
	this.age = 0;
	this.reproduceTime = 0;
	
	this.color = c || newColor();
	
	this.genes = [this.color];
	
	this.maxSpeed = maxCreatureSpeed;
	
	this.output = [0, 0, 0];
	
	this.network = {};
	this.createNeuralNetwork();
	
	this.select = function() {
		if (mouse.up.x > this.x - cropx - this.size && mouse.up.x < this.x - cropx + this.size && mouse.up.y < this.y - cropy + this.size && mouse.up.y > this.y - cropy - this.size) {
			return true;
		}
		
		return false;
	};
}

// Creature.prototype creates a neural network composed of layers and axons
Creature.prototype.createNeuralNetwork = function() {
	this.network.layers = layers; // Creature.prototype creates layers based on the parameters I provide in the layers letiable
	this.initNeurons(); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
	this.initAxons(); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight
};

Creature.prototype.initNeurons = function() {
	this.network.neurons = [];
	for (let i = 0; i < layers.length; i++) {
		this.network.neurons.push([]);
		
		for (let j = 0; j < layers[i]; j++) {
			this.network.neurons[i].push(0);
		}
	}
};

Creature.prototype.initAxons = function() {
	this.network.axons = [];
	for (let i = 1; i < this.network.layers.length; i++) {
		let layerWeights = [];
		let neuronsInPreviousLayer = this.network.layers[i - 1];
		for (let j = 0; j < this.network.neurons[i].length; j++) {
			let neuronWeights = [];
			for (let k = 0; k < neuronsInPreviousLayer; k++) {
				neuronWeights.push(Math.random() * 2 - 1);
			}
			layerWeights.push(neuronWeights);
		}
		this.network.axons.push(layerWeights);
	}
};

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
Creature.prototype.feedForward = function(inputs) {
	for (let i = 0; i < inputs.length; i++) {
		this.network.neurons[0][i] = inputs[i]; // Takes the inputs and applies them
	}

	for (let i = 1; i < this.network.layers.length; i++) {
		for (j = 0; j < this.network.layers[i]; j++) {
			let value = offset;
			for (k = 0; k < this.network.neurons[i - 1].length; k++) {
				value += this.network.axons[i - 1][j][k] * this.network.neurons[i - 1][k]; // Adds the neurons value * the weight
			}

			this.network.neurons[i][j] = Math.tanh(value); // Sets the neuron across from the axon to the new value (1 - -1)
		}
	}
	return this.network.neurons[this.network.neurons.length - 1]; // returns the output, or the last line
};

// Modifies weights of the axons
Creature.prototype.mutate = function() {
	let tempcolor = this.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");
	let rand = Math.random() * 100;
	
	if (rand < 30) {
		tempcolor[0] = parseInt(tempcolor[0]) + Math.floor(Math.random() * 60 - 30);
		
		if (tempcolor[0] < 0) tempcolor[0] = 0;
		if (tempcolor[0] > 356) tempcolor[0] = 356;
	} else if (rand >= 30 && rand <= 60) {
		tempcolor[1] = parseInt(tempcolor[1]) + Math.floor(Math.random() * 60 - 30);
		
		if (tempcolor[1] < 0) tempcolor[1] = 0;
		if (tempcolor[1] > 100) tempcolor[1] = 100;
		
		tempcolor[1] += "%";
	} else {
		
		tempcolor[2] = parseInt(tempcolor[2]) + Math.floor(Math.random() * 60 - 30);
		if (tempcolor[2] < 0) tempcolor[2] = 0;
		if (tempcolor[2] > 100) tempcolor[2] = 100;
		
		tempcolor[2] += "%";
	}
	
	
	this.color = "hsl(" + tempcolor.join() + ")";
	
	for (let i = 0; i < this.network.axons.length; i++) {
		for (let j = 0; j < this.network.axons[i].length; j++) {
			for (let k = 0; k < this.network.axons[i][j].length; k++) {
				for (let l = 0; l < mutability; l++) {
					let weight = this.network.axons[i][j][k];
					let randomNumber = Math.random() * 100;
					const numMutations = 5;

					if (randomNumber < totalProbability * 1 / numMutations) {
						weight *= Math.random();
					} else if (randomNumber < totalProbability * 2 / numMutations) {
						weight /= Math.random();
					} else if (randomNumber < totalProbability * 3 / numMutations) {
						weight *= -1;
					} else if (randomNumber < totalProbability * 4 / numMutations) {
						weight -= Math.random() * 0.25;
					} else if (randomNumber < totalProbability * 5 / numMutations) {
						weight += Math.random() * 0.25;
					}

					this.network.axons[i][j][k] = weight;
				}
			}
		}
	}
};

Creature.prototype.copyNeuralNetwork = function(copyNetwork) {
	this.copyAxons(copyNetwork.network.axons);
};

Creature.prototype.copyAxons = function(copyAxon) {
	for (let i = 0, l = this.network.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.axons[i][j].length; k < n; k++) {
				this.network.axons[i][j][k] = copyAxon[i][j][k];
			}
		}
	}
};