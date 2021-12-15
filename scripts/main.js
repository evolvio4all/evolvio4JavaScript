function main() {
  if (speciesGraphAutoSmooth) {
    speciesGraphSmooth = Math.ceil(1 + tick / 20000);
  }

  if (speciesGraphAutoDial && speciesGraph.length > 0) {
    speciesGraphDial = speciesGraphX + speciesGraphWidth - tick / speciesGraphDetail * speciesGraphStretch;
  }

  checkKey();

  odate = new Date();
  simulateUpdates();
  ndate = new Date();

  if (ndate - odate > maxUpdateTime && !fastforward && autoMode && timescale > 1) {
    timescale -= (ndate - odate) / maxUpdateTime;
  } else if (ndate - odate < minUpdateTime && !fastforward && autoMode) {
    timescale++;
  }

  render();
}

function simulateUpdates() {
  if (population < creatureLimit) {
    if (Math.abs(timescale) >= 1) { // Can timescale ever go below 1?
      for (let ts = 0; ts < timescale; ts++) {
        update(false);
      }
    } else {
      tc++;

      if (timescale > 0 && tc >= 1 / Math.abs(timescale)) {
        update(false);

        tc = 0;
      }
    }
  }
}

var odate = new Date();
var ndate = new Date();

function update() {
  tick++;

  highestSimulatedTick = tick;

  if (tick % speciesGraphDetail == 0) {
    var stackedThisTick = 0;

    for (let j = 0; j < speciesCountList.length; j++) {
      if (speciesCountList[j].length == 0) continue;

      if (speciesGraph[j].length == 0) speciesGraph[j].push({
        originTick: tick,
        speciesName: speciesCountList[j][0].species,
        eyes: speciesCountList[j][0].eyes.length
      });

      speciesGraph[j].push(stackedThisTick + speciesCountList[j].length);
      stackedThisTick += speciesCountList[j].length;
    }
  }

  updateMap();

  updateCreatureLocations();

  updateCreatures();
}

function updateMap() {
  // Cycle through tiles //
  updateScentBuffer();
  updateMapScent();

  updateMapFood();
}

function updateScentBuffer() {
  if (tick % scentUpdateDelay === 0) {
    for (let row = 0; row < mapSize; row++) {
      for (let column = 0; column < mapSize; column++) {
        var tile = map[row][column];

        // If tile isn't water //
        if (tile != null && tile.type > 0) {
          for (let x = 0; x < tile.scent.length; x++) {
            tile.scentBuffer[x] = tile.scent[x];
          }
        }
      }
    }
  }
}

function updateMapScent() {
  if (tick % scentUpdateDelay === 0) {
    for (let row = 0; row < mapSize; row++) {
      for (let column = 0; column < mapSize; column++) {
        var tile = map[row][column];

        // If tile isn't water //
        if (tile != null && (tile.scent[0] > 0 || tile.scent[1] > 0 || tile.scent[2] > 0)) {
          for (let x = 0; x < tile.scent.length; x++) {
            var diffRight = tile.scentBuffer[x] * scentSpreadRate;
            var diffLeft = tile.scentBuffer[x] * scentSpreadRate;
            var diffUp = tile.scentBuffer[x] * scentSpreadRate;
            var diffDown = tile.scentBuffer[x] * scentSpreadRate;

            if (map[row - 1] && map[row - 1][column]) {
              diffLeft = Math.max(tile.scentBuffer[x] - map[row - 1][column].scentBuffer[x], 0) * scentSpreadRate;
              map[row - 1][column].scent[x] += diffLeft * scentUpdateDelay;
            }
            if (map[row + 1] && map[row + 1][column]) {
              diffRight = Math.max(tile.scentBuffer[x] - map[row + 1][column].scentBuffer[x], 0) * scentSpreadRate;
              map[row + 1][column].scent[x] += diffRight * scentUpdateDelay;
            }
            // Up and down //
            if (map[row][column + 1]) {
              diffDown = Math.max(tile.scentBuffer[x] - map[row][column + 1].scentBuffer[x], 0) * scentSpreadRate;
              map[row][column + 1].scent[x] += diffDown * scentUpdateDelay;
            }

            if (map[row][column - 1]) {
              diffUp = Math.max(tile.scentBuffer[x] - map[row][column - 1].scentBuffer[x], 0) * scentSpreadRate;
              map[row][column - 1].scent[x] += diffUp * scentUpdateDelay;
            }

            tile.scent[x] -= (diffLeft + diffRight + diffUp + diffDown + scentDeplenishRate) * scentUpdateDelay;

            if (tile.scent[x] > maxTileScent) tile.scent[x] = maxTileScent;
            else if (tile.scent[x] < 0) tile.scent[x] = 0;
          }
        }
      }
    }
  }
}

