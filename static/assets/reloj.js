(function(window) {
reloj_instancia_1 = function() {
	this.initialize();
}
reloj_instancia_1._SpriteSheet = new createjs.SpriteSheet({images: ["reloj.png"], frames: [[0,0,100,100,0,49.95,49.95],[100,0,100,100,0,49.95,49.95],[200,0,100,100,0,49.95,49.95],[300,0,100,100,0,49.95,49.95],[400,0,100,100,0,49.95,49.95],[0,100,100,100,0,49.95,49.95],[100,100,100,100,0,49.95,49.95],[200,100,100,100,0,49.95,49.95],[300,100,100,100,0,49.95,49.95]]});
var reloj_instancia_1_p = reloj_instancia_1.prototype = new createjs.Sprite();
reloj_instancia_1_p.Sprite_initialize = reloj_instancia_1_p.initialize;
reloj_instancia_1_p.initialize = function() {
	this.Sprite_initialize(reloj_instancia_1._SpriteSheet);
	this.paused = false;
}
window.reloj_instancia_1 = reloj_instancia_1;
}(window));

