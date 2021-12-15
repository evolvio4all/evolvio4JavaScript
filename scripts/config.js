// GLOBAL //
var seed = prompt("input seed"); // Determines everything.
console.log(seed);
//All random numbers are seeded based on this seed.
//All initially-spawned creatures will have exactly the same parameters and come in the same order, assuming nothing directly related to creatures spawning is changed
//This ensures you can toy around with most parameters freely and the simulation shouldn't change entirely
//The conditions the creature spawns in may not be exactly the same, and this is why
//you may see different behavior in the simulation after changing some parameters that would normally seem safe (i.e. speciesDiversity)

var debugMode = false; // Shows debug info (angle, left and right turn outputs, and tile food)

var DEV_DEBUG_MODE = false;

var infoMode = true; // shows and hides info (neural network and graph)
var autoMode = false; // automatically calculate timescale (max 40ms to 60ms update time)
var scentMode = false; // show or hide scent map
var brainDisplayMode = false; // show or hide the neural display of the brain

const minUpdateTime = 60; // Time between updates before the timescale is increased by 1 (automode, lower = less CPU use)
const maxUpdateTime = 75; // Time between updates before the timescale is decreased by 1 (automode, lower = less CPU use)

// [DANGER] EXPERIMENTAL //
const reverseEnabled = false; // My current time reversing solution is very naiive and so it takes up a lot of storage;
//Will crash by day 300 at most
const ticksPerCapture = 1000; // Number of ticks between frame captures. Only with reverseEnabled.
//(higher = WAY more CPU intensive, browser will crash above a certain amount); ONLY IF reverseEnabled = true

const bias = 0.00; // Bias added to each Neuron after activation function

// MAP //
const mapSize = 180; // Size of the map (height and width) in tiles
const tileSize = 800; // Size of the tiles in pixels (at a zoom level of 1)
const selectSizeAddition = 100; // How far around creatures can you click to select them

const maxTileFood = 80; // Maximum food on a tile

const springGrowRate = 0.001; // Grow amount in spring season (applies to all tiles)
const winterGrowRate = 0.000; // Grow amount in winter season (applies to all tiles)

const grassSpreadRate = 0.0003; // % difference between tiles grass spread rate
const dayLength = 900; // Length of the day (in ticks)

// Generation //
const firstMapFrequency = 5; // Frequency of the first noise mapSize
const firstMapImpact = 1 / 2; // Impact of the first noise map on the overall map

const secondMapFrequency = 13; // Frequency of the second noise mapSize
const secondMapImpact = 1 / 4; // Impact of the second noise map on the overall map

const thirdMapFrequency = 3; // Frequency of the third noise mapSize
const thirdMapImpact = 1 / 8; // Impact of the third noise map on the overall map

const edgeDistanceImpact = 0.5; // How far from the center does water start forming (higher = more water, lower = more land)
const centerDistanceImpact = 0.1 // How far from the center does land start forming (higher = more water, lower = more land)
const waterRatio = 0.4; // Water amount. Very close to a percentage but not exact (higher = more water)

const foodUpdateDelay = 15; // How many ticks between food tiles update
const scentUpdateDelay = 5; // How many ticks scent tile updates

// evergreen tiles are always grow at the same rate //
const everGreenNoiseFrequency = 4; // Frequency of evergreen noise function
const everGreenProminence = 1; // How prominent are evergreen tiles (arbitrary)
const everGreenInnerArea = 0.2; // How far from the edge evergreens start to spawn
const everGreenOuterArea = 0.3; // How far from the center are evergreens spawning
const everGreenPercentage = 0.7; // % of tiles (within the evergreen area) that are evergreen (always in grow season)

const everGreenGrowRate = springGrowRate * 1.2; // grow rate of evergreen tiles
const everGreenMaxFood = maxTileFood * 2; // maximum food on evergreen tiles
const everGreenGrassSpreadRate = grassSpreadRate * 1.2; // % difference between tiles grass spread rate for evergreen tiles


// CREATURES //

