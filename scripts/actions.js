function eat(creature, tile) {
  creature.isEating = true;

  //lose energy cost to eat
  var tenergy = -energy.eat;

  if (tile == null) {
    creature.energy += tenergy;
    creature.energyGraph.eat.push(tenergy);
    return;
  }

  var eatAmount = 0;

  if (creature.output[3] >= 0) eatAmount = eatPower * Math.pow(tile.food / tile.maxFood, 1 / eatDiminishingRate);
  else eatAmount = -pukePower;

  tenergy += eatAmount * eatEffeciency;
  creature.energy += tenergy;

  creature.energyGraph.eat.push(tenergy);

  if (tile.food - eatAmount < 0) {
    tile.food = 0;
  } else if (tile.food > 0) {
    tile.food -= eatAmount;
  }
};

function metabolize(creature) {
  var timeScalar = Math.min(Math.pow(creature.age / metabolismScaleTime, metabolismScaleScale), 1);
  var sizeScalar = (1 - sizeMetabolismFactor) + ((creature.size - minCreatureSize) / maxCreatureSize) * sizeMetabolismFactor;
  var weightScalar = (1 - weightMetabolismFactor) + (creature.energy / maxCreatureEnergy) * weightMetabolismFactor;

  var tenergy = -(maxMetabolism - minMetabolism) * timeScalar * sizeScalar * weightScalar - minMetabolism;
  creature.energy += tenergy;

  creature.energyGraph.metabolism.push(tenergy);
};

function move(creature, tile) {
  if (!creature.rotateTime) creature.rotateTime = 1;

  var tenergy = 0;

  var forwardAcceleration = maxAcceleration * creature.output[0];
  var horizontalAcceleration = maxAcceleration * creature.output[1] * horizontalAccelerationModifier;

  var xMoveAmount = Math.cos(creature.rotation + Math.PI / 2) * horizontalAcceleration + Math.cos(creature.rotation) * forwardAcceleration;
  var yMoveAmount = Math.sin(creature.rotation + Math.PI / 2) * horizontalAcceleration + Math.sin(creature.rotation) * forwardAcceleration;

  if (creature.isEating) {
    xMoveAmount *= eatingSpeed;
    yMoveAmount *= eatingSpeed;
  }

  if (tile == null) {
    xMoveAmount *= swimmingSpeed;
    yMoveAmount *= swimmingSpeed;
  }

  creature.velocity.x += xMoveAmount;
  creature.velocity.y += yMoveAmount;

  tenergy -= energy.move;
  creature.energy += tenergy;

  creature.energyGraph.move.push(tenergy);
};

function rotate(creature) {
  var tenergy = 0;

  tenergy -= energy.rotate;

  creature.rotation += rotationSpeed * creature.output[2];
  creature.rotation = creature.rotation % (2 * Math.PI);

  for (let i = 0; i < creature.eyes.length; i++) {
    var eye = creature.eyes[i];

    eye.googleAngle += rotationSpeed * creature.output[2];
  }

  creature.energy += tenergy;
}

function reproduce(creature) {
  /*if (creature.output[4] < minSpawnPower) {
    //creature.energyGraph.spawn.push(0);
    return;
  }*/

  var nearbyMembers = 1;
  //var tenergy = 0;
  if (creature.reproductiveMembers > 1) {
    var searchArea = Math.PI * reproduceRange * reproduceRange;
    var searchRing = 0;
    var angle = 0;

    for (let j = 0; j < searchArea; j++) {
      angle += 1 / (2 * Math.PI * searchRing);
      angle = angle % (Math.PI * 2);
      var searchX = Math.floor(searchRing * Math.cos(angle));
      var searchY = Math.floor(searchRing * Math.sin(angle));
      if (creatureLocations[searchX] && creatureLocations[searchX][searchY]) {
        var targetCreaturesList = creatureLocations[searchX][searchY];

        for (let i = 0; i < targetCreaturesList.length; i++) {
          var targetCreature = targetCreaturesList[i];

          if (targetCreature && targetCreature != creature) {
            if (creature.reproductiveMembers == targetCreature.reproductiveMembers) {
              nearbyMembers++;
            }
          }
        }
      }

      if (j == Math.PI * searchRing * searchRing / 4) searchRing++;
    }
  }


  // Random number added to desynchronize births (theoretically this would happen over time naturally, but it would take a long time and synchronized birth has an undesired impacts on user-experience)
  if (creature.reproductiveMembers >= nearbyMembers) {
    var startEnergy = creature.energy;

    for (let i = 0; i < creature.children; i++) {
      let birthCost = (creature.size / maxCreatureSize * childSizeCost + creature.eyes.length * childEyeCost + childEnergy);

      if (creature.energy >= birthCost) {
        //tenergy -= birthCost;
        creature.energy -= birthCost;

        creature.reproduceTime = 0;
      } else break;

      makeChild(creature);
    }
  }

  //creature.energyGraph.spawn.push(parseFloat(tenergy.toFixed(2)));
};

