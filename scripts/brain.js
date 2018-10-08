// Creature.prototype creates a neural network composed of layers and axons
Creature.prototype.createNeuralNetwork = function () {
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
};

Creature.prototype.initNeurons = function () {
	this.network.main.neurons = [];
	for (let i = 0; i < layers.length; i++) {
		this.network.main.neurons.push([]);

		for (let j = 0; j < layers[i]; j++) {
			this.network.main.neurons[i].push(0);
		}
	}
	
	this.network.forget.neurons = [];
	for (let i = 0; i < forgetLayers.length; i++) {
		this.network.forget.neurons.push([]);

		for (let j = 0; j < forgetLayers[i]; j++) {
			this.network.forget.neurons[i].push(0);
		}
	}
	
	this.network.decide.neurons = [];
	for (let i = 0; i < decideLayers.length; i++) {
		this.network.decide.neurons.push([]);

		for (let j = 0; j < decideLayers[i]; j++) {
			this.network.decide.neurons[i].push(0);
		}
	}
	
	this.network.modify.neurons = [];
	for (let i = 0; i < modifyLayers.length; i++) {
		this.network.modify.neurons.push([]);

		for (let j = 0; j < modifyLayers[i]; j++) {
			this.network.modify.neurons[i].push(0);
		}
	}
};