// Global //
const minCreatures = 10; // Minimum number of creatures
const minFirstGen = 35; // Minimum number of first generation creatures

const creatureLimit = 5000; // Maximum number of creatures (when population = creatureLimit, the game pauses)
const foodImposedCreatureLimit = 800; // Maximum number of creatures before food stops growing (when population = foodBasedCreatureLimit, food stops growing)

const maxCreatureSize = 66; // Maximum creature size (radius)
const minCreatureSize = 22; // Minimum creature size (radius)

const eyeSize = 0.12; // scalar
const pupilSize = 0.12; // scalar NOT relative to eye size

const minEyes = 1; // Minimum number of "eyes" a creature can have
const maxEyes = 8; // Maximum number of "eyes" a creature can have

const minEyeDistance = tileSize * 1; // Minimum eye distance in general (creatures will mutate the angle and distance)
const maxEyeDistance = tileSize * 18; // Maximum eye distance in general (creatures will mutate the angle and distance)

const fastInternalClockSpeed = 13; // Internal clock speed in seconds = internalClockSpeed / 30;
const slowInternalClockSpeed = 113;

// Initial //
const minInitEyeCount = 1; // Minimum number of eyes "eyes" a first generation creature can have
const maxInitEyeCount = 3; // Maximum number of "eyes" a first generation creature can have

const minAngleSampleCount = 1; // Minimum number of samples a creature will take from its vision "triangle"
const maxAngleSampleCount = 6; // Maxmimum number of samples a creature will take from its vision "triangle"

const minDistanceSampleCount = 3; // does nothing at the moment; Minimum number of samples a creature will take from its vision "triangle", in terms of distance from the creature in each raycast throughout the triangle
const maxDistanceSampleCount = 12; //  does nothing at the moment; Maxmimum number of samples a creature will take from its vision "triangle", in terms of distance from the creature in each raycast throughout the triangle

const minInitEyeDistance = 0; // Minimum distance an eye can raycast, can be shorter if the creature decides
const maxInitEyeDistance = 10 * tileSize; // Maximum distance an eye can raycast, can be shorter if the creature decides

const maxSpreadAngle = Math.PI; // Maximum spread angle for an eye (in radians) Pi/2 = 90, Pi = 180, 2*Pi = 360, etc.

// Energy //
const maxCreatureEnergy = 100; // Maximum creature energy
const energyGraphMult = 50; // Energy graph height multiplier
const energyGraphEnergyTotalMult = 0.01; // Energy total height on energy graph relative other lines
const energyGraphSpacing = 3; // Spacing beween points on the energy graph
const energyGraphWidth = 1920 - 350 - 150; // Width of the energy graph (in pixels, from the rightmost point)
const energyGraphX = 350; // X of the RIGHT SIDE of the energyGraph
const energyGraphY = 1080 - 180; // Y of the energyGraph

const energy = {
  eat: 0.25, // Energy cost to eat at eatPower
  move: 0.25, // Energy cost to move at maxCreatureSpeed
  rotate: 0.15, // Energy cost to rotate at rotationSpeed
  attack: 0.25 // Energy cost to attack at attackPower
};

// Eating //
const eatThreshold = 0.0; // Minimum eating strength (anything lower will be considered 0)
const minEatStrength = 1; // Anything over minEatPower will all be over this number.

const eatEffeciency = 1; // Eat effeciency %
const eatPower = 1; // Eating speed %

const pukePower = 0.25;

const eatDiminishingRate = 1; // Determines how uniformly diminishing returns are applied on eating; Higher is less diminishing; 0 is none; 1 is linear; (based on food on the tile / maxTileFood). Math.pow(tile.food / maxTileFood, eatDiminishingReturns)

