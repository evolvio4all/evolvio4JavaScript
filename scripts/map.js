let map = [];
let outline = [];

function generateMap() {
    for (let i = 0; i < mapSize; i++) {
        map.push([]);
        for (let j = 0; j < mapSize; j++) {
            map[i].push(new Tile());
        }
    }

    generateOutline();
}

function generateOutline() {
    for (let i = 0; i < mapSize; i++) {
        for (let j = 0; j < mapSize; j++) {
            if (map[i][j].type === 0) {
                continue;
            }

            if (i < mapSize - 1 && map[i + 1][j].type === 0) {
                outline.push([(i + 1) * tileSize, j * tileSize, (i + 1) * tileSize, (j + 1) * tileSize]);
            }

            if (i > 1 && map[i - 1][j].type === 0) {
                outline.push([i * tileSize, j * tileSize, i * tileSize, (j + 1) * tileSize]);
            }

            if (j < mapSize - 1 && map[i][j + 1].type === 0) {
                outline.push([i * tileSize, (j + 1) * tileSize, (i + 1) * tileSize, (j + 1) * tileSize]);
            }

            if (j > 1 && map[i][j - 1].type === 0) {
                outline.push([i * tileSize, j * tileSize, (i + 1) * tileSize, j * tileSize]);
            }
        }
    }
}

function Tile() {
    this.type = Math.floor(seededNoise() * 3) % 2;
    this.food = maxTileFood / 1.2;
    if (this.type === 0) this.food = 0;
}