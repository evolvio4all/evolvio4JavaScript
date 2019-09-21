function main() {
  if (cropy / zoomLevel > 80000) cropy = -50000 * zoomLevel;
  else if (cropy / zoomLevel < -80000) cropy = 50000 * zoomLevel;

  if (cropx / zoomLevel > 140000) cropx = -100000 * zoomLevel;
  else if (cropx / zoomLevel < -140000) cropx = 100000 * zoomLevel;
  render();

  localStorage.setItem("ticksBeforeCrash", tickList.length);
  if (population < creatureLimit) {
    let odate = new Date();
    if (Math.abs(timescale) >= 1) { // Can timescale ever go below 1?
      if (timescale > 0) {
        if (tick >= tickList.length * ticksPerCapture) {
          for (let ts = 0; ts < timescale; ts++) {
            update();
            highestSimulatedTick = tick;
          }
        } else {
          goToTick(tick + timescale);
        }
      } else if (reverseEnabled) {
        for (let ts = 0; ts < -timescale; ts++) {
          goToTick(tick - 1);
        }
      }
    } else {
      tc++;

      if (tc >= 1 / Math.abs(timescale)) {
        if (timescale > 0) {
          if (tick >= tickList.length * ticksPerCapture) {
            update();
            highestSimulatedTick = tick;
          } else goToTick(tick + 1);
        } else if (reverseEnabled) goToTick(tick - 1);

        tc = 0;
      }
    }

    let ndate = new Date();

    if (ndate - odate > maxUpdateTime && !fastforward && autoMode && timescale > 1) {
      timescale--;
    } else if (ndate - odate < minUpdateTime && !fastforward && autoMode) {
      timescale++;
    }
  }
}

function goToTick(toTick) {
  tick = toTick;
  if (toTick > highestSimulatedTick) tick = highestSimulatedTick;

  let tickTick = Math.floor(tick / ticksPerCapture);
  if (tickList[tickTick - 1] == null || tickTick == lastTick) return;

  let varList = tickList[tickTick - 1].split(";;;");
  creatures = JSON.parse(varList[0]);
  //map = JSON.parse(varList[1]);

  lastTick = tickTick;
}

function replaceTick() {
  tickList.splice(-1);
  tickList.push(JSON.stringify(creatures, replacer));
}

function saveTick() {
  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i];
    for (let graph in creature.energyGraph) {
      for (let i = creature.energyGraph[graph].length - 1; i >= 0; i--) {
        if (i > 140) creature.energyGraph[graph].splice(0, 1);
      }
    }
  }

  tickList.push(JSON.stringify(creatures));
}

