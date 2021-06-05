const canvas = document.getElementById("canvas");
const playBtn = document.getElementById("play-btn");
const logo = document.querySelector("img");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

var frame = 0;
var enemySpeed = 2;
var gameover = false;
const aud = new Audio();
const lostAud = new Audio();
aud.src = "./assets/burst.wav";
lostAud.src = "./assets/lost.mp3";


if (!localStorage.getItem("highScore")){
    localStorage.setItem("highScore", 0);
}

var highScore = localStorage.getItem("highScore");

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 1,
    dy: 1, 
    rad: 30,
    distance: 10,
    speed: 6
}

const correction = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX - correction.left;
    mouse.y = e.clientY - correction.top;
})

const colors = ["blue", "green", "orange", "pink", "purple", "red", "yellow"];

class Bubble {
    constructor(){
        this.x = 30 + Math.random() * (canvas.width - 60),
        this.y = Math.random() * 100 + canvas.height,
        this.dy = Math.random() * 3 + 1
        this.rad = 30
        this.distance = 10
        this.touched = false
        this.burst = false
        this.phase = 1;
        this.image = new Image()
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.image.src = `./assets/balloons/${this.color}-balloon/${this.phase}.png`
    }

    draw(){
        ctx.drawImage(this.image, this.x-47, this.y-37, this.rad*3.2, this.rad*2.9)
    }
}

class Enemy {
    constructor(){
        this.x = canvas.width + 300,
        this.y = 50 + Math.random() * (canvas.height - 100),
        this.dx = enemySpeed;
        this.rad = 40
        this.distance = 10
        this.image = new Image()
        this.image.src = "./assets/snowball.svg"
        this.enemyX = 0;
    }
    draw(){
        if(frame % 6 == 0){
            this.enemyX += 512;
            if (this.enemyX > 512*2){
                this.enemyX = 0;
            }
        }

        if (frame % 100 == 0) {
            enemySpeed += 0.1;
            console.log(this.dx)
        }

        ctx.drawImage(this.image, this.enemyX,0, 512, this.image.height/3, this.x-49, this.y-63, this.rad*4.5, this.rad*3.2)
    }
}

class Cloud{
    constructor(){
        this.x = canvas.width + Math.random() * canvas.width 
        this.y =  5 + (Math.random() * 150);
        this.dx = 0.5;
        this.image = new Image()
        this.image.src = "./assets/clouds.png"
        this.X = [0, this.image.width/2]
        this.Y = [0, this.image.height/3, this.image.height*2/3]
        this.randX = Math.floor(Math.random()*this.X.length);
        this.randY = Math.floor(Math.random()*this.Y.length);
    }
    draw(){
        ctx.drawImage(this.image, this.X[this.randX], this.Y[this.randY], this.image.width/2, this.image.height/3, this.x, this.y, 200, 200)
    }
}

let beeImage = new Image();
beeImage.src = "./assets/bee.svg";
let beeX = 0;
let beeY = 0;

class Game{
    constructor(){
        this.bubbles = [];
        this.enemy = [];
        this.clouds = [];
        this.score = 0;
    }
    draw() {
        if(player.distance > 0){
            if (mouse.x > player.x){
                player.x += player.dx;
            }
            if (mouse.x < player.x){
                player.x -= player.dx;
            }
            if (mouse.y > player.y){
                player.y += player.dy;
            }
            if (mouse.y < player.y){
                player.y -= player.dy;
            }
        }
        player.distance = Math.sqrt((mouse.x - player.x)**2 + (mouse.y - player.y)**2)

        player.dx = (Math.abs(mouse.x - player.x) / player.distance) * player.speed;
        player.dy = (Math.abs(mouse.y - player.y) / player.distance) * player.speed;

        if (this.clouds.length < 3){
            if(this.clouds.length == 0){
                let c = new Cloud();
                c.x = canvas.width  + 20;
                this.clouds.push(c);
            }
            this.clouds.push(new Cloud())
        }
        for(let i=0; i<this.clouds.length; i++){
            let cloud = this.clouds[i];
            cloud.x -= cloud.dx

            if (cloud.x < -230){
                this.clouds.splice(i, 1);
                i--;
            }

            cloud.draw()
        }
        
        if (player.x > mouse.x){
            beeY = 512;
        } else {
            beeY = 0;
        }

        if (frame > 5000){
            frame = 0;
        }

        if (frame % 2 == 0){
            if (beeX < beeImage.width  - 512){
                beeX += 512;
            } else {
                beeX = 0;
            }
        }

        if (this.bubbles.length < 5){
            this.bubbles.push(new Bubble);
        }

        for(let i=0; i<this.bubbles.length; i++){
            let bub = this.bubbles[i];
            bub.draw()
            bub.y -= bub.dy
            bub.distance = Math.sqrt((player.x - bub.x)**2 + (player.y - bub.y)**2)

            if (bub.y < -100){
                this.bubbles.splice(i, 1);
                i--;
            }
            if (bub.distance < player.rad + bub.rad && !bub.touched){
                bub.touched = true
            }

            if (bub.touched && frame % 3 == 0 && bub.phase < 6){
                bub.phase++;
                bub.image.src = `./assets/balloons/${bub.color}-balloon/${bub.phase}.png`
                if (bub.phase == 6){
                    bub.burst = true;
                }
            }

            if (bub.burst){
                this.bubbles.splice(i, 1);
                i--;
                this.score++;
                aud.currentTime = 0;
                aud.play()
            }
        }

        if (this.enemy.length < 1){
            this.enemy.push(new Enemy());
        }

        for (let i=0; i<this.enemy.length ; i++){
            let enemy = this.enemy[i];
            enemy.x -= enemy.dx

            if (enemy.x < -150){
                this.enemy.splice(i, 1);
                i--
            }
            enemy.distance = Math.sqrt((enemy.x - player.x)**2 + (enemy.y - player.y)**2);

            if (enemy.distance < enemy.rad + player.rad){
                gameover = true;  
            }

            enemy.draw()
        }
        ctx.font = "30px arial";
        ctx.fillStyle = "darkblue"
        ctx.fillText("score:  " + this.score, 50,50);
        ctx.fillText("High Score:  "+ highScore, canvas.width-275, 50);

        ctx.drawImage(beeImage, beeX, beeY, beeImage.width/6, beeImage.height/2, player.x-player.rad, player.y-player.rad, player.rad*2+5, player.rad*2+5);

        if (gameover){
            ctx.font = "50px Arial";
            ctx.fillStyle = "darkblue";

            if (this.score > highScore){
                localStorage.setItem("highScore", this.score);
                ctx.fillText("NEW HIGH SCORE:  " + this.score, 100, canvas.height/2);
            } else{
                ctx.fillText("GAME OVER: SCORE:  " + this.score, 100, canvas.height/2);
            }

            lostAud.play()
        }
    }
}

const game = new Game();

function runGame() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw();
    if (!gameover){
        requestAnimationFrame(runGame);
    }
}

playBtn.addEventListener("click", ()=>{
    playBtn.style.display = "none";
    logo.style.display = "none";
    runGame()
}, {once: true})