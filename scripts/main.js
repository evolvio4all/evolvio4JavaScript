function main() {
	let odate = new Date();
	if (creatures.length > 8000) return;
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

	if (ndate - odate > 50 && !fastforward && autoMode) {
		if (timescale > 1) timescale--;
		else timescale /= 1.01;
	} else if (ndate - odate < 40 && !fastforward && autoMode) {
		if (timescale >= 1) timescale++;
		else timescale *= 1.01;
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
	if (seasonUp) {
		season++;
	} else season--;

	if (season >= growSeasonLength + dieSeasonLength || season < 0) {
		seasonUp = !seasonUp;
		if (seasonUp) year++;
	}

	if (season % mapUpdateDelay == 0) {
		for (let i in map) {
			for (let j in map[i]) {
				if (map[i][j].type == 1) {
					if (season < growSeasonLength) {
						map[i][j].food += growSeasonGrowRate * mapUpdateDelay;
					} else {
						map[i][j].food += dieSeasonGrowRate * mapUpdateDelay;
					}

					if (map[i][j].food > map[i][j].maxFood) map[i][j].food = map[i][j].maxFood;
					else if (map[i][j].food < 0) map[i][j].food = 0;
				}
			}
		}
	}

	firstGen = 0;

	for (let creature of creatures) {
		if (creature.age > oldest) oldest = creature.age;
		if (creature.generation === 0) firstGen++;

		let size = ((creature.size - minCreatureSize) / (maxCreatureSize - minCreatureSize));
		let energy = creature.energy / creatureEnergy;
		let pos = creature.getPosition();

		// UNUSED SENSES //
		/* let x = (creature.x / (tileSize * mapSize));
			let y = (creature.y / (tileSize * mapSize));
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
				lastContactPos = creature.lastContact.getPosition();
				lastContactSize = ((creature.lastContact.size - minCreatureSize) / (maxCreatureSize - minCreatureSize));
				lastContactX = creature.lastContact.x / (tileSize * mapSize);
				lastContactY = creature.lastContact.y / (tileSize * mapSize);
				lastContactColor = creature.lastContact.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");
				lastContactEnergy = creature.lastContact.energy / (creatureEnergy * creature.size / maxCreatureSize);
			}
		
			let memory = [];
			let age = creature.age / metabolismScaleTime;
			let reproduceTime = creature.reproduceTime / (minReproduceTime * 2.5); */

		let tileFood = map[pos[0]][pos[1]].food / maxTileFood;

		let rotation = creature.rotation / (2 * Math.PI);

		let time = (tick % 15) / 15;

		creature.input = [time, rotation, energy, season / (growSeasonLength + dieSeasonLength)];

		for (let eye of creature.eyes) {
			if (eye.see()[1] == "tile") {
				creature.input.push(eye.see()[0].food / maxTileFood);
				creature.input.push(Math.max(100 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 2 * 50, 50) / 360);
			} else if (eye.see()[1] == "creature") {
				creature.input.push(eye.see()[0].energy / creatureEnergy);
				creature.input.push((parseInt(eye.see()[0].color.split(",")[0].replace("hsl(", "")) % 360) / 360);
			} else if (eye.see()[1] == "oob") {
				creature.input.push(eye.see()[0]);
				creature.input.push(eye.see()[0]);
			}
		}

		creature.output = creature.feedForward(creature.input);

		creature.maxSpeed = maxCreatureSpeed;

		if (map[pos[0]][pos[1]].type === 0) creature.maxSpeed = maxCreatureSpeed * swimmingSpeed;

		creature.eat(pos);
		creature.move();
		
		creature.reproduce();
		creature.attack();
		creature.metabolize();
		creature.tick();

		creature.energyGraph.net.push(creature.energy - creature.lastEnergy);
		creature.energyGraph.gross.push(creature.energy);

		creature.lastEnergy = creature.energy;

		if (creature == selectedCreature && zoomLevel > 0.05) {
			cropx -= (cropx - (creature.x * zoomLevel - canvas.width / 2)) / (50 / zoomLevel);
			cropy -= (cropy - (creature.y * zoomLevel - canvas.height / 2)) / (50 / zoomLevel);
		}

		wallLock(creature);
		clampSize(creature);
	}

	population = creatures.length;
}

function render() {
	ctx.clearRect(0, 0, display.width, display.height);
	ctz.clearRect(0, 0, viewport.width, viewport.height);

	for (let i in map) {
		for (let j in map[i]) {
			if (map[i][j].type === 0) continue;
			let hue = Math.max(100 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 2 * 50, 50) + "," + Math.floor(map[i][j].food / maxTileFood * 100);

			ctx.fillStyle = "hsl(" + hue + "%, 22%)";
			ctx.fillRect(i * tileSize * zoomLevel - cropx - 1, j * tileSize * zoomLevel - cropy - 1, tileSize * zoomLevel + 2, tileSize * zoomLevel + 2);
		}
	}

	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 15 * zoomLevel;

	ctx.beginPath();
	for (let i in outline) {
		ctx.moveTo(outline[i][0] * zoomLevel - cropx, outline[i][1] * zoomLevel - cropy);
		ctx.lineTo(outline[i][2] * zoomLevel - cropx, outline[i][3] * zoomLevel - cropy);
	}
	ctx.stroke();

	ctx.strokeStyle = "#ffffff";

	for (let creature of creatures) {
		ctx.fillStyle = "rgba(255, 0, 0, " + creature.output[3] + ")";
		let pos = [Math.floor((creature.x + Math.cos(creature.rotation) * tileSize) / tileSize), Math.floor((creature.y + Math.sin(creature.rotation) * tileSize) / tileSize)];

		if (creature.output[3] > minAttackPower) {
			ctx.fillRect(pos[0] * zoomLevel * tileSize - cropx, pos[1] * zoomLevel * tileSize - cropy, tileSize * zoomLevel, tileSize * zoomLevel);
		}
	}

	for (let creature of creatures) {
		ctx.lineWidth = 10 * zoomLevel;

		ctx.fillStyle = creature.color;
		ctx.fillCircle(creature.x * zoomLevel - cropx, creature.y * zoomLevel - cropy, creature.size * zoomLevel, true);

		ctx.beginPath();
		ctx.moveTo(creature.x * zoomLevel - cropx, creature.y * zoomLevel - cropy);
		ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation) * (creature.size + 75) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation) * (creature.size + 75) * zoomLevel);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation) * creature.size * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation) * creature.size * zoomLevel);
		ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation - Math.PI / 2) * ((creature.size - 3) * creature.network.output[0]) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation - Math.PI / 2) * ((creature.size - 3) * creature.network.output[0]) * zoomLevel);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation) * creature.size * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation) * creature.size * zoomLevel);
		ctx.lineTo(creature.x * zoomLevel - cropx + Math.cos(creature.rotation + Math.PI / 2) * ((creature.size - 3) * creature.network.output[1]) * zoomLevel, creature.y * zoomLevel - cropy + Math.sin(creature.rotation + Math.PI / 2) * ((creature.size - 3) * creature.network.output[1]) * zoomLevel);
		ctx.stroke();

		if (debugMode) {
			ctx.lineWidth = 2 * zoomLevel;

			for (let eye of creature.eyes) {
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

	ctz.strokeText("Year " + year, 1920 / 2, 50);
	ctz.fillText("Year " + year, 1920 / 2, 50);

	ctz.textAlign = "left";
	ctz.strokeText("Population: " + population, 40, 1040);
	ctz.fillText("Population: " + population, 40, 1040);

	ctz.textAlign = "right";
	ctz.strokeText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);
	ctz.fillText((timescale < 1 ? timescale.toFixed(1) : Math.ceil(timescale)) + "x", 1880, 1040);

	ctz.textAlign = "center";

	if (debugMode) {
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