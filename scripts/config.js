// GLOBAL //
let seed = prompt("Seed?");

if (seed == "" || seed == null) seed = Math.floor(Math.random() * 99999);

let debugMode = false; // Shows debug info (angle, left and right turn outputs, and tile food)
let infoMode = true; // shows and hides info (neural network and graph)
let autoMode = false; // automatically calculate timescale (max 40ms to 60ms update time)

const minUpdateTime = 35; // Time between updates before the timescale is increased by 1 (automode, lower = less CPU use)
const maxUpdateTime = 45; // Time between updates before the timescale is decreased by 1 (automode, lower = less CPU use)

// [DANGER] EXPERIMENTAL //
const reverseEnabled = false; // My current time reversing solution is very naiive and so it takes up a lot of storage;
//Will crash by year 300 at most
const ticksPerCapture = 1000; // Number of ticks between frame captures. Only with reverseEnabled.
//(higher = WAY more CPU intensive, browser will crash above a certain amount); ONLY IF reverseEnabled = true

// MAP //
const mapSize = 120; // Size of the map (height and width) in tiles
const tileSize = 400; // Size of the tiles in pixels (at a zoom level of 1)
const selectSizeAddition = 100; // How far around creatures can you click to select them

const maxTileFood = 100; // Maximum food on a tile

const springGrowRate = 0.02; // Grow amount in spring season (applies to all tiles)
const winterGrowRate = -0.01; // Grow amount in winter season (applies to all tiles)

const grassSpreadRate = 0.00025; // % difference between tiles grass spread rate

// evergreen tiles are always grow at the same rate //
const everGreenCentralization = 0.3; // % How far from the center evergreen tiles are allowed to be
const everGreenPercentage = 0.8; // % of food tiles (within the central area) that are evergreen (always in grow season)
const everGreenGrowModifier = 0.7; // % speed evergreen tiles grow compared to normal tiles
const everGreenMaxFoodModifier = 1.2; // % maximum food is modified by on evergreen tiles

const mapComplexity = 2.2; // How complex the map is. Breaks below 1
const maxWaterPercentage = 0.3; // Water % past edge
const edgeDistance = 0.8; // How far from the center does water start forming
const edgeSmoothness = 0.0; // How smooth the transition from edge to water is. Reduces the appearance of a circular island.

const yearLength = 1800; // Length of the year (in ticks)

const mapUpdateDelay = 15; // How many ticks before the map tiles update

// CREATURES //

// Global //
const minCreatures = 50; // Minimum number of creatures
const minFirstGen = 50; // Minimum number of first generation creatures

const creatureLimit = 5000; // Maximum number of creatures (when population = creatureLimit, the game pauses)
const foodImposedCreatureLimit = 800; // Maximum number of creatures before food stops growing (when population = foodBasedCreatureLimit, food stops growing)

const maxCreatureSize = 125; // Maximum creature size (radius)
const minCreatureSize = 50; // Minimum creature size (radius)

const minEyes = 0; // Minimum number of "eyes" a creature can have
const maxEyes = 8; // Maximum number of "eyes" a creature can have

const minEyeDistance = 0; // Minimum eye distance in general (creatures will mutate the angle and distance)
const maxEyeDistance = tileSize * 5; // Maximum eye distance in general (creatures will mutate the angle and distance)

const internalClockSpeed = 60; // Internal clock speed in seconds = internalClockSpeed / 30;

// Initial //
const minInitEyes = 0; // Minimum "eyes" a first generation creature can have
const maxInitEyes = 3; // Maximum "eyes" a first generation creature can have

const initEyeDistanceH = 6; // Maximum distance an "eye" can be from a creature in tiles forward and backward initially
const initEyeDistanceV = 3; // Maximum distance an "eye" can be from a creature in tiles to either side initially

// Energy //
const maxCreatureEnergy = 80; // Maximum creature energy
const energyGraphMult = 100; // Energy graph height multiplier
const energyGraphWidth = 2; // Width of the energy graph

const energy = {
  eat: 0.25, // Energy cost to eat at eatPower
  move: 0.03, // Energy cost to move at maxCreatureSpeed
  rotate: 0.03, // Energy cost to rotate at rotationSpeed
  attack: 0.25 // Energy cost to attack at attackPower
};

// Eating //
const minEatPower = 0.25; // Minimum eating strength (anything lower will be considered 0)

const eatEffeciency = 0.8; // Eat effeciency %
const eatPower = 1; // Eating speed %

const eatDiminishingRate = 3; // Determines how uniformly diminishing returns are applied on eating; Higher is less diminishing; 0 is none; 1 is linear; (based on food on the tile / maxTileFood). Math.pow(tile.food / maxTileFood, eatDiminishingReturns)

// Metabolism //
const metabolismScaleTime = 3600; // Max lifespan of a creature in ticks (metabolismScaleTime / 30 = metabolismScaleTime in seconds)
const metabolismScaleScale = 10; // Determines how uniformly metabolism increases. 1 is linear; Higher = lower metabolism for longer. Math.pow(age / metabolismScaleTime, metabolismScaleScale)
const sizeMetabolismFactor = 0; // % how much size affects metabolism (creature size / maxCreatureSize)
const weightMetabolismFactor = 0; // % how much energy affects metabolism (creature energy / maxCreatureEnergy)

