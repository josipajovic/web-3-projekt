// Initialize canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Paddle configuration
const paddleHeight = 20;
const paddleWidth = 230;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleY = canvas.height - 40;

// Ball configuration
const ballRadius = 12;
let x = canvas.width / 2;
let y = paddleY - paddleHeight - 20;

// Set starting angle and speed
const minAngle = Math.PI / 4; // Minimum angle (45°)
const maxAngle = (3 * Math.PI) / 4; // Maximum angle (135°)
const angle = Math.random() * (maxAngle - minAngle) + minAngle;
const speed = 5;
let dx = Math.cos(angle) * speed;
let dy = Math.sin(angle) * speed;

const restartButton = document.getElementById("restartButton");
let rightPressed = false;
let leftPressed = false;
let interval = 0;
let score = 0;

let brickRows = 4;
let brickColumns = 10;
const brickHeight = 50;
const brickWidth = 135;
const brickPadding = 7;
const brickOffsetTop = 120;
const brickOffsetLeft = 5;

/**
 * Creates an array of bricks
 * Each brick contains x and y coordinates and status which indicates whether or
 * not the brick has been hit by the ball (1 is default, 0 when hit)
*/
function createBricks(brickColumns, brickRows){
    let bricks = [];

    for (let c = 0; c < brickColumns; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRows; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
    }
    return bricks;
}

let bricks = createBricks(brickColumns, brickRows);

// Initialize value that records the best score in local storage
if(!localStorage.getItem("bestScore")){
    localStorage.setItem("bestScore", 0);
}

// Map to assign colors to each row of bricks
const colors = new Map([
    [0, 'red'],
    [1, 'orange'],
    [2, 'green'],
    [3, 'yellow'],
  ]);

// Event listeners for keyboard input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Handle key press events
function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      leftPressed = true;
    }
  }
function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
      rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      leftPressed = false;
    }
  }

/**
 * Draws the bricks on the canvas.
 *
 * This function iterates over the array of bricks and draws each brick
 * that has a status of 1 on the canvas. The bricks are positioned
 * based on their column and row index, as well as defined
 * offsets and padding.
 * Each brick is styled with a specific color determined by its row index
 * and a shadow effect.
*/
function drawBricks() {
    for (let c = 0; c < brickColumns; c++) {
      for (let r = 0; r < brickRows; r++) {
        if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        let color = r % 4;
        ctx.fillStyle = colors.get(color);
        ctx.shadowColor = "#15161e";
        ctx.fill();
        ctx.closePath();
        }
      }
    }
}

/**
 * Draws message after losing the game, also displays restart button and score
*/
function drawGameOverMessage() {
    ctx.font = "48px Helvetica"; // Definiraj veličinu i font
    ctx.fillStyle = "red";   // Boja teksta
    ctx.textAlign = "center"; // Centriraj horizontalno
    ctx.textBaseline = "middle"; // Centriraj vertikalno
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "24px Helvetica"; // Manji font za rezultat
    ctx.fillStyle = "white"; // Crna boja za tekst
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    restartButton.style.display = "block";
    restartButton.addEventListener("click", () => {
      document.location.reload();
    });
}

/**
 * Draws message after winning the game, also displays restart button and score.
*/
function drawWinnerMessage() {
    ctx.font = "48px Helvetica"; // Definiraj veličinu i font
    ctx.fillStyle = "#FFD700";   // Boja tekstaå
    ctx.textAlign = "center"; // Centriraj horizontalno
    ctx.textBaseline = "middle"; // Centriraj vertikalno
    ctx.fillText("WINNER", canvas.width / 2, canvas.height / 2);
    ctx.font = "24px Helvetica"; // Manji font za rezultat
    ctx.fillStyle = "white"; // Crna boja za tekst
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    restartButton.style.display = "block";
    restartButton.addEventListener("click", () => {
      document.location.reload();
    });
}

/**
 * Detects collisions between the ball and the bricks, handles ball direction
 * change, and updates the game state.
 * This function checks whether the ball intersects with any of the bricks on
 * the canvas. If a collision is detected, the ball's direction is adjusted
 * accordingly. It also marks the collided brick as destroyed, updates the score,
 * and checks if all bricks are destroyed, in which case the game ends
 * and the winner message is displayed.
*/
function collisionDetection() {
    for (let c = 0; c < brickColumns; c++) {
      for (let r = 0; r < brickRows; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
            if (
                x + ballRadius > b.x &&
                x - ballRadius < b.x + brickWidth &&
                y + ballRadius > b.y &&
                y - ballRadius < b.y + brickHeight
              ) {
                // Check collision direction
                if (
                  x + ballRadius - dx <= b.x ||
                  x - ballRadius - dx >= b.x + brickWidth
                ) {
                  dx = -dx;
                } else {
                  dy = -dy;
                }

            b.status = 0;
            score += 1;
            if(score == brickColumns*brickRows){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawWinnerMessage();
                if(score > localStorage.getItem("bestScore")){
                    localStorage.setItem("bestScore", score);
                }
                clearInterval(interval);
            }
          }
        }
      }
    }
}

/**
 * Draws the current score and the best score on the canvas at the top-left
 * corner.
*/
function drawScores() {
    ctx.font = "16px Helvetica";
    ctx.fillStyle = "white";
    let best = localStorage.getItem("bestScore");
    ctx.fillText(`Score: ${score} Best: ${best}`, 8, 20);
}
/**
 * Draws the ball on the canvas.
*/
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#d9d9d9";
  ctx.fill();
  ctx.closePath();
}
/**
 * Draws the paddle on the canvas
*/
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#15161e";
  ctx.fillStyle = "#c22d23";
  ctx.fill();
  ctx.closePath();
}

/**
 * Main game loop that draws and updates the game state.
 *
 * This function is responsible for updating and rendering the entire game state every frame. It includes:
 * - Clearing the canvas to prepare for redrawing the game elements.
 * - Drawing the ball, bricks, paddle and scores
 * - Handling collisions with bricks and the paddle.
 * - Checking for game over conditions and displaying the appropriate message.
 * - Updating the ball's position based on its speed
 *
 * The function is repeatedly called by the `setInterval` function
*/
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawBricks();
    drawPaddle();
    collisionDetection();
    drawScores();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    }
    if(y + dy >= canvas.height - ballRadius){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGameOverMessage();
        if(score > localStorage.getItem("bestScore")){
            localStorage.setItem("bestScore", score);
        }
        clearInterval(interval);
    }

    if (
        y + ballRadius > paddleY &&
        x > paddleX &&
        x < paddleX + paddleWidth
      ) {
        let relativeHit = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        // Adjust ball trajectory
        dx = relativeHit * 5; // Scale horizontal velocity
        dy = -Math.abs(dy); // Reverse vertical velocity
        // Reset position to just above paddle
        y = paddleY - ballRadius;
      }
  if (rightPressed) {
    paddleX += 7;
    if (paddleX + paddleWidth > canvas.width) {
      paddleX = canvas.width - paddleWidth;
    }
  } else if (leftPressed) {
    paddleX -= 7;
    if (paddleX < 0) {
      paddleX = 0;
    }
  }
  x += dx;
  y += dy;
}

// Set up a repeating function call to call the draw function every 10 milliseconds.
interval = setInterval(draw, 10);


