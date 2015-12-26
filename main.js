var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var FPS = 60;
var cursor = {};
var isBuilding = false;


var bgImg = document.createElement("img");
bgImg.src = "images/gamemap.png";
var buttonImg = document.createElement("img");
buttonImg.src = "images/tower-btn.png";
var towerImg = document.createElement("img");
towerImg.src = "images/Decoration_goldenturd_thumbnail@2x.png";
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
    }
});

function draw(){
    ctx.drawImage(bgImg,0,0);
    ctx.drawImage(buttonImg, 640-64, 480-64, 64, 64);
    if(isBuilding){
        ctx.drawImage(towerImg, cursor.x, cursor.y , 64 , 64);
    }
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
