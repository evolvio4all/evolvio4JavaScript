// BRAIN INFO //
const inputs = 6;
const outputs = 5 + memories;

const brains = 4;

const testInput = [];
for (let i = 0; i < speciesAccuracy; i++) {
  testInput.push([]);
  for (let j = 0; j < inputs; j++) {
    let inputRandom = seededNoiseA(-0.6, 0.6);
    if (inputRandom < 0) inputRandom -= 0.4;
    else inputRandom += 0.4;

    testInput[i].push(inputRandom);
  }
}

// Creature.prototype creates a neural network composed of layers and axons
function createNeuralNetwork(creature, noiseGroup) {
  // VARIABLES //
  creature.inputs = inputs + creature.eyes.length;
  creature.outputs = outputs;

  let forgetLayers = [creature.inputs, (creature.inputs + creature.outputs) / 2, creature.outputs];
  let decideLayers = [creature.inputs, (creature.inputs + creature.outputs) / 2, creature.outputs];
  let modifyLayers = [creature.inputs, (creature.inputs + creature.outputs) / 2, creature.outputs];
  let layers = [creature.outputs + creature.inputs, (creature.inputs + creature.outputs * 2) / 2, creature.outputs];

  creature.network = new Network(forgetLayers, decideLayers, modifyLayers, layers, creature.outputs, creature.inputs);

  initNeurons(creature); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
  initAxons(creature, noiseGroup); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight
};

function Network(forget, decide, modify, main, out, inp) {
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
  for (let i = 0; i < out; i++) this.cellState.push(0);

  this.output = [];
  for (let i = 0; i < out; i++) this.output.push(0);
}

initNeurons = function(creature) {
  for (let brain in creature.network) {
    if (brain == "cellState") break;
    let nbrain = creature.network[brain];

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

initAxons = function(creature, noiseGroup) {
  for (let brain in creature.network) {
    if (brain == "cellState") break;
    let nbrain = creature.network[brain];
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

          if (noiseGroup && seededNoiseB() < connectionDensity) {
            weight = seededNoiseB(-maxInitialAxonValue, maxInitialAxonValue);
          } else if (!noiseGroup && seededNoiseA() < connectionDensity) {
            weight = seededNoiseA(-maxInitialAxonValue, maxInitialAxonValue);
          } else weight = 0;

          neuronWeights.push(weight);
        }
        layerWeights.push(neuronWeights);
      }

      nbrain.axons.push(layerWeights);

      layerWeights = [];

      for (let axon = 0; axon < neuronsInNextLayer; axon++) {
        let weight = 0;

        if (noiseGroup && seededNoiseB() < connectionDensity) {
          weight = seededNoiseB(-maxInitialAxonValue, maxInitialAxonValue);
        } else if (!noiseGroup && seededNoiseA() < connectionDensity) {
          weight = seededNoiseA(-maxInitialAxonValue, maxInitialAxonValue);
        } else weight = 0;

        layerWeights.push(weight);
      }

      nbrain.biasAxons.push(layerWeights);
    }
  }
};

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
function feedForward(creature, input) {
  let network = creature.network;
  let inputCount = creature.inputs;
  let outputCount = creature.outputs;
  let cellStateLength = network.cellState.length;

  feedForget(creature, network, input, inputCount, outputCount, cellStateLength);
  feedDecide(creature, network, input, inputCount, outputCount);
  feedModify(creature, network, input, inputCount, outputCount, cellStateLength);
  feedMain(creature, network, input, inputCount, outputCount);

  return calculateCellState(creature, network, cellStateLength);
};