function makeChild(creature) {
  var child = new Creature(creature.x + seededNoiseA(-tileSize, tileSize), creature.y + seededNoiseA(-tileSize, tileSize), creature.species, creature.speciesGeneration, creature.color);

  child.energy = childEnergy * birthEffeciency;

  child.scentTrail = [...JSON.parse(JSON.stringify(creature.scentTrail))];

  child.eyes = [...JSON.parse(JSON.stringify(creature.eyes))];

  child.mutability = JSON.parse(JSON.stringify(creature.mutability));

  child.biases = [...JSON.parse(JSON.stringify(creature.biases))];

  child.reproductiveMembers = creature.reproductiveMembers;

  child.children = creature.children;
  child.size = creature.size;
  child.generation = creature.generation + 1;
  child.species = creature.species;

  mutate(child);
  copyNeuralNetwork(child, creature);

  var rand = seededNoiseA();
  if (rand < childMutationChance) {
    if (rand < 0.01) {
      for (var u = 0; u < 10; u++) {
        mutateNet(child, child.network);
      }
    } else {
      mutateNet(child, child.network);
    }
  }

  child.species = setSpecies(child, creature.species);

  child.rotation = seededNoiseA(0, 2 * Math.PI);

  creatures.push(child);
}

function die(creature) {
  if (specieslist[creature.species]) {
    var con = specieslist[creature.species].contains.indexOf(creature);
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

    var pos = creatures.indexOf(creature);
    creatures.splice(pos, 1);

    population--;
  }
};

function releaseScent(creature, tile) {
  tile.scent[0] += creature.scentTrail[0] * (maxCreatureScentTrail - minCreatureScentTrail) + minCreatureScentTrail;
  tile.scent[1] += creature.scentTrail[1] * (maxCreatureScentTrail - minCreatureScentTrail) + minCreatureScentTrail;
  tile.scent[2] += creature.scentTrail[2] * (maxCreatureScentTrail - minCreatureScentTrail) + minCreatureScentTrail;
}

function releaseRedScent(creature, tile) {
  tile.scent[0] += scentPlacementRate * creature.output[6];
}

function releaseGreenScent(creature, tile) {
  tile.scent[1] += scentPlacementRate * creature.output[7];
}

function releaseBlueScent(creature, tile) {
  tile.scent[2] += scentPlacementRate * creature.output[8];
}

function attack(creature) {
  var tenergy = -energy.attack;

  if (creature.age < minAttackAge || creature.reproduceTime < minAttackAge) return;

  for (let i = 0; i < creatures.length; i++) {
    var targetCreature = creatures[i];

    if (targetCreature && targetCreature != creature &&
      targetCreature.x > creature.x - attackRadius && targetCreature.x < creature.x + attackRadius &&
      targetCreature.y > creature.y - attackRadius && targetCreature.y < creature.y + attackRadius) {

      var sizeDiff = Math.max(creature.size - targetCreature.size, 0) / maxCreatureSize + 0.2;

      targetCreature.energy -= attackPower * sizeDiff;
      if (!targetCreature.isAttacking) tenergy += attackPower * sizeDiff * attackEffeciency + Math.min(targetCreature.energy, 0);
    }
  }

  creature.energy += tenergy;

  creature.energyGraph.attack.push(parseFloat(tenergy.toFixed(2)));
};

function adjustEyes(creature) {
  var eyes = creature.eyes;
  for (let i = 0; i < eyes.length; i++) {
    var eye = eyes[i];

    eye.tween = creature.output[outputs + i];
  }
}