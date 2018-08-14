function main() {
	let odate = new Date();
	if (creatures.length > 120) pause = true;
	if (!pause) {
	  keyEvents();
		if (timescale >= 1) {
			for (let ts = 0; ts < timescale; ts++) {
				update();
			}
		} else {
			tc++;
			if (tc > 1 / timescale) {
				update();

				tc = 0;
			}
		}
	}


	let ndate = new Date();

	if (ndate - odate <= 150) render();
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
	if (creature.energy > creatureEnergy * creature.size / maxCreatureSize) creature.energy = creatureEnergy * creature.size / maxCreatureSize;
	if (creature.energy <= 0) {
		if (creature == selectedCreature) selectedCreature = null;
		creature.die();
	}
}

function update() {
	tick++;
	if (seasonUp) {
		season++;
	} else season--;

	if (season > growSeasonLength + dieSeasonLength || season < 0) seasonUp = !seasonUp;

	for (let i in map) {
		for (let j in map[i]) {
			if (map[i][j].type == 1) {
				if (season < growSeasonLength) {
					map[i][j].food += seasonChange;
				} else {
					map[i][j].food -= seasonChange;
				}

				map[i][j].food += foodRegrowRate;

				if (map[i][j].food > maxTileFood) map[i][j].food = maxTileFood;
			}
		}
	}

	for (let creature of creatures) {
		if (creature.age > oldest) oldest = creature.age;

		wallLock(creature);
		clampSize(creature);

		let x = (creature.x / (tileSize * mapSize));
		let y = (creature.y / (tileSize * mapSize));
		let size = ((creature.size - minCreatureSize) / (maxCreatureSize - minCreatureSize));
		let energy = creature.energy / (creatureEnergy * creature.size / maxCreatureSize);

		let pos = creature.getPosition();

		let color = creature.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");

		let lastContactX = 0;
		let lastContactY = 0;
		let lastContactPos = [0, 0];
		let lastContactSize = 1;
		let lastContactColor = [0, 0, 0];
		let lastContactEnergy = 0;

		for (let creature2 of creatures) {
			if (creature2 == creature) continue;
			if (~~(creature.x / tileSize) == ~~(creature2.x / tileSize)) {
				if (~~(creature.y / tileSize) == ~~(creature2.y / tileSize)) {
					creature.lastContact = creature2;
				}
			}
		}

		if (typeof creature.lastContact !== "undefined") {
			//lastContactPos = creature.lastContact.getPosition();
			lastContactSize = ((creature.lastContact.size - minCreatureSize) / (maxCreatureSize - minCreatureSize));
			lastContactX = creature.lastContact.x / (tileSize * mapSize);
			lastContactY = creature.lastContact.y / (tileSize * mapSize);
			//lastContactColor = creature.lastContact.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");
			lastContactEnergy = creature.lastContact.energy / (creatureEnergy * creature.size / maxCreatureSize);
		}

		let cen = 0;
		if (map[pos[0]] === undefined) console.log(cen);
		cen = creature.energy;

		let tileFood = map[pos[0]][pos[1]].food / maxTileFood;
		//let eatPower = creature.output[2];
		let age = (creature.age / (1000 / ageSpeed));
		let reproduceTime = creature.reproduceTime / (minReproduceTime * 2.5);
		//let xMove = creature.output[0];
		//let yMove = creature.output[1];
		let memory = [];

		creature.input = [1, x, y, size, energy, tileFood, age, lastContactX, lastContactY, lastContactSize];

		creature.output = creature.feedForward(creature.input);

		if (creature.output[2] > minEatPower) {
			creature.eat(pos);
		} else this.maxSpeed = maxCreatureSpeed;

		if (creature.output[3] > minReproducePower) creature.reproduce();
		if (creature.output[4] > minAttackPower) creature.attack();

		creature.move();
		creature.metabolize();

		creature.tick();

		if (creature == selectedCreature) {
			cropx -= (cropx - (creature.x * zoomLevel - canvas.width / 2)) / (50 / zoomLevel);
			cropy -= (cropy - (creature.y * zoomLevel - canvas.height / 2)) / (50 / zoomLevel);
		}
	}
}

