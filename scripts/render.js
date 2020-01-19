let maxTileFoodOverHundred = maxTileFood / 100;
let multiple = tileSize * zoomLevel;

function render() {
  renderClear();
  renderTiles();
  renderOutline();
  renderCreatures();
  renderUI();
  renderSelectedCreature();
  if (speciesGraphOn) renderSpeciesGraph();
}

function renderClear() {
  ctx.clearRect(0, 0, display.width, display.height);
  ctz.clearRect(0, 0, viewport.width, viewport.height);
}

function renderTiles() {
  let middleX = (waterScrollX + 1920 / 2 * 100 - tileSize * mapSize / 2) * zoomLevel;
  let middleY = (waterScrollY + 1080 / 2 * 100 - tileSize * mapSize / 2) * zoomLevel;

  ctx.drawImage(waterTexture, -cropx - middleX - 1919 / 2 * 100 * zoomLevel, -cropy - middleY - 1079 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);
  ctx.drawImage(waterTexture, -cropx - middleX - 1919 / 2 * 100 * zoomLevel, -cropy - middleY + 1080 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);
  ctx.drawImage(waterTexture, -cropx - middleX + 1920 / 2 * 100 * zoomLevel, -cropy - middleY - 1079 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);
  ctx.drawImage(waterTexture, -cropx - middleX + 1920 / 2 * 100 * zoomLevel, -cropy - middleY + 1080 / 2 * 100 * zoomLevel, 1920 * 100 * zoomLevel, 1080 * 100 * zoomLevel);

  //let hue = 50 + 50 * (Math.sin(tick / dayLength) + 1) / 2;
  //let huePrefix = "hsl(" + hue + ", ";

  let saturation = 65 + Math.floor(Math.abs(Math.sin(tick / dayLength * 3.14)) * 20)

  for (let row = 0; row < mapSize; row++) {
    for (let column = 0; column < mapSize; column++) {
      let tile = map[row][column];
      if (tile != null) {
        let hue = Math.min(Math.floor(45 + 50 * (tile.food / maxTileFood)), maxTileHue);

        //if (tile.type == 1) ctx.fillStyle = huePrefix + saturation + "%, 25%)";
        //else
        ctx.fillStyle = "hsl(" + hue + ", " + saturation + "%, 20%)";
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

      let pos = [Math.floor(creature.x / tileSize + Math.cos(creature.rotation)), Math.floor(creature.y / tileSize + Math.sin(creature.rotation))];
      ctx.fillRect(pos[0] * zoomLevel * tileSize - cropx, pos[1] * zoomLevel * tileSize - cropy, multiple, multiple);
    }

    ctx.lineWidth = 10 * zoomLevel;

    let color = creature.color.split(",");
    color[1] = Math.floor(20 + creature.energy / maxCreatureEnergy * 80) + "%";
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

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.font = "48px Calibri";
    ctx.lineWidth = 5;

    ctx.textAlign = "left";
    ctx.strokeText("Day " + (tick / dayLength).toFixed(1), 40, 980);
    ctx.fillText("Day " + (tick / dayLength).toFixed(1), 40, 980);

    ctx.strokeText(population + " Evos", 40, 1040);
    ctx.fillText(population + " Evos", 40, 1040);

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
      ctz.strokeText(map[tilex][tiley].food.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
      ctz.fillText(map[tilex][tiley].food.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);

      ctz.beginPath();
      ctz.strokeStyle = "#ffffff";
      ctz.lineWidth = 2;
      ctz.rect(tilex * multiple - cropx, tiley * multiple - cropy, multiple + 2, multiple + 2);
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
      ctz.lineWidth = 2;

      ctz.strokeStyle = "#ffffff";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.gross.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.gross.splice(0, 1);
        ctz.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.gross[i] * energyGraphMult * energyGraphEnergyTotalMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#aaffff";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.net.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.net.splice(0, 1);
        ctz.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.net[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#ffaa00";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.metabolism.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.metabolism.splice(0, 1);
        ctz.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.metabolism[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#ff2233";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.attack.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.attack.splice(0, 1);
        ctz.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.attack[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#aa88ff";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.move.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.move.splice(0, 1);
        ctz.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.move[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#00ff00";
      ctz.beginPath();
      for (let i = selectedCreature.energyGraph.eat.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.eat.splice(0, 1);
        ctz.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.eat[i] * energyGraphMult);
      }
      ctz.stroke();

      ctz.strokeStyle = "#000000";
      ctz.beginPath();
      ctz.moveTo(energyGraphX, energyGraphY);
      ctz.lineTo(energyGraphX + energyGraphWidth, energyGraphY);
      ctz.stroke();

      ctz.strokeStyle = "#000000";
      ctz.fillStyle = "#ffffff";

      ctz.textAlign = "left";
      ctz.strokeText(selectedCreature.species, 20, 30);
      ctz.fillText(selectedCreature.species, 20, 30);

      if (selectedCreature.age / dayLength >= 10) {
        ctz.strokeText((selectedCreature.age / dayLength).toFixed(1) + " days old", 20, 70);
        ctz.fillText((selectedCreature.age / dayLength).toFixed(1) + " days old", 20, 70);
      } else {
        ctz.strokeText((selectedCreature.age / dayLength * 24).toFixed(1) + " hours old", 20, 70);
        ctz.fillText((selectedCreature.age / dayLength * 24).toFixed(1) + " hours old", 20, 70);
      }
    }

    renderSelectedBrain();

    if (zoomLevel >= 0.05) {
      cropx -= (cropx - (selectedCreature.x * zoomLevel - canvas.width / 2)) / ((1 / panSpeed) / zoomLevel);
      cropy -= (cropy - (selectedCreature.y * zoomLevel - canvas.height / 2)) / ((1 / panSpeed) / zoomLevel);
    }
  }
}

function renderSelectedBrain() {
  if (debugMode) {
    for (let brain in selectedCreature.network) {
      if (brainNames.indexOf(brain) == -1) continue;
      renderBrain(selectedCreature.network[brain]);
    }
  }
}

function renderSpeciesGraph() {
  if (speciesGraph.length == 0) return;

  ctz.lineWidth = 1;

  ctz.strokeStyle = "black";
  ctz.lineCap = "bevel";
  ctz.lineJoin = "round"

  for (let i = speciesGraph.length - 1; i >= 0; i--) {
    let alpha = 1;
    if (i > 0) {
      alpha = 1; //(0.6 + 1 / (speciesGraph[i][0] - speciesGraph[i - 1][0])) / 2;
    }

    ctz.fillStyle = speciesColors[i].replace(")", ", " + alpha + ")");
    ctz.beginPath();
    for (let j = speciesGraphSmooth; j < speciesGraph[i].length; j += speciesGraphSmooth) {
      let average = 0;
      for (let k = 0; k < speciesGraphSmooth; k++) {
        average += speciesGraph[i][j - k];
      }
      average /= speciesGraphSmooth;

      ctz.lineTo(speciesGraph[i][0] / speciesGraphDetail * speciesGraphStretch + j * speciesGraphStretch + speciesGraphDial, speciesGraphY - average * speciesGraphMult);
    }

    ctz.lineTo(speciesGraph[i][0] / speciesGraphDetail * speciesGraphStretch + speciesGraph[i].length * speciesGraphStretch + speciesGraphDial, speciesGraphY);

    ctz.lineTo(speciesGraph[i][0] / speciesGraphDetail * speciesGraphStretch + speciesGraphDial, speciesGraphY);
    ctz.stroke();
    ctz.fill();
  }

  if (infoMode) {
    ctz.beginPath();
    for (let i = 0; i < 1920 / dayLength * speciesGraphDetail / speciesGraphStretch; i++) {
      ctz.moveTo(i * dayLength / speciesGraphDetail * speciesGraphStretch + speciesGraphDial % (dayLength / speciesGraphDetail * speciesGraphStretch), speciesGraphY);
      ctz.lineTo(i * dayLength / speciesGraphDetail * speciesGraphStretch + speciesGraphDial % (dayLength / speciesGraphDetail * speciesGraphStretch), speciesGraphY - speciesGraphLinesHeight);
    }
    ctz.stroke();
  }

  ctz.beginPath();
  ctz.moveTo(0, speciesGraphY);
  ctz.lineTo(1920, speciesGraphY);
  ctz.stroke();
}