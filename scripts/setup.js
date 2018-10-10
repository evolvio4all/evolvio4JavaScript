const display = document.getElementById("canvas");
const ctx = display.getContext("2d", {
	alpha: true
});


const viewport = document.getElementById("neuralnet");
const ctz = viewport.getContext("2d", {
	alpha: true
});

// VARIABLES //
const memories = 2;
const outputs = 5 + memories;
const inputs = 7;

const layers = [inputs + outputs * 2, (inputs + outputs * 3) / 2, (inputs + outputs * 3) / 2, outputs];
const forgetLayers = [inputs + outputs * 2, (inputs + outputs * 3) / 2, (inputs + outputs * 3) / 2, outputs];
const decideLayers = [inputs + outputs * 2, (inputs + outputs * 3) / 2, (inputs + outputs * 3) / 2, outputs];
const modifyLayers = [inputs + outputs * 2, (inputs + outputs * 3) / 2, (inputs + outputs * 3) / 2, outputs];

const connectionDensity = 0.32; // must be >= 0.26

let tick = 0;
let tc = 0;

let pause = false;

let timescale = 1;
let timeUp = 0;
let creatures = [];

let grv = 1;

let population = 0;

let timetoggle = false;

let selectedCreature = null;

let season = 0;
let seasonUp = true;

let specieslist = {};
let prefixes = ["Feles", "Canis", "Elephantus", "Porcus", "Vacca", "Apis", "Lupus", "Cervus", "Cerva", "Equus", "Leo", "Avis", "Serpentis", "Vulpes", "Polypus", "Apris", "Formica", "Ovis", "Sciurus", "Neotoma", "Dipodomys", "Chelicerata", "Crustacea", "Insecta", "Arachnida", "Craniforma", "Chilopoda", "Amphibia", "Acoela", "Clitellata", "Echiura", "Sipuncula", "Myzostomida", "Xiphosura", "Maxillopoda", "Malacostraca", "Mandibulata", "Malacostraca", "Anopheles", "Aedes", "Culex", "Zygentoma", "Archaeognatha", "Diplura", "Volantis", "Passer", "Patella", "Coccymys", "Syngamia", "Chrysomya", "Nepenthes", "Microtus", "Veronica", "Agrestis", "Amblyrhynchus", "Cristatus", "Ursus", "Hyperoodon", "Scalopus", "Sceloporus", "Zenaida", "Cygnus", "Sauromalus", "Fulica", "Achillea", "Semotilus", "Eubalaena", "Taxus", "Conus", "Erignathus", "Micrelaps", "Mallos", "Brachycephalus", "Brachyphylla", "Holochilus", "Brunneria", "Ceratogymna", "Meloe", "Rieppeleon", "Lophiotoma", "Ceratosoma"];
let suffixes = ["Unus", "Duo", "Tribus", "Quattuor", "Quinque", "Sex", "Septem", "Novem", "Decem", "Undecim", "Duodecim", "Tredecim", "Quattuordecim", "Quindecim", "Sedecim", "Septendecim", "Duodeviginti", "Undeviginti", "Viginti", "Maximus"];


// FUNCTIONS //

function newColor() {
	let h = Math.floor(seededNoise() * 360);
	let s = Math.floor(seededNoise() * 60 + 20);
	let l = Math.floor(seededNoise() * 60 + 20);

	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

function newSeed() {
	return Math.floor(Math.random() * 1000000);
}

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