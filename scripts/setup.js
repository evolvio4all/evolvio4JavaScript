const display = document.getElementById("canvas");
const ctx = display.getContext("2d", {
    alpha: false
});

const viewport = document.getElementById("viewport");
const ctz = viewport.getContext("2d", {
    alpha: false
});

// VARIABLES //

const layers = [10, 6, 4];

let tick = 0;
let tc = 0;

let seed = newSeed();

let timescale = 1;
let creatures = [];

let population = 0;

let selectedCreature = null;

let cropx = 0;
let cropy = 0;

// FUNCTIONS //

function newColor() {
    let h = Math.floor(Math.random() * 360);
    let s = Math.floor(Math.random() * 100);
    let l = Math.floor(Math.random() * 100);

    return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

function newSeed() {
    return Math.floor(Math.random() * 1000000);
}

function Tile() {
    this.type = Math.floor(Math.random() * 2);
    this.food = Math.floor(Math.random() * maxTileFood);
    if (this.type === 0) this.food = 0;
}

CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r, s) {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI);
    this.closePath();

    this.fill();
    if (s) this.stroke();
};