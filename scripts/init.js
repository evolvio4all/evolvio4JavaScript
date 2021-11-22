//console.log("generating map")
generateMap(); // (scripts/map.js)

//console.log("spawning creatures")
spawnCreatures(minCreatures); // (scripts/creature.js)

//console.log("starting main")
setInterval(main, 1000 / 30); // Start looping main at 30 ticks per second (scripts/main.js)

//console.log("starting render")
requestAnimationFrame(render); // Start rendering, request a frame to render on (scripts/render.js)