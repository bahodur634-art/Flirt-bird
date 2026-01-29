const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Птица
const bird = {
    x: 50,
    y: 150,
    radius: 12,
    velocity: 0,
    gravity: 0.5,
    jump: -8
};

// Трубы
const pipes = [];
const pipeWidth = 50;
const pipeGap = 120;
let frame = 0;
let score = 0;
let gameOver = false;

// Управление
document.addEventListener("keydown", jump);
document.addEventListener("click", jump);

function jump() {
    if (!gameOver) {
        bird.velocity = bird.jump;
    } else {
        restartGame();
    }
}

// Обновление игры
function update() {
    if (gameOver) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Генерация труб
    if (frame % 100 === 0) {
        const topHeight = Math.random() * 200 + 20;
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + pipeGap
        });
    }

    // Движение труб
    pipes.forEach(pipe => {
        pipe.x -= 2;

        // Проверка столкновений
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipeWidth &&
            (bird.y - bird.radius < pipe.top ||
             bird.y + bird.radius > pipe.bottom)
        ) {
            gameOver = true;
        }

        // Подсчёт очков
        if (pipe.x + pipeWidth === bird.x) {
            score++;
        }
    });

    // Удаление старых труб
    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }

    // Границы экрана
    if (bird.y + bird.radius > canvas.height || bird.y < 0) {
        gameOver = true;
    }

    frame++;
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Птица
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();

    // Трубы
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height);
    });

    // Очки
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    // Game Over
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "28px Arial";
        ctx.fillText("Game Over", 80, 220);
        ctx.font = "16px Arial";
        ctx.fillText("Click or Space to restart", 65, 260);
    }
}

// Перезапуск
function restartGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frame = 0;
    gameOver = false;
}

// Игровой цикл
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
