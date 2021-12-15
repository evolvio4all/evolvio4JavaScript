const display = document.getElementById("canvas");
const ctx = display.getContext("2d", {
  alpha: false
});
ctx.lineCap = "round";

var maxTileFoodOverHundred = maxTileFood / 100;
var multiple = tileSize * zoomLevel;

function render() {
  renderClear();
  renderTiles();
  renderOutline();
  renderCreatures();
  renderUI();
  if (speciesGraphOn) renderSpeciesGraph();
  renderSelectedCreature();
}

function renderClear() {
  ctx.clearRect(0, 0, display.width, display.height);
}

function renderTiles() {
  ctx.fillStyle = "#249D9F";
  ctx.fillRect(0, 0, display.width, display.height);

  var saturation = 85;

  for (let row = 0; row < mapSize; row++) {
    for (let column = 0; column < mapSize; column++) {
      var tile = map[row][column];
      if (tile != null) {
        var hue = 0;

        if (scentMode) {
          ctx.fillStyle = "rgb(" + Math.floor(tile.scent[0] / maxTileScent * 255) + ", " + Math.floor(tile.scent[1] / maxTileScent * 255) + ", " + Math.floor(tile.scent[2] / maxTileScent * 255) + ")";
        } else {
          hue = Math.min(Math.floor(45 + 50 * ((tile.food + 0.01) / maxTileFood)), maxTileHue);
          ctx.fillStyle = "hsl(" + hue + ", " + saturation + "%, 20%)";
        }

        ctx.fillRect(row * multiple - cropx - 2, column * multiple - cropy - 2, multiple + 4, multiple + 4);
      }
    }
  }
}

function renderOutline() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 15 * zoomLevel;

  ctx.beginPath();
  let olength = outline.length;
  for (let i = 0; i < olength; i++) {
    ctx.moveTo(outline[i][0] * zoomLevel - cropx, outline[i][1] * zoomLevel - cropy);
    ctx.lineTo(outline[i][2] * zoomLevel - cropx, outline[i][3] * zoomLevel - cropy);
  }

  ctx.stroke();
}

function renderCreatures() {
  for (let i = 0; i < creatures.length; i++) {
    var creature = creatures[i];
    var creaturex = creature.x * zoomLevel;
    var creaturey = creature.y * zoomLevel;

    var eyes = creature.eyes.length;
    for (let i = 0; i < eyes; i++) {
      ctx.strokeStyle = "black";
      var eye = creature.eyes[i];

      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5 * zoomLevel;
      ctx.fillCircle(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + eye.angle) * creature.size * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + eye.angle) * creature.size * zoomLevel, (50 + eye.distance / maxEyeDistance * 440) * eyeSize * zoomLevel, true);
    }

    for (let i = 0; i < eyes; i++) {
      ctx.save();
      var eye = creature.eyes[i];

      ctx.beginPath();
      ctx.arc(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + eye.angle) * creature.size * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + eye.angle) * creature.size * zoomLevel, (50 + eye.distance / maxEyeDistance * 440) * eyeSize * zoomLevel, 0, 2 * Math.PI);
      ctx.clip();

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 100, 100);

      ctx.fillStyle = "black";
      ctx.save();
      ctx.beginPath();
      ctx.arc(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + eye.angle) * (creature.size + (50 + eye.distance / maxEyeDistance * 161) * pupilSize) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + eye.angle) * (creature.size + (50 + eye.distance / maxEyeDistance * 161) * pupilSize) * zoomLevel, (50 + eye.distance / maxEyeDistance * 166) * pupilSize * zoomLevel, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }

    var color = creature.color.split(",");

    color[1] = Math.floor(20 + creature.energy / maxCreatureEnergy * 150) + "%";
    ctx.fillStyle = color.join(",");

    ctx.strokeStyle = "black";
    ctx.lineWidth = 5 * zoomLevel;

    if (creature.isAttacking) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4 * zoomLevel;
      if (debugMode) ctx.strokeRect(creature.x * zoomLevel - attackRadius * zoomLevel - cropx, creature.y * zoomLevel - attackRadius * zoomLevel - cropy, attackRadius * zoomLevel * 2, attackRadius * zoomLevel * 2);
      ctx.lineWidth = 10 * zoomLevel;
    }

    ctx.fillCircle(creaturex - cropx, creaturey - cropy, creature.size * zoomLevel, true);

    if (debugMode) {
      ctx.lineWidth = 2 * zoomLevel;

      var eyes = creature.eyes.length;
      for (let i = 0; i < eyes; i++) {
        var eye = creature.eyes[i];
        ctx.beginPath();
        ctx.moveTo((creature.x + Math.cos(creature.rotation + eye.angle) * creature.size) * zoomLevel - cropx, (creature.y + Math.sin(creature.rotation + eye.angle) * creature.size) * zoomLevel - cropy);
        ctx.lineTo((creature.x + Math.cos(creature.rotation + eye.angle) * eye.distance) * zoomLevel - cropx, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + eye.angle) * eye.distance * zoomLevel);
        ctx.stroke();
      }
    }
  }
}