function updateMapFood() {
  if (tick % foodUpdateDelay === 0 && population < foodImposedCreatureLimit) {
    for (let row = 0; row < mapSize; row++) {
      for (let column = 0; column < mapSize; column++) {
        var tile = map[row][column];

        if (tile != null && tile.type > 0) { // If tile isn't water //
          if (tile.type == 1) { // If tile is grass //

            // add food based on season //
            tile.food += (winterGrowRate + Math.abs(Math.sin(tick / dayLength * 3.14)) * (springGrowRate - winterGrowRate)) * foodUpdateDelay;

            // Spread grass to all touching tiles //
            // Left and right //
            if (map[row - 1] && map[row - 1][column]) map[row - 1][column].food += Math.max(tile.food - map[row - 1][column].food, 0) * grassSpreadRate * foodUpdateDelay;
            if (map[row + 1] && map[row + 1][column]) map[row + 1][column].food += Math.max(tile.food - map[row + 1][column].food, 0) * grassSpreadRate * foodUpdateDelay;
            // Up and down //
            if (map[row][column + 1]) map[row][column + 1].food += Math.max(tile.food - map[row][column + 1].food, 0) * grassSpreadRate * foodUpdateDelay;
            if (map[row][column - 1]) map[row][column - 1].food += Math.max(tile.food - map[row][column - 1].food, 0) * grassSpreadRate * foodUpdateDelay;
          } else if (tile.type == 2) { // If tile is evergreen //
            // add food //
            tile.food += everGreenGrowRate * foodUpdateDelay;
            // Left and right //
            if (map[row - 1] && map[row - 1][column]) map[row - 1][column].food += Math.max(tile.food - map[row - 1][column].food, 0) * everGreenGrassSpreadRate * foodUpdateDelay;
            if (map[row + 1] && map[row + 1][column]) map[row + 1][column].food += Math.max(tile.food - map[row + 1][column].food, 0) * everGreenGrassSpreadRate * foodUpdateDelay;
            // Up and down //
            if (map[row][column + 1]) map[row][column + 1].food += Math.max(tile.food - map[row][column + 1].food, 0) * everGreenGrassSpreadRate * foodUpdateDelay;
            if (map[row][column - 1]) map[row][column - 1].food += Math.max(tile.food - map[row][column - 1].food, 0) * everGreenGrassSpreadRate * foodUpdateDelay;
          }

          if (tile.food > tile.maxFood) tile.food = tile.maxFood;
          else if (tile.food < 0) tile.food = 0;
        }
      }
    }
  }
}

function updateCreatureLocations() {
  creatureLocations.length = 0;
  for (let x = 0; x < mapSize; x++) {
    creatureLocations.push([]);
    for (let y = 0; y < mapSize; y++) {
      creatureLocations[x].push([]);
    }
  }

  for (let p = creatures.length - 1; p >= 0; p--) {
    var creatureX = Math.floor(creatures[p].x / tileSize);
    var creatureY = Math.floor(creatures[p].y / tileSize);

    if (creatureLocations[creatureX] && creatureLocations[creatureX][creatureY]) {
      creatureLocations[creatureX][creatureY].push(creatures[p]);
    }
  }
}

