function Creature(x, y, spec, specGen, color) {
  //console.log("setting variables");
  var tile = Math.floor(seededNoiseA(0, spawnTiles.length));

  this.x = x || spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
  this.y = y || spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

  this.velocity = {
    x: 0,
    y: 0
  };

  this.reproductiveMembers = 1;

  this.removedEyes = [];

  this.mutability = {
    brain: 0,
    children: 0,
    childEnergy: 0,
    size: 0,
    members: 0,
    eyes: {
      number: 0,
      angle: 0,
      distance: 0
    },
    mutability: 0,
    biases: 0
  };

  this.energyGraph = {
    move: [],
    eat: [],
    attack: [],
    spawn: [],
    metabolism: [],
    gain: [],
    loss: [],
    net: [],
    gross: []
  };

  this.size = 0;

  this.energy = 0;
  this.lastEnergy = 0;

  this.age = 0;
  this.reproduceTime = 0;
  this.childEnergy = 0;
  this.children = 0;

  this.color = color || newColor(false);

  this.scentTrail = [seededNoiseA(), seededNoiseA(), seededNoiseA()];

  this.genes = [this.color, this.children, this.childEnergy];

  this.maxSpeed = maxCreatureSpeed;

  this.output = [];

  this.geneticID = "";
  this.generation = 0;
  this.speciesGeneration = specGen || 0;

  this.firstGen = false;

  //console.log("making eyes");
  this.eyes = makeEyes(false);

  population++;

  this.biases = [];
  //console.log('setting bias');
  for (let b = 0; b < biases; b++) {
    this.biases.push(seededNoiseA(-1, 1));
  }

  //console.log('creating neural network')
  createNeuralNetwork(this, false, false);

  //console.log('set species')
  this.rotation = 1;
  this.species = "";
  this.isEating = false;

  this.rotation = seededNoiseA(0, 2 * Math.PI);
}

function tickCreature(creature) {
  creature.age++;
  creature.reproduceTime++;

  creature.isEating = false;
};

function select(creature) {
  if (mouse.down.x > creature.x * zoomLevel - cropx - creature.size * zoomLevel - selectSizeAddition * zoomLevel && mouse.down.x < creature.x * zoomLevel - cropx + creature.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y < creature.y * zoomLevel - cropy + creature.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y > creature.y * zoomLevel - cropy - creature.size * zoomLevel - selectSizeAddition * zoomLevel) {
    return true;
  }

  return false;
};

function makeEyes(noiseGroup) {
  var eyes = [];
  if (noiseGroup) {
    var numEyes = Math.floor(seededNoiseB(minInitEyeCount, maxInitEyeCount + 1));
  } else {
    var numEyes = Math.floor(seededNoiseA(minInitEyeCount, maxInitEyeCount + 1));
  }

  for (let i = 0; i < numEyes; i++) {
    eyes.push(new Eye(undefined, undefined, undefined, undefined, noiseGroup));
  }

  return eyes;
}

function Eye(angle, spangle, distance, samples, noiseGroup) {
  if (noiseGroup) {
    this.angleSamples = samples ? samples.angle : Math.floor(seededNoiseB(minAngleSampleCount, maxAngleSampleCount));
    this.distanceSamples = samples ? samples.distance : Math.floor(seededNoiseB(minDistanceSampleCount, maxDistanceSampleCount));
    this.angle = angle || seededNoiseB(0, 2 * Math.PI);
    this.distance = distance || seededNoiseB(minInitEyeDistance, maxInitEyeDistance);
    this.spreadAngle = spangle || seededNoiseB(0, Math.PI * maxSpreadAngle);
  } else {
    this.angleSamples = samples ? samples.angle : Math.floor(seededNoiseA(minAngleSampleCount, maxAngleSampleCount));
    this.distanceSamples = samples ? samples.distance : Math.floor(seededNoiseA(minDistanceSampleCount, maxDistanceSampleCount));
    this.angle = angle || seededNoiseA(0, 2 * Math.PI);
    this.distance = distance || seededNoiseA(minInitEyeDistance, maxInitEyeDistance);
    this.spreadAngle = spangle || seededNoiseA(0, Math.PI * maxSpreadAngle);
  }

  this.googleAngle = Math.random() * 2 * Math.PI;

  this.distanceTween = 0;
  this.angleTween = 0;
}

function useEye(eyeTo, thisCreature) {
  var lineCoords = {
    x1: thisCreature.x,
    y1: thisCreature.y,
    x2: thisCreature.x + Math.cos(thisCreature.rotation + eyeTo.angle) * eyeTo.distance,
    y2: thisCreature.y + Math.sin(thisCreature.rotation + eyeTo.angle) * eyeTo.distance
  };

  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i];
    if (creature == thisCreature) continue;
    if (Math.dist(thisCreature.x, thisCreature.y, creature.x, creature.y) > eyeTo.distance) continue;

    if (lineCircle(lineCoords.x1, lineCoords.y1, lineCoords.x2, lineCoords.y2, creature.x, creature.y, creature.size)) {
      return [{
        creature: creature,
        distance: Math.dist(thisCreature.x, thisCreature.y, creature.x, creature.y) / eyeTo.distance
      }, "creature"];
    }
  }

  let row = map[Math.floor(lineCoords.x2 / tileSize)];
  if (row) var tile = row[Math.floor(lineCoords.y2 / tileSize)];

  if (tile === null) return [0, "water"];
  else if (tile === undefined) return [-1, "oob"];
  else if (tile.type > 0) return [tile, "tile"];

  return seeing;
}

