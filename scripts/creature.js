function Creature(x, y, s, c) {
	this.x = x || seededNoise() * display.width;
	this.y = y || seededNoise() * display.height;

	this.size = s || seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.energy = 100;
	
	this.age = 0;
	this.reproduceTime = 0;
	
	this.color = c || newColor();
	
	this.genes = [this.color];
	
	this.maxSpeed = maxCreatureSpeed;
	
	this.output = [0, 0, 0];
	
	this.network = {};
	this.createNeuralNetwork();
	
	this.select = function() {
		if (mouse.down.x > this.x - cropx - this.size - selectSizeAddition && mouse.down.x < this.x - cropx + this.size + selectSizeAddition && mouse.down.y < this.y - cropy + this.size + selectSizeAddition && mouse.down.y > this.y - cropy - this.size - selectSizeAddition) {
			return true;
		}
		
		return false;
	};
}

Creature.prototype.tick = function() {
    this.age++;
    this.reproduceTime++;
};

Creature.prototype.randomize = function() {
    this.x = seededNoise() * display.width;
    this.y = seededNoise() * display.height;

    this.age = 0;
    this.reproduceTime = 0;

    this.size = seededNoise() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
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