function update() {
  if (tick % ticksPerCapture == (ticksPerCapture - 1) && tick != (ticksPerCapture - 1) && reverseEnabled) replaceTick();

  tick++;

  waterScrollX += waterDirection * 2 - 1;
  waterScrollY += waterDirection * 2 - 1;

  if (Math.abs(waterScrollX) > 1000) waterDirection = !waterDirection;

  if (tick % speciesGraphDetail == 0) {
    let stackedThisTick = 0;
    for (let j = 0; j < speciesCountList.length; j++) {
      if (speciesCountList[j].length == 0) continue;

      if (speciesGraph[j].length == 0) speciesGraph[j].push(tick);
      speciesGraph[j].push(speciesCountList[j].length);
      stackedThisTick = speciesCountList[j].length;
    }
  }

  if (season === 0) {
    seasonUp = true;
    year++;
  } else if (season == growSeasonLength + dieSeasonLength) {
    seasonUp = false;
    if (dieSeasonGrowRate > minDieRate) dieSeasonGrowRate -= dieRateReduction;
    if (growSeasonGrowRate > minGrowRate) growSeasonGrowRate -= growRateReduction;
  }

  if (seasonUp) season++;
  else season--;

  if (season % mapUpdateDelay === 0 && population < foodImposedCreatureLimit) {
    for (let row = 0; row < mapSize; row++) {
      for (let column = 0; column < mapSize; column++) {
        let tile = map[row][column];
        if (tile != null && tile.type > 0) {
          if (season < growSeasonLength) {
            tile.food += growSeasonGrowRate * mapUpdateDelay * (tile.food / tile.maxFood * (1 - minGrowPercentage) + minGrowPercentage);
          } else if (tile.type == 1) {
            tile.food += dieSeasonGrowRate * mapUpdateDelay * (tile.food / tile.maxFood * (1 - minGrowPercentage) + minGrowPercentage);
          } else if (tile.type == 2) {
            tile.food += growSeasonGrowRate * mapUpdateDelay * (tile.food / tile.maxFood * (1 - minGrowPercentage) + minGrowPercentage);
          }

          if (tile.food > tile.maxFood) tile.food = tile.maxFood;
          else if (tile.food < 0) tile.food = 0;
        }
      }
    }
  }

  creatureLocations = [];
  for (let f = 0; f < mapSize; f++) {
    creatureLocations.push([]);
  }

  for (let i = population - 1; i >= 0; i--) {
    let creature = creatures[i];

    wallLock(creature);
    creatureLocations[Math.floor(creature.x / tileSize)][Math.floor(creature.y / tileSize)] = creature;
  }

  for (let i = population - 1; i >= 0; i--) {
    let creature = creatures[i];
    if (creature.age > oldest) oldest = creature.age;

    let time = (creature.age % internalClockSpeed) / internalClockSpeed * 2 - 1;

    let rotation = creature.rotation / 6.28318; // 2 * 3.14159 (PI)
    let energy = creature.energy / creatureEnergy;
    let age = creature.age / metabolismScaleTime;

    let velx = creature.velocity.x / maxCreatureSpeed;
    let vely = creature.velocity.y / maxCreatureSpeed;

    creature.input = [time, rotation, energy, age, velx, vely];

    let vision = see(creature);
    for (let i = 0; i < vision.length; i++) {
      creature.input.push(vision[i]);
    }

    creature.output = feedForward(creature, creature.input);
  }

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
  }

  if (tick % ticksPerCapture == 0 && reverseEnabled) saveTick();
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
  if (creature.energy > creatureEnergy) creature.energy = creatureEnergy;
  if (creature.energy <= 0) {
    if (creature == selectedCreature) selectedCreature = null;
    die(creature);
  }
}

let maxTileFoodOverHundred = maxTileFood / 100;
let multiple = tileSize * zoomLevel;

function render() {
  renderClear();
  renderTiles();
  renderOutline();
  renderCreatures();
  renderUI();
  renderSelectedCreature();
  if (debugMode && infoMode) renderSpeciesGraph();
}

function renderClear() {
  ctx.clearRect(0, 0, display.width, display.height);
  ctz.clearRect(0, 0, viewport.width, viewport.height);
}

function renderTiles() {
  let middleX = (waterScrollX * 20 + 1920 / 2 * 100 - tileSize * mapSize / 2) * zoomLevel;
  let middleY = (waterScrollY * 10 + 1080 / 2 * 100 - tileSize * mapSize / 2) * zoomLevel;

  ctx.drawImage(waterTexture, -cropx - middleX - 1920 / 2 * 100 * zoomLevel, -cropy - middleY - 1080 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);
  ctx.drawImage(waterTexture, -cropx - middleX - 1920 / 2 * 100 * zoomLevel, -cropy - middleY + 1080 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);
  ctx.drawImage(waterTexture, -cropx - middleX + 1920 / 2 * 100 * zoomLevel, -cropy - middleY - 1080 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);
  ctx.drawImage(waterTexture, -cropx - middleX + 1920 / 2 * 100 * zoomLevel, -cropy - middleY + 1080 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);

  let hue = (60 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 40);
  let huePrefix = "hsl(" + hue + ", ";

  for (let row = 0; row < mapSize; row++) {
    for (let column = 0; column < mapSize; column++) {
      let tile = map[row][column];
      if (tile != null) {
        let saturation = Math.floor(tile.food / maxTileFoodOverHundred);

        if (tile.type == 1) ctx.fillStyle = huePrefix + saturation + "%, 20%)";
        else ctx.fillStyle = "hsl(145, " + saturation + "%, 18%)";
        ctx.fillRect(row * multiple - cropx, column * multiple - cropy, multiple + 1, multiple + 1);
      }
    }
  }
}

