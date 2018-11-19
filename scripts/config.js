// GLOBAL //
const seed = Math.floor(Math.random() * 999 + 1);
let debugMode = false; // Shows debug info (angle, left and right turn outputs, and tile food)
let gifMode = false; // removes background
let infoMode = true; // shows and hides info (neural network and graph)
let autoMode = false; // automatically calculate timescale (max 40ms to 60ms update time)

const graphMult = 100; // Energy graph height multiplier

const minUpdateTime = 35; // Time between updates before the timescale is increased by 1 (automode, lower = less CPU use)
const maxUpdateTime = 45; // Time between updates before the timescale is decreased by 1 (automode, lower = less CPU use)

// MAP //
const mapSize = 150; // Size of the map (height and width) in tiles
const tileSize = 400; // Size of the tiles in pixels (at a zoom level of 1)
const selectSizeAddition = 100; // How far around creatures can you click to select them

const maxTileFood = 50; // Maximum food on a tile
const growSeasonGrowRate = 0.025; // How fast food regrows during grow season %
const dieSeasonGrowRate = -0.02; // How fast food regrows during die season %

const everGreenCentralization = 0.4; // % How far from the center evergreen tiles are allowed to be
const everGreenPercentage = 0.13; // % of food tiles (within the central area) that are evergreen (always in grow season)

const waterBias = 0.2; // Land vs. Water % (Becomes unstable above about 0.75; inexact)
const distanceSmoothing = 1.3; // Higher = Less land further away from center
const continentSize = 60; // How large the islands are (maintains water ratio, also determines island smoothness)

const growSeasonLength = 600; // Grow season length (growSeasonLength * 2 / 30 = growSeasonLength in seconds)
const dieSeasonLength = 300; // Die season length (dieSeasonLength * 2 / 30 = dieSeasonLength in seconds)

const mapUpdateDelay = 15; // How many ticks before the map tiles update

// CREATURES //

// Global //
const minCreatures = 50; // Minimum number of creatures
const minFirstGen = 50; // Minimum number of first generation creatures

const creatureLimit = 5000; // Maximum number of creatures (when population = creatureLimit, the game pauses)
const foodImposedCreatureLimit = 400; // Maximum number of creatures before food stops growing (when population = foodBasedCreatureLimit, food stops growing)

const maxCreatureSize = 125; // Maximum creature size (radius)
const minCreatureSize = 50; // Minimum creature size (radius)

const minEyes = 0; // Minimum number of "eyes" a creature can have
const maxEyes = 12; // Maximum number of "eyes" a creature can have

const minEyeDistance = 0; // Minimum eye distance in general (creatures will mutate the angle and distance)
const maxEyeDistance = tileSize * 5; // Maximum eye distance in general (creatures will mutate the angle and distance)

// Initial //
const minInitEyes = 0; // Minimum "eyes" a first generation creature can have
const maxInitEyes = 4; // Maximum "eyes" a first generation creature can have

const initEyeDistanceH = 6; // Maximum distance an "eye" can be from a creature in tiles forward and backward initially
const initEyeDistanceV = 3; // Maximum distance an "eye" can be from a creature in tiles to either side initially

// Energy //
const creatureEnergy = 50; // Maximum creature energy

const energy = {
    eat: 0.02, // Energy cost to eat at eatPower
    move: 0.02, // Energy cost to move at maxCreatureSpeed
    rotate: 0.02, // Energy cost to rotate at rotationSpeed
    attack: 0.2 // Energy cost to attack at attackPower
};

const metabolismScaleTime = 900; // Max lifespan of a creature in ticks (metabolismScaleTime / 30 = metabolismScaleTime in seconds)
const metabolismScaleScale = 4; // Determines how uniformly metabolism increases. Higher = lower metabolism for longer. Math.pow(age / metabolismScaleTime, metabolismScaleScale)

const minMetabolism = 0; // Initial metabolism
const maxMetabolism = 0.2; // End metabolism (metabolism when age == metabolismScaleTime)

// Movement //
const maxCreatureSpeed = 100; // Maximum creature speed (maxCreatureSpeed = maxAcceleration / friction)
const friction = 0.2; // The friction applied each tick (percentage of velocity lost to friction; friction = maxAcceleration / maxCreatureSpeed)

const maxAcceleration = maxCreatureSpeed / (1 - friction) - maxCreatureSpeed; // Maximum creature acceleration (DO NOT MODIFY; maxAcceleration = maxCreatureSpeed * friction)

const swimmingSpeed = 0.7; // Movement speed % in water
const eatingSpeed = 0.1; // Movement speed % while eating

// Species //
const speciesDiversity = 4; // Diversity of each species
const speciesColorChange = 10; // Color change between species

const rotationSpeed = 0.1; // Maximum rotation speed in radians per tick

// Birth //
const birthEffeciency = 0.5; // Birth effeciency %

const minChildren = 2; // Minimum children a creature is allowed to produce
const maxChildren = 8; // Maximum children a creature is allowed to produce

const minChildEnergy = 0.1; // Min % of creatures energy to be given to a single child
const maxChildEnergy = 0.7; // Max % of creatures energy to be given to a single child

// Eating //
const minEatPower = 0.1; // Minimum eating strength (anything lower will be considered 0)

const eatEffeciency = 0.9; // Eat effeciency %
const eatPower = 1; // Eating speed %

const eatDiminishingRate = 2; // Determines how uniformly diminishing returns are applied on eating; 0 is none; (based on food on the tile / maxTileFood). Math.pow(tile.food / maxTileFood, eatDiminishingReturns)

// Attacking //
const minAttackPower = 0.1; // Minimum attack strength (anything lower will be considered 0)

const attackEffeciency = 0.5; // Attack effeciency %
const attackPower = 10; // Attack power % (damage)

// Reproduction //
const minSpawnPower = 0.1; // Minimum output to reproduce (anything lower will be considered 0)

const reproduceAge = 700; // Minimum number of ticks before a creature can spawn children (reproduceAge / 30 = minimum reproduce age in seconds)
const minReproduceTime = 300; // Minimum number of ticks between spawns (minReproduceTime / 30 = minimum time between spawns in seconds)

// Mutation //
const maxEyeAngleChange = Math.PI; // Maximum angle an eye can change by in a single mutation
const maxEyeDistanceChange = 300; // Maxmimum distance an eye can change distance in a single mutation

// ADVANCED //

// Neural Network //
const bias = 0.1; // Multiplied by the weight of a bias axon

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
const maxInitialAxonValue = 20; // Maximum weight of an axon intially

const memories = 2; // # of memories a creature can store (outputs that do nothing, except store a value to be used as an input) — super expensive
// I have intentions to make this — and most things here — evolution-based (with config values for min, max, and intial min and max)

const stepAmount = 8; // Maximum amount an axon can be changed by in a single mutation

// ZOOM //
const zoomSpeed = 0.1; // How fast the zoom happens
const minZoomLevel = 1080 / (mapSize * tileSize); // Furthest zoom
const maxZoomLevel = 0.3;  // Nearest zoom
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
    info: "i"
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