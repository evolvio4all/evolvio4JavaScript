function main() {
	let odate = new Date();
	if (creatures.length > 2000) pause = true;
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
	if (ndate - odate < 100) render();
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

	if (season >= growSeasonLength + dieSeasonLength || season < 0) seasonUp = !seasonUp;

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
			lastContactPos = creature.lastContact.getPosition();
			lastContactSize = ((creature.lastContact.size - minCreatureSize) / (maxCreatureSize - minCreatureSize));
			lastContactX = creature.lastContact.x / (tileSize * mapSize);
			lastContactY = creature.lastContact.y / (tileSize * mapSize);
			lastContactColor = creature.lastContact.color.replace(" ", "").replace("hsl", "").replace("(", "").replace(")", "").split(",");
			lastContactEnergy = creature.lastContact.energy / (creatureEnergy * creature.size / maxCreatureSize);
		}

		let tileFood = map[pos[0]][pos[1]].food / maxTileFood;
		let age = (creature.age / (1000 / agingSpeed));
		let reproduceTime = creature.reproduceTime / (minReproduceTime * 2.5);
		let memory = [];

		creature.input = [1, x, y, size, energy, tileFood, age];

		creature.output = creature.feedForward(creature.input);

		if (creature.output[2] >= minEatPower) {
			creature.eat(pos);
		} else creature.maxSpeed = maxCreatureSpeed;
    
    if (map[pos[0]][pos[1]].type === 0) creature.maxSpeed = maxCreatureSpeed * swimmingSpeed;
    
		if (creature.output[3] >= minReproducePower) creature.reproduce();
		if (creature.output[4] >= minAttackPower) creature.attack();

		creature.move();
		creature.metabolize();

		creature.tick();

		if (creature == selectedCreature && zoomLevel > 0.424) {
			cropx -= (cropx - (creature.x * zoomLevel - canvas.width / 2)) / (50 / zoomLevel);
			cropy -= (cropy - (creature.y * zoomLevel - canvas.height / 2)) / (50 / zoomLevel);
		}
	}
}

function render() {
	ctx.clearRect(0, 0, display.width, display.height);
	ctz.clearRect(0, 0, viewport.width, viewport.height);

	for (let i in map) {
		for (let j in map[i]) {
			if (map[i][j].type === 0) continue;
			let hue = Math.max(100 - (season - growSeasonLength) / (growSeasonLength + dieSeasonLength) * 2 * 50, 50) + "," + Math.floor(map[i][j].food / maxTileFood * 100);
			
			ctx.fillStyle = "hsl(" + hue + "%, 22%)";
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
		ctz.fillStyle = "#222222";
		ctz.font = "32px Calibri";
		ctz.strokeStyle = "hsl(0, 0%, 100%)";
		ctz.lineWidth = 3;

		for (let j = 0; j < forgetLayers[0]; j++) {
			ctz.fillCircle(nnui.xoffset - 250, j * (nnui.size * 2 + 5) + nnui.yoffset, nnui.size, nnui.stroke);
		}

		for (let j = 0; j < forgetLayers[forgetLayers.length - 1]; j++) {
			ctz.fillCircle(nnui.xoffset - 150, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
		}

		for (let j = 0; j < decideLayers[decideLayers.length - 1]; j++) {
			ctz.fillCircle(nnui.xoffset - 100, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
		}

		for (let j = 0; j < modifyLayers[modifyLayers.length - 1]; j++) {
			ctz.fillCircle(nnui.xoffset - 50, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
		}

		for (let j = 0; j < layers[layers.length - 1]; j++) {
			ctz.fillCircle(nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
		}

		for (let i = 0; i < selectedCreature.network.cellState.length; i++) {
			ctz.fillCircle(i * 50 + 1920 - 350, 1080 - 35, nnui.size, nnui.stroke);
		}

    ctz.strokeStyle = "#000000";
		ctz.fillStyle = "#ffffff";
		
		ctz.textAlign = "left";
    ctz.strokeText(selectedCreature.species, 20, 1080 - 20);
		ctz.fillText(selectedCreature.species, 20, 1080 - 20);
		ctz.textAlign = "center";
		
    ctz.strokeText("Cell State", 1920 - 200, 1080 - 70);
		
		ctz.strokeText("X Move", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);
    ctz.strokeText("Y Move", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 1 - nnui.size - 12);
    ctz.strokeText("Eat", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 2 - nnui.size - 12);
    ctz.strokeText("Attack", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 3 - nnui.size - 12);
    ctz.strokeText("Mitosis", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 4 - nnui.size - 12);
    
    for (let i = 0; i < memories; i++) {
      ctz.strokeText("Mem. " + i, nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * (i + 5) - nnui.size - 12);
    }
    
    ctz.fillText("Cell State", 1920 - 200, 1080 - 70);
		
		ctz.fillText("X Move", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 0 - nnui.size - 12);
    ctz.fillText("Y Move", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 1 - nnui.size - 12);
    ctz.fillText("Eat", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 2 - nnui.size - 12);
    ctz.fillText("Attack", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 3 - nnui.size - 12);
    ctz.fillText("Mitosis", nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * 4 - nnui.size - 12);
    
    for (let i = 0; i < memories; i++) {
      ctz.fillText("Mem. " + i, nnui.xoffset - 75, nnui.yoffset + (nnui.size * 2 + nnui.yspacing) * (i + 5) - nnui.size - 12);
    }
    
    ctz.font = "bold 21px Calibri";
    
		for (let j = 0; j < forgetLayers[0]; j++) {
			ctz.fillText(selectedCreature.network.forget.neurons[0][j].toFixed(1), nnui.xoffset - 250, j * (nnui.size * 2 + 5) + nnui.yoffset + 6);
		}
    
		for (let j = 0; j < forgetLayers[forgetLayers.length - 1]; j++) {
			ctz.fillText(selectedCreature.network.forget.neurons[forgetLayers.length - 1][j].toFixed(1), nnui.xoffset - 150, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
		}

		for (let j = 0; j < decideLayers[decideLayers.length - 1]; j++) {
			ctz.fillText(selectedCreature.network.decide.neurons[decideLayers.length - 1][j].toFixed(1), nnui.xoffset - 100, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
		}

		for (let j = 0; j < modifyLayers[modifyLayers.length - 1]; j++) {
			ctz.fillText(selectedCreature.network.modify.neurons[modifyLayers.length - 1][j].toFixed(1), nnui.xoffset - 50, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
		}

		for (let j = 0; j < layers[layers.length - 1]; j++) {
			ctz.fillText(selectedCreature.network.main.neurons[layers.length - 1][j].toFixed(1), nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 6);
		}

		for (let i = 0; i < selectedCreature.network.cellState.length; i++) {
			ctz.fillText(selectedCreature.network.cellState[i].toFixed(1), i * 50 + 1920 - 350, 1080 - 35 + 6);
		}
	}
}