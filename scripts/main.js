function main() {
	if (population < 2000) {
		let odate = new Date();
		
		if (timescale >= 1) { // Can timescale ever go below 1?
			for (let ts = 0; ts < timescale; ts++) {
				update();
			}
		} else {
			tc++;
			if (tc >= 1 / timescale) {
				update();

				tc = 0;
			}
		}

		let ndate = new Date();

		if (ndate - odate > 60 && !fastforward && autoMode) {
			if (timescale > 1) timescale--;
		} else if (ndate - odate < 40 && !fastforward && autoMode) {
			if (timescale >= 1) timescale++;
		}
	}

	render();
}

function wallLock(creature) {
	if (creature.x <= 0) {
		creature.x = 0;
	} else if (creature.x >= mapSize * tileSize) {
		creature.x = mapSize * tileSize - 1;
	}

	if (creature.y <= 0) {
		creature.y = 0;
	} else if (creature.y >= mapSize * tileSize) {
		creature.y = mapSize * tileSize - 1;
	}
}

function clampSize(creature) {
	if (creature.energy > creatureEnergy) creature.energy = creatureEnergy;
	if (creature.energy <= 0) {
		if (creature == selectedCreature) selectedCreature = null;
		creature.die();
	}
}

function update() {
	tick++;

	if (season === 0) {
		seasonUp = true;
		year++;
	} else if (season == growSeasonLength + dieSeasonLength) {
		seasonUp = false;
	}

	if (seasonUp) season++;
	else season--;

	if (season % mapUpdateDelay === 0) {
		for (let row = 0; row < mapSize; row++) {
			for (let column = 0; column < mapSize; column++) {
				let tile = map[row][column];
				if (tile.type == 1) {
					if (season < growSeasonLength) {
						tile.food += growSeasonGrowRate * mapUpdateDelay;
					} else {
						tile.food += dieSeasonGrowRate * mapUpdateDelay;
					}

					if (tile.food > tile.maxFood) tile.food = tile.maxFood;
					else if (tile.food < 0) tile.food = 0;
				}
			}
		}
	}

	firstGen = 0;

	population = creatures.length;
	for (let i = population - 1; i >= 0; i--) {
		let creature = creatures[i];
		if (creature.age > oldest) oldest = creature.age;
		if (creature.speciesGeneration === 0) firstGen++;

		let energy = creature.energy / creatureEnergy;
		let rotation = creature.rotation / (2 * Math.PI);
		let time = (tick % 15) / 15;

		creature.input = [time, rotation, energy];

		let vision = creature.see();
		for (let i = 0; i < vision.length; i++) {
			creature.input.push(vision[i]);
		}

		creature.output = creature.feedForward(creature.input);

		let pos = creature.getPosition();
		tile = map[pos[0]][pos[1]];

		if (tile.type === 0) {
			creature.maxSpeed = maxCreatureSpeed * swimmingSpeed;
		} else {
			creature.maxSpeed = maxCreatureSpeed;
			creature.eat(pos);
		}

		creature.act();
		wallLock(creature);
		clampSize(creatures[i]);

		creature.energyGraph.net.push(creature.energy - creature.lastEnergy);
		creature.energyGraph.gross.push(creature.energy);

		creature.lastEnergy = creature.energy;

		if (zoomLevel >= 0.05 && creature == selectedCreature) {
			cropx -= (cropx - (creature.x * zoomLevel - canvas.width / 2)) / ((1 / panSpeed) / zoomLevel);
			cropy -= (cropy - (creature.y * zoomLevel - canvas.height / 2)) / ((1 / panSpeed) / zoomLevel);
		}
	}
}

