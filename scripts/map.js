let map = [];
let outline = [];
let spawnTiles = [];

noise.seed(seededNoise());  // We seed our noise generator

function generateMap() {
    for (let x = 0; x < mapSize; x++) {
        map.push([]);
        for (let y = 0; y < mapSize; y++) {
            map[x].push(new Tile(x, y));
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

            if (i > 0 && map[i - 1][j].type === 0) {
                outline.push([i * tileSize, j * tileSize, i * tileSize, (j + 1) * tileSize]);
            }

            if (j < mapSize - 1 && map[i][j + 1].type === 0) {
                outline.push([i * tileSize, (j + 1) * tileSize, (i + 1) * tileSize, (j + 1) * tileSize]);
            }

            if (j > 0 && map[i][j - 1].type === 0) {
                outline.push([i * tileSize, j * tileSize, (i + 1) * tileSize, j * tileSize]);
            }
        }
    }
}

function Tile(x, y) {
    var tile = noise.simplex2(x / continentSize, y / continentSize) - (waterBias * 2 - 1);
    // We increase odds of tile being water if it is further away from center (affected by distanceSmoothing)
    tile -= Math.sqrt(Math.pow(x - mapSize/2, 2) + Math.pow(y - mapSize/2, 2)) / (mapSize / 2) * distanceSmoothing;
    this.type = tile < 0 ? 0 : 1;
    this.food = maxTileFood * 0.5;
    
    this.x = x;
    this.y = y;
    
    if (this.type) {
      spawnTiles.push(this);
    } else {
      this.food = 0;
    }
}