function feedForget(creature, network, input, inputCount, outputCount, cellStateLength) {
  let nbrain = network.forget;
  let layers = nbrain.layerCount;

  /*
  for (let op = 0; op < outputCount; op++) {
    nbrain.neurons[0][op] = network.output[op] || 0;
  }

  for (let cs = 0; cs < cellStateLength; cs++) {
    nbrain.neurons[0][outputCount + cs] = network.cellState[cs] || 0;
  }
  */

  for (let i = 0; i < inputCount; i++) {
    nbrain.neurons[0][ /*outputCount + cellStateLength + */ i] = input[i] || 0;
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

feedDecide = function(creature, network, input, inputCount, outputCount) {
  let nbrain = network.decide;
  let layers = nbrain.layerCount;

  /*for (let op = 0; op < outputCount; op++) {
    nbrain.neurons[0][op] = network.output[op] || 0;
  }*/

  for (let i = 0; i < inputCount; i++) {
    nbrain.neurons[0][ /*outputCount + */ i] = input[i] || 0;
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

feedModify = function(creature, network, input, inputCount, outputCount, cellStateLength) {
  let nbrain = network.modify;
  let layers = nbrain.layerCount;

  /*for (let op = 0; op < outputCount; op++) {
    nbrain.neurons[0][op] = network.output[op] || 0;
  }

  for (let cs = 0; cs < cellStateLength; cs++) {
    nbrain.neurons[0][outputCount + cs] = network.cellState[cs] || 0;
  }*/

  for (let i = 0; i < inputCount; i++) {
    nbrain.neurons[0][ /*outputCount + cellStateLength +*/ i] = input[i] || 0;
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

feedMain = function(creature, network, input, inputCount, outputCount) {
  let nbrain = network.main;
  let layers = nbrain.layerCount;

  for (let op = 0; op < outputCount; op++) {
    nbrain.neurons[0][op] = network.output[op] || 0;
  }

  for (let i = 0; i < inputCount; i++) {
    nbrain.neurons[0][outputCount + i] = input[i] || 0;
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

calculateCellState = function(creature, network, cellStateLength) {
  let forgetOutput = network.forget.neurons[network.forget.layerCount - 1];
  let decideOutput = network.decide.neurons[network.decide.layerCount - 1];
  let modifyOutput = network.modify.neurons[network.modify.layerCount - 1];
  network.output = network.main.neurons[network.main.layerCount - 1];

  for (let i = 0; i < cellStateLength; i++) {
    network.cellState[i] *= forgetOutput[i];
    network.cellState[i] += decideOutput[i] * modifyOutput[i];
    network.output[i] *= Math.tanh(network.cellState[i]);
  }

  return network.output;
}

// Modifies weights of the axons
mutate = function(creature) {
  let mutability = creature.mutability;

  let rand = seededNoiseA(0, 100);

  if (rand < mutability.children / 2) {
    creature.children += 1;
    if (creature.children < minChildren) creature.children = minChildren;
  } else if (rand < mutability.children) {
    creature.children -= 1;
    if (creature.children > maxChildren) creature.children = maxChildren;
  }

  rand = seededNoiseA(0, 100);

  if (rand < mutability.size / 2) {
    creature.size /= 1.03;
    if (creature.size < minCreatureSize) creature.size = minCreatureSize;
  } else if (rand < mutability.size) {
    creature.size *= 1.03;
    if (creature.size > maxCreatureSize) creature.size = maxCreatureSize;
  }

  rand = seededNoiseA(0, 100);

  if (rand < mutability.size / 10) {
    creature.size /= 1.1;
    if (creature.size < minCreatureSize) creature.size = minCreatureSize;
  } else if (rand < mutability.size / 5) {
    creature.size *= 1.1;
    if (creature.size > maxCreatureSize) creature.size = maxCreatureSize;
  }

  rand = seededNoiseA(0, 100);

  if (rand < mutability.childEnergy / 2) {
    creature.childEnergy /= 1.03;
    if (creature.childEnergy < minChildEnergy) creature.childEnergy = minChildEnergy;
  } else if (rand < mutability.childEnergy) {
    creature.childEnergy *= 1.03;
    if (creature.childEnergy > maxChildEnergy) creature.childEnergy = maxChildEnergy;
  }

  let eyes = creature.eyes.length;
  for (let i = eyes - 1; i >= 0; i--) {
    rand = seededNoiseA(0, 100);

    if (rand < mutability.eyes.angle) {
      let eye = creature.eyes[i];

      eye.angle += seededNoiseA(-maxEyeAngleChange, maxEyeAngleChange);
      eye.angle = eye.angle % (2 * Math.PI);
      if (eye.angle < 0) eye.angle += 2 * Math.PI;
    }

    rand = seededNoiseA(0, 100);

    if (rand < mutability.eyes.distance) {
      let eye = creature.eyes[i];

      eye.distance += seededNoiseA(-maxEyeDistanceChange, maxEyeDistanceChange);
      if (eye.distance < minEyeDistance) eye.distance = minEyeDistance;
      else if (eye.distance > maxEyeDistance) eye.angle = maxEyeDistance;
    }

    rand = seededNoiseA(0, 100);

    if (rand < mutability.eyes.number / 2 && creature.eyes.length < maxEyes) {
      creature.eyes.push(new eye(undefined, undefined, false));
    } else if (rand < mutability.eyes.number && creature.eyes.length > minEyes) {
      creature.eyes.splice(i, 1);
    }
  }

  for (let property in mutability) {
    rand = seededNoiseA(0, 100);

    if (property == "eyes") {
      for (let sec in mutability[property]) {
        rand = seededNoiseA(0, 100);

        if (rand < mutability.mutability) {
          mutability[property][sec] += seededNoiseA(-maxMutabilityChange, maxMutabilityChange);

          if (mutability[property][sec] < minMutability[property][sec]) mutability[property][sec] = minMutability[property][sec];
          else if (mutability[property][sec] > maxMutability[property][sec]) mutability[property][sec] = maxMutability[property][sec];
        }
      }
    } else if (rand < mutability.mutability) {
      mutability[property] += seededNoiseA(-maxMutabilityChange, maxMutabilityChange);

      if (mutability[property] < minMutability[property]) mutability[property] = minMutability[property];
      else if (mutability[property] > maxMutability[property]) mutability[property] = maxMutability[property];
    }
  }
};

mutateNet = function(creature, network) {
  for (let brain in network) {
    if (brain == "cellState") break;
    let nbrain = network[brain];

    let layers = nbrain.layers.length - 1;
    for (let layer = 0; layer < layers; layer++) {
      let neurons = nbrain.layers[layer];
      let neuronsInNextLayer = nbrain.layers[layer + 1];

      for (let axon = 0; axon < neuronsInNextLayer; axon++) {
        for (let neuron = 0; neuron <= neurons; neuron++) {
          let randomNumber = seededNoiseA(0, 100);

          if (neuron == neurons) {
            if (randomNumber < creature.mutability.brain / 2) {
              nbrain.biasAxons[layer][axon] += seededNoiseA(-stepAmount, stepAmount);
            } else if (randomNumber < creature.mutability.brain) {
              nbrain.biasAxons[layer][axon] = 0;
            }
          } else {
            if (randomNumber < creature.mutability.brain / 2) {
              nbrain.axons[layer][neuron][axon] += seededNoiseA(-stepAmount, stepAmount);
            } else if (randomNumber < creature.mutability.brain) {
              nbrain.axons[layer][neuron][axon] = 0;
            }
          }
        }
      }
    }
  }
}

copyNeuralNetwork = function(creature, copy) {
  for (let brain in creature.network) {
    if (brain == "cellState") break;
    let netw = copy.network[brain].layers[0] < creature.network[brain].layers[0] ? copy.network[brain] : creature.network[brain];

    for (let layer = 0; layer < netw.axons.length; layer++) {
      for (let neuron = 0; neuron < netw.axons[layer].length; neuron++) {
        for (let axon = 0; axon < netw.axons[layer][neuron].length; axon++) {
          creature.network[brain].axons[layer][neuron][axon] = copy.network[brain].axons[layer][neuron][axon];
        }
      }
    }

    for (let layer = 0; layer < netw.biasAxons.length; layer++) {
      for (let axon = 0; axon < netw.biasAxons[layer].length; axon++) {
        creature.network[brain].biasAxons[layer][axon] = copy.network[brain].biasAxons[layer][axon];
      }
    }
  }
};