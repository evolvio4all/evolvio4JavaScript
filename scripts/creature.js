function Creature(x, y, spec, specGen, color) {
  let tile = Math.floor(seededNoise(0, spawnTiles.length));

  this.x = x || spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
  this.y = y || spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

  this.velocity = {
    x: 0,
    y: 0
  };

  this.mutability = {
    brain: 0,
    children: 0,
    childEnergy: 0,
    size: 0,
    eyes: {
      number: 0,
      angle: 0,
      distance: 0
    },
    mutability: 0
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

  this.color = color || newColor();

  this.genes = [this.color, this.children, this.childEnergy];

  this.maxSpeed = maxCreatureSpeed;

  this.output = [];

  this.geneticID = "";
  this.generation = 0;
  this.speciesGeneration = specGen || 0;

  this.isEating = false;


  this.firstGen = false;

  population++;

  this.eyes = makeEyes();
  createNeuralNetwork(this);

  this.rotation = 0;
  this.species = setSpecies(this, spec);
  this.rotation = seededNoise() * 2 * Math.PI;
}

function tickCreature(creature) {
  creature.age++;
  creature.reproduceTime++;
};

function select(creature) {
  if (mouse.down.x > creature.x * zoomLevel - cropx - creature.size * zoomLevel - selectSizeAddition * zoomLevel && mouse.down.x < creature.x * zoomLevel - cropx + creature.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y < creature.y * zoomLevel - cropy + creature.size * zoomLevel + selectSizeAddition * zoomLevel && mouse.down.y > creature.y * zoomLevel - cropy - creature.size * zoomLevel - selectSizeAddition * zoomLevel) {
    return true;
  }

  return false;
};

function makeEyes(creature) {
  let eyes = [];
  let numEyes = Math.floor(seededNoise(minInitEyes, maxInitEyes + 1));

  for (let i = 0; i < numEyes; i++) {
    eyes.push(new eye());
  }

  return eyes;
}

function eye(angle, distance) {
  this.x = Math.round(seededNoise(-initEyeDistanceH, initEyeDistanceH)) * tileSize;
  this.y = Math.round(seededNoise(-initEyeDistanceV, initEyeDistanceV)) * tileSize;

  this.angle = angle || Math.atan2(this.y, this.x);
  this.distance = distance || Math.sqrt(this.x * this.x + this.y * this.y);

  this.tween = 1;
}

function useEye(eyeTo, thisCreature) {
  let out;
  let tile;

  eyeTo.tween = 1;
  let pos = [Math.floor((thisCreature.x + Math.cos(thisCreature.rotation + eyeTo.angle) * eyeTo.distance) / tileSize), Math.floor((thisCreature.y + Math.sin(thisCreature.rotation + eyeTo.angle) * eyeTo.distance) / tileSize)];
  let row = map[pos[0]];

  if (row) {
    tile = row[pos[1]];
    if (tile === undefined) return [0, "oob"];
  } else return [0, "oob"];

  for (let tween = 0; tween < 1; tween += 0.1) {
    pos = [Math.floor((thisCreature.x + Math.cos(thisCreature.rotation + eyeTo.angle) * eyeTo.distance * tween) / tileSize), Math.floor((thisCreature.y + Math.sin(thisCreature.rotation + eyeTo.angle) * eyeTo.distance * tween) / tileSize)];
    if (creatureLocations[pos[0]] && creatureLocations[pos[0]][pos[1]] && creatureLocations[pos[0]][pos[1]] != thisCreature) {
      eyeTo.tween = tween;
      return [creatureLocations[pos[0]][pos[1]], "creature"];
    }
  }

  if (tile === null) return [0, "water"];

  if (tile.type > 0) return [tile, "tile"];
}

function randomize(creature) {
  let tile = Math.floor(seededNoise(0, spawnTiles.length));

  creature.x = spawnTiles[tile].x * tileSize + tileSize / 2 || 0;
  creature.y = spawnTiles[tile].y * tileSize + tileSize / 2 || 0;

  creature.velocity = {
    x: 0,
    y: 0
  };

  creature.mutability = {
    brain: seededNoise(minMutability.brain, maxMutability.brain),
    children: seededNoise(minMutability.children, maxMutability.children),
    childEnergy: seededNoise(minMutability.childEnergy, maxMutability.childEnergy),
    size: seededNoise(minMutability.size, maxMutability.size),
    eyes: {
      number: seededNoise(minMutability.eyes.number, maxMutability.eyes.number),
      angle: seededNoise(minMutability.eyes.angle, maxMutability.eyes.angle),
      distance: seededNoise(minMutability.eyes.distance, maxMutability.eyes.distance)
    },
    mutability: seededNoise(minMutability.mutability, maxMutability.mutability)
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

  creature.size = seededNoise(minCreatureSize, maxCreatureSize);

  creature.energy = creatureEnergy / 2;
  creature.lastEnergy = creatureEnergy / 2;

  creature.age = 0;
  creature.reproduceTime = 0;
  creature.childEnergy = seededNoise(minChildEnergy, maxChildEnergy);
  creature.children = Math.floor(seededNoise(minChildren, maxChildren));

  creature.color = newColor();

  creature.genes = [creature.color, creature.children, creature.childEnergy];

  creature.maxSpeed = maxCreatureSpeed;

  creature.output = [];

  creature.eyes = makeEyes(creature);

  createNeuralNetwork(creature);

  creature.geneticID = "";
  creature.generation = 0;
  creature.species = "undefined";
  creature.speciesGeneration = 0;
  creature.rotation = 0;
  creature.species = setSpecies(creature, creature.species);

  creature.isEating = false;

  creature.firstGen = true;
  creature.rotation = seededNoise() * 2 * Math.PI;

  firstGen++;
};

function getPosition(creature) {
  let x = Math.floor(creature.x / tileSize);
  let y = Math.floor(creature.y / tileSize);

  return [x, y];
};

function setSpecies(creature, species) {
  let geneticID = [];
  let prefix = "";
  let spGen = creature.speciesGeneration;

  creature.spIn = species;

  let network = creature.network;
  for (let j = 0; j < speciesAccuracy; j++) {
    feedForward(creature, testInput[j]);

    let forgetOutputs = network.forget.neurons[network.forget.neurons.length - 1];
    for (let i = 0; i < forgetOutputs.length; i++) {
      geneticID.push(forgetOutputs[i]);
    }

    let decideOutputs = network.decide.neurons[network.decide.neurons.length - 1];
    for (let i = 0; i < decideOutputs.length; i++) {
      geneticID.push(decideOutputs[i]);
    }

    let modifyOutputs = network.modify.neurons[network.modify.neurons.length - 1];
    for (let i = 0; i < modifyOutputs.length; i++) {
      geneticID.push(modifyOutputs[i]);
    }

    let mainOutputs = network.main.neurons[network.main.neurons.length - 1];
    for (let i = 0; i < mainOutputs.length; i++) {
      geneticID.push(mainOutputs[i]);
    }
  }

  creature.geneticID = geneticID;

  if (species == "undefined" || species === undefined) {
    let tries = 0;
    while ((specieslist[species] !== undefined && tries < maxNewSpeciesTries) || species == "undefined" || species === undefined) {
      tries++;
      prefix = Math.floor(seededNoise(0, prefixes.length));
      species = prefixes[prefix] + " " + suffixes[0];
    }

    if (tries == maxNewSpeciesTries) species = "Dud " + suffixes[0];
  } else {
    let minGeneDiff = Infinity;
    let newSpecies;

    for (let specie in specieslist) {
      if (specieslist[specie].contains.length > 0 && specie.split(" ")[0] == species.split(" ")[0]) {
        let geneDiff = arrayDifference(creature.geneticID, specieslist[specie].geneticID);

        if (geneDiff < minGeneDiff) {
          minGeneDiff = geneDiff;

          newSpecies = specie;
        }
      }
    }

    if (minGeneDiff < speciesDiversity) {
      species = newSpecies.split(" ")[0];
      creature.speciesChange = "cause of similarity";
    } else {
      species = species.split(" ")[0];
      creature.speciesGeneration++;

      let tempcolor = creature.color.replace("hsl(", "").replace(")", "").split(",");
      tempcolor[0] = Math.floor((parseInt(tempcolor[0]) + speciesColorChange * minGeneDiff / speciesDiversity * seededNoise(-1, 1)) % 360);
      creature.color = "hsl(" + tempcolor.join(",") + ")";

      creature.speciesChange = "cause of diversity";
    }

    if (creature.speciesGeneration < 40) {
      for (let i = 0; i < Math.floor(creature.speciesGeneration / suffixes.length) + 1; i++) {
        species += " " + suffixes[Math.min(creature.speciesGeneration - suffixes.length * i, suffixes.length - 1)];
      }
    } else {
      species += " " + creature.speciesGeneration;
    }
  }

  if (specieslist[species] === undefined) {
    specieslist[species] = {};
    specieslist[species].contains = [];

    specieslist[species].geneticID = creature.geneticID;
  }

  specieslist[species].contains.push(creature);

  if (specieslist[species].contains.length > minCreaturesForTracking && specieslist[species].graphIndex == undefined) {
    specieslist[species].graphIndex = currentSpeciesGraphIndex;
    speciesGraph[specieslist[species].graphIndex] = [];
    speciesColors[specieslist[species].graphIndex] = creature.color;
    speciesCountList[specieslist[species].graphIndex] = specieslist[species].contains;

    currentSpeciesGraphIndex++;
  }

  return species;
};

Math.clamp = function(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

function see(creature) {
  let eyes = creature.eyes.length;
  let output = [];
  for (let i = 0; i < eyes; i++) {
    let eye = creature.eyes[i];
    let sight = useEye(eye, creature);

    if (sight[1] == "tile") {
      output.push(sight[0].food / maxTileFood / 2);
      if (sight[0].type == 1) output.push(Math.max(60 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 40, 50) / 360);
      else output.push(145 / 360);
    } else if (sight[1] == "water") {
      output.push(-1);
      output.push(220 / 360);
    } else if (sight[1] == "creature") {
      output.push(0.5 + sight[0].energy / creatureEnergy / 2);
      output.push((sight[0].color.split(",")[0].replace("hsl(", "") % 360) / 360);
    } else if (sight[1] == "oob") {
      output.push(sight[0]);
      output.push(sight[0]);
    }
  }

  return output;
}

function act(creature) {
  let pos = getPosition(creature);
  let tile = map[pos[0]][pos[1]];

  tickCreature(creature);

  attack(creature);
  reproduce(creature);
  metabolize(creature);
  move(creature);

  eat(creature, tile);

  if (tile == null) {
    creature.velocity.x *= swimmingSpeed;
    creature.velocity.y *= swimmingSpeed;
  }

  creature.x += creature.velocity.x;
  creature.y += creature.velocity.y;

  creature.x = parseFloat(creature.x.toFixed(2));
  creature.y = parseFloat(creature.y.toFixed(2));
}

function spawnCreatures(num) {
  for (let i = 0; i < num; i++) {
    creatures.push(new Creature());
    die(creatures[i]);
  }
}