function renderUI() {
  if (uiBackground && (infoMode || brainDisplayMode) && selectedCreature) {
    ctx.fillStyle = "black";
    ctx.fillRect(ui.xoffset, ui.yoffset, ui.width, ui.height);
  }

  if (infoMode) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "48px Calibri";
    ctx.lineWidth = 5;

    ctx.textAlign = "left";
    ctx.strokeText("Day " + (tick / dayLength).toFixed(1), 40, 1040);
    ctx.fillText("Day " + (tick / dayLength).toFixed(1), 40, 1040);

    ctx.strokeText(population + " Vevos", 40, 995);
    ctx.fillText(population + " Vevos", 40, 995);

    if (timescale != 1) {
      ctx.textAlign = "right";
      ctx.strokeText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
      ctx.fillText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
    }

    ctx.textAlign = "right";

    if (debugMode) {
      ctx.font = "24px Calibri";
      ctx.strokeText("Seed", 1920 - 20, 85);
      ctx.fillText("Seed", 1920 - 20, 85);

      ctx.strokeText(seed, 1920 - 20, 110);
      ctx.fillText(seed, 1920 - 20, 110);

      ctx.textAlign = "center";

      ctx.font = zoomLevel * 128 + "px Calibri";

      var tilex = Math.floor((mouse.current.x + cropx) / tileSize / zoomLevel);
      var tiley = Math.floor((mouse.current.y + cropy) / tileSize / zoomLevel);
      if (tilex >= 0 && tilex < mapSize && tiley >= 0 && tiley < mapSize && map[tilex][tiley] != null) {
        if (scentMode) {
          //ctx.strokeText(map[tilex][tiley].scent.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
          //ctx.fillText(map[tilex][tiley].scent.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
        } else {
          ctx.strokeText(map[tilex][tiley].food.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
          ctx.fillText(map[tilex][tiley].food.toFixed(1), tilex * multiple - cropx + tileSize / 2 * zoomLevel, tiley * multiple - cropy + tileSize / 1.5 * zoomLevel);
        }

        ctx.beginPath();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.rect(tilex * multiple - cropx, tiley * multiple - cropy, multiple + 2, multiple + 2);
        ctx.stroke();
      }
    }
  }
}

