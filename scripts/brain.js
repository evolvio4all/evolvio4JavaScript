// BRAIN INFO //
const inputs = 6;
const outputs = 5 + memories;

// Creature.prototype creates a neural network composed of layers and axons
Creature.prototype.createNeuralNetwork = function () {
	// VARIABLES //
	this.inputs = inputs + this.eyes.length * 2;

	let layers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
	let forgetLayers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
	let decideLayers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
	let modifyLayers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];

	this.network = new Brain(forgetLayers, decideLayers, modifyLayers, layers);

	this.initNeurons(); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
	this.initAxons(); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight
};

function Brain(forget, decide, modify, main) {
	this.main = {
		layers: main
	};
	this.forget = {
		layers: forget
	};
	this.decide = {
		layers: decide
	};
	this.modify = {
		layers: modify
	};

	this.cellState = [];
	for (let i = 0; i < outputs; i++) this.cellState.push(0);

	this.output = [];
	for (let i = 0; i < outputs; i++) this.output.push(0);
}

Creature.prototype.initNeurons = function () {
	for (let brain in this.network) {
		if (brain == "cellState") break;

		this.network[brain].neurons = [];

		for (let layer = 0; layer < this.network[brain].layers.length; layer++) {
			this.network[brain].neurons.push([]);

			for (let neuron = 0; neuron < this.network[brain].layers[layer]; neuron++) {
				this.network[brain].neurons[layer].push(0);
			}
		}
	}
};

Creature.prototype.initAxons = function () {
	for (let brain in this.network) {
		if (brain == "cellState") break;

		this.network[brain].axons = [];

		for (let layer = 0; layer < this.network[brain].layers.length; layer++) {
			let layerWeights = [];
			let neuronsInNextLayer = this.network[brain].layers[layer + 1];
			for (let neuron = 0; neuron < this.network[brain].neurons[layer].length; neuron++) {
				let neuronWeights = [];
				for (let axon = 0; axon < neuronsInNextLayer; axon++) {
					let weight = 0;

					if (seededNoise() < connectionDensity) {
						weight = Math.round(seededNoise() * (maxInitialAxonValue - minInitialAxonValue) + minInitialAxonValue);
					}

					neuronWeights.push(weight);
				}
				layerWeights.push(neuronWeights);
			}
			this.network[brain].axons.push(layerWeights);
		}
	}
};

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
Creature.prototype.feedForward = function (input) {
	for (let brain in this.network) {
		if (brain == "cellState") break;

		let layer = 0;
		for (let neuron = 0; neuron < input.length; neuron++) {
			this.network[brain].neurons[0][neuron] = input[neuron];
		}

		for (let op = 0; op < outputs; op++) {
			this.network[brain].neurons[0][this.inputs + op] = this.network.output[op] || 0;
		}

		for (let cs = 0; cs < this.network.cellState.length; cs++) {
			this.network[brain].neurons[0][this.inputs + outputs + cs] = this.network.cellState[cs] || 0;
		}

		for (let neuronsInLayer of this.network[brain].layers) {
			neuronsInNextLayer = this.network[brain].layers[layer + 1];
			if (neuronsInNextLayer === undefined) break;

			for (let axon = 0; axon < neuronsInNextLayer; axon++) {
				let value = offset;
				for (let neuron = 0; neuron < neuronsInLayer; neuron++) {
					if (this.network[brain].axons[layer][neuron][axon] === 0) continue;
					if (this.network[brain].neurons[layer][neuron] === 0) break;

					value += this.network[brain].axons[layer][neuron][axon] * this.network[brain].neurons[layer][neuron];
				}

				if (brain == "forget" || brain == "modify" || brain == "main") {
					this.network[brain].neurons[layer + 1][axon] = 1 / (1 + Math.exp(-value));
				} else if (brain == "decide") {
					this.network[brain].neurons[layer + 1][axon] = Math.tanh(value);
				}
			}

			layer++;
		}
	}

	for (let i = 0; i < this.network.cellState.length; i++) {
		this.network.cellState[i] *= this.network.forget.neurons[this.network.forget.neurons.length - 1][i];
		this.network.cellState[i] += this.network.decide.neurons[this.network.decide.neurons.length - 1][i] * this.network.modify.neurons[this.network.modify.neurons.length - 1][i];
		this.network.main.neurons[this.network.main.neurons.length - 1][i] *= Math.tanh(this.network.cellState[i]);
	}

	this.network.output = this.network.main.neurons[this.network.main.neurons.length - 1];

	return this.network.main.neurons[this.network.main.neurons.length - 1];
};

