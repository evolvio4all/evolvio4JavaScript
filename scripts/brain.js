// BRAIN INFO //
const inputs = 6;
const outputs = 5 + memories;

const brains = 4;

const testInput = [];
for (let i = 0; i < inputs; i++) {
	testInput.push(seededNoise(-1, 1));
}

// Creature.prototype creates a neural network composed of layers and axons
Creature.prototype.createNeuralNetwork = function () {
	// VARIABLES //
	this.inputs = inputs + this.eyes.length * 2;

	let layers = [this.inputs + outputs, (this.inputs + outputs * 2) / 2, outputs];
	let forgetLayers = [this.inputs + outputs * 2, (this.inputs + outputs * 3) / 2, outputs];
	let decideLayers = [this.inputs + outputs, (this.inputs + outputs * 2) / 2, outputs];
	let modifyLayers = [this.inputs + outputs * 2, (this.inputs + outputs * 3) / 2, outputs];

	this.network = new Network(forgetLayers, decideLayers, modifyLayers, layers, this);

	this.initNeurons(); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
	this.initAxons(); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight
};

function Network(forget, decide, modify, main, par) {
	this.main = {
		layers: main
	};
	this.main.layerCount = this.main.layers.length;

	this.forget = {
		layers: forget
	};
	this.forget.layerCount = this.forget.layers.length;

	this.decide = {
		layers: decide
	};
	this.decide.layerCount = this.decide.layers.length;

	this.modify = {
		layers: modify
	};
	this.modify.layerCount = this.modify.layers.length;

	this.cellState = [];
	for (let i = 0; i < outputs; i++) this.cellState.push(0);

	this.output = [];
	for (let i = 0; i < outputs; i++) this.output.push(0);

	this.parent = par;
}

Creature.prototype.initNeurons = function () {
	for (let brain in this.network) {
		if (brain == "cellState") break;
		let nbrain = this.network[brain];

		let layers = nbrain.layers.length;
		nbrain.neurons = [];
		for (let layer = 0; layer < layers; layer++) {
			nbrain.neurons.push([]);

			let neurons = nbrain.layers[layer];
			for (let neuron = 0; neuron < neurons; neuron++) {
				nbrain.neurons[layer].push(0);
			}
		}
	}
};

Creature.prototype.initAxons = function () {
	for (let brain in this.network) {
		if (brain == "cellState") break;
		let nbrain = this.network[brain];
		let layers = nbrain.layers.length - 1;
		nbrain.axons = [];
		nbrain.biasAxons = [];

		for (let layer = 0; layer < layers; layer++) {
			let layerWeights = [];

			let neurons = nbrain.layers[layer];
			let neuronsInNextLayer = nbrain.layers[layer + 1];

			for (let neuron = 0; neuron < neurons; neuron++) {
				let neuronWeights = [];
				for (let axon = 0; axon < neuronsInNextLayer; axon++) {
					let weight = 0;

					if (seededNoise() < connectionDensity) {
						weight = seededNoise(-maxInitialAxonValue, maxInitialAxonValue);
					} else weight = 0;

					neuronWeights.push(weight);
				}
				layerWeights.push(neuronWeights);
			}

			nbrain.axons.push(layerWeights);

			layerWeights = [];

			for (let axon = 0; axon < neuronsInNextLayer; axon++) {
				let weight = 0;

				if (seededNoise() < connectionDensity) {
					weight = seededNoise(-maxInitialAxonValue, maxInitialAxonValue);
				} else weight = 0;

				layerWeights.push(weight);
			}

			nbrain.biasAxons.push(layerWeights);
		}
	}
};

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
Creature.prototype.feedForward = function (input) {
	let network = this.network;
	let inputCount = this.inputs;
	let cellStateLength = network.cellState.length;

	this.feedForget(network, input, inputCount, cellStateLength);
	this.feedDecide(network, input, inputCount);
	this.feedModify(network, input, inputCount, cellStateLength);
	this.feedMain(network, input, inputCount);

	return this.calculateCellState(network, cellStateLength);
};

