// BRAIN INFO //
const inputs = 4;
const outputs = 5 + memories;

const testInput = [];
for (let i = 0; i < inputs; i++) {
	testInput.push(seededNoise(-1, 1));
}

// Creature.prototype creates a neural network composed of layers and axons
Creature.prototype.createNeuralNetwork = function () {
	// VARIABLES //
	this.inputs = inputs + this.eyes.length * 2;

	let layers = [this.inputs + outputs, Math.ceil((this.inputs + outputs * 2) / 2), outputs];
	let forgetLayers = [this.inputs + outputs * 2, Math.ceil((this.inputs + outputs * 3) / 2), outputs];
	let decideLayers = [this.inputs + outputs, Math.ceil((this.inputs + outputs * 2) / 2), outputs];
	let modifyLayers = [this.inputs + outputs * 2, Math.ceil((this.inputs + outputs * 3) / 2), outputs];

	this.network = new Network(forgetLayers, decideLayers, modifyLayers, layers, this);

	this.initNeurons(); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
	this.initAxons(); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight
};

function Network(forget, decide, modify, main, par) {
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

	this.parent = par;
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

		this.network[brain].biasAxons = [];

		for (let layer = 0; layer < this.network[brain].layers.length; layer++) {
			let layerWeights = [];
			let neuronsInNextLayer = this.network[brain].layers[layer + 1];

			if (neuronsInNextLayer === undefined) break;

			for (let neuron = 0; neuron < this.network[brain].layers[layer]; neuron++) {
				let neuronWeights = [];
				for (let axon = 0; axon < neuronsInNextLayer; axon++) {
					let weight = 0;

					if (seededNoise() < connectionDensity) {
						weight = seededNoise(-maxInitialAxonValue, maxInitialAxonValue);
					}

					neuronWeights.push(weight);
				}
				layerWeights.push(neuronWeights);
			}
			this.network[brain].axons.push(layerWeights);
		}

		for (let layer = 0; layer < this.network[brain].layers.length; layer++) {
			let layerWeights = [];
			let neuronsInNextLayer = this.network[brain].layers[layer + 1];
			if (neuronsInNextLayer === undefined) break;

			for (let axon = 0; axon < neuronsInNextLayer; axon++) {
				let weight = 0;

				if (seededNoise() < connectionDensity) {
					weight = seededNoise(-maxInitialAxonValue, maxInitialAxonValue);
				}

				layerWeights.push(weight);
			}

			this.network[brain].biasAxons.push(layerWeights);
		}
	}
};

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
Creature.prototype.feedForward = function (input) {
	for (let brain in this.network) {
		if (brain == "cellState") break;

		for (let neuron = 0; neuron < input.length; neuron++) {
			this.network[brain].neurons[0][neuron] = input[neuron];
		}

		for (let op = 0; op < outputs; op++) {
			this.network[brain].neurons[0][this.inputs + op] = this.network.output[op] || 0;
		}

		for (let cs = 0; cs < this.network.cellState.length; cs++) {
			if (brain == "forget" || brain == "modify") this.network[brain].neurons[0][this.inputs + outputs + cs] = this.network.cellState[cs] || 0;
		}

		let layer = 0;
		for (let neuronsInLayer of this.network[brain].layers) {
			neuronsInNextLayer = this.network[brain].layers[layer + 1];
			if (neuronsInNextLayer === undefined) break;

			let nIL = neuronsInLayer;

			for (let axon = 0; axon < neuronsInNextLayer; axon++) { // Loops through each axon
				let value = 0;

				for (let neuron = 0; neuron <= nIL; neuron++) { // For each axon position (neuron in next layer) loop through all of the neurons in this layer
					if (neuron == nIL) {
						value += this.network[brain].biasAxons[layer][axon] * bias; // add bias neuron (independent)
					} else {
						value += this.network[brain].axons[layer][neuron][axon] * this.network[brain].neurons[layer][neuron]; // add all neuron values times weight of their respective axon
					}

				}

				if (brain == "forget" || brain == "modify" || brain == "main") {
					this.network[brain].neurons[layer + 1][axon] = 1 / (1 + Math.exp(-value)); // set neuron in next layer value to sigmoid
				} else if (brain == "decide") {
					this.network[brain].neurons[layer + 1][axon] = Math.tanh(value); // set neuron in next layer value to tanh
				}
			}

			layer++; // next layer
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
	let rand = seededNoise(0, 100);

	if (rand < this.mutability.children / 2) {
		this.children += 1;
		if (this.children < minChildren) this.children = minChildren;
	} else if (rand < this.mutability.children) {
		this.children -= 1;
		if (this.children > maxChildren) this.children = maxChildren;
	}

	rand = seededNoise(0, 100);

	if (rand < this.mutability.size / 2) {
		this.size /= 1.03;
		if (this.size < minCreatureSize) this.size = minCreatureSize;
	} else if (rand < this.mutability.size) {
		this.size *= 1.03;
		if (this.size > maxCreatureSize) this.size = maxCreatureSize;
	}

	rand = seededNoise(0, 100);

	if (rand < this.mutability.size / 10) {
		this.size /= 1.1;
		if (this.size < minCreatureSize) this.size = minCreatureSize;
	} else if (rand < this.mutability.size / 5) {
		this.size *= 1.1;
		if (this.size > maxCreatureSize) this.size = maxCreatureSize;
	}

	rand = seededNoise(0, 100);

	if (rand < this.mutability.childEnergy / 2) {
		this.childEnergy /= 1.03;
		if (this.childEnergy < minChildEnergy) this.childEnergy = minChildEnergy;
	} else if (rand < this.mutability.childEnergy) {
		this.childEnergy *= 1.03;
		if (this.childEnergy > maxChildEnergy) this.childEnergy = maxChildEnergy;
	}

	for (let eye of this.eyes) {
		rand = seededNoise(0, 100);

		if (rand < this.mutability.eyes.angle) {
			eye.angle += seededNoise(-maxEyeAngleChange, maxEyeAngleChange);
			if (eye.angle < 0) selectedEye.angle = 0;
			else if (eye.angle > 2 * Math.PI) eye.angle = 2 * Math.PI;
		}

		rand = seededNoise(0, 100);

		if (rand < this.mutability.eyes.distance) {
			eye.distance += seededNoise(-maxEyeDistanceChange, maxEyeDistanceChange);
			if (eye.distance < minEyeDistance) eye.distance = minEyeDistance;
			else if (eye.distance > maxEyeDistance) eye.angle = maxEyeDistance;
		}

		rand = seededNoise(0, 100);

		if (rand < this.mutability.eyes.number / 2 && this.eyes.length < maxEyes) {
			this.eyes.push(new this.eye(this));
		} else if (rand < this.mutability.eyes.number && this.eyes.length > minEyes) {
			this.eyes.splice(this.eyes.indexOf(eye), 1);
		}
	}

	for (let property in this.mutability) {
		rand = seededNoise(0, 100);

		if (property == "eyes") {
			for (let sec in this.mutability[property]) {
				rand = seededNoise(0, 100);

				if (rand < this.mutability.mutability) {
					this.mutability[property][sec] += seededNoise(-maxMutabilityChange, maxMutabilityChange);

					if (this.mutability[property][sec] < minMutability[property][sec]) this.mutability[property][sec] = minMutability[property][sec];
					else if (this.mutability[property][sec] > maxMutability[property][sec]) this.mutability[property][sec] = maxMutability[property][sec];
				}
			}
		} else if (rand < this.mutability.mutability) {
			this.mutability[property] += seededNoise(-maxMutabilityChange, maxMutabilityChange);

			if (this.mutability[property] < minMutability[property]) this.mutability[property] = minMutability[property];
			else if (this.mutability[property] > maxMutability[property]) this.mutability[property] = maxMutability[property];
		}
	}
};

Network.prototype.mutate = function () {
	for (let brain in this) {
		if (brain == "cellState") break;
		for (let layer = 0; layer < this[brain].axons.length; layer++) {
			for (let neuron = 0; neuron < this[brain].axons[layer].length; neuron++) {
				for (let axon = 0; axon < this[brain].axons[layer][neuron].length; axon++) {
					let weight = this[brain].axons[layer][neuron][axon];
					let randomNumber = seededNoise(0, 100);

					if (randomNumber < this.parent.mutability.brain / 2) {
						weight += seededNoise(-stepAmount, stepAmount);
					} else if (randomNumber < this.parent.mutability.brain) {
						weight = 0;
					}

					this[brain].axons[layer][neuron][axon] = weight;
				}
			}
		}

		for (let layer = 0; layer < this[brain].biasAxons.length; layer++) {
			for (let axon = 0; axon < this[brain].biasAxons[layer].length; axon++) {
				let weight = this[brain].biasAxons[layer][axon];
				let randomNumber = seededNoise(0, 100);

				if (randomNumber < this.parent.mutability.brain / 2) {
					weight += seededNoise(-stepAmount, stepAmount);
				} else if (randomNumber < this.parent.mutability.brain) {
					weight = 0;
				}

				this[brain].biasAxons[layer][axon] = weight;
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