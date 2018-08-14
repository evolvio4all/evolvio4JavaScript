const maxCreatureSize = 100; // Maximum Creature Size
const minCreatureSize = 30; // Minimum Creature Size
const creatureEnergy = 80;

const offset = 0.0; // Amount to offset the value of a neuron

let oldest = 0;
const nnui = {
    xoffset: 1920 - 300,
    yoffset: 30,
    xspacing: 50,
    yspacing: 5,
    size: 20,
    stroke: true,
    maxLineSize: 10,
    minLineSize: 5
};

const zoomSpeed = 3;
const eatSlowDown = 50;

const maxZoomLevel = 4;
const minZoomLevel = 0.04;
let zoomLevel = 0.04;

const selectSizeAddition = 40;

const maxCreatureSpeed = 30;

const seed = Math.floor(Math.random() * 1000 + 1);

const mapSize = 100;
const minCreatures = 80;

const tileSize = 250;

const eatEffeciency = 0.26;

const energy = {
    eat: 0.02,
    metabolism: 0.2,
    move: 0.02,
    birth: 1,
    attack: 0.02
};

const attackEffeciency = 0.26;
const attackPower = 3;

const birthEffeciency = 0.8;

const foodRegrowRate = 0.03;

let maxTileFood = 250;

const ageSpeed = 0.7;
const reproduceAge = 500;
const minReproduceTime = 500;

const mutability = 5;
const totalProbability = (Math.log(1 - mutability / 100) / Math.log(0.99)) / mutability;

const growSeasonLength = 500;
const dieSeasonLength = 1000;

const seasonChange = 0.02;

const waterBias = 0.3;

const stepAmount = 5;
const largeStepAmount = 5;
const minStepAmount = Number.EPSILON;
const speciesDiversity = 500;
const speciesColorChange = 15;

const minEatPower = 0.0;
const minReproducePower = 0.0;
const minAttackPower = 0.0;

const controls = {
    fastForward: "right",
    speedUp: "up",
    stop: "left",
    play: "down"
};