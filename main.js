var canvas = document.getElementById("game-canvas")
var ctx = canvas.getContext("2d");
var isBulding = false;
var bgImg = document.createElement("img");
bgImg.src = "images/gamemap.png";
var heroImg = document.createElement("img");
heroImg.src = "images/jason.gif";
var towerImg = document.createElement("img");
towerImg.src = "images/tower-btn.png";
var prImg = document.createElement("img");
prImg.src = "images/prinsess.png";
var hero = {
	x: 0,
	y: 0
}

function draw(){
	ctx.drawImage(bgImg,0,0);
	ctx.drawImage(heroImg, hero.x, hero.y);
	ctx.drawImage(towerImg,0,0,64,64);
	ctx.drawImage(prImg,512,336,64,64);
}
var cursor = {x:0, y:0};
$("#game-canves").click(function(){
	if(cursor.x>0&&cursor.x<64&&curser.y>0&&curser.y<64){
		isBuilding=true;
	}
});
setInterval(draw, 16)
