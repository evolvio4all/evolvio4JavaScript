let map = [];

function generate() {
	for (let i = 0; i < mapSize; i++) {
		map.push([]);
		for (let j = 0; j < mapSize; j++) {
			map[i].push(new Tile());
		}
	}
}

generate();