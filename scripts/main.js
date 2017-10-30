function main() {
	for (let ts = 0; ts < timescale; ts++) {
		update();
	}
}

function wallLock(i) {
	if (creatures[i].x <= 0) {
		creatures[i].x = 0;
	}

	if (creatures[i].x >= display.width - 1) {
		creatures[i].x = display.width - 1;
	}

	if (creatures[i].y <= 0) {
		creatures[i].y = 0;
	}

	if (creatures[i].y >= display.height - 1) {
		creatures[i].y = display.height - 1;
	}
}

function clampSize(i) {
	if (creatures[i].size > maxCreatureSize) creatures[i].size = maxCreatureSize;
	if (creatures[i].size < minCreatureSize) {
		if (creatures[i] == selectedCreature) selectedCreature = null;
		creatures[i].die();
	}
}

function update() {
	tick++;
	population = creatures.length;

	for (let i in creatures) {
		creatures[i].maxSpeed = maxCreatureSpeed;
		wallLock(i);

		let x = creatures[i].x / display.width;
		let y = creatures[i].y / display.height;
		let size = (creatures[i].size - minCreatureSize) / (maxCreatureSize - minCreatureSize);
		let pos = creatures[i].getPosition();
		let tileFood = map[pos[0]][pos[1]].food / maxTileFood;
		let eatPower = creatures[i].output[2];
		let age = creatures[i].age / reproduceAge;
		let reproduceTime = creatures[i].reproduceTime / minReproduceTime;
		let xMove = creatures[i].output[0];
		let yMove = creatures[i].output[1];

		creatures[i].input = [x, y, size, tileFood, eatPower, age, reproduceTime, xMove, yMove];
		creatures[i].output = creatures[i].feedForward(creatures[i].input);

		creatures[i].move();
		creatures[i].metabolize();

		if (creatures[i].output[2] > 0) creatures[i].eat(pos);
		if (creatures[i].output[3] > 0) {
			creatures[i].reproduce();
		}

		creatures[i].tick();

		clampSize(i);
	}

	for (let i in map) {
		for (let j in map[i]) {
			if (map[i][j].type == 1) {
				if (map[i][j].food < maxTileFood) map[i][j].food += foodRegrowRate;
			}
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
			ctx.fillStyle = "hsl(90," + Math.round(map[i][j].food / maxTileFood * 100) + "%, 40%)";
			ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
		}
	}

	ctx.lineWidth = 5;
	for (let creature of creatures) {
		ctx.strokeStyle = "#ffffff";
		if (selectedCreature == creature) {
			ctx.strokeStyle = "#ff0000";
			cropx = creature.x - viewport.width / 2;
			cropy = creature.y - viewport.height / 2;
		}

		ctx.fillStyle = creature.color;
		ctx.fillCircle(creature.x, creature.y, creature.size, true);
	}

	ctz.drawImage(display, cropx, cropy, 1920, 1080, 0, 0, 1920, 1080);
	ctz.lineWidth = 5;
	if (selectedCreature !== null) {
		ctz.beginPath();
		for (let i = 0; i < layers.length; i++) {
			for (let j = 0; j < layers[i]; j++) {
				for (let k = 0; k < layers[i - 1]; k++) {
					//ctz.strokeStyle = "hsl(0, 0%, " + Math.floor(creatures[selectedCreature].network.axons[i - 1][j][k] * 100) + "%)";
					ctz.moveTo((i - 1) * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, k * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset);
					ctz.lineTo(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset);
				}
			}
		}
		ctz.stroke();

		ctz.fillStyle = "#222222";
		ctz.font = "24px Calibri";
		for (let i = 0; i < layers.length; i++) {
			for (let j = 0; j < layers[i]; j++) {
				ctz.fillCircle(i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset, nnui.size, nnui.stroke);
			}
		}

		ctz.fillStyle = "#ffffff";
		for (let i = 0; i < layers.length; i++) {
			for (let j = 0; j < layers[i]; j++) {
				ctz.fillText(selectedCreature.network.neurons[i][j].toFixed(2), i * (nnui.size * 2 + nnui.xspacing) + nnui.xoffset - 20, j * (nnui.size * 2 + nnui.yspacing) + nnui.yoffset + 10);
			}
		}
	}
	requestAnimationFrame(render);
}

setInterval(main, 1000 / 60);
requestAnimationFrame(render);