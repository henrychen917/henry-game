var GAME_TICKER;

var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var FPS = 60;
var clock = 0;
var cursor = {};
var isBuilding = false;
var towers = [];
var enemies = [];
var cannonBalls = [];
var hp = 100;
var score = 0;

function Tower(x, y) {
    this.x = x;
    this.y = y;
    this.range = 96;
    this.fireRate = 1;
    this.readyToShootTime = 1;
    this.searchEnemy = function(){
        for(var i=0; i<enemies.length; i++){
            var distance = Math.sqrt( Math.pow(this.x-enemies[i].x,2) + Math.pow(this.y-enemies[i].y,2) );
            if (distance<=this.range) {
                this.aimingEnemyId = i;
                if(this.readyToShootTime<=0){
                    this.shoot();
                    this.readyToShootTime = this.fireRate;
                } else {
                    this.readyToShootTime -= 1/FPS
                }
                return;
            }
        }
        // 如果都沒找到，會進到這行，清除鎖定的目標
        this.aimingEnemyId = null;
    };
    this.shoot = function(){
        var newConnonball = new Connonball(this);
        cannonBalls.push(newConnonball);
    };
};

function Enemy() { 
    this.x = 96; 
    this.y = 480-32;
    this.hp = 10;
    this.direction = {x:0,y:-1};
    this.speed = 64;
    this.pathDes = 0;
    this.move = function(){
        if( isCollided(enemyPath[this.pathDes].x, enemyPath[this.pathDes].y, this.x, this.y, this.speed/FPS, this.speed/FPS) ){

            if (this.pathDes === enemyPath.length-1) {
                this.hp=0;
                hp -= 10;
            } else {
                // 首先，移動到下一個路徑點
                this.x = enemyPath[this.pathDes].x;
                this.y = enemyPath[this.pathDes].y;

                // 指定下一個路徑點
                this.pathDes++;

                // 取得前往下一個路徑點的單位向量
                var unitVector = getUnitVector( this.x, this.y, enemyPath[this.pathDes].x, enemyPath[this.pathDes].y );
                this.direction.x = unitVector.x;
                this.direction.y = unitVector.y;
            }

        } else {
            // this.x += this.direction.x * this.speed/FPS;
            this.x = this.x + this.direction.x * this.speed/FPS;
            // this.y += this.direction.y * this.speed/FPS;
            this.y = this.y + this.direction.y * this.speed/FPS;
        }
    };
}

function Connonball(tower) {

    var aimedEnemy = enemies[tower.aimingEnemyId];

    this.x = tower.x+16;
    this.y = tower.y;
    this.speed = 320;
    this.damage = 5;
    this.hitted = false;
    this.direction = getUnitVector(this.x, this.y, aimedEnemy.x, aimedEnemy.y);
    this.move = function(){
        this.x += this.direction.x*this.speed/FPS;
        this.y += this.direction.y*this.speed/FPS;
        for(var _i=0; _i<enemies.length; _i++){
            this.hitted =  isCollided(this.x, this.y, enemies[_i].x, enemies[_i].y, 32, 32 );
            if (this.hitted) {
                enemies[_i].hp -= this.damage;
                // 如果不加這行會很慘喔！
                break;
            }
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
var cannonballImg = document.createElement("img");
cannonballImg.src = "images/cannon-ball.png";


ctx.font = "24px Arial";
ctx.fillStyle = "white";

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
        towers.push( new Tower(cursor.x - cursor.x%32, cursor.y - cursor.y%32) );
    }
});

function draw(){

    if(clock%80==0){
        enemies.push(new Enemy());
    }

    ctx.drawImage(bgImg,0,0);
    ctx.drawImage(buttonImg, 640-64, 480-64, 64, 64);

    for(var i=0; i<enemies.length; i++){
        if (enemies[i].hp<=0) {
            enemies.splice(i,1);
            score += 10;
        } else {
            enemies[i].move();
            ctx.drawImage( slimeImg, enemies[i].x, enemies[i].y);
        }
    }

    for(var i=0; i<towers.length; i++){
        towers[i].searchEnemy();
        ctx.drawImage(towerImg, towers[i].x, towers[i].y);
        if ( towers[i].aimingEnemyId!=null ) {
            var id = towers[i].aimingEnemyId;
            ctx.drawImage( crosshairImg, enemies[id].x, enemies[id].y, 64, 64 );
        }
    }

    for(var _i=0; _i<cannonBalls.length; _i++){
        cannonBalls[_i].move();

        if (cannonBalls[_i].hitted) {
            cannonBalls.splice(_i,1);
        } else {
            ctx.drawImage( cannonballImg, cannonBalls[_i].x, cannonBalls[_i].y );
        }
    }
    
    if(isBuilding){
        ctx.drawImage(towerImg, cursor.x, cursor.y);
    }

    ctx.fillText("HP:"+hp, 16, 32);
    ctx.fillText("Score:"+score, 16, 64);

    if(hp<=0){
        gameover();
    }

    clock++;
}

GAME_TICKER = setInterval(draw, 1000/FPS);


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

function gameover(){
    ctx.textAlign = "center";
    ctx.font = "64px Arial";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2-96);
    ctx.font = "48px Arial";
    ctx.fillText("you got", canvas.width/2, canvas.height/2-32);
    ctx.font = "128px Arial";
    ctx.fillText(score, canvas.width/2, canvas.height/2+96);
    clearInterval(GAME_TICKER);
}
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
//happy happy happy happy happy  happy happy happy happy happy happy happy happy happy happy