function renderOutline() {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 15 * zoomLevel;

  ctx.beginPath();

  for (let i = 0; i < olength; i++) {
    ctx.moveTo(outline[i][0] * zoomLevel - cropx, outline[i][1] * zoomLevel - cropy);
    ctx.lineTo(outline[i][2] * zoomLevel - cropx, outline[i][3] * zoomLevel - cropy);
  }

  ctx.stroke();
}

function renderCreatures() {
  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i];
    let creaturex = creature.x * zoomLevel;
    let creaturey = creature.y * zoomLevel;

    if (creature.output[3] >= minAttackPower) {
      ctx.fillStyle = "rgba(255, 0, 0, " + creature.output[3] + ")";

      let pos = [Math.floor((creature.x + Math.cos(creature.rotation) * tileSize) / tileSize), Math.floor((creature.y + Math.sin(creature.rotation) * tileSize) / tileSize)];
      ctx.fillRect(pos[0] * zoomLevel * tileSize - cropx, pos[1] * zoomLevel * tileSize - cropy, tileSize * zoomLevel, tileSize * zoomLevel);
    }

    ctx.lineWidth = 10 * zoomLevel;

    let color = creature.color.split(",");
    color[1] = Math.floor(creature.energy / creatureEnergy * 100) + "%";

    ctx.fillStyle = color.join(",");
    ctx.fillCircle(creaturex - cropx, creaturey - cropy, creature.size * zoomLevel, true);

    ctx.beginPath();
    ctx.moveTo(creaturex - cropx, creaturey - cropy);
    ctx.lineTo(creaturex - cropx + Math.cos(creature.rotation) * (creature.size + 75) * zoomLevel, creaturey - cropy + Math.sin(creature.rotation) * (creature.size + 75) * zoomLevel);
    ctx.stroke();

    if (infoMode) {
      ctx.beginPath();
      ctx.moveTo(creaturex - cropx + Math.cos(creature.rotation) * creature.size * zoomLevel, creaturey - cropy + Math.sin(creature.rotation) * creature.size * zoomLevel);
      ctx.lineTo(creaturex - cropx + Math.cos(creature.rotation + Math.PI / 2) * (creature.size - 3) * creature.network.output[1] * zoomLevel, creaturey - cropy + Math.sin(creature.rotation + Math.PI / 2) * (creature.size - 3) * creature.network.output[1] * zoomLevel);
      ctx.stroke();
    }

    if (debugMode) {
      ctx.lineWidth = 2 * zoomLevel;

      let eyes = creature.eyes.length;
      for (let i = 0; i < eyes; i++) {
        let eye = creature.eyes[i];
        ctx.beginPath();
        ctx.moveTo(creaturex - cropx, creaturey - cropy);
        ctx.lineTo(creaturex - cropx + Math.cos(creature.rotation + eye.angle) * eye.distance * zoomLevel, creaturey - cropy + Math.sin(creature.rotation + eye.angle) * eye.distance * zoomLevel);
        ctx.stroke();

        ctx.fillCircle(creaturex - cropx + Math.cos(creature.rotation + eye.angle) * eye.distance * eye.tween * zoomLevel, creaturey - cropy + Math.sin(creature.rotation + eye.angle) * eye.distance * eye.tween * zoomLevel, 15 * zoomLevel, true);
      }
    }
  }
}