// Metabolism //
const metabolismScaleTime = 3600; // How long it takes for metabolism to scale to maxMetabolism; Effectively lifespan of a creature in ticks (metabolismScaleTime / 30 = metabolismScaleTime in seconds)
const metabolismScaleScale = 1.5; // Determines how uniformly metabolism increases. 1 is linear; Higher = lower metabolism for longer. Math.pow(age / metabolismScaleTime, metabolismScaleScale)
const sizeMetabolismFactor = 0.2; // % how much size affects metabolism (creature size / maxCreatureSize)
const weightMetabolismFactor = 0.2; // % how much energy affects metabolism (creature energy / maxCreatureEnergy)

const minMetabolism = 0.05; // Initial metabolism
const maxMetabolism = 1; // End metabolism (metabolism when age == metabolismScaleTime)

// Movement //
const maxCreatureSpeed = 400; // Maximum creature speed (maxCreatureSpeed = maxAcceleration / friction)
const minMovePower = 0.1; // Minimum amount a creature is allowed to move as a percentage of maxCreatureSpeed

const staticFriction = { // The flat friction applied each tick on each surface
  water: 0.02,
  grass: 0.2,
  evergreen: 0.2
};

const velocityFriction = { // The friction applied each tick on each surface based on velocity (percentage)
  water: 0.2,
  grass: 0.03,
  evergreen: 0.03
};

const maxAcceleration = 40; // Maximum creature acceleration
const horizontalAccelerationModifier = 0.8; // How fast a creature can accelerate side-ways, as a percentage of maxAcceleration

const swimmingSpeed = 0.8; // Movement speed % in water
const eatingSpeed = 0.01; // Movement speed % while eating

const rotationSpeed = 0.3; // Maximum rotation speed in radians per tick
const minRotation = 0.1; // Minimum rotation amount as a percentage of rotation speed

// Species //
const speciesDiversity = 18; // Diversity of each species
const speciesColorChange = 55; // Color change between species

var speciesGraphDetail = 37; // Higher = less detail (in ticks). Down to 1. High detail takes up a lot of memory after a while

var speciesGraphMult = 1; // Height of species graph
var speciesGraphAutoMult = true; // Is the graph height adjusted automatically (default: false)

var speciesGraphSmooth = 1; // Smoothness of the species graph, averages the the graph points (can cause some weird visuals in the graph);
var speciesGraphAutoSmooth = false; // Does the smoothness scale over time (makes the species graph less spikey over time) (default: false)

var speciesGraphStretch = 4; // How stretched the graph is
var speciesGraphScrollSpeed = 20; // How fast the species graph dial moves per tick (z / x)

var speciesGraphX = 350; // Left side of speciesGraph
var speciesGraphWidth = 1920 - 350 - 150; // Width of speciesGraph //
var speciesGraphY = 1080 - 2; // Bottom side of speciesGraph
var speciesGraphHeight = 140; // How tall is the graph (is using automult)

var speciesGraphLinesHeight = 10; // Height of the vertical lines on the speciesGraph

const minCreaturesForTracking = 19; // Minimum number of population needed for a species to be tracked on the species graph (saves memory)
const speciesAccuracy = 15; // How many times to run a feedforward and detect a species (increases memory usage)

// Reproduction //
const birthEffeciency = 0.95; // Birth effeciency %

const minChildren = 1; // Minimum children a creature is allowed to produce
const maxChildren = 6; // Maximum children a creature is allowed to produce

const childEnergy = 15; // How much energy a child will start with
const childSizeCost = 5; // How much it costs for a child to be bigger
const childEyeCost = 1; // How much it costs for a child to have more eyes

const minSpawnPower = -0.9; // Minimum output to reproduce (anything lower will be considered 0)

const reproduceAge = 900; // Minimum number of ticks before a creature can spawn children (reproduceAge / 30 = minimum reproduce age in seconds)
const minReproduceTime = 400; // Minimum number of ticks between spawns (minReproduceTime / 30 = minimum time between spawns in seconds)

const reproduceRange = 5; // Maximum range creatures can reproduce with eachother within
const minReproductiveMembers = 1; // Minimum reproductiveMembers a species can have
const maxReproductiveMembers = 2; // Max reproductiveMembers a species can have

const childMutationChance = 0.1; // Chance a child will mutate at all

