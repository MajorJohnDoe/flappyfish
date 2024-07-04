let gameStarted = false;
let highScore = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const obstacleImage = new Image();
obstacleImage.src = 'assets/obstacle.png';

const fishImage = new Image();
fishImage.src = 'assets/hero-fish.png';

const bubbleImage = new Image();
bubbleImage.src = 'assets/bubble.png';

const backgroundMusic = document.getElementById('backgroundMusic');

const gameOverSound = document.getElementById('gameOverSound');
gameOverSound.volume = 0.5; // Adjust as needed


let lastSpeedIncrease = Date.now();
let speedMultiplier = 1;

canvas.width = 700;
canvas.height = 800;

const fish = {
    x: 50,
    y: canvas.height / 2,
    width: 48,
    height: 32,
    speed: 3,
    moveX: 0,
    moveY: 0,
    wobble: 0,
    wobbleSpeed: 0.06,
    wobbleAmount: 0.3
};

const obstacles = [];
let score = 0;
let gameSpeed = 1;

// New current object
const current = {
    x: 0,
    y: 0,
    strength: 0.7,
    lastChange: 0
};

document.addEventListener('DOMContentLoaded', (event) => {
    const startButton = document.getElementById('startButton');
    
    startButton.addEventListener('click', () => {
        startGame();
    });

    // Draw the initial background
    drawStartBackground();

    // Focus on the start button when the page loads
    startButton.focus();
});

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    
    // Start background music
    startBackgroundMusic();
    
    // Initialize game
    resetGame();
    createObstacle();
    gameLoop();
}

function resetGame() {
    obstacles.length = 0;
    score = 0;
    gameSpeed = 1;
    speedMultiplier = 1;
    fish.x = 50;
    fish.y = canvas.height / 2;
    lastSpeedIncrease = Date.now();

    // Redraw the background
    drawStartBackground();
}
function gameOver() {
    playGameOverSound();
    backgroundMusic.pause();
    gameStarted = false;
    
    if (score > highScore) {
        highScore = score;
    }

    const scoreDisplay = document.getElementById('scoreDisplay');
    const startButton = document.getElementById('startButton');

    scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
    startButton.textContent = 'Play Again';

    document.getElementById('startScreen').style.display = 'flex';
    
    // Focus on the start button
    startButton.focus();
}

function drawFish() {
    ctx.fillStyle = 'orange';
    ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
}

function createObstacle() {
    const gap = 200; // Adjust based on difficulty
    const obstacleWidth = 60; // Adjust to match image width
    const minY = 100; // Minimum y position for the gap
    const maxY = canvas.height - gap - 100; // Maximum y position for the gap
    const gapY = Math.random() * (maxY - minY) + minY;

    obstacles.push({
        x: canvas.width,
        y: gapY,
        width: obstacleWidth,
        gap: gap,
        passed: false
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const aspectRatio = obstacleImage.height / obstacleImage.width;
        const drawWidth = obstacle.width;
        const drawHeight = canvas.height;

        // Draw top part of the obstacle (flipped)
        ctx.save();
        ctx.translate(obstacle.x + drawWidth / 2, obstacle.y);
        ctx.scale(1, -1);
        ctx.drawImage(
            obstacleImage,
            0, 0, obstacleImage.width, obstacleImage.height,  // Source rectangle
            -drawWidth / 2, 0, drawWidth, drawHeight // Destination rectangle
        );
        ctx.restore();

        // Draw bottom part of the obstacle
        ctx.drawImage(
            obstacleImage,
            0, 0, obstacleImage.width, obstacleImage.height,  // Source rectangle
            obstacle.x, obstacle.y + obstacle.gap, drawWidth, drawHeight     // Destination rectangle
        );
    });
}

function drawFish() {
    ctx.drawImage(fishImage, fish.x, fish.y, fish.width, fish.height);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3dcecf');
    gradient.addColorStop(1, '#2f6882');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


const bubbles = [];

function createBubble() {
    const bubbleX = fish.x + Math.random() * fish.width;
    const bubbleY = fish.y + Math.random() * fish.height;

    bubbles.push({
        x: bubbleX,
        y: bubbleY,
        size: Math.random() * 10 + 2, // Smaller bubbles, between 2 and 7 pixels
        speed: Math.random() * 0.5 + 0.1, // Much slower speed
        angle: Math.random() * Math.PI * 2 // Random angle for movement
    });
}

function updateAndDrawBubbles() {
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        
        // Gentle upward movement with slight horizontal drift
        bubble.x += Math.sin(bubble.angle) * bubble.speed - (current.x * current.strength);
        bubble.y -= bubble.speed + Math.cos(bubble.angle) * 0.2 - (current.y * current.strength);

        // Gradually shrink bubbles
        bubble.size -= 0.03;

        // Remove bubbles that are too small or off-screen
        if (bubble.size <= 0 || bubble.x > canvas.width || bubble.x < 0 || bubble.y > canvas.height || bubble.y < 0) {
            bubbles.splice(i, 1);
            continue;
        }

        // Draw the bubble
        ctx.globalAlpha = bubble.size / 7; // Fade out as they shrink
        ctx.drawImage(bubbleImage, bubble.x, bubble.y, bubble.size, bubble.size);
        ctx.globalAlpha = 1;
    }
}