function renderUI() {
  if (infoMode) {
    ctz.fillStyle = "#ffffff";
    ctz.strokeStyle = "#000000";
    ctz.font = "48px Calibri";
    ctz.lineWidth = 5;

    let yearProgress = seasonUp ? season / (growSeasonLength + dieSeasonLength) / 2 : 1 - (season / (growSeasonLength + dieSeasonLength) / 2);
    ctz.textAlign = "left";
    ctz.strokeText("Year " + (year + yearProgress).toFixed(1), 40, 980);
    ctz.fillText("Year " + (year + yearProgress).toFixed(1), 40, 980);

    ctz.strokeText(population + " Evos", 40, 1040);
    ctz.fillText(population + " Evos", 40, 1040);

    if (timescale != 1) {
      ctz.textAlign = "right";
      ctz.strokeText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
      ctz.fillText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
    }

    ctz.textAlign = "center";

    if (debugMode) {
      ctz.font = "24px Calibri";
      ctz.strokeText("Seed", 40, 40);
      ctz.fillText("Seed", 40, 40);

      ctz.strokeText(seed, 40, 60);
      ctz.fillText(seed, 40, 60);
    }

    ctz.font = zoomLevel * 128 + "px Calibri";

    let tilex = Math.floor((mouse.current.x + cropx) / tileSize / zoomLevel);
    let tiley = Math.floor((mouse.current.y + cropy) / tileSize / zoomLevel);
    if (tilex >= 0 && tilex < mapSize && tiley >= 0 && tiley < mapSize && map[tilex][tiley] != null) {
      ctz.strokeText(map[tilex][tiley].food.toFixed(1), tilex * tileSize * zoomLevel - cropx + tileSize / 2 * zoomLevel, tiley * tileSize * zoomLevel - cropy + tileSize / 1.5 * zoomLevel);
      ctz.fillText(map[tilex][tiley].food.toFixed(1), tilex * tileSize * zoomLevel - cropx + tileSize / 2 * zoomLevel, tiley * tileSize * zoomLevel - cropy + tileSize / 1.5 * zoomLevel);

      ctz.beginPath();
      ctz.strokeStyle = "#ffffff";
      ctz.lineWidth = 2;
      ctz.rect(tilex * tileSize * zoomLevel - cropx, tiley * tileSize * zoomLevel - cropy, tileSize * zoomLevel + 2, tileSize * zoomLevel + 2);
      ctz.stroke();
    }
  }
}