// Scent //
const scentDeplenishRate = 0.04; // How much scent deplinishes per tick
const maxTileScent = 100; // Maximum amount of scent for a single tile

const minScentPlacement = 0.1; // Minimum value of output to put scent on the ground voluntarily
const scentPlacementRate = 5; // Maximum intentional scent placement rate (at output = 1);

const minCreatureScentTrail = 0.2; // Min amount creatures add to tile scent per tick (from being on it)
const maxCreatureScentTrail = 0.5; // Max amount creatures add to tile scent per tick (from being on it)

const scentSpreadRate = 0.005; // Amount scent spreads from tile to tile (breaks if higher than 0.06 for some reason)
// Attacking //
const minAttackPower = 0.5; // Minimum attack strength (anything lower will be considered 0)

const attackRadius = 1 * tileSize; // Attack radius. Somewhat misleading, it's actually a box not a circle
const attackEffeciency = 0.95; // Attack effeciency %
const attackPower = 5; // Attack power % (damage)

const minAttackAge = 150; // Minimum age before a creature can attack

// Mutation //
const maxEyeAngleChange = (2 * Math.PI) / 24; // Maximum angle an eye can change by in a single mutation
const maxEyeDistanceChange = 300; // Maxmimum distance an eye can change distance in a single mutation

// ADVANCED //

// Neural Network //
const biases = 1;

const minMutability = { // Minimum mutability in various categories
  brain: 0.01,
  children: 2,
  childEnergy: 2,
  members: 2,
  size: 5,
  eyes: {
    number: 1,
    angle: 1,
    distance: 1
  },
  mutability: 5,
  biases: 2
};

const maxMutability = { // Maximum mutability in various categories
  brain: 0.05,
  children: 5,
  childEnergy: 5,
  members: 5,
  size: 20,
  eyes: {
    number: 10,
    angle: 10,
    distance: 10
  },
  mutability: 20,
  biases: 5
};

const maxMutabilityChange = 0.5; // Maximum amount any mutability can change by in a single mutation

const connectionDensity = [1, 1, 1, 1]; // % axons connected in each layer of the brain
const maxAxonsPerNeuron = 2; // Maximum number of connections a neuron can make to a neuron in the next layer. (I don't think this is implemented)
const maxInitialAxonValue = 16; // Maximum weight of an axon intially

const memories = [3, 3]; // dimensions of memories a creature can store
// I have intentions to make this — and most things here — evolution-based (with config values for min, max, and intial min and max)

const stepAdd = 0.2; // Maximum amount an axon can be changed by (additive)

// ZOOM //
const zoomSpeed = 0.1; // How fast the zoom happens
const minZoomLevel = 1080 / (mapSize * tileSize); // Furthest zoom
const maxZoomLevel = 0.8; // Nearest zoom
var zoomLevel = 1080 / (mapSize * tileSize); // Default zoom

const panSpeed = 0.2;

// CENTER MAP (AUTOMATIC) //
var cropx = -(1920 - tileSize * mapSize * zoomLevel) / 2;
var cropy = -(1080 - tileSize * mapSize * zoomLevel) / 2;

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
  speciesGraphLeft: "z",
  speciesGraphRight: "x",
  speciesGraphDial: "c",
  scent: "f",
  brainDisplayMode: "b",
  background: "n"
};

const maxTileHue = 190;

const nnui = { // Neural network UI config
  xoffset: 1480,
  yoffset: 90,
  xspacing: 100,
  yspacing: 7,
  brainspacingx: 0,
  brainspacingy: 0,
  verticalSpacingHidden: 8,
  verticalSpacingOut: 8.5,
  outputx: 1480 - 40,
  outputy: 400,
  cellStatex: 1480 - 40,
  cellStatey: 90,
  size: 6,
  stroke: true,
  maxLineSize: 10,
  minLineSize: 5
};

const ui = {
  xoffset: 1400,
  yoffset: 0,
  width: 1920 - 1400,
  height: 1080
}

const directionalDisplayLineLength = 10;

var uiBackground = false;