function moveFish() {
    fish.x += fish.moveX * fish.speed + current.x * current.strength;
    fish.y += fish.moveY * fish.speed + current.y * current.strength;

    // Add wobble effect
    fish.wobble += fish.wobbleSpeed;
    fish.y += Math.sin(fish.wobble) * fish.wobbleAmount;

    // Keep fish within canvas bounds
    fish.x = Math.max(0, Math.min(canvas.width - fish.width, fish.x));
    fish.y = Math.max(0, Math.min(canvas.height - fish.height, fish.y));
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 1.5 * gameSpeed;  // Reduced base speed, multiplied by gameSpeed
    });

    // Rest of the function remains the same
    if (obstacles.length > 0 && obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
        score++;
    }

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        createObstacle();
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (
            fish.x < obstacle.x + obstacle.width &&
            fish.x + fish.width > obstacle.x &&
            (fish.y < obstacle.y || fish.y + fish.height > obstacle.y + obstacle.gap)
        ) {
            return true;
        }
    }
    return false;
}



function updateCurrent() {
    if (Date.now() - current.lastChange > 10000) {
        const angle = Math.random() * Math.PI * 2;
        current.x = Math.cos(angle);
        current.y = Math.sin(angle);
        current.lastChange = Date.now();
    }
}

function drawCurrentIndicator() {
    const centerX = canvas.width - 50;
    const centerY = 50;
    const radius = 20;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + current.x * radius, centerY + current.y * radius);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function increaseSpeed() {
    const currentTime = Date.now();
    if (currentTime - lastSpeedIncrease >= 10000) {     // 10 seconds
        speedMultiplier *= 1.10;                        // Increase speed by 1% instead of 5%
        gameSpeed = speedMultiplier;
        lastSpeedIncrease = currentTime;
        console.log("Speed increased. New game speed:", gameSpeed.toFixed(2));
    }
}

function gameLoop() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStartBackground();  // Draw the background first
    drawBackground();

    updateCurrent();
    moveFish();
    moveObstacles();

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Speed: ${gameSpeed.toFixed(2)}x`, 10, 60);

    increaseSpeed();

    drawFish();
    updateAndDrawBubbles();
    drawObstacles();
    drawCurrentIndicator();

    if (Math.random() < 0.1) {
        createBubble();
    }

    if (checkCollision()) {
        gameOver();
    } else {
        requestAnimationFrame(gameLoop);
    }
}
document.addEventListener('keydown', function(e) {
    switch(e.code) {
        case 'ArrowUp':
        case 'KeyW':
            fish.moveY = -1;
            break;
        case 'ArrowDown':
        case 'KeyS':
            fish.moveY = 1;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            fish.moveX = -1;
            break;
        case 'ArrowRight':
        case 'KeyD':
            fish.moveX = 1;
            break;
    }
});

document.addEventListener('keyup', function(e) {
    switch(e.code) {
        case 'ArrowUp':
        case 'KeyW':
        case 'ArrowDown':
        case 'KeyS':
            fish.moveY = 0;
            break;
        case 'ArrowLeft':
        case 'KeyA':
        case 'ArrowRight':
        case 'KeyD':
            fish.moveX = 0;
            break;
    }
});

function startBackgroundMusic() {
    backgroundMusic.volume = 0.3;
    backgroundMusic.play().then(() => {
        console.log("Background music started successfully");
    }).catch((error) => {
        console.log("Autoplay prevented: ", error);
        // Music couldn't autoplay, we'll need user interaction to start it
    });
}

function toggleBackgroundMusic() {
    if (gameStarted) {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    }
}

function playGameOverSound() {
    gameOverSound.currentTime = 0; // Reset the audio to the beginning
    gameOverSound.play();
}


function drawStartBackground() {
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3dcecf');
    gradient.addColorStop(1, '#2f6882');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    drawBubble(150, 300, 15);
    drawBubble(350, 400, 20);
    drawBubble(550, 350, 18);

    drawBubble(250, 200, 125);
    drawBubble(650, 440, 20);

    drawBubble(50, 200, 25);
    drawBubble(650, 440, 20);  
}

function drawBubble(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
}