let maxTileFoodOverHundred = maxTileFood / 100;
let multiple = tileSize * zoomLevel;

function render() {
  renderClear();
  if (!brainDisplayMode) {
    renderTiles();
    renderOutline();
    renderCreatures();
  }
  if (speciesGraphOn) renderSpeciesGraph();
  renderUI();
  renderSelectedCreature();
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

  let saturation = 65 + Math.floor(Math.abs(Math.sin(tick / dayLength * 3.14)) * 20);

  for (let row = 0; row < mapSize; row++) {
    for (let column = 0; column < mapSize; column++) {
      let tile = map[row][column];
      if (tile != null) {
        let hue = 0;
        if (scentMode) {
          hue = Math.floor(250 + 120 * ((tile.scent + 0.01) / maxTileScent));
          saturation = 80;
        } else hue = Math.min(Math.floor(45 + 50 * ((tile.food + 0.01) / maxTileFood)), maxTileHue);

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
    ctx.strokeText("Day " + (tick / dayLength).toFixed(1), 40, 1040);
    ctx.fillText("Day " + (tick / dayLength).toFixed(1), 40, 1040);

    ctx.strokeText(population + " Evos", 40, 995);
    ctx.fillText(population + " Evos", 40, 995);

    if (timescale != 1) {
      ctz.textAlign = "right";
      ctz.strokeText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
      ctz.fillText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
    }

    ctz.textAlign = "right";

    if (debugMode) {
      ctz.font = "24px Calibri";
      ctz.strokeText("Seed", 1920 - 20, 85);
      ctz.fillText("Seed", 1920 - 20, 85);

      ctz.strokeText(seed, 1920 - 20, 110);
      ctz.fillText(seed, 1920 - 20, 110);
    }

    ctz.textAlign = "center";

    ctz.font = zoomLevel * 128 + "px Calibri";

    let tilex = Math.floor((mouse.current.x + cropx) / tileSize / zoomLevel);
    let tiley = Math.floor((mouse.current.y + cropy) / tileSize / zoomLevel);
    if (tilex >= 0 && tilex < mapSize && tiley >= 0 && tiley < mapSize && map[tilex][tiley] != null) {
      if (scentMode) {
        ctz.strokeText(map[tilex][tiley].scent.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
        ctz.fillText(map[tilex][tiley].scent.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
      } else {
        ctz.strokeText(map[tilex][tiley].food.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
        ctz.fillText(map[tilex][tiley].food.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
      }

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

      ctz.textAlign = "right";
      ctz.lineWidth = 4;
      ctz.strokeText(selectedCreature.species, 1920 - 20, 30);
      ctz.fillText(selectedCreature.species, 1920 - 20, 30);

      if (selectedCreature.age / dayLength >= 10) {
        ctz.strokeText((selectedCreature.age / dayLength).toFixed(1) + " days old", 1920 - 20, 60);
        ctz.fillText((selectedCreature.age / dayLength).toFixed(1) + " days old", 1920 - 20, 60);
      } else {
        ctz.strokeText((selectedCreature.age / dayLength * 24).toFixed(1) + " hours old", 1920 - 20, 60);
        ctz.fillText((selectedCreature.age / dayLength * 24).toFixed(1) + " hours old", 1920 - 20, 60);
      }
    }

    if (brainDisplayMode) renderSelectedBrain(selectedCreature);

    if (zoomLevel >= 0.05) {
      cropx -= (cropx - (selectedCreature.x * zoomLevel - canvas.width / 2)) / ((1 / panSpeed) / zoomLevel);
      cropy -= (cropy - (selectedCreature.y * zoomLevel - canvas.height / 2)) / ((1 / panSpeed) / zoomLevel);
    }
  }
}

let brainsTotalHeight = 0;

function renderSelectedBrain(creature) {
  ctx.fillStyle = "hsl(0, 0%, 50%)";
  ctx.fillRect(0, 0, 1920, 1080);

  let brainNum = 0;
  ctx.lineWidth = 1;

  brainsTotalHeight = 0;

  for (let brain in creature.network) {
    if (brainNames.indexOf(brain) == -1) continue;
    renderInput(creature, creature.network[brain], brainNum, brain);
    renderBrain(creature.network[brain], brainNum, brain);

    brainNum++;
  }

  renderCellState(creature.network.cellState, brainNum);
  renderOutput(creature.network.output, brainNum + 0.15);
}

function renderInput(creature, brain, brainNum, brainName) {
  let pastOutputs = false;
  let pastCellState = false;

  let biggestLayer = 0;
  for (let l = 1; l < brain.neurons.length; l++) {
    if (brain.neurons[l].length > biggestLayer) {
      biggestLayer = brain.neurons[l].length;
    }
  }

  let verticalSpacing = (1080 / (nnui.size + nnui.yspacing) - 1) / (creature.inputs + outputs + outputs);
  let verticalSpacingNext = nnui.verticalSpacingHidden; //biggestLayer / (brain.neurons[1].length - 1);

  for (let n = 0; n < brain.neurons[0].length; n++) {
    if (n >= outputs) pastOutputs = true;
    else pastOutputs = false;

    if (n >= outputs + outputs) pastCellState = true;
    else pastCellState = false;

    for (let a = 0; a < brain.axons[0][n].length; a++) {
      if (hoveredNeuron[0] == "input" && 0 == hoveredNeuron[1] && n != hoveredNeuron[2]) continue;
      if (hoveredNeuron[0] == brainName && 1 == hoveredNeuron[1] && a != hoveredNeuron[2]) continue;
      if (hoveredNeuron[0] != brainName && hoveredNeuron[1] == 1) continue;
      ctx.strokeStyle = "hsla(0, 0%, " + ((brain.axons[0][n][a] <= 0) ? 0 : 100) + "%," + Math.floor(Math.abs(brain.axons[0][n][a] * 10)) + "%)";

      ctx.beginPath();
      ctx.moveTo(nnui.xoffset, nnui.yoffset + ((n + pastOutputs + pastCellState) * verticalSpacing) * nnui.yspacing);
      ctx.lineTo(nnui.xoffset + nnui.xspacing, nnui.yoffset + (a * verticalSpacingNext + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy);
      ctx.stroke();
    }

    if (brainNum == 0) {
      let lightness = Math.floor((brain.neurons[0][n] + 1) / 2 * 100);

      ctx.fillStyle = "hsl(0, 0%, " + lightness + "%)";
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.arc(nnui.xoffset + brainNum * nnui.brainspacingx, nnui.yoffset + ((n + pastOutputs + pastCellState) * verticalSpacing) * nnui.yspacing, nnui.size, 0, 2 * 3.14);
      ctx.stroke();
      ctx.fill();
    }
  }
}

function renderBrain(brain, brainNum, brainName) {
  let biggestLayer = 0;
  for (let l = 1; l < brain.neurons.length; l++) {
    if (brain.neurons[l].length > biggestLayer) {
      biggestLayer = brain.neurons[l].length;
    }
  }

  let pastOutputs = false;
  let pastCellState = false;
  for (let l = 1; l < brain.neurons.length; l++) {
    let verticalSpacingNext = 0;

    let verticalSpacing = nnui.verticalSpacingHidden; //biggestLayer / (brain.neurons[l].length - 1);

    if (l + 1 < brain.neurons.length) {
      verticalSpacingNext = nnui.verticalSpacingOut; //biggestLayer / (brain.neurons[l + 1].length - 1);
    }

    if (l == brain.neurons.length - 1) {
      verticalSpacing = nnui.verticalSpacingOut;
    }

    for (let n = 0; n < brain.neurons[l].length; n++) {

      if (l < brain.neurons.length - 1) {
        for (let a = 0; a < brain.axons[l][n].length; a++) {
          if (hoveredNeuron[0] == brainName && l == hoveredNeuron[1] && n != hoveredNeuron[2]) continue;
          if (hoveredNeuron[0] == brainName && l + 1 == hoveredNeuron[1] && a != hoveredNeuron[2]) continue;

          ctx.strokeStyle = "hsla(0, 0%, " + ((brain.axons[l][n][a] <= 0) ? 0 : 100) + "%," + Math.floor(Math.abs(brain.axons[l][n][a] * 10)) + "%)";

          ctx.beginPath();
          ctx.moveTo(nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + ((n + pastOutputs + pastCellState) * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy);
          ctx.lineTo(nnui.xoffset + (l + 1) * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (a * verticalSpacingNext + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy)
          ctx.stroke();
        }
      }

      let lightness = Math.floor((brain.neurons[l][n] + 1) / 2 * 100);

      ctx.fillStyle = "hsl(0, 0%, " + lightness + "%)";
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.arc(nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy, nnui.size, 0, 2 * 3.14);
      ctx.stroke();
      ctx.fill();
    }
  }

  brainsTotalHeight += biggestLayer;
}

function renderCellState(cellState, brainNum) {
  ctx.strokeStyle = "black";

  for (let n = 0; n < cellState.length; n++) {
    ctx.fillStyle = "hsl(0, 0%, " + Math.floor((cellState[n] + 1) / 2 * 100) + "%)";

    ctx.beginPath();
    ctx.arc(nnui.cellStatex, nnui.cellStatey + n * nnui.yspacing, nnui.size, 0, 2 * 3.14);
    ctx.stroke();
    ctx.fill();
  }
}

function renderOutput(output, brainNum) {
  ctx.strokeStyle = "black";

  for (let n = 0; n < output.length; n++) {
    ctx.fillStyle = "hsl(0, 0%, " + Math.floor((output[n] + 1) / 2 * 100) + "%)";

    ctx.beginPath();
    ctx.arc(nnui.outputx, nnui.outputy + n * nnui.yspacing, nnui.size, 0, 2 * 3.14);
    ctx.stroke();
    ctx.fill();
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

  ctz.lineWidth = 2;
  if (infoMode) {
    ctz.beginPath();
    for (let i = 0; i < 1920 / dayLength * speciesGraphDetail / speciesGraphStretch + 1; i++) {
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

function hoverSelectedNeuron(e) {
  if (selectedCreature) {
    brainsTotalHeight = 0;
    let brainNum = 0;
    hoveredNeuron = ["none", -1, -1];
    for (let brainName in selectedCreature.network) {
      if (brainNames.indexOf(brainName) < 0) continue;

      let brain = selectedCreature.network[brainName];
      let biggestLayer = 0;
      for (let l = 1; l < brain.neurons.length; l++) {
        if (brain.neurons[l].length > biggestLayer) {
          biggestLayer = brain.neurons[l].length;
        }
      }

      for (let l = 0; l < brain.neurons.length; l++) {
        let verticalSpacing = (1080 / (nnui.size + nnui.yspacing) - 1) / (selectedCreature.inputs + outputs + outputs);

        if (l == 2) {
          verticalSpacing = nnui.verticalSpacingOut;
        } else if (l == 1) {
          verticalSpacing = nnui.verticalSpacingHidden;
        }

        for (let n = 0; n < brain.neurons[l].length; n++) {
          if (l > 0) {
            if (mouse.current.x > nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx - 20 &&
              mouse.current.x < nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx + 20) {

              if (mouse.current.y > nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy - 20 &&
                mouse.current.y < nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy + 20) {

                hoveredNeuron = [brainName, l, n];
              }
            }
          } else {
            if (mouse.current.x > nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx - 20 &&
              mouse.current.x < nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx + 20) {

              if (mouse.current.y > nnui.yoffset + (n + (n > outputs - 1) + (n > outputs * 2 - 1)) * verticalSpacing * nnui.yspacing - 20 &&
                mouse.current.y < nnui.yoffset + (n + (n > outputs - 1) + (n > outputs * 2 - 1)) * verticalSpacing * nnui.yspacing + 20) {

                hoveredNeuron = ["input", l, n];
              }
            }
          }
        }
      }

      brainsTotalHeight += biggestLayer;

      brainNum++;
    }
  }
}