function renderSelectedCreature() {
  if (selectedCreature !== null) {
    ctz.font = "32px Calibri";
    ctx.lineWidth = 10 * zoomLevel;

    ctx.strokeStyle = "#ffffff"
    ctx.beginPath();
    ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
    ctx.lineTo(selectedCreature.x * zoomLevel + Math.cos(selectedCreature.rotation) * (selectedCreature.size + 75) * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * (selectedCreature.size + 75) * zoomLevel);
    ctx.stroke();

    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
    ctx.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation) * (selectedCreature.size + 75) * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * (selectedCreature.size + 75) * zoomLevel);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctz.fillStyle = "#222222";
    ctz.strokeStyle = "hsl(0, 0%, 100%)";

    ctx.lineWidth = 2 * zoomLevel;
    ctx.fillStyle = selectedCreature.color;

    for (let i = 0; i < selectedCreature.eyes.length; i++) {
      let eye = selectedCreature.eyes[i];
      ctx.beginPath();
      ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
      ctx.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel);
      ctx.stroke();

      let tween = Math.min(Math.max(0, eye.tween), 1);
      ctx.fillCircle(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation + eye.angle) * eye.distance * tween * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation + eye.angle) * eye.distance * tween * zoomLevel, 15 * zoomLevel, true);
    }

    ctz.lineWidth = 3;

    if (infoMode) {
      let col = 0;
      for (let j = 0; j < selectedCreature.network.main.neurons[0].length; j++) {
        if (j % 20 == 0) col++;
        ctz.fillCircle(nnui.xoffset - (nnui.size + 5) * 18 + (nnui.size + 5) * col * 2, j % 20 * (nnui.size * 2 + 5) + nnui.yoffset, nnui.size, nnui.stroke);
      }

      for (let j = 0; j < selectedCreature.network.forget.neurons[selectedCreature.network.forget.neurons.length - 1].length; j++) {
        ctz.fillCircle(nnui.xoffset - (nnui.size + 5) * 10, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
      }

      for (let j = 0; j < selectedCreature.network.decide.neurons[selectedCreature.network.decide.neurons.length - 1].length; j++) {
        ctz.fillCircle(nnui.xoffset - (nnui.size + 5) * 8, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
      }

      for (let j = 0; j < selectedCreature.network.modify.neurons[selectedCreature.network.modify.neurons.length - 1].length; j++) {
        ctz.fillCircle(nnui.xoffset - (nnui.size + 5) * 6, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
      }

      for (let j = 0; j < selectedCreature.network.main.neurons[selectedCreature.network.main.neurons.length - 1].length; j++) {
        ctz.fillCircle(nnui.xoffset - (nnui.size + 5) * 3, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
      }

      for (let i = 0; i < selectedCreature.network.cellState.length; i++) {
        ctz.fillCircle(1920 - 60, i * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
      }

      ctz.lineWidth = 2;

      ctz.strokeStyle = "#ffffff";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.gross.length - 1; i >= 0; i--) {
        if (i > 140) selectedCreature.energyGraph.gross.splice(0, 1);
        ctz.lineTo(i * 10, 900 - selectedCreature.energyGraph.gross[i] * energyGraphMult / 10);
      }
      ctz.stroke();

      ctz.strokeStyle = "#aaffff";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.net.length - 1; i >= 0; i--) {
        if (i > 140) selectedCreature.energyGraph.net.splice(0, 1);
        ctz.lineTo(i * 10, 900 - selectedCreature.energyGraph.net[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#ffaa00";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.metabolism.length - 1; i >= 0; i--) {
        if (i > 140) selectedCreature.energyGraph.metabolism.splice(0, 1);
        ctz.lineTo(i * 10, 900 - selectedCreature.energyGraph.metabolism[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#ff2233";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.attack.length - 1; i >= 0; i--) {
        if (i > 140) selectedCreature.energyGraph.attack.splice(0, 1);
        ctz.lineTo(i * 10, 900 - selectedCreature.energyGraph.attack[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#aa88ff";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.move.length - 1; i >= 0; i--) {
        if (i > 140) selectedCreature.energyGraph.move.splice(0, 1);
        ctz.lineTo(i * 10, 900 - selectedCreature.energyGraph.move[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#00ff00";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.eat.length - 1; i >= 0; i--) {
        if (i > 140) selectedCreature.energyGraph.eat.splice(0, 1);
        ctz.lineTo(i * 10, 900 - selectedCreature.energyGraph.eat[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#000000";
      ctz.beginPath();
      ctz.moveTo(0, 900);
      ctz.lineTo(1400, 900);
      ctz.stroke();

      ctz.strokeStyle = "#000000";
      ctz.fillStyle = "#ffffff";

      ctz.textAlign = "left";
      ctz.strokeText(selectedCreature.species, 20, 20);
      ctz.fillText(selectedCreature.species, 20, 20);

      ctz.strokeText(selectedCreature.age, 20, 60);
      ctz.fillText(selectedCreature.age, 20, 60);
      ctz.textAlign = "center";

      ctz.strokeText("Cell State", 1920 - 60, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);

      ctz.strokeText("Move", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);
      ctz.strokeText("Turn", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 1 - nnui.size - 12);
      ctz.strokeText("Eat", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 2 - nnui.size - 12);
      ctz.strokeText("Attack", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 3 - nnui.size - 12);
      ctz.strokeText("Reproduce", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 4 - nnui.size - 12);

      for (let i = 0; i < memories; i++) {
        ctz.strokeText("Mem. " + i, nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * (i + 5) - nnui.size - 12);
      }

      ctz.fillText("Cell State", 1920 - 60, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);

      ctz.fillText("Move", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);
      ctz.fillText("Turn", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 1 - nnui.size - 12);
      ctz.fillText("Eat", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 2 - nnui.size - 12);
      ctz.fillText("Attack", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 3 - nnui.size - 12);
      ctz.fillText("Reproduce", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 4 - nnui.size - 12);

      for (let i = 0; i < memories; i++) {
        ctz.fillText("Mem. " + i, nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * (i + 5) - nnui.size - 12);
      }

      ctz.font = "bold 21px Calibri";

      col = 0;
      for (let j = 0; j < selectedCreature.network.main.neurons[0].length; j++) {
        if (j % 20 == 0) col++;
        ctz.fillText(selectedCreature.network.main.neurons[0][j].toFixed(1), nnui.xoffset - (nnui.size + 5) * 18 + (nnui.size + 5) * col * 2, j % 20 * (nnui.size * 2 + 5) + nnui.yoffset + 6);
      }

      for (let j = 0; j < selectedCreature.network.forget.neurons[selectedCreature.network.forget.neurons.length - 1].length; j++) {
        ctz.fillText(selectedCreature.network.forget.neurons[selectedCreature.network.forget.neurons.length - 1][j].toFixed(1), nnui.xoffset - (nnui.size + 5) * 10, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
      }

      for (let j = 0; j < selectedCreature.network.decide.neurons[selectedCreature.network.decide.neurons.length - 1].length; j++) {
        ctz.fillText(selectedCreature.network.decide.neurons[selectedCreature.network.decide.neurons.length - 1][j].toFixed(1), nnui.xoffset - (nnui.size + 5) * 8, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
      }

      for (let j = 0; j < selectedCreature.network.modify.neurons[selectedCreature.network.modify.neurons.length - 1].length; j++) {
        ctz.fillText(selectedCreature.network.modify.neurons[selectedCreature.network.modify.neurons.length - 1][j].toFixed(1), nnui.xoffset - (nnui.size + 5) * 6, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
      }

      for (let j = 0; j < selectedCreature.network.main.neurons[selectedCreature.network.main.neurons.length - 1].length; j++) {
        ctz.fillText(selectedCreature.network.main.neurons[selectedCreature.network.main.neurons.length - 1][j].toFixed(1), nnui.xoffset - (nnui.size + 5) * 3, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
      }

      for (let i = 0; i < selectedCreature.network.cellState.length; i++) {
        ctz.fillText(selectedCreature.network.cellState[i].toFixed(1), 1920 - 60, i * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
      }
    }

    if (zoomLevel >= 0.05) {
      cropx -= (cropx - (selectedCreature.x * zoomLevel - canvas.width / 2)) / ((1 / panSpeed) / zoomLevel);
      cropy -= (cropy - (selectedCreature.y * zoomLevel - canvas.height / 2)) / ((1 / panSpeed) / zoomLevel);
    }
  }
}

let width = 960;

function renderSpeciesGraph() {
  if (speciesGraph.length == 0) return;

  ctz.lineWidth = 1;
  ctz.strokeStyle = "black";
  ctz.lineCap = "round";
  ctz.lineJoint = "round";
  for (let i = speciesGraph.length - 1; i >= 0; i--) {
    let width = 1920 / tick * speciesGraphDetail;
    ctz.fillStyle = speciesColors[i].replace(")", "," + (0.6 + i / speciesGraph.length) / 2);
    ctz.beginPath();
    for (let j = 1; j < speciesGraph[i].length; j++) {
      ctz.lineTo(speciesGraph[i][0] / speciesGraphDetail * width + (j - 1) * width, 980 - speciesGraph[i][j] * speciesGraphMult);
    }
    ctz.lineTo(speciesGraph[i][0] / speciesGraphDetail * width + (speciesGraph[i].length - 2) * width, 980);

    ctz.lineTo(speciesGraph[i][0] / speciesGraphDetail * width, 980);
    ctz.stroke();
    ctz.fill();
  }

  ctz.beginPath();
  ctz.moveTo(0, 980);
  ctz.lineTo(1920, 980);
  ctz.stroke();
}