Creature.prototype.feedForget = function (network, input, inputCount, cellStateLength) {
	let nbrain = network.forget;
	let layers = nbrain.layerCount;

	for (let neuron = 0; neuron < inputCount; neuron++) {
		nbrain.neurons[0][neuron] = input[neuron] || 0;
	}

	for (let op = 0; op < outputs; op++) {
		nbrain.neurons[0][inputCount + op] = network.output[op] || 0;
	}

	for (let cs = 0; cs < cellStateLength; cs++) {
		nbrain.neurons[0][inputCount + outputs + cs] = network.cellState[cs] || 0;
	}

	let neuronsInNextLayer;
	for (let layer = 0; layer < layers; layer++) {
		let neuronsInLayer = neuronsInNextLayer || nbrain.layers[layer];
		neuronsInNextLayer = nbrain.layers[layer + 1];

		for (let axon = 0; axon < neuronsInNextLayer; axon++) { // Loops through each axon
			let value = 0;

			for (let neuron = 0; neuron <= neuronsInLayer; neuron++) { // For each axon position (neuron in next layer) loop through all of the neurons in this layer
				if (neuron == neuronsInLayer) {
					value += nbrain.biasAxons[layer][axon] * bias; // add bias neuron (independent)
				} else {
					value += nbrain.axons[layer][neuron][axon] * nbrain.neurons[layer][neuron]; // add all neuron values times weight of their respective axon
				}
			}
			
			nbrain.neurons[layer + 1][axon] = 1 / (1 + Math.exp(-value)); // set neuron in next layer value to sigmoid
		}
	}
}

Creature.prototype.feedDecide = function (network, input, inputCount) {
	let nbrain = network.decide;
	let layers = nbrain.layerCount;

	for (let neuron = 0; neuron < inputCount; neuron++) {
		nbrain.neurons[0][neuron] = input[neuron] || 0;
	}

	for (let op = 0; op < outputs; op++) {
		nbrain.neurons[0][inputCount + op] = network.output[op] || 0;
	}

	let neuronsInNextLayer;
	for (let layer = 0; layer < layers; layer++) {
		let neuronsInLayer = neuronsInNextLayer || nbrain.layers[layer];
		neuronsInNextLayer = nbrain.layers[layer + 1];

		for (let axon = 0; axon < neuronsInNextLayer; axon++) { // Loops through each axon
			let value = 0;

			for (let neuron = 0; neuron <= neuronsInLayer; neuron++) { // For each axon position (neuron in next layer) loop through all of the neurons in this layer
				if (neuron == neuronsInLayer) {
					value += nbrain.biasAxons[layer][axon] * bias; // add bias neuron (independent)
				} else {
					value += nbrain.axons[layer][neuron][axon] * nbrain.neurons[layer][neuron]; // add all neuron values times weight of their respective axon
				}
			}
			
			nbrain.neurons[layer + 1][axon] = approximate_tanh(value);
		}
	}
}

Creature.prototype.feedModify = function (network, input, inputCount, cellStateLength) {
	let nbrain = network.modify;
	let layers = nbrain.layerCount;

	for (let neuron = 0; neuron < inputCount; neuron++) {
		nbrain.neurons[0][neuron] = input[neuron] || 0;
	}

	for (let op = 0; op < outputs; op++) {
		nbrain.neurons[0][inputCount + op] = network.output[op] || 0;
	}

	for (let cs = 0; cs < cellStateLength; cs++) {
		nbrain.neurons[0][inputCount + outputs + cs] = network.cellState[cs] || 0;
	}

	let neuronsInNextLayer;
	for (let layer = 0; layer < layers; layer++) {
		let neuronsInLayer = neuronsInNextLayer || nbrain.layers[layer];
		neuronsInNextLayer = nbrain.layers[layer + 1];

		for (let axon = 0; axon < neuronsInNextLayer; axon++) { // Loops through each axon
			let value = 0;

			for (let neuron = 0; neuron <= neuronsInLayer; neuron++) { // For each axon position (neuron in next layer) loop through all of the neurons in this layer
				if (neuron == neuronsInLayer) {
					value += nbrain.biasAxons[layer][axon] * bias; // add bias neuron (independent)
				} else {
					value += nbrain.axons[layer][neuron][axon] * nbrain.neurons[layer][neuron]; // add all neuron values times weight of their respective axon
				}
			}
			
			nbrain.neurons[layer + 1][axon] = 1 / (1 + Math.exp(-value)); // set neuron in next layer value to sigmoid
		}
	}
}