Creature.prototype.initAxons = function () {
	this.network.main.axons = [];
	for (let i = 1; i < this.network.main.layers.length; i++) {
		let layerWeights = [];
		let neuronsInPreviousLayer = this.network.main.layers[i - 1];
		for (let j = 0; j < this.network.main.neurons[i].length; j++) {
			let neuronWeights = [];
			for (let k = 0; k < neuronsInPreviousLayer; k++) {
			  let weight = Math.round((seededNoise() * 4 - 2) / (1 / connectionDensity)) * (seededNoise() * 3);
				neuronWeights.push(weight);
			}
			layerWeights.push(neuronWeights);
		}
		this.network.main.axons.push(layerWeights);
	}
	
	this.network.forget.axons = [];
	for (let i = 1; i < this.network.forget.layers.length; i++) {
		let layerWeights = [];
		let neuronsInPreviousLayer = this.network.forget.layers[i - 1];
		for (let j = 0; j < this.network.forget.neurons[i].length; j++) {
			let neuronWeights = [];
			for (let k = 0; k < neuronsInPreviousLayer; k++) {
				let weight = Math.round((seededNoise() * 4 - 2) / (1 / connectionDensity)) * (seededNoise() * 3);
				neuronWeights.push(weight);
			}
			layerWeights.push(neuronWeights);
		}
		this.network.forget.axons.push(layerWeights);
	}
	
	this.network.decide.axons = [];
	for (let i = 1; i < this.network.decide.layers.length; i++) {
		let layerWeights = [];
		let neuronsInPreviousLayer = this.network.decide.layers[i - 1];
		for (let j = 0; j < this.network.decide.neurons[i].length; j++) {
			let neuronWeights = [];
			for (let k = 0; k < neuronsInPreviousLayer; k++) {
				let weight = Math.round((seededNoise() * 4 - 2) / (1 / connectionDensity)) * (seededNoise() * 3);
				neuronWeights.push(weight);
			}
			layerWeights.push(neuronWeights);
		}
		this.network.decide.axons.push(layerWeights);
	}
	
	this.network.modify.axons = [];
	for (let i = 1; i < this.network.modify.layers.length; i++) {
		let layerWeights = [];
		let neuronsInPreviousLayer = this.network.modify.layers[i - 1];
		for (let j = 0; j < this.network.modify.layers[i]; j++) {
			let neuronWeights = [];
			for (let k = 0; k < neuronsInPreviousLayer; k++) {
				let weight = Math.round((seededNoise() * 4 - 2) / (1 / connectionDensity)) * (seededNoise() * 3);
				neuronWeights.push(weight);
			}
			layerWeights.push(neuronWeights);
		}
		this.network.modify.axons.push(layerWeights);
	}
};

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
Creature.prototype.feedForward = function (ins) {
	for (let i = 0; i < forgetLayers[0]; i++) {
		if (i < inputs) this.network.forget.neurons[0][i] = ins[i]; // Takes the inputs and applies them
		else if (i < inputs + outputs) this.network.forget.neurons[0][i] = this.output[i - inputs] || 0; // Takes the inputs and applies them
		else this.network.forget.neurons[0][i] = this.network.cellState[i - inputs - outputs];
	}
	
	for (let i = 0; i < decideLayers[0]; i++) {
		if (i < inputs) this.network.decide.neurons[0][i] = ins[i]; // Takes the inputs and applies them
		else if (i < inputs + outputs) this.network.decide.neurons[0][i] = this.output[i - inputs] || 0; // Takes the inputs and applies them
		else this.network.decide.neurons[0][i] = this.network.cellState[i - inputs - outputs];
	}
	
	for (let i = 0; i < modifyLayers[0]; i++) {
		if (i < inputs) this.network.modify.neurons[0][i] = ins[i]; // Takes the inputs and applies them
		else if (i < inputs + outputs) this.network.modify.neurons[0][i] = this.output[i - inputs] || 0; // Takes the inputs and applies them
		else this.network.modify.neurons[0][i] = this.network.cellState[i - inputs - outputs];
	}
	
	for (let i = 0; i < layers[0]; i++) {
		if (i < inputs) this.network.main.neurons[0][i] = ins[i]; // Takes the inputs and applies them
		else if (i < inputs + outputs) this.network.main.neurons[0][i] = this.output[i - inputs] || 0; // Takes the inputs and applies them
		else this.network.main.neurons[0][i] = this.network.cellState[i - inputs - outputs];
	}
  
  
  
	for (let i = 1; i < this.network.forget.layers.length; i++) {
		for (j = 0; j < this.network.forget.layers[i]; j++) {
			let value = offset;
			for (k = 0; k < this.network.forget.neurons[i - 1].length; k++) {
				value += this.network.forget.axons[i - 1][j][k] * this.network.forget.neurons[i - 1][k]; // Adds the neurons value * the weight
			}

			this.network.forget.neurons[i][j] = 1 / (1 + Math.exp(-value)); // Sets the neuron across from the axon to the new value (0 - 1)
		}
	}
	
	let forgetOutput = this.network.forget.neurons[this.network.forget.neurons.length - 1];
	
	for (let i = 0; i < forgetOutput.length; i++) {
	  this.network.cellState[i] *= forgetOutput[i];
	}
	
	
	for (let i = 1; i < this.network.decide.layers.length; i++) {
		for (j = 0; j < this.network.decide.layers[i]; j++) {
			let value = offset;
			for (k = 0; k < this.network.decide.neurons[i - 1].length; k++) {
				value += this.network.decide.axons[i - 1][j][k] * this.network.decide.neurons[i - 1][k]; // Adds the neurons value * the weight
			}

			this.network.decide.neurons[i][j] = Math.tanh(value); // Sets the neuron across from the axon to the new value (0 - 1)
		}
	}
	
	let decideOutput = this.network.decide.neurons[this.network.decide.neurons.length - 1];
	
	for (let i = 1; i < this.network.modify.layers.length; i++) {
		for (j = 0; j < this.network.modify.layers[i]; j++) {
			let value = offset;
			for (k = 0; k < this.network.modify.neurons[i - 1].length; k++) {
				value += this.network.modify.axons[i - 1][j][k] * this.network.modify.neurons[i - 1][k]; // Adds the neurons value * the weight
			}

			this.network.modify.neurons[i][j] = 1 / (1 + Math.exp(-value)); // Sets the neuron across from the axon to the new value (0 - 1)
		}
	}
	
	let modifyOutput = this.network.modify.neurons[this.network.modify.neurons.length - 1];
	
	for (let i = 0; i < decideOutput.length; i++) {
	  this.network.cellState[i] += modifyOutput[i] * decideOutput[i];
	}
	
	for (let i = 1; i < this.network.main.layers.length; i++) {
		for (j = 0; j < this.network.main.layers[i]; j++) {
			let value = offset;
			for (k = 0; k < this.network.main.neurons[i - 1].length; k++) {
				value += this.network.main.axons[i - 1][j][k] * this.network.main.neurons[i - 1][k]; // Adds the neurons value * the weight
			}

			this.network.main.neurons[i][j] = 1 / (1 + Math.exp(-value)); // Sets the neuron across from the axon to the new value (0 - 1)
		}
	}
	
	let output = this.network.main.neurons[this.network.main.neurons.length - 1];
	
	for (let i = 0; i < output.length; i++) {
	  output[i] *= Math.tanh(this.network.cellState[i]);
	  output[i] = Math.max(Math.min(output[i], 1), -1)
	}
	
	return output; // returns the output, or the last line
};

