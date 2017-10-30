Creature.prototype.eat = function(p) {
	let pos = p || this.getPosition();
	let tile = map[pos[0]][pos[1]];
	this.size -= energy.eat * this.output[2];

	this.maxSpeed = maxCreatureSpeed * this.output[2];

	if (tile.food - this.output[2] * eatSpeed < 0) {
		tile.food = 0;
		this.size += tile.food / eatSpeed;
	} else if (tile.food > 0) {
		tile.food -= this.output[2] * eatSpeed;
		this.size += this.output[2] * eatSize * (tile.food / maxTileFood);
	}
};

Creature.prototype.metabolize = function() {
	this.size -= energy.metabolism * (this.age / reproduceAge);
};

Creature.prototype.move = function() {
	this.size -= energy.move * (Math.abs(this.output[0]) + Math.abs(this.output[1])) * (this.size / maxCreatureSize);

	this.x += this.output[0] * this.maxSpeed;
	this.y += this.output[1] * this.maxSpeed;
};

Creature.prototype.reproduce = function(t) {
	if (this.age > reproduceAge && this.reproduceTime > minReproduceTime || t) {
		if (this.size > energy.birth * this.size + minCreatureSize || t) {
			for (let i = 0; i < numChildren; i++) {
				creatures.push(new Creature(this.x + Math.random() * 300 - 150, this.y + Math.random() * 300 - 150, this.size * Math.min(this.reproduceTime / (reproduceAge / 2), 1) * (Math.random() + 0.5)));
				creatures[creatures.length - 1].copyNeuralNetwork(this);
				creatures[creatures.length - 1].color  = this.color;
				creatures[creatures.length - 1].mutate();
			}

			if (!t) this.size -= energy.birth * this.size;
			this.reproduceTime = 0;
		}
	}
};