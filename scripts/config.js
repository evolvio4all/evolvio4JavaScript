// GLOBAL //
const seed = Math.floor(Math.random() * 999 + 1);
let debugMode = true; // Shows debug info (angle, left and right turn outputs, and tile food)
let gifMode = false; // removes background
let autoMode = false; // automatically calculate timescale

// MAP //
const mapSize = 150; // Size of the map (height and width) in tiles
const tileSize = 250; // Size of the tiles in pixels (at a zoom level of 1)
const selectSizeAddition = 40; // How far around creatures can you click to select them

let maxTileFood = 100; // Maximum food in a tile
const foodRegrowRate = 0.025; // How fast food regrows

const waterBias = 0.4; // Becomes unstable above about 0.75
const distanceSmoothing = 0.5; // less land further away from center
const continentSize = 50; // How large the islands are (maintains water ratio)

const growSeasonLength = 800; // Grow season length
const dieSeasonLength = 1000; // Die season length

const seasonChange = 0.02; // Food grow speed change (added in grow season and subtracted in die season)
const mapUpdateDelay = 100; // How many ticks before the map tiles update

// CREATURES //
const minCreatures = 50; // Minimum number of creatures
const minFirstGen = 10; // Minimum number of first generation creatures

const creatureEnergy = 80; // Max creature energy

const speciesDiversity = 6; // Diversity of each species
const speciesColorChange = 20; // Color change between species

const maxCreatureSize = 100; // Maximum Creature Size
const minCreatureSize = 30; // Minimum Creature Size

const maxCreatureSpeed = 30; // Maximum Creature Speed
const swimmingSpeed = 0.3; // Speed % in water
const agingSpeed = 0.2; // Aging speed percentage %
const eatingSpeed = 0.0; // Speed % while eating

const rotationSpeed = 0.1; // Speed % how fast creatures rotate

let oldest = 0; // oldest creature's age
const maxInitEyes = 2;
const maxEyes = 6; // maximum number of "eyes" a creature can have
const maxEyeDistance = 500; // Maximum distance an "eye" can be from a creature

const energy = { // Energy cost per tick
    eat: 0.04, // Energy cost to eat
    metabolism: 0.04, // Energy cost to live
    move: 0.05, // Energy cost to move
    attack: 0.04, // Energy cost to attack
    birth: 1 // Energy cost to birth
};

const eatEffeciency = 0.9; // Eat effeciency %
const birthEffeciency = 0.85; // Birth effeciency %
const attackEffeciency = 2.00; // Attack effeciency %
const attackPower = 3.00; // Attack power %

const minEatPower = 0.0; // Minimum eating strength (anything lower will be 0)
const minReproducePower = 0.0; // Minimum output to reproduce (anything lower will be 0)
const minAttackPower = 0.0; // Minimum attack strength (anything lower will be 0)

const reproduceAge = 1200; // Minimum age when a creature can reproduce
const minReproduceTime = 800; // Minimum time between litters

// Neural Network //
const offset = 0.0; // Amount to offset the value of a neuron
const mutability = 4; // Chance of mutating a single axon

const minStepAmount = Number.EPSILON; // Min step amount (Number.EPSILON is the smallest positive number)
const stepAmount = 3; // Max step amount

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
    auto: "a"
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