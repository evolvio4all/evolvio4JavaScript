eat = function(creature, tile) {
  let eatp = creature.output[2];

  if (eatp < minEatPower) {
    creature.energyGraph.eat.push(0);
    creature.eating = false;
    return;
  } else creature.isEating = true;


  let tenergy = -energy.eat * eatp;

  if (tile == null) {
    creature.energy += tenergy;
    creature.energyGraph.eat.push(parseFloat(tenergy.toFixed(2)));
    return;
  }

  let eatAmount = eatp * eatPower * Math.pow(tile.food / maxTileFood, eatDiminishingRate);
  tenergy += eatAmount * eatEffeciency;
  creature.energy += tenergy;

  creature.energyGraph.eat.push(parseFloat(tenergy.toFixed(2)));

  if (tile.food - eatAmount < 0) {
    tile.food = 0;
  } else if (tile.food > 0) {
    tile.food -= eatAmount;
  }
};

metabolize = function(creature) {
  let scale = 0;
  scale = Math.min(Math.pow(creature.age / metabolismScaleTime, metabolismScaleScale), 1);
  let sizeScalar = (maxCreatureSize - minCreatureSize + creature.size) / maxCreatureSize;

  let tenergy = -((maxMetabolism - minMetabolism) + minMetabolism) * sizeScalar * scale;
  creature.energy += tenergy;

  creature.energyGraph.metabolism.push(parseFloat(tenergy.toFixed(2)));
};

move = function(creature) {
  if (!creature.rotateTime) creature.rotateTime = 1;

  let tenergy = 0;

  if (Math.abs(creature.output[1]) > minRotation) {
    tenergy -= energy.rotate * Math.pow(1 + Math.abs(creature.output[1]), 3);

    creature.rotation += creature.output[1] * rotationSpeed;
    creature.rotation = creature.rotation % (2 * Math.PI);
  }

  let f = (1 - friction);
  creature.velocity.x *= f;
  creature.velocity.y *= f;

  if (Math.abs(creature.output[0]) > minMoveAmount) {
    let acceleration = maxAcceleration * creature.output[0];
    tenergy -= energy.move * Math.pow(1 + Math.abs(creature.output[0]), 2)

    if (creature.isEating) {
      acceleration *= eatingSpeed;
    }

    creature.velocity.x += Math.cos(creature.rotation) * acceleration;
    creature.velocity.y += Math.sin(creature.rotation) * acceleration;

  }

  creature.energy += tenergy;

  creature.energyGraph.move.push(parseFloat(tenergy.toFixed(2)));
};

reproduce = function(creature) {
  if (creature.output[4] < minSpawnPower) {
    //creature.energyGraph.spawn.push(0);
    return;
  }

  let tenergy = 0;
  let randomNum = seededNoise();

  if (creature.age > reproduceAge && creature.reproduceTime > minReproduceTime && randomNum > 0.48 && randomNum < 0.481) {
    for (let i = 0; i < creature.children; i++) {
      if (creature.energy > creatureEnergy * creature.childEnergy) {
        let child = new Creature(creature.x + (seededNoise() * 2 - 1) * 10, creature.y + (seededNoise() * 2 - 1) * 10, creature.species, creature.speciesGeneration, creature.color);

        child.eyes = [];
        let eyes = creature.eyes.length;
        for (let i = 0; i < eyes; i++) {
          let eyeCopy = creature.eyes[i];
          child.eyes.push(new eye(eyeCopy.angle, eyeCopy.distance));
        }

        child.mutability = {};
        for (let value in creature.mutability) {
          child.mutability[value] = creature.mutability[value];
        }

        child.energy = creatureEnergy * creature.childEnergy * birthEffeciency;
        child.children = creature.children;
        child.childEnergy = creature.childEnergy;
        child.size = creature.size;
        child.generation = creature.generation + 1;

        mutate(child);

        createNeuralNetwork(child);
        copyNeuralNetwork(child, creature);

        mutateNet(child.network);
        child.rotation = seededNoise() * 2 * Math.PI;

        creatures.push(child);

        tenergy -= creature.childEnergy * creatureEnergy;
        creature.energy -= creature.childEnergy * creatureEnergy;
        creature.reproduceTime = 0;
      } else break;
    }
  }

  //creature.energyGraph.spawn.push(parseFloat(tenergy.toFixed(2)));
};

die = function(creature) {
  if (specieslist[creature.species]) {
    let con = specieslist[creature.species].contains.indexOf(creature);
    specieslist[creature.species].contains.splice(con, 1);

    if (specieslist[creature.species].contains.length === 0) {
      delete specieslist[creature.species];
    }
  }

  if (population <= minCreatures || firstGen <= minFirstGen) {
    if (creature.firstGen) firstGen--;

    randomize(creature);
  } else {
    if (creature.firstGen) firstGen--;

    let pos = creatures.indexOf(creature);
    creatures.splice(pos, 1);

    population--;
  }
};

attack = function(creature) {
  let att = creature.output[3];

  if (att < minAttackPower) {
    creature.energyGraph.attack.push(0);
    return;
  }

  let tenergy = -energy.attack * att;

  let attackPositionX = Math.floor((creature.x / tileSize) + Math.cos(creature.rotation));
  let attackPositionY = Math.floor((creature.y / tileSize) + Math.sin(creature.rotation));

  if (creatureLocations[attackPositionX]) {
    let targetCreature = creatureLocations[attackPositionX][attackPositionY] || null;
    if (targetCreature) {
      let sizeDiff = Math.max(creature.size - targetCreature.size, 0) / maxCreatureSize + 0.2;
      targetCreature.energy -= att * attackPower * sizeDiff;

      tenergy += att * attackPower * sizeDiff * attackEffeciency;
    }
  }

  creature.energy += tenergy;

  creature.energyGraph.attack.push(parseFloat(tenergy.toFixed(2)));
};

adjustEyes = function(creature) {
  let eyes = creature.eyes;
  for (let i = 0; i < eyes.length; i++) {
    let eye = eyes[i];

    eye.tween = creature.output[outputs + i];
  }
}