function renderSelectedCreature() {
  if (selectedCreature !== null) {
    ctx.font = "32px Calibri";
    ctx.lineWidth = 4 * zoomLevel;

    ctx.strokeStyle = "#ffffff"
    ctx.beginPath();
    ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
    ctx.lineTo(selectedCreature.x * zoomLevel + Math.cos(selectedCreature.rotation) * (selectedCreature.size + directionalDisplayLineLength) * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * (selectedCreature.size + directionalDisplayLineLength) * zoomLevel);
    ctx.stroke();

    ctx.lineWidth = 3 * zoomLevel;

    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
    ctx.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation) * (selectedCreature.size + directionalDisplayLineLength) * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * (selectedCreature.size + directionalDisplayLineLength) * zoomLevel);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4 * zoomLevel;
    ctx.beginPath();
    ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
    ctx.lineTo((selectedCreature.x + selectedCreature.velocity.x * 0.5) * zoomLevel - cropx, (selectedCreature.y + selectedCreature.velocity.y * 0.5) * zoomLevel - cropy);
    ctx.stroke();

    ctx.lineWidth = 2 * zoomLevel;

    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";

    if (infoMode) {
      for (let i = 0; i < selectedCreature.eyes.length; i++) {
        var eye = selectedCreature.eyes[i];

        ctx.beginPath();
        ctx.moveTo((selectedCreature.x + Math.cos(selectedCreature.rotation + eye.angle) * selectedCreature.size) * zoomLevel - cropx, (selectedCreature.y + Math.sin(selectedCreature.rotation + eye.angle) * selectedCreature.size) * zoomLevel - cropy);
        ctx.lineTo((selectedCreature.x + Math.cos(selectedCreature.rotation + eye.angle) * eye.distance) * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel);
        ctx.stroke();
      }
    }

    ctx.lineWidth = 3;

    if (infoMode) {
      ctx.lineWidth = 1;

      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      for (let i = selectedCreature.energyGraph.gross.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.gross.splice(0, 1);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.gross[i] * energyGraphMult * energyGraphEnergyTotalMult);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing - energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.gross[i] * energyGraphMult * energyGraphEnergyTotalMult);
      }
      ctx.stroke();

      ctx.strokeStyle = "#aaffff";
      ctx.beginPath();
      for (let i = selectedCreature.energyGraph.net.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.net.splice(0, 1);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.net[i] * energyGraphMult);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing - energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.net[i] * energyGraphMult);
      }
      ctx.stroke();

      ctx.strokeStyle = "#ffaa00";
      ctx.beginPath();
      for (let i = selectedCreature.energyGraph.metabolism.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.metabolism.splice(0, 1);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.metabolism[i] * energyGraphMult);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing - energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.metabolism[i] * energyGraphMult);
      }
      ctx.stroke();

      ctx.strokeStyle = "#ff2233";
      ctx.beginPath();
      for (let i = selectedCreature.energyGraph.attack.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.attack.splice(0, 1);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.attack[i] * energyGraphMult);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing - energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.attack[i] * energyGraphMult);
      }
      ctx.stroke();

      ctx.strokeStyle = "#aa88ff";
      ctx.beginPath();
      for (let i = selectedCreature.energyGraph.move.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.move.splice(0, 1);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.move[i] * energyGraphMult);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing - energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.move[i] * energyGraphMult);
      }
      ctx.stroke();

      ctx.strokeStyle = "#00ff00";
      ctx.beginPath();
      for (let i = selectedCreature.energyGraph.eat.length - 1; i >= 0; i--) {
        if (i > energyGraphWidth / energyGraphSpacing) selectedCreature.energyGraph.eat.splice(0, 1);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.eat[i] * energyGraphMult);
        ctx.lineTo(energyGraphX + i * energyGraphSpacing - energyGraphSpacing, energyGraphY - selectedCreature.energyGraph.eat[i] * energyGraphMult);
      }
      ctx.stroke();

      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(energyGraphX, energyGraphY);
      ctx.lineTo(energyGraphX + energyGraphWidth, energyGraphY);
      ctx.stroke();

      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#ffffff";

      ctx.textAlign = "right";
      ctx.lineWidth = 4;
      ctx.strokeText(selectedCreature.species, 1920 - 20, 30);
      ctx.fillText(selectedCreature.species, 1920 - 20, 30);

      if (selectedCreature.age / dayLength >= 10) {
        ctx.strokeText((selectedCreature.age / dayLength).toFixed(0 + debugMode * 2) + " days old", 1920 - 20, 60);
        ctx.fillText((selectedCreature.age / dayLength).toFixed(0 + debugMode * 2) + " days old", 1920 - 20, 60);
      } else {
        ctx.strokeText((selectedCreature.age / dayLength * 24).toFixed(0 + debugMode * 2) + " hours old", 1920 - 20, 60);
        ctx.fillText((selectedCreature.age / dayLength * 24).toFixed(0 + debugMode * 2) + " hours old", 1920 - 20, 60);
      }
    }

    if (brainDisplayMode) renderSelectedBrain(selectedCreature);

    if (zoomLevel >= 0.05) {
      cropx -= (cropx - (selectedCreature.x * zoomLevel - canvas.width / 2)) / ((1 / panSpeed) / zoomLevel);
      cropy -= (cropy - (selectedCreature.y * zoomLevel - canvas.height / 2)) / ((1 / panSpeed) / zoomLevel);
    }

    //var middleX = (waterScrollX + 1920 / 2 * 400 - tileSize * mapSize / 2) * zoomLevel;
    //var middleY = (waterScrollY + 1080 / 2 * 400 - tileSize * mapSize / 2) * zoomLevel;
    //var waterX = -middleX - 1919 / 2 * 400 * zoomLevel;
    //var waterWidth = 1920 * 400 * zoomLevel;
    //var waterY = -middleY - 1079 / 2 * 400 * zoomLevel;
    //var waterHeight = 1080 * 400 * zoomLevel;

    //if (cropy > waterY + waterHeight * 2 - 1080) cropy = waterY;
    //else if (cropy < waterY) cropy = waterY + waterHeight * 2 - 1080;

    //if (cropx > waterX + waterWidth * 2 - 1920) cropx = waterX;
    //else if (cropx < waterX) cropx = waterX + waterWidth * 2 - 1920;
  }
}