function render() {
	ctx.clearRect(0, 0, display.width, display.height);
	ctz.clearRect(0, 0, viewport.width, viewport.height);

	for (let row = 0; row < mapSize; row++) {
		for (let column = 0; column < mapSize; column++) {
			let tile = map[row][column];
			if (tile.type === 0) continue;

			let hue = (60 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 40);
			let saturation = Math.floor(tile.food / maxTileFood * 100);

			ctx.fillStyle = "hsl(" + hue + ", " + saturation + "%, 22%)";
			ctx.fillRect(row * tileSize * zoomLevel - cropx - 1, column * tileSize * zoomLevel - cropy - 1, tileSize * zoomLevel + 2, tileSize * zoomLevel + 2);
		}
	}

	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 15 * zoomLevel;

	ctx.beginPath();
	let length = outline.length;
	for (let i = 0; i < length; i++) {
		ctx.moveTo(outline[i][0] * zoomLevel - cropx, outline[i][1] * zoomLevel - cropy);
		ctx.lineTo(outline[i][2] * zoomLevel - cropx, outline[i][3] * zoomLevel - cropy);
	}
	ctx.stroke();

	ctx.strokeStyle = "#ffffff";

	for (let i = 0; i < creatures.length; i++) {
		let creature = creatures[i];
		if (creature.output[3] > minAttackPower) {
			ctx.fillStyle = "rgba(255, 0, 0, " + creature.output[3] + ")";

			let pos = [Math.floor((creature.x + Math.cos(creature.rotation) * tileSize) / tileSize), Math.floor((creature.y + Math.sin(creature.rotation) * tileSize) / tileSize)];
			ctx.fillRect(pos[0] * zoomLevel * tileSize - cropx, pos[1] * zoomLevel * tileSize - cropy, tileSize * zoomLevel, tileSize * zoomLevel);
		}

		ctx.lineWidth = 10 * zoomLevel;

		ctx.fillStyle = creature.color;
		ctx.fillCircle(creature.x * zoomLevel - cropx, creature.y * zoomLevel - cropy, creature.size * zoomLevel, true);

		ctx.beginPath();
		ctx.moveTo(creature.x * zoomLevel - cropx, creature.y * zoomLevel - cropy);
		ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation) * (creature.size + 75) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation) * (creature.size + 75) * zoomLevel);
		ctx.stroke();

		if (infoMode) {
			ctx.beginPath();
			ctx.moveTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation) * creature.size * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation) * creature.size * zoomLevel);
			ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation - Math.PI / 2) * ((creature.size - 3) * creature.network.output[0]) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation - Math.PI / 2) * ((creature.size - 3) * creature.network.output[0]) * zoomLevel);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation) * creature.size * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation) * creature.size * zoomLevel);
			ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + Math.PI / 2) * ((creature.size - 3) * creature.network.output[1]) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + Math.PI / 2) * ((creature.size - 3) * creature.network.output[1]) * zoomLevel);
			ctx.stroke();
		}

		if (debugMode) {
			ctx.lineWidth = 2 * zoomLevel;

			let eyes = creature.eyes.length;
			for (let i = 0; i < eyes; i++) {
				let eye = creature.eyes[i];
				ctx.beginPath();
				ctx.moveTo(creature.x * zoomLevel - cropx, creature.y * zoomLevel - cropy);
				ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + eye.angle) * eye.distance * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + eye.angle) * eye.distance * zoomLevel);
				ctx.stroke();

				ctx.fillCircle(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + eye.angle) * eye.distance * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + eye.angle) * eye.distance * zoomLevel, 15 * zoomLevel, true);
			}
		}
	}

	ctz.textAlign = "center";
	ctz.fillStyle = "#ffffff";
	ctz.strokeStyle = "#000000";
	ctz.font = "48px Calibri";
	ctz.lineWidth = 5;

	let yearProgress = seasonUp ? season / (growSeasonLength + dieSeasonLength) / 2 : 1 - (season / (growSeasonLength + dieSeasonLength) / 2);
	ctz.strokeText("Year " + (year + yearProgress).toFixed(1), 1920 / 2, 50);
	ctz.fillText("Year " + (year + yearProgress).toFixed(1), 1920 / 2, 50);

	ctz.textAlign = "left";
	ctz.strokeText("Population: " + population, 40, 1040);
	ctz.fillText("Population: " + population, 40, 1040);

	ctz.textAlign = "right";
	ctz.strokeText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
	ctz.fillText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);

	ctz.textAlign = "center";

	if (infoMode) {
		ctz.font = zoomLevel * 128 + "px Calibri";

		let tilex = Math.floor((mouse.current.x + cropx) / tileSize / zoomLevel);
		let tiley = Math.floor((mouse.current.y + cropy) / tileSize / zoomLevel);
		if (tilex >= 0 && tilex < mapSize && tiley >= 0 && tiley < mapSize) {
			ctz.strokeText(map[tilex][tiley].food.toFixed(1), tilex * tileSize * zoomLevel - cropx + tileSize / 2 * zoomLevel, tiley * tileSize * zoomLevel - cropy + tileSize / 1.5 * zoomLevel);
			ctz.fillText(map[tilex][tiley].food.toFixed(1), tilex * tileSize * zoomLevel - cropx + tileSize / 2 * zoomLevel, tiley * tileSize * zoomLevel - cropy + tileSize / 1.5 * zoomLevel);

			ctz.beginPath();
			ctz.strokeStyle = "#ffffff";
			ctz.lineWidth = 2;
			ctz.rect(tilex * tileSize * zoomLevel - cropx, tiley * tileSize * zoomLevel - cropy, tileSize * zoomLevel + 2, tileSize * zoomLevel + 2);
			ctz.stroke();
		}
	}

	if (selectedCreature !== null) {
		ctz.font = "32px Calibri";
		ctz.lineWidth = 10 * zoomLevel;

		ctz.strokeStyle = "#000000";
		ctz.beginPath();
		ctz.moveTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation) * selectedCreature.size * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * selectedCreature.size * zoomLevel);
		ctz.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation - Math.PI / 2) * ((selectedCreature.size - 3) * selectedCreature.network.output[0]) * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation - Math.PI / 2) * ((selectedCreature.size - 3) * selectedCreature.network.output[0]) * zoomLevel);
		ctz.stroke();

		ctz.strokeStyle = "#ffffff"
		ctz.beginPath();
		ctz.moveTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation) * selectedCreature.size * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * selectedCreature.size * zoomLevel);
		ctz.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation + Math.PI / 2) * ((selectedCreature.size - 3) * selectedCreature.network.output[1]) * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation + Math.PI / 2) * ((selectedCreature.size - 3) * selectedCreature.network.output[1]) * zoomLevel);
		ctz.stroke();

		ctz.strokeStyle = "#ff8888";
		ctz.beginPath();
		ctz.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
		ctz.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation) * (selectedCreature.size + 90) * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation) * (selectedCreature.size + 90) * zoomLevel);
		ctz.stroke();

		ctz.fillStyle = "#222222";
		ctz.strokeStyle = "hsl(0, 0%, 100%)";

		ctx.lineWidth = 2 * zoomLevel;
		ctx.fillStyle = selectedCreature.color;
		for (let eye of selectedCreature.eyes) {
			ctx.beginPath();
			ctx.moveTo(selectedCreature.x * zoomLevel - cropx, selectedCreature.y * zoomLevel - cropy);
			ctx.lineTo(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel);
			ctx.stroke();

			ctx.fillCircle(selectedCreature.x * zoomLevel - cropx + Math.cos(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel, selectedCreature.y * zoomLevel - cropy + Math.sin(selectedCreature.rotation + eye.angle) * eye.distance * zoomLevel, 15 * zoomLevel, true);
		}

		ctz.lineWidth = 3;

		if (infoMode) {
			for (let j = 0; j < selectedCreature.network.forget.neurons[0].length; j++) {
				ctz.fillCircle(nnui.xoffset - (nnui.size + 5) * 14, j * (nnui.size * 2 + 5) + nnui.yoffset, nnui.size, nnui.stroke);
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
			let x = 0;
			ctz.beginPath();
			for (let point of selectedCreature.energyGraph.gross) {
				if (x * 10 >= 1400) selectedCreature.energyGraph.gross.splice(0, 1);
				ctz.lineTo(x * 10, 900 - point * graphMult / 10);
				x++;
			}
			ctz.stroke();

			ctz.strokeStyle = "#aaffff";
			x = 0;
			ctz.beginPath();
			for (let point of selectedCreature.energyGraph.net) {
				if (x * 10 >= 1400) selectedCreature.energyGraph.net.splice(0, 1);
				ctz.lineTo(x * 10, 900 - point * graphMult);
				x++;
			}
			ctz.stroke();

			ctz.strokeStyle = "#ffaa00";
			x = 0;
			ctz.beginPath();
			for (let point of selectedCreature.energyGraph.metabolism) {
				if (x * 10 >= 1400) selectedCreature.energyGraph.metabolism.splice(0, 1);
				ctz.lineTo(x * 10, 900 - point * graphMult);
				x++;
			}
			ctz.stroke();

			ctz.strokeStyle = "#ff2233";
			x = 0;
			ctz.beginPath();
			for (let point of selectedCreature.energyGraph.attack) {
				if (x * 10 >= 1400) selectedCreature.energyGraph.attack.splice(0, 1);
				ctz.lineTo(x * 10, 900 - point * graphMult);
				x++;
			}
			ctz.stroke();

			ctz.strokeStyle = "#aa88ff";
			x = 0;
			ctz.beginPath();
			for (let point of selectedCreature.energyGraph.move) {
				if (x * 10 >= 1400) selectedCreature.energyGraph.move.splice(0, 1);
				ctz.lineTo(x * 10, 900 - point * graphMult);
				x++;
			}
			ctz.stroke();

			ctz.strokeStyle = "#00ff00";
			x = 0;
			ctz.beginPath();
			for (let point of selectedCreature.energyGraph.eat) {
				if (x * 10 >= 1400) selectedCreature.energyGraph.eat.splice(0, 1);
				ctz.lineTo(x * 10, 900 - point * graphMult);
				x++;
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
			ctz.strokeText(selectedCreature.species, 20, 1080 - 20);
			ctz.fillText(selectedCreature.species, 20, 1080 - 20);
			ctz.textAlign = "center";

			ctz.strokeText("Cell State", 1920 - 60, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);

			ctz.strokeText("Left", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);
			ctz.strokeText("Right", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 1 - nnui.size - 12);
			ctz.strokeText("Eat", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 2 - nnui.size - 12);
			ctz.strokeText("Attack", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 3 - nnui.size - 12);
			ctz.strokeText("Reproduce", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 4 - nnui.size - 12);

			for (let i = 0; i < memories; i++) {
				ctz.strokeText("Mem. " + i, nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * (i + 5) - nnui.size - 12);
			}

			ctz.fillText("Cell State", 1920 - 60, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);

			ctz.fillText("Left", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);
			ctz.fillText("Right", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 1 - nnui.size - 12);
			ctz.fillText("Eat", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 2 - nnui.size - 12);
			ctz.fillText("Attack", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 3 - nnui.size - 12);
			ctz.fillText("Reproduce", nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 4 - nnui.size - 12);

			for (let i = 0; i < memories; i++) {
				ctz.fillText("Mem. " + i, nnui.xoffset - nnui.size * 10, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * (i + 5) - nnui.size - 12);
			}

			ctz.font = "bold 21px Calibri";

			for (let j = 0; j < selectedCreature.network.forget.neurons[0].length; j++) {
				ctz.fillText(selectedCreature.network.forget.neurons[0][j].toFixed(1), nnui.xoffset - (nnui.size + 5) * 14, j * (nnui.size * 2 + 5) + nnui.yoffset + 6);
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
	}
}