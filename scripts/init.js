for (let i = 0; i < minCreatures; i++) {
	creatures.push(new Creature(seededNoise() * (mapSize * tileSize), seededNoise() * (mapSize * tileSize)));
}

generateMap();

setInterval(main, 1000 / 60);