function see(creature) {
  var output = [];
  for (let i = 0; i < creature.eyes.length; i++) {
    var eye = creature.eyes[i];
    var sight = useEye(eye, creature);

    if (sight[1] == "tile") {
      output.push(1);
      output.push(Math.min(Math.floor(45 + 50 * sight[0].food / maxTileFood), maxTileHue) / 360); // Color of tile
    } else if (sight[1] == "water") {
      output.push(1);
      output.push(-1); // Color of water
    } else if (sight[1] == "creature") {
      output.push(sight[0].distance);
      output.push(parseInt(sight[0].creature.color.split(",")[0].replace("hsl(", "")) / 360);
    } else if (sight[1] == "oob") {
      output.push(1);
      output.push(-1);
    }
  }

  return output;
}

function changeGoogleAngle(creature) {
  for (let i = 0; i < creature.eyes.length; i++) {
    var eye = creature.eyes[i];

    eye.googleAngle += 0.2 * (Math.random() * 2 - 0.9) * (creature.output[0] / (1 + Math.abs(creature.output[2])));
  }
}

function randomize(creature) {
  var tile = Math.floor(seededNoiseB(0, spawnTiles.length));

  creature.x = spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
  creature.y = spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

  creature.velocity = {
    x: 0,
    y: 0
  };

  creature.removedEyes = [];

  creature.reproductiveMembers = 1;

  creature.mutability = {
    brain: seededNoiseB(minMutability.brain, maxMutability.brain),
    children: seededNoiseB(minMutability.children, maxMutability.children),
    childEnergy: seededNoiseB(minMutability.childEnergy, maxMutability.childEnergy),
    size: seededNoiseB(minMutability.size, maxMutability.size),
    members: seededNoiseB(minMutability.members, maxMutability.members),
    eyes: {
      number: seededNoiseB(minMutability.eyes.number, maxMutability.eyes.number),
      angle: seededNoiseB(minMutability.eyes.angle, maxMutability.eyes.angle),
      distance: seededNoiseB(minMutability.eyes.distance, maxMutability.eyes.distance)
    },
    mutability: seededNoiseB(minMutability.mutability, maxMutability.mutability),
    biases: seededNoiseB(minMutability.biases, maxMutability.biases)
  };

  creature.energyGraph = {
    move: [],
    eat: [],
    attack: [],
    spawn: [],
    metabolism: [],
    gain: [],
    loss: [],
    net: [],
    gross: []
  };

  creature.scentTrail = [seededNoiseB(), seededNoiseB(), seededNoiseB()];

  creature.size = seededNoiseB(minCreatureSize, maxCreatureSize);

  creature.energy = maxCreatureEnergy;
  creature.lastEnergy = maxCreatureEnergy;
  creature.age = 0;
  creature.reproduceTime = 0;
  creature.children = Math.floor(seededNoiseB(minChildren, maxChildren));
  creature.color = newColor(true);

  creature.genes = [creature.color, creature.children, creature.childEnergy];

  creature.maxSpeed = maxCreatureSpeed;

  creature.output = [];

  creature.eyes = makeEyes(true);

  creature.biases = [];

  for (let b = 0; b < biases; b++) {
    creature.biases.push(seededNoiseB(-1, 1));
  }

  createNeuralNetwork(creature, true, true);

  creature.geneticID = "";
  creature.generation = 0;
  creature.species = "undefined";
  creature.speciesGeneration = 0;
  creature.rotation = 0;

  creature.species = setSpecies(creature, "undefined");

  creature.isEating = false;

  creature.firstGen = true;
  creature.rotation = seededNoiseB(0, 2 * Math.PI);

  firstGen++;

  reproduce(creature);
  creature.energy = maxCreatureEnergy;
};

function getPosition(creature) {
  var x = Math.floor(creature.x / tileSize);
  var y = Math.floor(creature.y / tileSize);

  return [x, y];
};

