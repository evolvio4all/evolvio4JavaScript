for (let i = 0; i < minCreatures; i++) {
    creatures.push(new Creature(seededNoise(i, 3) * (mapSize * tileSize) + 1, seededNoise(i, i / 3) * (mapSize * tileSize) + 1, seededNoise(i + 3, i) * maxCreatureSize + minCreatureSize));
}


generateMap();

setInterval(main, 1000 / 60);
requestAnimationFrame(render);