// Modifies weights of the axons
Creature.prototype.mutate = function () {
	let rand = seededNoise() * 100;

	if (rand > 15 && rand < 30) {
		this.children += 1;
	} else if (rand > 30 && rand < 45) {
		this.children -= 1;
	}

	if (rand > 45 && rand < 60) {
		this.size /= 1.03;
	} else if (rand > 60 && rand < 75) {
		this.size *= 1.03;
	}

	if (rand > 77 && rand < 78) {
		this.size /= 1.1;
	} else if (rand > 79 && rand < 80) {
		this.size *= 1.1;
	}

	if (rand > 45 && rand < 60) {
		this.childEnergy /= 1.03;
	} else if (rand > 60 && rand < 75) {
		this.childEnergy *= 1.03;
	}

	if (this.size < minCreatureSize) this.size = minCreatureSize;
	if (this.size > maxCreatureSize) this.size = maxCreatureSize;

	if (this.children < 1) this.children = 1;

	if (this.childEnergy < 0.1) this.childEnergy = 0.1;
	if (this.childEnergy > 1) this.childEnergy = 1;

	for (let i = 0; i < this.network.main.axons.length; i++) {
		for (let j = 0; j < this.network.main.axons[i].length; j++) {
			for (let k = 0; k < this.network.main.axons[i][j].length; k++) {
				let weight = this.network.main.axons[i][j][k];
				let randomNumber = seededNoise() * 100;
				const numMutations = 3;

				if (randomNumber < mutability * 1 / numMutations) {
					weight -= seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 2 / numMutations) {
					weight += seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 3 / numMutations) {
					weight = 0;
				}

				this.network.main.axons[i][j][k] = weight;
			}
		}
	}
	
	for (let i = 0; i < this.network.forget.axons.length; i++) {
		for (let j = 0; j < this.network.forget.axons[i].length; j++) {
			for (let k = 0; k < this.network.forget.axons[i][j].length; k++) {
				let weight = this.network.forget.axons[i][j][k];
				let randomNumber = seededNoise() * 100;
				const numMutations = 3;

				if (randomNumber < mutability * 1 / numMutations) {
					weight -= seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 2 / numMutations) {
					weight += seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 3 / numMutations) {
					weight = 0;
				}

				this.network.forget.axons[i][j][k] = weight;
			}
		}
	}
	
	for (let i = 0; i < this.network.decide.axons.length; i++) {
		for (let j = 0; j < this.network.decide.axons[i].length; j++) {
			for (let k = 0; k < this.network.decide.axons[i][j].length; k++) {
				let weight = this.network.decide.axons[i][j][k];
				let randomNumber = seededNoise() * 100;
				const numMutations = 3;
				
        if (randomNumber < mutability * 1 / numMutations) {
					weight -= seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 2 / numMutations) {
					weight += seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 3 / numMutations) {
					weight = 0;
				}

				this.network.decide.axons[i][j][k] = weight;
			}
		}
	}
	
	for (let i = 0; i < this.network.modify.axons.length; i++) {
		for (let j = 0; j < this.network.modify.axons[i].length; j++) {
			for (let k = 0; k < this.network.modify.axons[i][j].length; k++) {
				let weight = this.network.modify.axons[i][j][k];
				let randomNumber = seededNoise() * 100;
				const numMutations = 3;

				if (randomNumber < mutability * 1 / numMutations) {
					weight -= seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 2 / numMutations) {
					weight += seededNoise() * stepAmount + minStepAmount;
				} else if (randomNumber < mutability * 3 / numMutations) {
					weight = 0;
				}

				this.network.modify.axons[i][j][k] = weight;
			}
		}
	}
};

Creature.prototype.copyNeuralNetwork = function (copy) {
	for (let i = 0, l = this.network.main.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.main.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.main.axons[i][j].length; k < n; k++) {
				this.network.main.axons[i][j][k] = copy.network.main.axons[i][j][k];
			}
		}
	}
	
	for (let i = 0, l = this.network.forget.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.forget.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.forget.axons[i][j].length; k < n; k++) {
				this.network.forget.axons[i][j][k] = copy.network.forget.axons[i][j][k];
			}
		}
	}
	
	for (let i = 0, l = this.network.decide.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.decide.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.decide.axons[i][j].length; k < n; k++) {
				this.network.decide.axons[i][j][k] = copy.network.decide.axons[i][j][k];
			}
		}
	}
	
	for (let i = 0, l = this.network.modify.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.modify.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.modify.axons[i][j].length; k < n; k++) {
				this.network.modify.axons[i][j][k] = copy.network.modify.axons[i][j][k];
			}
		}
	}
};

Creature.prototype.breedNeuralNetwork = function (copy, copy2) {
	for (let i = 0, l = this.network.main.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.main.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.main.axons[i][j].length; k < n; k++) {
				this.network.main.axons[i][j][k] = (copy.network.main.axons[i][j][k] + copy2.network.main.axons[i][j][k]) / 2;
			}
		}
	}
	
	for (let i = 0, l = this.network.forget.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.forget.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.forget.axons[i][j].length; k < n; k++) {
				this.network.forget.axons[i][j][k] = (copy.network.forget.axons[i][j][k] + copy2.network.forget.axons[i][j][k]) / 2;
			}
		}
	}
	
	for (let i = 0, l = this.network.decide.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.decide.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.decide.axons[i][j].length; k < n; k++) {
				this.network.decide.axons[i][j][k] = (copy.network.decide.axons[i][j][k] + copy2.network.decide.axons[i][j][k]) / 2;
			}
		}
	}
	
	for (let i = 0, l = this.network.modify.axons.length; i < l; i++) {
		for (let j = 0, m = this.network.modify.axons[i].length; j < m; j++) {
			for (let k = 0, n = this.network.modify.axons[i][j].length; k < n; k++) {
				this.network.modify.axons[i][j][k] = (copy.network.modify.axons[i][j][k] + copy2.network.modify.axons[i][j][k]) / 2;
			}
		}
	}
};