function updateCreatures() {
  for (let i = creatures.length - 1; i >= 0; i--) {
    var creature = creatures[i];

    updateCreaturesBrain(creature);
  }

  for (let i = creatures.length - 1; i >= 0; i--) {
    var creature = creatures[i];

    updateCreatureStates(creature);
  }

  for (let i = creatures.length - 1; i >= 0; i--) {
    var creature = creatures[i];

    updateCreaturesFinal(creature);
  }
}

function updateCreaturesBrain(creature) {
  if (creature.age > oldest) oldest = creature.age;

  var fastClock = Math.sin(creature.age / fastInternalClockSpeed);

  var rotation = creature.rotation / 6.28318; // 2 * 3.14159 (PI)
  var energy = creature.energy / maxCreatureEnergy;

  var age = creature.age / metabolismScaleTime;

  var xvel = creature.velocity.x / maxCreatureSpeed;
  var yvel = creature.velocity.y / maxCreatureSpeed;

  var size = creature.size / maxCreatureSize;

  var tile;

  var nose = [0, 0, 0];

  var columnInFront = Math.floor(creature.x / tileSize + Math.cos(creature.rotation));
  var rowInFront = Math.floor(creature.y / tileSize + Math.sin(creature.rotation));

  if (map[columnInFront] && map[columnInFront][rowInFront]) {
    tile = map[columnInFront][rowInFront];

    nose = [tile.scent[0] / maxTileScent, tile.scent[1] / maxTileScent, tile.scent[2] / maxTileScent];
  }

  creature.input = [1, fastClock, energy, age, xvel, yvel, nose[0], nose[1], nose[2]];

  var vision = see(creature);
  for (let i = 0; i < vision.length; i++) {
    creature.input.push(vision[i]);
  }

  creature.output = feedForward(creature, creature.input);

  updateMemory(creature);
}

function updateMemory(creature) {
  var memoryLayer = creature.network.memories;
  for (let i = 0; i < memories.length - 1; i++) {
    memoryLayer = memoryLayer[Math.floor((creature.output[9 + i] + 1) / 2 * (memories[i] / 1.001))];
  }

  memoryLayer[Math.floor((creature.output[9 + memories.length - 1] + 1) / 2 * (memories[memories.length - 1] / 1.001))] = creature.output[9 + memories.length];
}

function updateCreatureStates(creature) {
  var largest = 0;
  var action = -1;
  for (let i = 2; i < 5; i++) {
    if (Math.abs(creature.output[i]) > 0.2 && Math.abs(creature.output[i]) > largest) {
      action = i;
      largest = Math.abs(creature.output[i]);
    }
  }

  creature.stateAction = action;

  if (action == 4) creature.isAttacking = true;
  else creature.isAttacking = false;
}

function updateCreaturesFinal(creature) {
  var DEBUG_VARIABLE_INDEX = creatures.indexOf(creature);
  if (tick == 233096 && DEBUG_VARIABLE_INDEX == 36) DEV_DEBUG_MODE = true;

  wallLock(creature);

  act(creature);

  clampSize(creature);

  creature.energyGraph.net.push(creature.energy - creature.lastEnergy);

  creature.energyGraph.gross.push(creature.energy);

  creature.lastEnergy = creature.energy;

  if (creature.energy > maxCreatureEnergy) {
    creature.energy = maxCreatureEnergy;
  }
}

function wallLock(creature) {
  if (creature.x < 0) {
    creature.x = 1;
  } else if (creature.x >= mapSize * tileSize) {
    creature.x = mapSize * tileSize - 1;
  }

  if (creature.y < 0) {
    creature.y = 1;
  } else if (creature.y >= mapSize * tileSize) {
    creature.y = mapSize * tileSize - 1;
  }
}

function clampSize(creature) {
  //if (creature.energy > maxCreatureEnergy) creature.energy = maxCreatureEnergy;
  if (creature.energy <= 0) {
    if (creature == selectedCreature) {
      selectedCreature = null;
    }

    die(creature);
  }
}