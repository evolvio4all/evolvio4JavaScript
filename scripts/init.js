generateMap();

for (let i = 0; i < minCreatures; i++) {
	creatures.push(new Creature());
}

setInterval(main, 1000 / 60);