Creature.prototype.feedMain = function (network, input, inputCount) {
	let nbrain = network.main;
	let layers = nbrain.layerCount;

	for (let neuron = 0; neuron < inputCount; neuron++) {
		nbrain.neurons[0][neuron] = input[neuron] || 0;
	}

	for (let op = 0; op < outputs; op++) {
		nbrain.neurons[0][inputCount + op] = network.output[op] || 0;
	}

	let neuronsInNextLayer;
	for (let layer = 0; layer < layers; layer++) {
		let neuronsInLayer = neuronsInNextLayer || nbrain.layers[layer];
		neuronsInNextLayer = nbrain.layers[layer + 1];

		for (let axon = 0; axon < neuronsInNextLayer; axon++) { // Loops through each axon
			let value = 0;

			for (let neuron = 0; neuron <= neuronsInLayer; neuron++) { // For each axon position (neuron in next layer) loop through all of the neurons in this layer
				if (neuron == neuronsInLayer) {
					value += nbrain.biasAxons[layer][axon] * bias; // add bias neuron (independent)
				} else {
					value += nbrain.axons[layer][neuron][axon] * nbrain.neurons[layer][neuron]; // add all neuron values times weight of their respective axon
				}
			}
			
			nbrain.neurons[layer + 1][axon] = 1 / (1 + Math.exp(-value)); // set neuron in next layer value to sigmoid
		}
	}
}

Creature.prototype.calculateCellState = function (network, cellStateLength) {
	let forgetOutput = network.forget.neurons[network.forget.layerCount - 1];
	let decideOutput = network.decide.neurons[network.decide.layerCount - 1];
	let modifyOutput = network.modify.neurons[network.modify.layerCount - 1];
	network.output = network.main.neurons[network.main.layerCount - 1];

	for (let i = 0; i < cellStateLength; i++) {
		network.cellState[i] *= forgetOutput[i];
		network.cellState[i] += decideOutput[i] * modifyOutput[i];
		network.output[i] *= approximate_tanh(network.cellState[i]);
	}

	return network.output;
}

