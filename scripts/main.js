function main() {
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

    keyEvents();
}

function wallLock(creature) {
    if (creature.x <= 0) {
        creature.x = 0;
    }

    if (creature.x >= display.width - 1) {
        creature.x = display.width - 1;
    }

    if (creature.y <= 0) {
        creature.y = 0;
    }

    if (creature.y >= display.height - 1) {
        creature.y = display.height - 1;
    }
}

function clampSize(creature) {
    if (creature.size > maxCreatureSize) creature.size = maxCreatureSize;
    if (creature.size < minCreatureSize) {
        if (creature == selectedCreature) selectedCreature = null;
        creature.die();
    }
}

function update() {
    tick++;
    population = creatures.length;

    for (let creature of creatures) {
        creature.maxSpeed = maxCreatureSpeed;
        wallLock(creature);

        let x = creature.x / display.width;
        let y = creature.y / display.height;
        let size = (creature.size - minCreatureSize) / (maxCreatureSize - minCreatureSize);
        let pos = creature.getPosition();
        let tileFood = map[pos[0]][pos[1]].food / maxTileFood;
        let eatPower = creature.output[2];
        let age = creature.age / reproduceAge;
        let reproduceTime = creature.reproduceTime / minReproduceTime;
        let xMove = creature.output[0];
        let yMove = creature.output[1];

        creature.input = [x, y, size, tileFood, eatPower, age, reproduceTime, xMove, yMove];
        creature.output = creature.feedForward(creature.input);

        creature.move();
        creature.metabolize();

        if (creature.output[2] > 0) creature.eat(pos);
        if (creature.output[3] > 0) {
            creature.reproduce();
        }

        creature.tick();

        clampSize(creature);

        if (creature == selectedCreature) {
            cropx -= (cropx - (creature.x - viewport.width / zoomLevel / 2)) / (50 / zoomLevel);
            cropy -= (cropy - (creature.y - viewport.height / zoomLevel / 2)) / (50 / zoomLevel);
        }
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
        }

        ctx.fillStyle = creature.color;
        ctx.fillCircle(creature.x, creature.y, creature.size, true);
    }

    ctz.drawImage(display, cropx, cropy, viewport.width / zoomLevel, viewport.height / zoomLevel, 0, 0, viewport.width, viewport.height);
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