// Modifies weights of the axons
Creature.prototype.mutate = function () {
	let rand = seededNoise() * 100;

	if (rand < this.mutability.children / 2) {
		this.children += 1;
		if (this.children < minChildren) this.children = minChildren;
	} else if (rand < this.mutability.children) {
		this.children -= 1;
	  if (this.children > maxChildren) this.children = maxChildren;
	}

	rand = seededNoise() * 100;

	if (rand < this.mutability.size / 2) {
		this.size /= 1.03;
		if (this.size < minCreatureSize) this.size = minCreatureSize;
	} else if (rand < this.mutability.size) {
		this.size *= 1.03;
		if (this.size > maxCreatureSize) this.size = maxCreatureSize;
	}

	rand = seededNoise() * 100;

	if (rand < this.mutability.size / 10) {
		this.size /= 1.1;
		if (this.size < minCreatureSize) this.size = minCreatureSize;
	} else if (rand < this.mutability.size / 5) {
		this.size *= 1.1;
		if (this.size > maxCreatureSize) this.size = maxCreatureSize;
	}

	rand = seededNoise() * 100;

	if (rand < this.mutability.childEnergy / 2) {
		this.childEnergy /= 1.03;
		if (this.childEnergy < minChildEnergy) this.childEnergy = minChildEnergy;
	} else if (rand < this.mutability.childEnergy) {
		this.childEnergy *= 1.03;
	  if (this.childEnergy > maxChildEnergy) this.childEnergy = maxChildEnergy;
	}

	rand = seededNoise() * 100;

	if (rand < this.mutability.eyes.number / 2 && this.eyes.length < maxEyes) {
		this.eyes.push(new this.eye(this));
	} else if (rand < this.mutability.eyes.number && this.eyes.length > minEyes) {
		this.eyes.splice(Math.floor(seededNoise() * this.eyes.length), 1);
	}

	rand = seededNoise() * 100;

	let selectedEye = this.eyes[Math.floor(seededNoise() * this.eyes.length)];
	
	if (this.eyes.length > 0) {
		if (rand < this.mutability.eyes.angle) {
			selectedEye.angle += seededNoise(-maxEyeAngleChange, maxEyeAngleChange);
			if (selectedEye.angle < 0) selectedEye.angle = 0;
			else if (selectedEye.angle > 2 * Math.PI) selectedEye.angle = 2 * Math.PI;
		}
		
		if (rand < this.mutability.eyes.distance) {
			selectedEye.distance += seededNoise() * 10 - 5;
			if (selectedEye.distance < minEyeDistance) selectedEye.distance = minEyeDistance;
			else if (selectedEye.distance > maxEyeDistance) selectedEye.angle = maxEyeDistance;
		}
	}
};

Brain.prototype.mutate = function () {
	for (let brain in this.network) {
		if (brain == "cellState") break;
		for (let i = 0; i < this.network[brain].axons.length; i++) {
			for (let j = 0; j < this.network[brain].axons[i].length; j++) {
				for (let k = 0; k < this.network[brain].axons[i][j].length; k++) {
					let weight = this.network[brain].axons[i][j][k];
					let randomNumber = seededNoise(0, 100);
					const numMutations = 2;

					if (randomNumber < this.mutability[0] * 1 / numMutations) {
						weight += (seededNoise() * (1 - minStepAmount) + minStepAmount) * stepAmount - stepAmount / 2;
					} else if (randomNumber < this.mutability[0] * 2 / numMutations) {
						weight = 0;
					}

					this.network[brain].axons[i][j][k] = weight;
				}
			}
		}
	}
}

Creature.prototype.copyNeuralNetwork = function (copy) {
	for (let brain in this.network) {
		if (brain == "cellState") break;
		for (let i = 0, l = this.network[brain].axons.length; i < l; i++) {
			for (let j = 0, m = this.network[brain].axons[i].length; j < m; j++) {
				for (let k = 0, n = this.network[brain].axons[i][j].length; k < n; k++) {
					this.network[brain].axons[i][j][k] = copy.network[brain].axons[i][j][k];
				}
			}
		}
	}
};

Creature.prototype.breedNeuralNetwork = function (copy, copy2) {
	for (let brain in this.network) {
		if (brain == "cellState") break;
		for (let i = 0, l = this.network[brain].axons.length; i < l; i++) {
			for (let j = 0, m = this.network[brain].axons[i].length; j < m; j++) {
				for (let k = 0, n = this.network[brain].axons[i][j].length; k < n; k++) {
					this.network[brain].axons[i][j][k] = (copy.network[brain].axons[i][j][k] + copy2.network[brain].axons[i][j][k]) / 2;
				}
			}
		}
	}
};