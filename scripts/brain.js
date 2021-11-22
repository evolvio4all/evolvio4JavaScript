// BRAIN INFO //

var memoryCount = 1;
for (let i = 0; i < memories.length; i++) {
  memoryCount *= memories[i];
}

const inputs = 9;
const outputs = 9 + memories.length + 1;

const brains = 1;

const testInput = [];
for (let i = 0; i < speciesAccuracy; i++) {
  testInput.push([]);
  for (let j = 0; j < inputs; j++) {
    testInput[i].push(1);
  }
}

// Creature.prototype creates a neural network composed of layers and axons
function createNeuralNetwork(creature, noiseGroup, setValues) {
  // VARIABLES //
  creature.inputs = inputs + creature.eyes.length * 2;

  creature.outputs = outputs;
  let mainLayers = [creature.inputs + memoryCount, 5, creature.outputs];

  creature.network = new Network(mainLayers, creature.outputs, creature.inputs);

  initMemory(creature, memories);
  initNeurons(creature); // Creature.prototype initializes the neurons, creating them, Neurons contain a value and are the connection point for axons
  initAxons(creature, noiseGroup, setValues); // Axons are basically lines that connect Neurons, each one has a weight, and each neuron has a value, the axon takes the value and multiplies it by the weight
}

function Network(main, out, inp) {
  this.main = {
    layers: main
  };
  this.main.layerCount = this.main.layers.length;

  this.memories = [];

  this.output = [];
  for (let i = 0; i < out; i++) this.output.push(0);
}

function resetMemories(creature) {
  var group = [];
  for (let m = 0; m < memories.length; m++) {
    var length = memories[m];

    group.push([]);
    for (let l = 0; l < length; l++) {
      if (m == 0) group[m].push(0);
      else group[m].push([...group[m - 1]]);
    }
  }

  creature.network.memories = group[group.length - 1];
}

function initMemory(creature, memories) {
  var group = [];
  for (let m = 0; m < memories.length; m++) {
    var length = memories[m];

    group.push([]);
    for (let l = 0; l < length; l++) {
      if (m == 0) group[m].push(0);
      else group[m].push([...group[m - 1]]);
    }
  }

  creature.network.memories = group[group.length - 1];
}