function render() {
	ctx.clearRect(0, 0, display.width, display.height);
	ctz.clearRect(0, 0, viewport.width, viewport.height);

	ctx.fillStyle = "#1799B5";
	ctx.fillRect(0, 0, display.width, display.height);

	for (let i in map) {
		for (let j in map[i]) {
			if (map[i][j].type === 0) continue;
			ctx.fillStyle = "hsl(" + Math.max(100 - (season - growSeasonLength) / growSeasonLength * 50, 50) + "," + Math.floor(map[i][j].food / maxTileFood * 100) + "%, 22%)";
			ctx.fillRect(i * tileSize * zoomLevel - cropx, j * tileSize * zoomLevel - cropy, tileSize * zoomLevel + 1, tileSize * zoomLevel + 1);
		}
	}

	ctx.lineWidth = 5 * zoomLevel;
	for (let i in outline) {
		ctx.beginPath();
		ctx.moveTo(outline[i][0] * zoomLevel - cropx, outline[i][1] * zoomLevel - cropy);
		ctx.lineTo(outline[i][2] * zoomLevel - cropx, outline[i][3] * zoomLevel - cropy);
		ctx.stroke();
	}

	for (let creature of creatures) {
		ctx.strokeStyle = "#ffffff";
		if (selectedCreature == creature) {
			ctx.strokeStyle = "#ff0000";
		}

		ctx.fillStyle = creature.color;
		ctx.fillCircle(creature.x * zoomLevel - cropx, creature.y * zoomLevel - cropy, creature.size * zoomLevel, true);
	}

	ctz.lineWidth = 3;
	if (selectedCreature !== null) {
		for (let i = 0; i < layers.length; i++) {
			for (let j = 0; j < layers[i]; j++) {
				for (let k = 0; k < layers[i - 1]; k++) {
					ctz.beginPath();
					ctz.strokeStyle = "hsla(0, 0%, " + Math.floor(selectedCreature.network.main.axons[i - 1][j][k] * 100) + "%, " + Math.abs(selectedCreature.network.main.axons[i - 1][j][k]) + ")";
					ctz.moveTo((i - 1) * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, k * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset);
					ctz.lineTo(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset);
					ctz.stroke();
				}
			}
		}

		ctz.fillStyle = "#222222";
		ctz.font = "bold 21px Calibri";
		ctz.strokeStyle = "hsl(0, 0%, 100%)";
		ctz.lineWidth = 3;
		ctz.textAlign = "center";

		for (let i = 0; i < forgetLayers.length; i++) {
			for (let j = 0; j < forgetLayers[i]; j++) {
				ctz.fillCircle(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset / 2, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
			}
		}

		for (let i = 0; i < decideLayers.length; i++) {
			for (let j = 0; j < decideLayers[i]; j++) {
				ctz.fillCircle(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset / 1.2, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
			}
		}

		for (let i = 0; i < modifyLayers.length; i++) {
			for (let j = 0; j < modifyLayers[i]; j++) {
				ctz.fillCircle(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset / 1.5, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
			}
		}

		for (let i = 0; i < layers.length; i++) {
			for (let j = 0; j < layers[i]; j++) {
				ctz.fillCircle(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
			}
		}

		for (let i = 0; i < selectedCreature.network.cellState.length; i++) {
			ctz.fillCircle(i * (nnui.size * 2 + 10) + nnui.xoffset, 21 * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
		}

		ctz.fillStyle = "#ffffff";

		ctz.fillText(selectedCreature.species, (nnui.size + 10) + nnui.xoffset, 20 * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);

		for (let i = 0; i < forgetLayers.length; i++) {
			for (let j = 0; j < forgetLayers[i]; j++) {
				ctz.fillText(selectedCreature.network.forget.neurons[i][j].toFixed(1), i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset / 2, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
			}
		}

		for (let i = 0; i < decideLayers.length; i++) {
			for (let j = 0; j < decideLayers[i]; j++) {
				ctz.fillText(selectedCreature.network.decide.neurons[i][j].toFixed(1), i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset / 1.2, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
			}
		}

		for (let i = 0; i < modifyLayers.length; i++) {
			for (let j = 0; j < modifyLayers[i]; j++) {
				ctz.fillText(selectedCreature.network.modify.neurons[i][j].toFixed(1), i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset / 1.5, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
			}
		}

		for (let i = 0; i < layers.length; i++) {
			for (let j = 0; j < layers[i]; j++) {
				ctz.fillText(selectedCreature.network.main.neurons[i][j].toFixed(1), i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
			}
		}

		for (let i = 0; i < selectedCreature.network.cellState.length; i++) {
			ctz.fillText(selectedCreature.network.cellState[i].toFixed(1), i * (nnui.size * 2 + 10) + nnui.xoffset, 21 * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
		}
	}
}