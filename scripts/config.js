const maxCreatureSize = 100; // Maximum Creature Size
const minCreatureSize = 30; // Minimum Creature Size
const creatureEnergy = 80;

const offset = 0.0; // Amount to offset the value of a neuron

let oldest = 0;
const nnui = {
    xoffset: 1920 - 100,
    yoffset: 70,
    xspacing: 10,
    yspacing: 100,
    size: 20,
    stroke: true,
    maxLineSize: 10,
    minLineSize: 5
};

const zoomSpeed = 3;
const eatSlowDown = 29;

const maxZoomLevel = 4;
const minZoomLevel = 0.0424;
let zoomLevel = 0.0424;

const selectSizeAddition = 40;

const maxCreatureSpeed = 30;

const seed = Math.floor(Math.random() * 999 + 1);

const mapSize = 100;
const minCreatures = 50;

const tileSize = 250;

const eatEffeciency = 0.9;

const energy = {
    eat: 0.1,
    metabolism: 0.5,
    move: 0.1,
    attack: 0.1,
    birth: 1
};

const attackEffeciency = 0.95;
const attackPower = 3;

const birthEffeciency = 0.85;

const foodRegrowRate = 0.02;

let maxTileFood = 100;

const ageSpeed = 0.2;
const reproduceAge = 500;
const minReproduceTime = 500;

const mutability = 4;
const totalProbability = (Math.log(1 - mutability / 100) / Math.log(0.99)) / mutability;

const growSeasonLength = 500;
const dieSeasonLength = 500;

const seasonChange = 0.02;

const waterBias = 0.4;

const stepAmount = 1;
const largeStepAmount = 3;
const minStepAmount = Number.EPSILON;
const speciesDiversity = 5;
const speciesColorChange = 20;

const minEatPower = 0.0;
const minReproducePower = 0.0;
const minAttackPower = 0.0;

const controls = {
    fastForward: "right",
    speedUp: "up",
    stop: "left",
    play: "down"
};