function initNeurons(creature) {
  let nbrain = creature.network.main;

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

function initAxons(creature, noiseGroup, setValues) {
  let nbrain = creature.network.main;
  let layers = nbrain.layers.length - 1;
  nbrain.axons = [];
  nbrain.types = [];

  for (let layer = 0; layer < layers; layer++) {
    let layerWeights = [];
    let layerTypes = [];

    let neurons = nbrain.layers[layer];
    let neuronsInNextLayer = nbrain.layers[layer + 1];

    for (let neuron = 0; neuron < neurons; neuron++) {
      let neuronWeights = [];
      let neuronTypes = [];
      for (let axon = 0; axon < neuronsInNextLayer; axon++) {
        if (setValues == false) {
          neuronWeights.push(0);
          neuronTypes.push("*");
          continue;
        }

        if (noiseGroup && seededNoiseB() < connectionDensity[layer]) {
          var R1 = seededNoiseB();
          var R2 = seededNoiseB();

          while (R2 * R2 < R1) {
            var R1 = seededNoiseB();
            var R2 = seededNoiseB();
          }

          var weight = R1 * seededNoiseB(-maxInitialAxonValue, maxInitialAxonValue);
          var type = axonTypes[Math.floor(seededNoiseB(0, axonTypes.length - 0.01))];
        } else if (!noiseGroup && seededNoiseA() < connectionDensity[layer]) {
          var R1 = seededNoiseA();
          var R2 = seededNoiseA();

          while (R2 * R2 < R1) {
            var R1 = seededNoiseA();
            var R2 = seededNoiseA();
          }

          var weight = R1 * seededNoiseA(-maxInitialAxonValue, maxInitialAxonValue);
          var type = axonTypes[Math.floor(seededNoiseA(0, axonTypes.length - 0.01))];
        } else {
          var weight = 0;
          var type = "*";
        }

        neuronWeights.push(weight);
        neuronTypes.push(type);
      }
      layerWeights.push(neuronWeights);
      layerTypes.push(neuronTypes);
    }

    nbrain.axons.push(layerWeights);
    nbrain.types.push(layerTypes);
  }
}

// Creature.prototype feeds the neuron values through the axons, and all the way to the end of the network.
function feedForward(creature, input) {
  let network = creature.network;
  feedMain(creature, input);

  network.output = [...network.main.neurons[network.main.layerCount - 1]];

  return network.output;
}

function feedMain(creature, input) {
  applyInputs(creature, input)

  processBrain(creature);
}

function applyInputs(creature, input) {
  //insertOutput(creature);
  insertMemories(creature);
  insertInput(creature, input);
}

function insertOutput(creature) {
  let network = creature.network;

  for (let op = 0; op < creature.output.length; op++) {
    network.main.neurons[0][op] = creature.output[op] || 0;
  }
}

function insertMemories(creature) {
  let network = creature.network;

  for (let mem = 0; mem < memoryCount; mem++) {
    //creature.output.length +
    network.main.neurons[0][mem] = [].concat(...network.memories)[mem] || 0;
  }
}

function insertInput(creature, input) {
  let network = creature.network;

  for (let inp = 0; inp < input.length; inp++) {
    //creature.output.length +
    network.main.neurons[0][memoryCount + inp] = input[inp] || 0;
  }
}

function processBrain(creature) {
  let nbrain = creature.network.main;

  var neuronsInNextLayer;
  for (let layer = 0; layer < nbrain.layers.length; layer++) {
    let neuronsInLayer = neuronsInNextLayer || nbrain.layers[layer];
    neuronsInNextLayer = nbrain.layers[layer + 1];

    for (let axon = 0; axon < neuronsInNextLayer; axon++) { // Loops through each axon
      let value = 0;
      for (let neuron = 0; neuron < neuronsInLayer; neuron++) { // For each axon position (neuron in next layer) loop through all of the neurons in this layer
        if (nbrain.axons[layer][neuron][axon] == 0 || nbrain.neurons[layer][neuron] == 0) {
          continue;
        }

        let type = nbrain.types[layer][neuron][axon];
        if (type == "+") {
          value += (nbrain.neurons[layer][neuron] + nbrain.axons[layer][neuron][axon]);
        } else if (type == "*") {
          value += (nbrain.neurons[layer][neuron] * nbrain.axons[layer][neuron][axon]);
        } else if (type == "/") {
          value += (nbrain.neurons[layer][neuron] / nbrain.axons[layer][neuron][axon]);
        } else if (type == "-") {
          value += (nbrain.neurons[layer][neuron] - nbrain.axons[layer][neuron][axon]);
        }
        // add all neuron values times weight of their respective axon
      }

      nbrain.neurons[layer + 1][axon] = Math.tanh(value);
    }
  }
}

// Modifies weights of the axons
function mutate(creature) {
  let mutability = creature.mutability;

  let rand = seededNoiseA(0, 100);

  if (rand < mutability.members) {
    reproductiveMembers = seededNoiseA(minReproduceTime, maxReproductiveMembers);
  }

  rand = seededNoiseA(0, 100);
  if (rand < mutability.children / 2) {
    creature.children += 1;
    if (creature.children < minChildren) creature.children = minChildren;
  } else if (rand < mutability.children) {
    creature.children -= 1;
    if (creature.children > maxChildren) creature.children = maxChildren;
  }

  /*rand = seededNoiseA(0, 100);

  if (rand < mutability.size / 2) {
    creature.size /= 1.03;
    if (creature.size < minCreatureSize) creature.size = minCreatureSize;
  } else if (rand < mutability.size) {
    creature.size *= 1.03;
    if (creature.size > maxCreatureSize) creature.size = maxCreatureSize;
  }*/

  rand = seededNoiseA(0, 100);

  if (rand < mutability.size / 10) {
    creature.size /= 1.1;
    if (creature.size < minCreatureSize) creature.size = minCreatureSize;
  } else if (rand < mutability.size / 5) {
    creature.size *= 1.1;
    if (creature.size > maxCreatureSize) creature.size = maxCreatureSize;
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
      else if (eye.distance > maxEyeDistance) eye.distance = maxEyeDistance;
    }

    rand = seededNoiseA(0, 100);

    if (rand < mutability.eyes.number / 2 && creature.eyes.length < maxEyes) {
      creature.eyes.push(new Eye(undefined, undefined, false));
    } else if (rand < mutability.eyes.number && creature.eyes.length > minEyes) {
      creature.removedEyes.push(i);
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

function mutateNet(creature, network) {
  let nbrain = network.main;

  let layers = nbrain.layers.length - 1;
  for (let layer = 0; layer < layers; layer++) {
    let neurons = nbrain.layers[layer];
    let neuronsInNextLayer = nbrain.layers[layer + 1];

    for (let axon = 0; axon < neuronsInNextLayer; axon++) {
      for (let neuron = 0; neuron < neurons; neuron++) {
        let randomNumber = seededNoiseA(0, 100);
        if (randomNumber < creature.mutability.brain * 1 / 7) {
          nbrain.axons[layer][neuron][axon] += seededNoiseA(-stepAdd, stepAdd);
        } else if (randomNumber < creature.mutability.brain * 2 / 7) {
          nbrain.axons[layer][neuron][axon] *= Math.floor(seededNoiseA(-4, 4));
        } else if (randomNumber < creature.mutability.brain * 3 / 7) {
          nbrain.axons[layer][neuron][axon] %= seededNoiseA(0, 8);
        } else if (randomNumber < creature.mutability.brain * 4 / 7) {
          nbrain.types[layer][neuron][axon] = "+";
        } else if (randomNumber < creature.mutability.brain * 5 / 7) {
          nbrain.types[layer][neuron][axon] = "-";
        } else if (randomNumber < creature.mutability.brain * 6 / 7) {
          nbrain.types[layer][neuron][axon] = "/";
        } else if (randomNumber < creature.mutability.brain * 7 / 7) {
          nbrain.types[layer][neuron][axon] = "*";
        }
      }
    }
  }
}

function copyNeuralNetwork(creature, copy) {
  brain = "main";

  let netw = copy.network[brain].layers[0] < creature.network[brain].layers[0] ? copy.network[brain] : creature.network[brain];

  for (let layer = 0; layer < netw.axons.length; layer++) {
    for (let neuron = 0; neuron < netw.axons[layer].length; neuron++) {
      for (let axon = 0; axon < netw.axons[layer][neuron].length; axon++) {
        creature.network[brain].axons[layer][neuron][axon] = copy.network[brain].axons[layer][neuron][axon];
        creature.network[brain].types[layer][neuron][axon] = copy.network[brain].types[layer][neuron][axon];
      }
    }
  }
};

Array.prototype.copyValues = function(e) {
  let tempArray = [];
  for (let i = 0; i < this.length; i++) {
    tempArray.push(this[i]);
  }
  return tempArray;
}