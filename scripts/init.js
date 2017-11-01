for (let i = 0; i < minCreatures; i++) {
	creatures.push(new Creature(seededNoise() * (mapSize * tileSize), seededNoise() * (mapSize * tileSize), seededNoise() * maxCreatureSize + minCreatureSize));
}

generateMap();

setInterval(main, 1000 / 60);
requestAnimationFrame(render);