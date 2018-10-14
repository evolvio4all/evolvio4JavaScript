// BRAIN INFO //
const inputs = 6;
const memories = 2;
const outputs = 5 + memories;

const connectionDensity = 0.2; // % of axons initially connected in the brain

// Creature.prototype creates a neural network composed of layers and axons
Creature.prototype.createNeuralNetwork = function () {
	// VARIABLES //
	this.inputs = inputs + this.eyes.length;

	let layers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
	let forgetLayers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
	let decideLayers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
	let modifyLayers = [inputs + outputs * 2, Math.ceil((inputs + outputs * 3) / 2), outputs];
  
	this.network.main = {};
	this.network.main.layers = layers;
	this.network.forget = {};
	this.network.forget.layers = forgetLayers;
	this.network.decide = {};
	this.network.decide.layers = decideLayers;
	this.network.modify = {};
	this.network.modify.layers = modifyLayers;

	this.initNeurons(); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
	this.initAxons(); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight

	this.network.cellState = [];
	for (let i = 0; i < outputs; i++) this.network.cellState.push(0);

	this.network.output = [];
	for (let i = 0; i < outputs; i++) this.network.output.push(0);
};

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
					  weight = Math.round(seededNoise() * 6 - 3);
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
					value += this.network[brain].axons[layer][neuron][axon] * this.network[brain].neurons[layer][neuron];
					if (isNaN(value)) console.log(this.network[brain].neurons[layer][neuron]);
				}

				if (brain == "forget" || brain == "modify" || brain == "main") {
					this.network[brain].neurons[layer + 1][axon] = 1 / (1 + Math.exp(-value));
				} else if (brain == "decide") {
					this.network[brain].neurons[layer + 1][axon] = rtanh(value);
				}
			}

			layer++;
		}
	}

	for (let i = 0; i < this.network.cellState.length; i++) {
		this.network.cellState[i] *= this.network.forget.neurons[this.network.forget.neurons.length - 1][i];
		this.network.cellState[i] += this.network.decide.neurons[this.network.decide.neurons.length - 1][i] * this.network.modify.neurons[this.network.modify.neurons.length - 1][i];
		this.network.main.neurons[this.network.main.neurons.length - 1][i] *= rtanh(this.network.cellState[i]);
	}

	this.network.output = this.network.main.neurons[this.network.main.neurons.length - 1];

	return this.network.main.neurons[this.network.main.neurons.length - 1];
};

// Modifies weights of the axons
Creature.prototype.mutate = function () {
	let rand = seededNoise() * 100;

	if (rand < 10) {
		this.children += 1;
	} else if (rand < 20) {
		this.children -= 1;
	}
  
  rand = seededNoise() * 100;
  
	if (rand < 10) {
		this.size /= 1.03;
	} else if (rand < 20) {
		this.size *= 1.03;
	}

  rand = seededNoise() * 100;

	if (rand < 2) {
		this.size /= 1.1;
	} else if (rand < 4) {
		this.size *= 1.1;
	}
  
  rand = seededNoise() * 100;
  
	if (rand < 10) {
		this.childEnergy /= 1.03;
	} else if (rand < 20) {
		this.childEnergy *= 1.03;
	}
	
	rand = seededNoise() * 100;
	
	if (rand < 5) {
	  this.eyes[Math.floor(seededNoise() * this.eyes.length)].angle += seededNoise * 2 / 90 - 1 / 90;
	} else if (rand < 10) {
	  this.eyes[Math.floor(seededNoise() * this.eyes.length)].distance += seededNoise * 10 - 5;
	}
	
	rand = seededNoise() * 100;
	
	if (rand < 5) {
	  this.eyes.push(new this.eye(this));
	} else if (rand < 10) {
	  this.eyes.splice(Math.floor(seededNoise() * this.eyes.length), 1);
	}

	if (this.size < minCreatureSize) this.size = minCreatureSize;
	if (this.size > maxCreatureSize) this.size = maxCreatureSize;

	if (this.children < 1) this.children = 1;

	if (this.childEnergy < 0.1) this.childEnergy = 0.1;
	if (this.childEnergy > 1) this.childEnergy = 1;

	for (let brain in this.network) {
		if (brain == "cellState") break;
		for (let i = 0; i < this.network[brain].axons.length; i++) {
			for (let j = 0; j < this.network[brain].axons[i].length; j++) {
				for (let k = 0; k < this.network[brain].axons[i][j].length; k++) {
					let weight = this.network[brain].axons[i][j][k];
					let randomNumber = seededNoise() * 100;
					const numMutations = 2;

					if (randomNumber < mutability * 1 / numMutations) {
						weight += (seededNoise() * (1 - minStepAmount) + minStepAmount) * stepAmount - stepAmount / 2;
					} else if (randomNumber < mutability * 2 / numMutations) {
						weight = 0;
					}

					this.network[brain].axons[i][j][k] = weight;
				}
			}
		}
	}
};

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