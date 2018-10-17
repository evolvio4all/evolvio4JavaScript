// GLOBAL //
const seed = Math.floor(Math.random() * 999 + 1); // 314
let debugMode = false; // Shows debug info (angle, left and right turn outputs, and tile food)
let gifMode = false; // removes background
let autoMode = false; // automatically calculate timescale
let infoMode = true; // shows and hides info (neural network and graph)

// MAP //
const mapSize = 100; // Size of the map (height and width) in tiles
const tileSize = 350; // Size of the tiles in pixels (at a zoom level of 1)
const selectSizeAddition = 40; // How far around creatures can you click to select them

let maxTileFood = 15; // Maximum food in a tile
const growSeasonGrowRate = 0.03; // How fast food regrows
const dieSeasonGrowRate = 0.02; // How fast food regrows

const waterBias = 0.2; // Becomes unstable above about 0.75
const distanceSmoothing = 0.5; // less land further away from center
const continentSize = 80; // How large the islands are (maintains water ratio)

const growSeasonLength = 1800; // Grow season length
const dieSeasonLength = 600; // Die season length

const mapUpdateDelay = 30; // How many ticks before the map tiles update

// CREATURES //
const minCreatures = 50; // Minimum number of creatures
const minFirstGen = 50; // Minimum number of first generation creatures

const creatureEnergy = 50; // Max creature energy

const metabolismScaleTime = 600; // Max lifespan of a creature in ticks (metabolismScaleTime / 30 = metabolismScaleTime in seconds)
const minMetabolism = 0.1; // Initial metabolism
const maxMetabolism = 0.2; // End metabolism (metabolism when age == metabolismScaleTime)

const speciesDiversity = 20; // Diversity of each species
const speciesColorChange = 20; // Color change between species

const maxCreatureSize = 100; // Maximum creature size
const minCreatureSize = 30; // Minimum creature size

const maxCreatureSpeed = 50; // Maximum creature speed
const swimmingSpeed = 0.3; // Movement speed % in water

const eatingSpeed = 0.0; // Movement speed % while eating

const rotationSpeed = 0.1; // Speed % how fast creatures rotate

let oldest = 0; // Oldest creature's age

const minInitEyes = 1; // Minimum "eyes" a first generation creature can have
const maxInitEyes = 3; // Maximum "eyes" a first generation creature can have

const minEyes = 0; // Minimum number of "eyes" a creature can have
const maxEyes = 12; // Maximum number of "eyes" a creature can have

const minEyeDistance = 0; // Minimum distance an "eye" can be from a creature
const maxEyeDistance = 500; // Maximum distance an "eye" can be from a creature

const maxEyeAngleChange = 1;
const maxEyeDistanceChange = 30;

const minChildren = 1; // Minimum children a creature is allowed to produce
const maxChildren = 10; // Maximum children a creature is allowed to produce

const minChildEnergy = 0.2; // Min % of creatures energy to be given to a single child
const maxChildEnergy = 0.8; // Max % of creatures energy to be given to a single child

const energy = { // Energy cost per tick
    eat: 0.1, // Energy cost to eat
    move: 0.1, // Energy cost to move
    attack: 0.1 // Energy cost to attack
};

const eatEffeciency = 1; // Eat effeciency %
const birthEffeciency = 0.9; // Birth effeciency %

const attackEffeciency = 0.95; // Attack effeciency %
const attackPower = 3.00; // Attack power % (damage)

const minEatPower = 0.0; // Minimum eating strength (anything lower will be 0)
const minSpawnPower = 0.0; // Minimum output to reproduce (anything lower will be 0)
const minAttackPower = 0.0; // Minimum attack strength (anything lower will be 0)

const reproduceAge = 300; // Minimum number of ticks before a creature spawn children (reproduceAge / 30 = minimum reproduce age in seconds)
const minReproduceTime = 150; // Minimum number of ticks between spawns (minReproduceTime / 30 = minimum time between spawns in seconds)

// Neural Network //
const offset = 0.1; // Amount to offset the value of a neuron

const minMutability = { // Minimum mutability in various categories
  brain: 2,
  children: 2,
  childEnergy: 2,
  size: 2,
  eyes: {
    number: 2,
    angle: 2,
    distance: 2
  },
  mutability: 2
};

const maxMutability = { // Maximum mutability in various categories
  brain: 10,
  children: 10,
  childEnergy: 10,
  size: 10,
  eyes: {
    number: 10,
    angle: 10,
    distance: 10
  },
  mutability: 10
};

const maxMutabilityChange = 2; // Maximum amount any mutability can change by

const connectionDensity = 0.2; // % of axons initially connected in the brain

const memories = 3; // # of memories a creature can store (outputs that do nothing, except store a value)

const stepAmount = 2; // Maximum amount an axon can be changed by in mutation

const minInitialAxonValue = -6; // Minimum power of an axon intially
const maxInitialAxonValue = 6; // Maximum power of an axon intially

// ZOOM //
const zoomSpeed = 0.01; // How fast the zoom happens
const minZoomLevel = 0.0424 / 2; // Furthest zoom
const maxZoomLevel = 4;  // Nearest zoom
let zoomLevel = 0.0424; // Default zoom

// CENTER MAP (AUTOMATIC) //
let cropx = -(1920 - tileSize * mapSize * zoomLevel) / 2;
let cropy = -(1080 - tileSize * mapSize * zoomLevel) / 2;

// MISC //
const controls = {
    fastForward: "right",
    speedUp: "up",
    stop: "left",
    play: "down",
    debug: "d",
    gif: "g",
    auto: "a",
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