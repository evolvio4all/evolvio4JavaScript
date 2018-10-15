const display = document.getElementById("canvas");
const ctx = display.getContext("2d", {
	alpha: true
});


const viewport = document.getElementById("neuralnet");
const ctz = viewport.getContext("2d", {
	alpha: true
});

ctz.lineCap = "round";

let tick = 0;
let tc = 0;

let pause = false;

let timescale = 1;
let fastforward = false;

let debugToggle = false;

let population = 0;

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
let year = 0;

let firstGen = 0;

let specieslist = {};
let prefixes = ["Feles", "Canis", "Elephantus", "Porcus", "Vacca", "Apis", "Lupus", "Cervus", "Cerva", "Equus", "Leo", "Avis", "Serpentis", "Vulpes", "Polypus", "Apris", "Formica", "Ovis", "Sciurus", "Neotoma", "Dipodomys", "Chelicerata", "Crustacea", "Insecta", "Arachnida", "Craniforma", "Chilopoda", "Amphibia", "Acoela", "Clitellata", "Echiura", "Sipuncula", "Myzostomida", "Xiphosura", "Maxillopoda", "Malacostraca", "Mandibulata", "Malacostraca", "Anopheles", "Aedes", "Culex", "Zygentoma", "Archaeognatha", "Diplura", "Volantis", "Passer", "Patella", "Coccymys", "Syngamia", "Chrysomya", "Nepenthes", "Microtus", "Veronica", "Agrestis", "Amblyrhynchus", "Cristatus", "Ursus", "Hyperoodon", "Scalopus", "Sceloporus", "Zenaida", "Cygnus", "Sauromalus", "Fulica", "Achillea", "Semotilus", "Eubalaena", "Taxus", "Conus", "Erignathus", "Micrelaps", "Mallos", "Brachycephalus", "Brachyphylla", "Holochilus", "Brunneria", "Ceratogymna", "Meloe", "Rieppeleon", "Lophiotoma", "Ceratosoma"];
let suffixes = ["Unus", "Duo", "Tribus", "Quattuor", "Quinque", "Sex", "Septem", "Octo", "Novem", "Decem", "Undecim", "Duodecim", "Tredecim", "Quattuordecim", "Quindecim", "Sedecim", "Septendecim", "Duodeviginti", "Undeviginti", "Viginti"];

let lastKey = NaN;
let toggle = false;

// FUNCTIONS //

function newColor() {
	let h = Math.floor(seededNoise() * 360);
	let s = Math.floor(seededNoise() * 60 + 20);
  let l = 50;
  
  
	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

let grv = 1;
function seededNoise() {
	grv++;
	return Math.abs(seed * Math.tan(grv / Math.sin(grv * seed))) % 1;
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