const minMetabolism = 0.05; // Initial metabolism
const maxMetabolism = 0.8; // End metabolism (metabolism when age == metabolismScaleTime)

// Movement //
const maxCreatureSpeed = 300; // Maximum creature speed (maxCreatureSpeed = maxAcceleration / friction)
const minMoveAmount = 0.2; // Minimum amount a creature is allowed to move as a percentage of maxCreatureSpeed
const friction = 0.085; // The friction applied each tick (percentage of velocity lost to friction; friction = maxAcceleration / maxCreatureSpeed)

const maxAcceleration = maxCreatureSpeed / (1 - friction) - maxCreatureSpeed; // Maximum creature acceleration (DO NOT MODIFY; maxAcceleration = maxCreatureSpeed * friction)

const swimmingSpeed = 0.7; // Movement speed % in water
const eatingSpeed = 0.2; // Movement speed % while eating

const rotationSpeed = 0.255; // Maximum rotation speed in radians per tick
const minRotation = 0.1; // Minimum rotation amount as a percentage of rotation speed


// Species //
const speciesDiversity = 80; // Diversity of each species
const speciesColorChange = 20; // Color change between species

const speciesGraphDetail = 50; // Higher = less detail (in ticks). Down to 1. High detail takes up a lot of memory after a while
let speciesGraphMult = 1; // Height of species graph
let speciesGraphAutoMult = false; // Is the graph height adjusted automatically (default: true)
let speciesGraphSmooth = 1; // Smoothness of the species graph, averages the the graph points
let speciesGraphAutoSmooth = false; // Does the smoothness scale over time (makes the species graph less spikey over time) (default: false)
let speciesGraphStretch = 1; // How stretched the graph is
let speciesGraphScrollSpeed = 20;

const minCreaturesForTracking = 5; // Minimum number of population needed for a species to be tracked on the species graph (saves memory)
const speciesAccuracy = 5; // How many times to run a feedforward and detect a species (increases geneticID length by about 25)

// Reproduction //
const birthEffeciency = 0.95; // Birth effeciency %

const minChildren = 1; // Minimum children a creature is allowed to produce
const maxChildren = 6; // Maximum children a creature is allowed to produce

const minChildEnergy = 0.3; // Min % of creatures energy to be given to a single child
const maxChildEnergy = 0.7; // Max % of creatures energy to be given to a single child

const minSpawnPower = -0.8; // Minimum output to reproduce (anything lower will be considered 0)

const reproduceAge = 1800; // Minimum number of ticks before a creature can spawn children (reproduceAge / 30 = minimum reproduce age in seconds)
const minReproduceTime = 900; // Minimum number of ticks between spawns (minReproduceTime / 30 = minimum time between spawns in seconds)

// Attacking //
const minAttackPower = 0.35; // Minimum attack strength (anything lower will be considered 0)

const attackEffeciency = 0.95; // Attack effeciency %
const attackPower = 2; // Attack power % (damage)


// Mutation //
const maxEyeAngleChange = (2 * Math.PI) / 24; // Maximum angle an eye can change by in a single mutation
const maxEyeDistanceChange = 300; // Maxmimum distance an eye can change distance in a single mutation

// ADVANCED //

// Neural Network //
const bias = 1.648; // Multiplied by the weight of a bias axon

const minMutability = { // Minimum mutability in various categories
  brain: 3,
  children: 3,
  childEnergy: 3,
  size: 3,
  eyes: {
    number: 3,
    angle: 3,
    distance: 3
  },
  mutability: 5
};

const maxMutability = { // Maximum mutability in various categories
  brain: 10,
  children: 20,
  childEnergy: 10,
  size: 20,
  eyes: {
    number: 5,
    angle: 5,
    distance: 5
  },
  mutability: 20
};

const maxMutabilityChange = 3; // Maximum amount any mutability can change by in a single mutation

const connectionDensity = 0.5; // % of axons initially connected in the brain
const maxInitialAxonValue = 3; // Maximum weight of an axon intially

const memories = 2; // # of memories a creature can store (outputs that do nothing, except store a value to be used as an input) — super expensive
// I have intentions to make this — and most things here — evolution-based (with config values for min, max, and intial min and max)

const stepAmount = 8; // Maximum amount an axon can be changed by in a single mutation

// ZOOM //
const zoomSpeed = 0.1; // How fast the zoom happens
const minZoomLevel = 1080 / (mapSize * tileSize); // Furthest zoom
const maxZoomLevel = 0.3; // Nearest zoom
let zoomLevel = 1080 / (mapSize * tileSize); // Default zoom

const panSpeed = 0.2;

// CENTER MAP (AUTOMATIC) //
let cropx = -(1920 - tileSize * mapSize * zoomLevel) / 2;
let cropy = -(1080 - tileSize * mapSize * zoomLevel) / 2;

// MISC //
const controls = {
  fastForward: "right",
  stop: "left",
  play: "down",
  debug: "d",
  gif: "g",
  auto: "up",
  info: "i",
  speciesGraphMode: "s",
  speciesGraphLeft: "a",
  speciesGraphRight: "d",
  speciesGraphDial: "q"
};

const nnui = { // Neural network UI config
  xoffset: 1920 - 100,
  yoffset: 70,
  xspacing: 10,
  yspacing: 100,
  size: 18,
  stroke: true,
  maxLineSize: 10,
  minLineSize: 5
};