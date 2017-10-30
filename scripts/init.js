const display = document.getElementById("canvas");
const ctx = display.getContext("2d");

const viewport = document.getElementById("viewport");
const ctz = viewport.getContext("2d");

const layers = [10, 6, 4];

let tick = 0;

if (seed === null) seed = newSeed();

let timescale = 1;
let creatures = [];

let population = minCreatures;

let selectedCreature = null;

function newColor() {
    let h = Math.floor(Math.random() * 360);
    let s = Math.floor(Math.random() * 100);
    let l = Math.floor(Math.random() * 100);

    return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r, s) {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI);
    this.closePath();

    this.fill();
    if (s) this.stroke();
};

function newSeed() {
    return Math.floor(Math.random() * 1000000);
}

function Tile() {
    this.type = Math.floor(Math.random() * 2);
    this.food = Math.floor(Math.random() * maxTileFood);
    if (this.type === 0) this.food = 0;
}

Creature.prototype.die = function() {
    if (population <= minCreatures) {
        this.randomize();
    } else {
        let pos = creatures.indexOf(this);
        creatures.splice(pos, 1);
    }
};

Creature.prototype.tick = function() {
    this.age++;
    this.reproduceTime++;
};

Creature.prototype.randomize = function() {
    this.x = Math.random() * display.width;
    this.y = Math.random() * display.height;

    this.age = 0;
    this.reproduceTime = 0;

    this.size = Math.random() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
    this.energy = 100;

    this.color = newColor();

    this.genes = [this.color];

    this.maxSpeed = maxCreatureSpeed;

    this.network = {};
    this.createNeuralNetwork();
};

Creature.prototype.getPosition = function() {
    let x = Math.floor(this.x / tileSize);
    let y = Math.floor(this.y / tileSize);

    return [x, y];
};

for (let i = 0; i < minCreatures; i++) {
    creatures.push(new Creature());
}


let cropx = 0;
let cropy = 0;

let mouse = {
    up: {},
    down: {},
    current: {},
    isdown: false
};

window.onmousedown = function(e) {
  mouse.down.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
  mouse.down.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);
  
  mouse.isdown = true;
  
  selectedCreature = null;
};

window.onmouseup = function(e) {
  mouse.up.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
  mouse.up.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);
  
  mouse.isdown = false;
  
  for (let creature of creatures) {
  	if (creature.select()) {
  		selectedCreature = creature;
  	}
  }
};

window.onmousemove = function(e) {
  mouse.current.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
  mouse.current.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);
  
  if (mouse.isdown) {
      cropx += lcx - mouse.current.x;
      cropy += lcy - mouse.current.y;
  }
  
  lcx = mouse.current.x;
  lcy = mouse.current.y;
};