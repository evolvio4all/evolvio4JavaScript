let map = [];

function generateMap() {
    for (let i = 0; i < mapSize; i++) {
        map.push([]);
        for (let j = 0; j < mapSize; j++) {
            map[i].push(new Tile());
        }
    }
}

function Tile() {
    this.type = Math.floor(seededNoise() * 3) % 2;
    this.food = maxTileFood / 1.2;
    if (this.type === 0) this.food = 0;
}