// Modifies weights of the axons
Creature.prototype.mutate = function () {
	let mutability = this.mutability;

	let rand = seededNoise(0, 100);

	if (rand < mutability.children / 2) {
		this.children += 1;
		if (this.children < minChildren) this.children = minChildren;
	} else if (rand < mutability.children) {
		this.children -= 1;
		if (this.children > maxChildren) this.children = maxChildren;
	}

	rand = seededNoise(0, 100);

	if (rand < mutability.size / 2) {
		this.size /= 1.03;
		if (this.size < minCreatureSize) this.size = minCreatureSize;
	} else if (rand < mutability.size) {
		this.size *= 1.03;
		if (this.size > maxCreatureSize) this.size = maxCreatureSize;
	}

	rand = seededNoise(0, 100);

	if (rand < mutability.size / 10) {
		this.size /= 1.1;
		if (this.size < minCreatureSize) this.size = minCreatureSize;
	} else if (rand < mutability.size / 5) {
		this.size *= 1.1;
		if (this.size > maxCreatureSize) this.size = maxCreatureSize;
	}

	rand = seededNoise(0, 100);

	if (rand < mutability.childEnergy / 2) {
		this.childEnergy /= 1.03;
		if (this.childEnergy < minChildEnergy) this.childEnergy = minChildEnergy;
	} else if (rand < mutability.childEnergy) {
		this.childEnergy *= 1.03;
		if (this.childEnergy > maxChildEnergy) this.childEnergy = maxChildEnergy;
	}

	let eyes = this.eyes.length;
	for (let i = eyes - 1; i >= 0; i--) {
		rand = seededNoise(0, 100);
		
		if (rand < mutability.eyes.angle) {
			let eye = this.eyes[i];

			eye.angle += seededNoise(-maxEyeAngleChange, maxEyeAngleChange);
			if (eye.angle < 0) eye.angle = 0;
			else if (eye.angle > 2 * Math.PI) eye.angle = 2 * Math.PI;
		}

		rand = seededNoise(0, 100);

		if (rand < mutability.eyes.distance) {
			let eye = this.eyes[i];

			eye.distance += seededNoise(-maxEyeDistanceChange, maxEyeDistanceChange);
			if (eye.distance < minEyeDistance) eye.distance = minEyeDistance;
			else if (eye.distance > maxEyeDistance) eye.angle = maxEyeDistance;
		}

		rand = seededNoise(0, 100);

		if (rand < mutability.eyes.number / 2 && this.eyes.length < maxEyes) {
			this.eyes.push(new this.eye(this));
		} else if (rand < mutability.eyes.number && this.eyes.length > minEyes) {
			let eye = this.eyes[i];

			this.eyes.splice(this.eyes.indexOf(eye), 1);
		}
	}

	for (let property in mutability) {
		rand = seededNoise(0, 100);

		if (property == "eyes") {
			for (let sec in mutability[property]) {
				rand = seededNoise(0, 100);

				if (rand < mutability.mutability) {
					mutability[property][sec] += seededNoise(-maxMutabilityChange, maxMutabilityChange);

					if (mutability[property][sec] < minMutability[property][sec]) mutability[property][sec] = minMutability[property][sec];
					else if (mutability[property][sec] > maxMutability[property][sec]) mutability[property][sec] = maxMutability[property][sec];
				}
			}
		} else if (rand < mutability.mutability) {
			mutability[property] += seededNoise(-maxMutabilityChange, maxMutabilityChange);

			if (mutability[property] < minMutability[property]) mutability[property] = minMutability[property];
			else if (mutability[property] > maxMutability[property]) mutability[property] = maxMutability[property];
		}
	}
};

Network.prototype.mutate = function () {
	for (let brain in this) {
		if (brain == "cellState") break;
		let nbrain = this[brain];

		let layers = nbrain.layers.length - 1;
		for (let layer = 0; layer < layers; layer++) {
			let neurons = nbrain.layers[layer];
			let neuronsInNextLayer = nbrain.layers[layer + 1];

			for (let axon = 0; axon < neuronsInNextLayer; axon++) {
				for (let neuron = 0; neuron <= neurons; neuron++) {
					let randomNumber = seededNoise(0, 100);

					if (neuron == neurons) {
						if (randomNumber < this.parent.mutability.brain / 2) {
							nbrain.biasAxons[layer][axon] += seededNoise(-stepAmount, stepAmount);
						} else if (randomNumber < this.parent.mutability.brain) {
							nbrain.biasAxons[layer][axon] = 0;
						}
					} else {
						if (randomNumber < this.parent.mutability.brain / 2) {
							nbrain.axons[layer][neuron][axon] += seededNoise(-stepAmount, stepAmount);
						} else if (randomNumber < this.parent.mutability.brain) {
							nbrain.axons[layer][neuron][axon] = 0;
						}
					}
				}
			}
		}
	}
}

Creature.prototype.copyNeuralNetwork = function (copy) {
	for (let brain in this.network) {
		if (brain == "cellState") break;
		let netw = copy.network[brain].layers[0] < this.network[brain].layers[0] ? copy.network[brain] : this.network[brain];

		for (let layer = 0; layer < netw.axons.length; layer++) {
			for (let neuron = 0; neuron < netw.axons[layer].length; neuron++) {
				for (let axon = 0; axon < netw.axons[layer][neuron].length; axon++) {
					this.network[brain].axons[layer][neuron][axon] = copy.network[brain].axons[layer][neuron][axon];
				}
			}
		}

		for (let layer = 0; layer < netw.biasAxons.length; layer++) {
			for (let axon = 0; axon < netw.biasAxons[layer].length; axon++) {
				this.network[brain].biasAxons[layer][axon] = copy.network[brain].biasAxons[layer][axon];
			}
		}
	}
};