const maxCreatureSize = 35; // Maximum Creature Size
const minCreatureSize = 10; // Minimum Creature Size

const offset = 0; // Amount to offset the value of a neuron

let zoomLevel = 1 / 3.7;
let oldest = 0;
const nnui = {
	xoffset: 1920 - 300,
	yoffset: 100,
	xspacing: 50,
	yspacing: 20,
	size: 30,
	stroke: true,
	maxLineSize: 10,
	minLineSize: 5
};

const zoomSpeed = 1;

const maxZoomLevel = 2;
const minZoomLevel = 1 / 3.7;

const maxColorChange = 10;

const selectSizeAddition = 20;

const numChildren = 2;

const maxCreatureSpeed = 5;

const seed = newSeed();

const mapSize = 40;
const minCreatures = 10;

const tileSize = 100;

const eatSpeed = 5;
const eatSize = 0.08;

const energy = {
	eat: 0.01,
	metabolism: 0.01,
	move: 0.01,
	birth: 0.5
};

const foodRegrowRate = 0.4;

const maxTileFood = 1000;

const reproduceAge = 2000;
const minReproduceTime = 1000;

const mutability = 10;
const totalProbability = (Math.log(1 - mutability / 100) / Math.log(0.99)) / mutability;

const controls = {
	fastForward: "right",
	speedUp: "up",
	stop: "left",
	play: "down"
};