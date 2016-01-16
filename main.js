var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var FPS = 60;
var clock = 0;
var cursor = {};
var isBuilding = false;
var tower = {};
var enemies = [];

function Enemy() { 
    this.x = 96; 
    this.y = 480-32;
    this.direction = {x:0,y:-1};
    this.speed = 64;
    this.pathDes = 0;
    this.move = function(){
        if( isCollided(enemyPath[this.pathDes].x, enemyPath[this.pathDes].y, this.x, this.y, this.speed/FPS, this.speed/FPS) ){

           
            this.x = enemyPath[this.pathDes].x;
            this.y = enemyPath[this.pathDes].y;

          
            this.pathDes++;

          
            var unitVector = getUnitVector( this.x, this.y, enemyPath[this.pathDes].x, enemyPath[this.pathDes].y );
            this.direction.x = unitVector.x;
            this.direction.y = unitVector.y;

        } else {
            // this.x += this.direction.x * this.speed/FPS;
            this.x = this.x + this.direction.x * this.speed/FPS;
            // this.y += this.direction.y * this.speed/FPS;
            this.y = this.y + this.direction.y * this.speed/FPS;
        }
    };
}


var enemyPath = [
    {x:96, y:64},
    {x:384, y:64},
    {x:384, y:192},
    {x:224, y:192},
    {x:224, y:320},
    {x:544, y:320},
    {x:544, y:96}
];

var enemyPath = [
    {x:96, y:64},
    {x:384, y:64},
    {x:384, y:192},
    {x:224, y:192},
    {x:224, y:320},
    {x:544, y:320},
    {x:544, y:96}
];



var bgImg = document.createElement("img");
bgImg.src = "images/mapaaa.png";
var buttonImg = document.createElement("img");
buttonImg.src = "images/tower-btn.png";
var towerImg = document.createElement("img");
towerImg.src = "images/c_frying_pan_gold_large.1198945aaa4f8544f7f372d4dfb15228f0b6f9b5.png";
var slimeImg = document.createElement("img");
slimeImg.src = "images/Decoration_goldenturd_thumbnail@2x.png";
var panImg = document.createElement("img");
panImg.src = "images/c_frying_pan_gold_large.1198945aaa4f8544f7f372d4dfb15228f0b6f9b5.png";



$("#game-canvas").mousemove(function(event) {
    cursor = {
        x: event.offsetX,
        y: event.offsetY
    };
});

$("#game-canvas").click(function(){
    if( isCollided(cursor.x, cursor.y, 640-64, 480-64, 64, 64) ){
        if (isBuilding) {
            isBuilding = false;
        } else {
            isBuilding = true;
        }
    } else if (isBuilding) {
        tower.x = cursor.x - cursor.x%32;
        tower.y = cursor.y - cursor.y%32;
    }
});

function draw(){

    if(clock%80==0){
        enemies.push(new Enemy());
    }

    ctx.drawImage(bgImg,0,0);
    ctx.drawImage(buttonImg, 640-64, 480-64, 64, 64);
    ctx.drawImage(towerImg, tower.x, tower.y , 32, 32);
    if(isBuilding){
        ctx.drawImage(towerImg, cursor.x, cursor.y , 32 ,32);
    }

    for(var i=0; i<enemies.length; i++){
        enemies[i].move();
        ctx.drawImage( slimeImg, enemies[i].x, enemies[i].y);
    }

    clock++;
}

setInterval(draw, 1000/FPS);





function isCollided(pointX, pointY, targetX, targetY, targetWidth, targetHeight) {
    if(     pointX >= targetX
        &&  pointX <= targetX + targetWidth
        &&  pointY >= targetY
        &&  pointY <= targetY + targetHeight
    ){
        return true;
    } else {
        return false;
    }
}

function getUnitVector(srcX, srcY, targetX, targetY) {
    var offsetX = targetX - srcX;
    var offsetY = targetY - srcY;
    var distance = Math.sqrt( Math.pow(offsetX,2) + Math.pow(offsetY,2) );

    var unitVector = {
        x: offsetX/distance,
        y: offsetY/distance
    };
    return unitVector;
}
