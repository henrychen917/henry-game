var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var FPS = 60;
var cursor = {};
var isBuilding = false;
var tower = {};
var enemy = { 
    x:96-64, 
    y:480-32,
    direction:{x:0,y:-1},
    speed:64,
    move: function(){
        // this.x += this.direction.x * this.speed/FPS;
        this.x = this.x + this.direction.x * this.speed/FPS;
        // this.y += this.direction.y * this.speed/FPS;
        this.y = this.y + this.direction.y * this.speed/FPS;
    }
};

// ====== 引入圖檔 ====== //
var bgImg = document.createElement("img");
bgImg.src = "images/mapddd.png";
var buttonImg = document.createElement("img");
buttonImg.src = "images/tower-btn.png";
var towerImg = document.createElement("img");
towerImg.src = "images/c_frying_pan_gold_large.1198945aaa4f8544f7f372d4dfb15228f0b6f9b5.png";
var slimeImg = document.createElement("img");
slimeImg.src = "images/Decoration_goldenturd_thumbnail@2x.png";
var panImg = document.createElement("img");
panImg.src = "images/c_frying_pan_gold_large.1198945aaa4f8544f7f372d4dfb15228f0b6f9b5.png";
// ==================== //

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

    enemy.move();

    ctx.drawImage(bgImg,0,0);
    ctx.drawImage(buttonImg, 640-64, 480-64, 64, 64);
    ctx.drawImage(towerImg, tower.x, tower.y, 32,32);
    ctx.drawImage(slimeImg, enemy.x, enemy.y , 32 ,32);
    if(isBuilding){
        ctx.drawImage(towerImg, cursor.x, cursor.y , 32 ,32);
    }
}

setInterval(draw, 1000/FPS);



// ====== 其他函式 ====== //

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
