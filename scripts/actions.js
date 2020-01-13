function eat(creature, tile) {
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

  let eatAmount = eatp * eatPower * (1 - Math.pow(1 - Math.min(tile.food / tile.maxFood, 1), eatDiminishingRate));
  tenergy += eatAmount * eatEffeciency;
  creature.energy += tenergy;

  creature.energyGraph.eat.push(parseFloat(tenergy.toFixed(2)));

  if (tile.food - eatAmount < 0) {
    tile.food = 0;
  } else if (tile.food > 0) {
    tile.food -= eatAmount;
  }
};

function metabolize(creature) {
  let timeScalar = Math.min(Math.pow(creature.age / metabolismScaleTime, metabolismScaleScale), 1);
  let sizeScalar = (1 - sizeMetabolismFactor) + ((creature.size - minCreatureSize) / maxCreatureSize) * sizeMetabolismFactor;
  let weightScalar = (1 - weightMetabolismFactor) + (creature.energy / maxCreatureEnergy) * weightMetabolismFactor;

  let tenergy = -(maxMetabolism - minMetabolism) * timeScalar * sizeScalar * weightScalar - minMetabolism;
  creature.energy += tenergy;

  creature.energyGraph.metabolism.push(parseFloat(tenergy.toFixed(2)));
};

function move(creature) {
  if (!creature.rotateTime) creature.rotateTime = 1;

  let tenergy = 0;

  if (Math.abs(creature.output[1]) > minRotation) {
    tenergy -= energy.rotate * Math.abs(creature.output[1]);

    creature.rotation += creature.output[1] * rotationSpeed;
    creature.rotation = creature.rotation % (2 * Math.PI);
  }

  let f = (1 - friction);
  creature.velocity.x *= f;
  creature.velocity.y *= f;

  if (Math.abs(creature.output[0]) > minMoveAmount) {
    let acceleration = maxAcceleration * creature.output[0];
    tenergy -= energy.move * Math.abs(creature.output[0]);

    if (creature.isEating) {
      acceleration *= eatingSpeed;
    }

    creature.velocity.x += Math.cos(creature.rotation) * acceleration;
    creature.velocity.y += Math.sin(creature.rotation) * acceleration;
  }

  creature.energy += tenergy;

  creature.energyGraph.move.push(parseFloat(tenergy.toFixed(2)));
};

function reproduce(creature) {
  if (creature.output[4] < minSpawnPower) {
    //creature.energyGraph.spawn.push(0);
    return;
  }

  let tenergy = 0;

  // Random number added to desynchronize births (theoretically this would happen over time naturally, but it would take a long time and synchronized birth has an undesired impacts on user-experience)
  if (seededNoiseA() < 0.25 && creature.age > reproduceAge && creature.reproduceTime > minReproduceTime) {
    for (let i = 0; i < creature.children; i++) {
      if (creature.energy > maxCreatureEnergy * creature.childEnergy) {
        let child = new Creature(creature.x + (seededNoiseA() * 2 - 1) * 10, creature.y + (seededNoiseA() * 2 - 1) * 10, creature.species, creature.speciesGeneration, creature.color);

        child.eyes = [];

        let eyes = creature.eyes.length;
        for (let i = 0; i < eyes; i++) {
          let eyeCopy = creature.eyes[i];
          child.eyes.push(new eye(eyeCopy.angle, eyeCopy.distance, false));
        }

        child.mutability = {};
        for (let value in creature.mutability) {
          child.mutability[value] = creature.mutability[value];
        }

        child.energy = maxCreatureEnergy * creature.childEnergy * birthEffeciency;
        child.children = creature.children;
        child.childEnergy = creature.childEnergy;
        child.size = creature.size;
        child.generation = creature.generation + 1;

        mutate(child);

        createNeuralNetwork(child, false);
        copyNeuralNetwork(child, creature);

        mutateNet(child, child.network);
        child.rotation = seededNoiseA() * 2 * Math.PI;

        creatures.push(child);

        tenergy -= creature.childEnergy * maxCreatureEnergy;
        creature.energy -= creature.childEnergy * maxCreatureEnergy;
      } else break;
    }

    creature.reproduceTime = 0;
  }

  //creature.energyGraph.spawn.push(parseFloat(tenergy.toFixed(2)));
};

function die(creature) {
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

function attack(creature) {
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
    if (targetCreature && targetCreature != creature) {
      let sizeDiff = Math.max(creature.size - targetCreature.size, 0) / maxCreatureSize + 0.2;
      targetCreature.energy -= att * attackPower * sizeDiff;

      tenergy += att * attackPower * sizeDiff * attackEffeciency;
    }
  }

  creature.energy += tenergy;

  creature.energyGraph.attack.push(parseFloat(tenergy.toFixed(2)));
};

function adjustEyes(creature) {
  let eyes = creature.eyes;
  for (let i = 0; i < eyes.length; i++) {
    let eye = eyes[i];

    eye.tween = creature.output[outputs + i];
  }
}