function setSpecies(creature, species) {
  var geneticID = [];
  var prefix = "";
  var prefix2 = "";
  var spGen = creature.speciesGeneration;

  creature.spIn = species;

  var network = creature.network;

  for (let j = 0; j < speciesAccuracy; j++) {
    feedForward(creature, testInput[j]);

    let mainOutputs = network.main.neurons[network.main.neurons.length - 1];
    for (let i = 0; i < mainOutputs.length; i++) {
      geneticID.push(mainOutputs[i]);
    }
  }

  creature.geneticID = geneticID;

  if (species == "undefined" || species === undefined) {
    var tries = 0;
    while (tries < maxNewSpeciesTries) {
      tries++;
      prefix = Math.floor(seededNoiseB(0, prefixes.length));
      prefix2 = Math.floor(seededNoiseB(0, prefixes.length));

      species = prefixes[prefix] + "-" + prefixes[prefix2];

      if (specieslist[species] == undefined) break;
    }

    if (tries == maxNewSpeciesTries) species = "Dud " + suffixes[0];

    creature.speciesChange = "cause of progenerator";
  } else {
    var minGeneDiff = Infinity;
    var newSpecies;

    for (let specie in specieslist) {
      var geneDiff = arrayDifference(creature.geneticID, specieslist[specie].geneticID);
      if (geneDiff < minGeneDiff) {
        minGeneDiff = geneDiff;

        newSpecies = specie;
      }
    }

    if (minGeneDiff < speciesDiversity) {
      species = newSpecies;
      creature.speciesChange = "cause of similarity";
    } else {
      var speciesStart = species.split("-")[0];

      var tries = 0;
      while (specieslist[species] !== undefined && tries < maxNewSpeciesTries) {
        tries++;

        prefix = Math.floor(seededNoiseA(0, prefixes.length));

        species = speciesStart + "-" + prefixes[prefix];
      }

      if (tries == maxNewSpeciesTries) species = "Dud " + prefixes[prefix];

      var tempcolor = creature.color.replace("hsl(", "").replace(")", "").split(",");

      if (minGeneDiff === Infinity) minGeneDiff = 0;

      tempcolor[0] = Math.floor(Math.abs(parseInt(tempcolor[0]) + speciesColorChange * minGeneDiff / speciesDiversity * seededNoiseA(-1, 1)) % 360);
      creature.color = "hsl(" + tempcolor.join(",") + ")";

      creature.speciesChange = "cause of diversity";
    }
  }

  if (specieslist[species] === undefined) {
    specieslist[species] = {};
    specieslist[species].contains = [];

    specieslist[species].geneticID = [...creature.geneticID];
  }

  specieslist[species].contains.push(creature);

  if (specieslist[species].contains.length > minCreaturesForTracking && specieslist[species].graphIndex == undefined) {
    specieslist[species].graphIndex = currentSpeciesGraphIndex;
    speciesGraph[specieslist[species].graphIndex] = [{
      originTick: tick,
      eyes: creature.eyes.length,
      speciesName: species
    }];
    speciesColors[specieslist[species].graphIndex] = creature.color;
    speciesCountList[specieslist[species].graphIndex] = specieslist[species].contains;

    currentSpeciesGraphIndex++;
  }

  creature.grvb = grvb;

  resetMemories(creature);

  return species;
};

Math.clamp = function(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

function act(creature) {
  var pos = getPosition(creature);
  var tile = map[pos[0]][pos[1]];

  tickCreature(creature);
  metabolize(creature);

  var largest = 0;
  var action = -1;

  for (let i = 2; i < 5; i++) {
    if (Math.abs(creature.output[i]) > 0.05 && Math.abs(creature.output[i]) > largest) {
      action = i;
      largest = Math.abs(creature.output[i]);
    }
  }

  if (action == 2) rotate(creature);

  if (action == 3) eat(creature, tile);
  else creature.energyGraph.eat.push(0);

  if (action == 4) attack(creature);
  else creature.energyGraph.attack.push(0);

  if (Math.abs(creature.output[0]) > minMovePower) move(creature);
  else creature.energyGraph.move.push(0);

  if (tile != null) {
    releaseRedScent(creature, tile);
    releaseGreenScent(creature, tile);
    releaseBlueScent(creature, tile);

    releaseScent(creature, tile);
  }

  creature.action = action;

  if (creature.velocity.x + creature.velocity.y >= maxCreatureSpeed) {
    creature.velocity.x -= maxAcceleration;
    creature.velocity.y -= maxAcceleration;
  }

  creature.x += creature.velocity.x;
  creature.y += creature.velocity.y;

  var frictionFromSurface;
  var frictionFromVelocity;
  if (tile) {
    if (tile.type == 1) {
      frictionFromSurface = staticFriction.grass;
      frictionFromVelocity = velocityFriction.grass;
    } else if (tile.type == 2) {
      frictionFromSurface = staticFriction.evergreen;
      frictionFromVelocity = velocityFriction.evergreen;
    }
  } else {
    frictionFromSurface = staticFriction.water;
    frictionFromVelocity = velocityFriction.water;
  }

  var fS = frictionFromSurface;
  var fV = (1 - frictionFromVelocity);
  creature.velocity.x -= fS * (creature.velocity.x >= 0 ? 1 : -1);
  creature.velocity.y -= fS * (creature.velocity.y >= 0 ? 1 : -1);

  creature.velocity.x *= fV;
  creature.velocity.y *= fV;

  if (creature.output[5] >= minSpawnPower && creature.age > reproduceAge && creature.reproduceTime > minReproduceTime) reproduce(creature);

  changeGoogleAngle(creature);
}

function spawnCreatures(num) {
  for (let i = 0; i < num; i++) {
    //console.log("creating new creature")
    creatures.push(new Creature());
    //console.log("re-randomizing it for counting purposes")
    die(creatures[i]);
  }
}