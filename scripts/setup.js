const display = document.getElementById("canvas");
const ctx = display.getContext("2d", {
  alpha: true
});

const viewport = document.getElementById("neuralnet");
const ctz = viewport.getContext("2d", {
  alpha: true
});

ctz.lineCap = "round";

let seed = prompt("Seed?");

if (seed == "" || seed == null) seed = Math.floor(Math.random() * 99999);

let tick = 0;
let tc = 0;
let timescale = 1;
let population = 0;
let oldest = 0;

let pause = false;

let fastforward = false;

let debugToggle = false;

var lastTick = -1;

let maxNewSpeciesTries = 50;

let creatures = [];
let selectedCreature = null;

let energyGraph = {
  eat: [],
  move: [],
  metabolism: [],
  attack: [],
  birth: [],
  net: [],
  gain: [],
  loss: [],
  total: []
};

let season = 0;
let seasonUp = true;
let day = 0;

let highestSimulatedTick = 0;

const tickList = [];

let replacer = ['x', 'y', 'output', 'network', 'color', 'rotation', 'eyes', 'energy', 'size', 'main', 'forget', 'decide', 'modify', 'cellState', 'neurons', 'energyGraph', 'gross', 'net', 'attack', 'eat', 'move', 'metabolism', 'age'];

let firstGen = 0;

let specieslist = {};
let prefixes = ["Feles", "Canis", "Elephantus", "Porcus", "Vacca", "Apis", "Lupus", "Cervus", "Cerva", "Equus", "Leo", "Avis", "Serpentis", "Vulpes", "Polypus", "Apris", "Formica", "Ovis", "Sciurus", "Neotoma", "Dipodomys", "Chelicerata", "Crustacea", "Insecta", "Arachnida", "Craniforma", "Chilopoda", "Amphibia", "Acoela", "Clitellata", "Echiura", "Sipuncula", "Myzostomida", "Xiphosura", "Maxillopoda", "Malacostraca", "Mandibulata", "Malacostraca", "Anopheles", "Aedes", "Culex", "Zygentoma", "Archaeognatha", "Diplura", "Volantis", "Passer", "Patella", "Coccymys", "Syngamia", "Chrysomya", "Nepenthes", "Microtus", "Veronica", "Agrestis", "Amblyrhynchus", "Cristatus", "Ursus", "Hyperoodon", "Scalopus", "Sceloporus", "Zenaida", "Cygnus", "Sauromalus", "Fulica", "Achillea", "Semotilus", "Eubalaena", "Taxus", "Conus", "Erignathus", "Micrelaps", "Mallos", "Brachycephalus", "Brachyphylla", "Holochilus", "Brunneria", "Ceratogymna", "Meloe", "Rieppeleon", "Lophiotoma", "Ceratosoma"];
let suffixes = ["Unus", "Duo", "Tribus", "Quattuor", "Quinque", "Sex", "Septem", "Octo", "Novem", "Decem", "Undecim", "Duodecim", "Tredecim", "Quattuordecim", "Quindecim", "Sedecim", "Septendecim", "Duodeviginti", "Undeviginti", "Viginti"];

let lastKey = NaN;
let toggle = false;

let creatureLocations = [];

let speciesGraph = [];
let speciesColors = [];
let speciesCountList = [];
let currentSpeciesGraphIndex = 0;

let speciesGraphDial = 0;
let speciesGraphAutoDial = true;

let waterTexture = new Image();
waterTexture.src = "./topwater.jpg";

let waterScrollX = -1000;
let waterScrollY = -1000;

let waterDirection = true;

let speciesGraphOn = false;


let noiseChain = [];

let keyToggle = true;

let brainNames = ["main", "decide", "modify", "forget"];
// FUNCTIONS //

function newColor(noiseGroup) {
  if (noiseGroup) {
    var h = Math.floor(seededNoiseB(0, 360));
  } else {
    var h = Math.floor(seededNoiseA(0, 360));
  }

  let l = 50;

  return "hsl(" + h + ", " + 100 + "%, " + l + "%)";
}

let grva = seed;
let grvb = seed;

function seededNoiseA(a, b) {
  let r1 = a || 0;
  let r2 = b || 1;

  let A = 12.5;
  let M = seed;

  let Q = M / A;
  let R = M % A;

  grva = (A * (grva % Q)) - (R * Math.floor(grva / Q));
  if (grva < 0) grva += M;

  return (grva / M) * (r2 - r1) + r1;
}

function seededNoiseB(a, b) {
  let r1 = a || 0;
  let r2 = b || 1;

  let A = 12.5;
  let M = seed;

  let Q = M / A;
  let R = M % A;

  grvb = (A * (grvb % Q)) - (R * Math.floor(grvb / Q));
  if (grvb < 0) grvb += M;

  return (grvb / M) * (r2 - r1) + r1;
}

function sortByHighestValue(a, b) {
  let aMax = 0;
  let bMax = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > aMax) {
      aMax = a[i];
    }
  }

  for (let i = 0; i < b.length; i++) {
    if (b[i] > bMax) {
      bMax = b[i];
    }
  }

  return aMax - bMax;
}

function strDifference(str1, str2) {
  let value = 0;
  for (let i = 2; i < str1.length; i++) {
    value += Math.abs(str1[i] - str2[i]);
  }
  return value;
}

function arrayDifference(arr1, arr2) {
  let value = 0;

  for (let i = 0; i < arr1.length; i++) {
    value += Math.abs(arr1[i] - arr2[i]);
  }

  return value;
}

CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r, s) {
  this.beginPath();
  this.arc(x, y, r, 0, 2 * Math.PI);
  this.closePath();

  this.fill();
  if (s) this.stroke();
};