var brainsTotalHeight = 0;

function renderSelectedBrain(creature) {
  ctx.fillStyle = "hsl(0, 0%, 100%)";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(nnui.outputx + nnui.size / 2 + 4, nnui.outputy + 240);
  ctx.rotate(-90 * 3.14 / 180);
  ctx.fillText("Output", 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(nnui.cellStatex + nnui.size / 2 + 4, nnui.cellStatey + 220);
  ctx.rotate(-90 * 3.14 / 180);
  ctx.fillText("Cell State", 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(nnui.outputx + 40 + nnui.size / 2 + 4, nnui.outputy + 1080 - 200);
  ctx.rotate(-90 * 3.14 / 180);
  ctx.fillText("Input", 0, 0);
  ctx.restore();

  var brainNum = 0;
  ctx.lineWidth = 1000;

  brainsTotalHeight = 0;

  renderInput(creature, creature.network.main, 0, main);
  renderBrain(creature.network.main, 0, main);

  renderOutput(creature.network.output);
  renderMemories(creature.network.memories);
}

function renderInput(creature, brain, brainNum, brainName) {
  var pastOutputs = false;
  var pastCellState = false;

  var biggestLayer = 0;
  for (let l = 1; l < brain.neurons.length; l++) {
    if (brain.neurons[l].length > biggestLayer) {
      biggestLayer = brain.neurons[l].length;
    }
  }

  var verticalSpacing = (1080 / (nnui.size + nnui.yspacing) - 1) / (creature.inputs + (outputs + 1) * 2);
  var verticalSpacingNext = nnui.verticalSpacingHidden; //biggestLayer / (brain.neurons[1].length - 1);

  for (let n = 0; n < brain.axons[0].length; n++) {
    var x = n;
    for (let a = 0; a < brain.axons[0][n].length; a++) {
      if (hoveredNeuron[0] == "input" && 0 == hoveredNeuron[1] && x != hoveredNeuron[2]) continue;
      if (hoveredNeuron[0] == "main" && 1 == hoveredNeuron[1] && a != hoveredNeuron[2]) continue;
      if (hoveredNeuron[0] != "main" && hoveredNeuron[1] == 1) continue;

      let value = 0;

      var neuronValue = brain.neurons[0][n];
      var axonValue = brain.axons[0][n][a];

      var type = brain.types[0][n][a];
      var hue = [0, 100];

      if (type == "+") {
        value = (neuronValue + axonValue);
        hue = [60, 180];
      } else if (type == "*") {
        value = (neuronValue * axonValue);
        hue = [0, 100];
      } else if (type == "%") {
        value = (neuronValue % (axonValue || 0.0001));
        hue = [140, 140];
      } else if (type == "<") {
        if (neuronValue < axonValue) value = neuronValue;
        hue = [240, 300];
      } else if (type == ">") {
        if (neuronValue > axonValue) value = neuronValue;
        hue = [240, 300];
      }

      ctx.strokeStyle = "hsla(" + (value <= 0 ? hue[0] : hue[1]) + ", 80%, 50%," + Math.abs(value / 4) + ")";
      ctx.lineWidth = Math.sqrt(Math.abs(brain.axons[0][n][a])) * 3;

      ctx.beginPath();
      ctx.moveTo(nnui.xoffset, nnui.yoffset + (x * verticalSpacing) * nnui.yspacing);
      ctx.lineTo(nnui.xoffset + nnui.xspacing, nnui.yoffset + (a * verticalSpacingNext + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy);
      ctx.stroke();
    }
  }

  var verticalSpacing = (1080 / (nnui.size + nnui.yspacing) - 1) / (creature.inputs + (outputs + 1) * 2);

  for (let n = 0; n < brain.neurons[0].length; n++) {
    var hueV = Math.floor((brain.neurons[0][n] + 1) / 2 * 100);

    ctx.fillStyle = "hsl(" + hueV + ", 80%," + Math.floor(Math.abs(brain.neurons[0][n] * 55)) + "%)";
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(nnui.xoffset, nnui.yoffset + (n * verticalSpacing) * nnui.yspacing, nnui.size, 0, 2 * 3.14);
    ctx.fill();
    ctx.stroke();

    /*ctx.beginPath();
    ctx.arc(nnui.xoffset, nnui.yoffset + (n * verticalSpacing) * nnui.yspacing, nnui.size, 3.14 / 2 + 0.6, 3.14 * 3 / 2 - 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(nnui.xoffset, nnui.yoffset + (n * verticalSpacing) * nnui.yspacing, nnui.size, 3.14 * 3 / 2 + 0.6, 3.14 * 5 / 2 - 0.6);
    ctx.stroke();*/
  }
}

function renderBrain(brain, brainNum, brainName) {
  var biggestLayer = 0;
  for (let l = 1; l < brain.neurons.length; l++) {
    if (brain.neurons[l].length > biggestLayer) {
      biggestLayer = brain.neurons[l].length;
    }
  }

  var pastOutputs = false;
  var pastCellState = false;
  for (let l = 1; l < brain.neurons.length; l++) {
    var verticalSpacingNext = nnui.verticalSpacingHidden;

    var verticalSpacing = nnui.verticalSpacingHidden; //biggestLayer / (brain.neurons[l].length - 1);

    if (l == brain.neurons.length - 1) {
      verticalSpacing = nnui.verticalSpacingOut;
    }

    if (l == brain.neurons.length - 2) {
      verticalSpacingNext = nnui.verticalSpacingOut;
    }

    for (let n = 0; n < brain.neurons[l].length; n++) {
      if (l < brain.neurons.length - 1) {
        for (let a = 0; a < brain.axons[l][n].length; a++) {
          if (hoveredNeuron[0] == "main" && l == hoveredNeuron[1] && n != hoveredNeuron[2]) continue;
          if (hoveredNeuron[0] == "main" && l + 1 == hoveredNeuron[1] && a != hoveredNeuron[2]) continue;

          let value = 0;

          var neuronValue = brain.neurons[l][n];
          var axonValue = brain.axons[l][n][a];

          var type = brain.types[l][n][a];
          var hue = [0, 100];

          if (type == "+") {
            value = (neuronValue + axonValue);
            hue = [60, 180];
          } else if (type == "*") {
            value = (neuronValue * axonValue);
            hue = [0, 100];
          } else if (type == "%") {
            value = (neuronValue % (axonValue || 0.0001));
            hue = [140, 140];
          } else if (type == "<") {
            if (neuronValue < axonValue) value = neuronValue;
            hue = [240, 300];
          } else if (type == ">") {
            if (neuronValue > axonValue) value = neuronValue;
            hue = [240, 300];
          }

          ctx.strokeStyle = "hsla(" + (value <= 0 ? hue[0] : hue[1]) + ", 80%, 50%," + Math.abs(value / 4) + ")";
          ctx.lineWidth = Math.sqrt(Math.abs(brain.axons[l][n][a])) * 3;

          ctx.beginPath();
          ctx.moveTo(nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy);
          ctx.lineTo(nnui.xoffset + (l + 1) * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (a * verticalSpacingNext + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy)
          ctx.stroke();
        }
      }

      ctx.lineWidth = 1;

      var hueV = Math.floor((brain.neurons[l][n] + 1) / 2 * 100);

      ctx.fillStyle = "hsl(" + hueV + ", 80%, " + Math.floor(Math.abs(brain.neurons[l][n] * 55)) + "%)";
      ctx.strokeStyle = "gray";

      ctx.beginPath();
      ctx.arc(nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy, nnui.size, 0, 2 * 3.14);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy, nnui.size, 3.14 / 2 + 0.6, 3.14 * 3 / 2 - 0.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(nnui.xoffset + l * nnui.xspacing + brainNum * nnui.brainspacingx, nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + brainNum * nnui.brainspacingy, nnui.size, 3.14 * 3 / 2 + 0.6, 3.14 * 5 / 2 - 0.6);
      ctx.stroke();
    }
  }

  brainsTotalHeight += biggestLayer;
}

function renderOutput(output) {
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 2;
  var largest = 0;
  var action = -1;

  for (let i = 2; i < 5; i++) {
    if (Math.abs(output[i]) > 0.05 && Math.abs(output[i]) > largest) {
      action = i;
      largest = Math.abs(output[i]);
    }
  }

  for (let n = 0; n < output.length; n++) {
    var lightness = Math.floor((output[n] + 1) / 2 * 100);
    ctx.fillStyle = "hsla(" + lightness + ", 80%, 50%," + Math.abs(output[n]) + ")";

    if (n == action) ctx.strokeStyle = "white";
    else ctx.strokeStyle = "gray";

    ctx.beginPath();
    ctx.arc(nnui.outputx, nnui.outputy + (n + (n > 1) + (n > 4) + (n > 5) + (n > outputs - memories - 1)) * nnui.yspacing * 2, nnui.size, 0, 2 * 3.14);
    ctx.stroke();
    ctx.fill();
  }

  ctx.strokeStyle = "gray";
}

function renderMemories(memories) {
  for (let i = 0; i < memories.length; i++) {
    for (let j = 0; j < memories[i].length; j++) {
      var lightness = Math.floor((memories[i][j] + 1) / 2 * 100);
      ctx.fillStyle = "hsla(" + lightness + ", 80%, 50%," + Math.abs(memories[i][j]) + ")";

      ctx.beginPath();
      ctx.arc(nnui.xoffset + i * nnui.size * 2, nnui.yoffset + 800 + j * nnui.size * 2, nnui.size, 0, 2 * 3.14);
      ctx.stroke();
      ctx.fill();
    }
  }
}

function renderSpeciesGraph() {
  ctx.lineWidth = 1;

  ctx.strokeStyle = "black";
  ctx.lineCap = "bevel";
  ctx.lineJoin = "round"

  ctx.setLineDash([]);
  for (let i = speciesGraph.length - 1; i >= 0; i--) {
    if (speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraph[i].length * speciesGraphStretch + speciesGraphDial > speciesGraphX && speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraphDial < speciesGraphX + speciesGraphWidth) {
      if (speciesGraph[i].length >= speciesGraphSmooth) {
        ctx.fillStyle = speciesColors[i];
        ctx.beginPath();
        for (let j = speciesGraphSmooth; j < speciesGraph[i].length; j += speciesGraphSmooth) {
          var average = 0;
          for (let k = 0; k < speciesGraphSmooth; k++) {
            average += speciesGraph[i][j - k];
          }
          average /= speciesGraphSmooth;

          if (speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + j * speciesGraphStretch + speciesGraphDial > speciesGraphX && speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + j * speciesGraphStretch + speciesGraphDial < speciesGraphX + speciesGraphWidth) {
            ctx.lineTo(speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + j * speciesGraphStretch + speciesGraphDial, speciesGraphY - average * speciesGraphMult);
            ctx.lineTo(speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + j * speciesGraphStretch + speciesGraphDial + speciesGraphStretch, speciesGraphY - average * speciesGraphMult);
          }

          if (speciesGraphAutoMult && average * speciesGraphMult > speciesGraphHeight) {
            speciesGraphMult *= 0.99;
          }
        }

        ctx.lineTo(Math.min(speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraph[i].length * speciesGraphStretch + speciesGraphDial, speciesGraphX + speciesGraphWidth), speciesGraphY);

        ctx.lineTo(Math.max(speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraphDial, speciesGraphX), speciesGraphY);

        ctx.closePath();

        ctx.stroke();
        ctx.fill();
      }
    }
  }

  if (infoMode) {
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    for (let i = speciesGraph.length - 1; i >= 0; i--) {
      if (speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraphDial > speciesGraphX && speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraphDial < speciesGraphX + speciesGraphWidth) {
        var av = 0;
        for (let k = 0; k < speciesGraphSmooth; k++) {
          av += speciesGraph[i][speciesGraphSmooth - k];
        }
        av /= speciesGraphSmooth;

        ctx.moveTo(speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraphStretch + 1 + speciesGraphDial, speciesGraphY - av * speciesGraphMult);
        ctx.lineTo(speciesGraph[i][0].originTick / speciesGraphDetail * speciesGraphStretch + speciesGraphStretch + 1 + speciesGraphDial, speciesGraphY);
      }
    }
    ctx.stroke();
  }

  ctx.setLineDash([]);
  if (infoMode) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 1920 / dayLength * speciesGraphDetail / speciesGraphStretch + 1; i++) {
      ctx.moveTo(i * dayLength / speciesGraphDetail * speciesGraphStretch + speciesGraphDial % (dayLength / speciesGraphDetail * speciesGraphStretch), speciesGraphY);
      ctx.lineTo(i * dayLength / speciesGraphDetail * speciesGraphStretch + speciesGraphDial % (dayLength / speciesGraphDetail * speciesGraphStretch), speciesGraphY - speciesGraphLinesHeight);
    }
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(speciesGraphX + speciesGraphWidth, speciesGraphY);
  ctx.lineTo(speciesGraphX, speciesGraphY);
  ctx.stroke();
}

function hoverSelectedNeuron(e) {
  if (selectedCreature) {
    brainsTotalHeight = 0;
    hoveredNeuron = ["none", -1, -1];

    var brain = selectedCreature.network.main;
    var biggestLayer = 0;
    for (let l = 1; l < brain.neurons.length; l++) {
      if (brain.neurons[l].length > biggestLayer) {
        biggestLayer = brain.neurons[l].length;
      }
    }

    for (let l = 0; l < brain.neurons.length; l++) {
      var verticalSpacing = (1080 / (nnui.size + nnui.yspacing) - 1) / (selectedCreature.inputs + (outputs + 1) * 2);

      if (l == brain.neurons.length - 1) {
        verticalSpacing = nnui.verticalSpacingOut;
      } else if (l > 0) {
        verticalSpacing = nnui.verticalSpacingHidden;
      }

      for (let n = 0; n < brain.neurons[l].length; n++) {
        if (l > 0) {
          if (mouse.current.x > nnui.xoffset + l * nnui.xspacing - nnui.size &&
            mouse.current.x < nnui.xoffset + l * nnui.xspacing + nnui.size) {

            if (mouse.current.y > nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing - nnui.size &&
              mouse.current.y < nnui.yoffset + (n * verticalSpacing + brainsTotalHeight) * nnui.yspacing + nnui.size) {

              hoveredNeuron = ["main", l, n];
            }
          }
        } else {
          if (mouse.current.x > nnui.xoffset + l * nnui.xspacing - nnui.size &&
            mouse.current.x < nnui.xoffset + l * nnui.xspacing + nnui.size) {

            if (mouse.current.y > nnui.yoffset + n * verticalSpacing * nnui.yspacing - nnui.size &&
              mouse.current.y < nnui.yoffset + n * verticalSpacing * nnui.yspacing + nnui.size) {

              hoveredNeuron = ["input", l, n];
            }
          }
        }
      }
    }

    brainsTotalHeight += biggestLayer;
  }
}