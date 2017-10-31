for (let i = 0; i < minCreatures; i++) {
    creatures.push(new Creature());
}

generateMap();

setInterval(main, 1000 / 60);
requestAnimationFrame(render);