const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// GAME SETTINGS
// =====================
const GRAVITY = 0.4;          // спокойная гравитация
const JUMP = -7;              // мягкий прыжок
const PIPE_SPEED = 1.6;       // спокойная скорость
const PIPE_GAP = 150;         // УВЕЛИЧЕННЫЙ проход

// =====================
// GAME STATE
// =====================
let gameState = "start"; // start | play | gameover
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// =====================
// BIRD
// =====================
const bird = {
  x: 80,
  y: 200,
  r: 12,
  velocity: 0,

  reset() {
    this.y = 200;
    this.velocity = 0;
  },

  draw() {
    // тело
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();

    // глаз
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x + 4, this.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  },

  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;
  }
};

// =====================
// PIPES
// =====================
let pipes = [];

function createPipe() {
  const topHeight = Math.random() * 150 + 40;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + PIPE_GAP,
    passed: false
  });
}

function resetPipes() {
  pipes = [];
  createPipe();
}

// =====================
// INPUT
// =====================
function jump() {
  if (gameState === "start") {
    gameState = "play";
    resetPipes();
    score = 0;
    bird.reset();
  } 
  else if (gameState === "play") {
    bird.velocity = JUMP;
  } 
  else if (gameState === "gameover") {
    gameState = "start";
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

canvas.addEventListener("click", jump);

// =====================
// COLLISION
// =====================
function checkCollision(pipe) {
  if (
    bird.x + bird.r > pipe.x &&
    bird.x - bird.r < pipe.x + 40 &&
    (bird.y - bird.r < pipe.top ||
     bird.y + bird.r > pipe.bottom)
  ) {
    return true;
  }

  if (bird.y + bird.r > canvas.height || bird.y - bird.r < 0) {
    return true;
  }

  return false;
}

// =====================
// DRAW
// =====================
function drawText(text, x, y, size = 20, color = "#000") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.draw();

  pipes.forEach(pipe => {
    ctx.fillStyle = "green";

    // верхняя труба
    ctx.fillRect(pipe.x, 0, 40, pipe.top);

    // нижняя труба
    ctx.fillRect(
      pipe.x,
      pipe.bottom,
      40,
      canvas.height - pipe.bottom
    );
  });

  drawText(`Score: ${score}`, 60, 30, 16);
  drawText(`Best: ${bestScore}`, 260, 30, 16);

  if (gameState === "start") {
    drawText("FLIRT BIRD", 160, 200, 28);
    drawText("Click or Space to start", 160, 240, 16);
  }

  if (gameState === "gameover") {
    drawText("GAME OVER", 160, 200, 26, "red");
    drawText("Click or Space to restart", 160, 240, 16);
  }
}

// =====================
// UPDATE
// =====================
function update() {
  if (gameState !== "play") return;

  bird.update();

  if (pipes.length === 0 || pipes[pipes.length - 1].x < 160) {
    createPipe();
  }

  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;

    if (!pipe.passed && pipe.x + 40 < bird.x) {
      pipe.passed = true;
      score++;
    }

    if (checkCollision(pipe)) {
      gameState = "gameover";
      bestScore = Math.max(score, bestScore);
      localStorage.setItem("bestScore", bestScore);
    }
  });

  pipes = pipes.filter(pipe => pipe.x + 40 > 0);
}

// =====================
// GAME LOOP
// =====================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
