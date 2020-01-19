function main() {
  if (cropy / zoomLevel > 70000) cropy = -60000 * zoomLevel;
  else if (cropy / zoomLevel < -70000) cropy = 60000 * zoomLevel;

  if (cropx / zoomLevel > 120000 - 1920 * 3) cropx = (-120000 - 1920 * 3) * zoomLevel;
  else if (cropx / zoomLevel < -120000 - 1920 * 3) cropx = (120000 - 1920 * 3) * zoomLevel;

  if (speciesGraphAutoSmooth) {
    speciesGraphSmooth = Math.ceil(1 + tick / 20000);
  }

  if (speciesGraphAutoMult) {
    speciesGraphMult = 10800 / tick * speciesGraphDetail;
  }

  if (speciesGraphAutoDial && speciesGraph.length > 0) {
    speciesGraphDial = 1920 - tick / speciesGraphDetail * speciesGraphStretch;
  }

  checkKey();


  let odate = new Date();

  simulateUpdates();

  let ndate = new Date();

  if (ndate - odate > maxUpdateTime && !fastforward && autoMode && timescale > 1) {
    timescale--;
  } else if (ndate - odate < minUpdateTime && !fastforward && autoMode) {
    timescale++;
  }

  render();
}

function simulateUpdates() {
  if (population < creatureLimit) {
    if (Math.abs(timescale) >= 1) { // Can timescale ever go below 1?
      for (let ts = 0; ts < timescale; ts++) {
        update();
      }
    } else {
      tc++;

      if (timescale > 0 && tc >= 1 / Math.abs(timescale)) {
        update();

        tc = 0;
      }
    }
  }
}

function update() {
  tick++;
  highestSimulatedTick = tick;

  waterScrollX += 20;
  waterScrollY += 20;

  if (waterScrollX >= 23850 - 1920 * 4) {
    waterScrollX = -23850 - 1920 * 4;
  }

  if (waterScrollY >= 13475) {
    waterScrollY = -13475;
  }

  if (tick % speciesGraphDetail == 0) {
    let stackedThisTick = 0;
    for (let j = 0; j < speciesCountList.length; j++) {
      if (speciesCountList[j].length == 0) continue;

      if (speciesGraph[j].length == 0) speciesGraph[j].push(tick);
      speciesGraph[j].push(stackedThisTick + speciesCountList[j].length);
      stackedThisTick += speciesCountList[j].length;
    }
  }

  updateMap();

  creatureLocations = [];
  for (let f = 0; f < mapSize; f++) {
    creatureLocations.push([]);
  }

  for (let i = population - 1; i >= 0; i--) {
    let creature = creatures[i];

    wallLock(creature);
    creatureLocations[Math.floor(creature.x / tileSize)][Math.floor(creature.y / tileSize)] = creature;
  }

  updateCreatures();

  if (tick % ticksPerCapture == 0 && reverseEnabled) saveTick();
}

function updateMap() {
  // Cycle through tiles //
  if (tick % mapUpdateDelay === 0 && population < foodImposedCreatureLimit) {
    for (let row = 0; row < mapSize; row++) {
      for (let column = 0; column < mapSize; column++) {
        let tile = map[row][column];

        // If tile isn't water //
        if (tile != null && tile.type > 0) {
          // If tile is grass //
          if (tile.type == 1) {
            // Add grass to tile //
            tile.food += (winterGrowRate + Math.abs(Math.sin(tick / dayLength * 3.14)) * (springGrowRate - winterGrowRate)) * mapUpdateDelay;
            // If tile is evergreen //
          } else if (tile.type == 2) {
            // Add food to tile //
            tile.food += everGreenGrowRate * mapUpdateDelay;
          }


          if (tile.type == 1) {
            // Spread grass to all touching tiles //
            // Left and right //
            if (map[row - 1] && map[row - 1][column]) map[row - 1][column].food += Math.max(tile.food - map[row - 1][column].food, 0) * grassSpreadRate * mapUpdateDelay;
            if (map[row + 1] && map[row + 1][column]) map[row + 1][column].food += Math.max(tile.food - map[row + 1][column].food, 0) * grassSpreadRate * mapUpdateDelay;
            // Up and down //
            if (map[row][column + 1]) map[row][column + 1].food += Math.max(tile.food - map[row][column + 1].food, 0) * grassSpreadRate * mapUpdateDelay;
            if (map[row][column - 1]) map[row][column - 1].food += Math.max(tile.food - map[row][column - 1].food, 0) * grassSpreadRate * mapUpdateDelay;
          } else if (tile.type == 2) {
            if (map[row - 1] && map[row - 1][column]) map[row - 1][column].food += Math.max(tile.food - map[row - 1][column].food, 0) * everGreenGrassSpreadRate * mapUpdateDelay;
            if (map[row + 1] && map[row + 1][column]) map[row + 1][column].food += Math.max(tile.food - map[row + 1][column].food, 0) * everGreenGrassSpreadRate * mapUpdateDelay;
            // Up and down //
            if (map[row][column + 1]) map[row][column + 1].food += Math.max(tile.food - map[row][column + 1].food, 0) * everGreenGrassSpreadRate * mapUpdateDelay;
            if (map[row][column - 1]) map[row][column - 1].food += Math.max(tile.food - map[row][column - 1].food, 0) * everGreenGrassSpreadRate * mapUpdateDelay;
          }
        }
      }
    }


    // Loop through map again //
    for (let row = 0; row < mapSize; row++) {
      for (let column = 0; column < mapSize; column++) {
        let tile = map[row][column];
        if (tile != null && tile.type > 0) {
          // Limit amount of food in a tile //
          if (tile.food > tile.maxFood) tile.food = tile.maxFood;
          else if (tile.food < 0) tile.food = 0;
        }
      }
    }
  }
}

function updateCreatures() {
  updateCreaturesBrain();
  updateCreaturesFinal();
}

function updateCreaturesBrain() {
  for (let i = population - 1; i >= 0; i--) {
    let creature = creatures[i];
    if (creature.age > oldest) oldest = creature.age;

    let time = (creature.age % internalClockSpeed) / internalClockSpeed * 2 - 1;

    let rotation = creature.rotation / 6.28318; // 2 * 3.14159 (PI)
    let energy = creature.energy / maxCreatureEnergy;
    let age = creature.age / metabolismScaleTime;

    let velx = creature.velocity.x / maxCreatureSpeed;
    let vely = creature.velocity.y / maxCreatureSpeed;

    let size = creature.size / maxCreatureSize;

    creature.input = [time, rotation, energy, age, velx, vely, size];

    for (let i = 0; i < biases; i++) {
      creature.input.push(creature.biases[i]);
    }

    let vision = see(creature);
    for (let i = 0; i < vision.length; i++) {
      creature.input.push(vision[i]);
    }

    creature.output = feedForward(creature, creature.input);
  }
}

function updateCreaturesFinal() {
  for (let i = population - 1; i >= 0; i--) {
    let creature = creatures[i];

    act(creature);
    clampSize(creatures[i]);

    creature.energyGraph.net.push(parseFloat((creature.energy - creature.lastEnergy).toFixed(2)));
    creature.energyGraph.gross.push(parseFloat(creature.energy.toFixed(2)));

    creature.lastEnergy = creature.energy;

    for (let i = 0; i < creature.output.length; i++) {
      creature.output[i] = parseFloat(creature.output[i].toFixed(2));
    }

    if (creature.energy > maxCreatureEnergy) {
      creature.energy = maxCreatureEnergy;
    }
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
    if (creature == selectedCreature) selectedCreature = null;
    die(creature);
  }
}