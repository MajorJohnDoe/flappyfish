const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const obstacleImage = new Image();
obstacleImage.src = 'assets/obstacle.png';

const fishImage = new Image();
fishImage.src = 'assets/hero-fish.png';

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
let gameSpeed = 0.1;

// New current object
const current = {
    x: 0,
    y: 0,
    strength: 0.7,
    lastChange: 0
};

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
        obstacle.x -= 1 * gameSpeed;
    });

    // Remove obstacles that have moved off screen
    if (obstacles.length > 0 && obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
        score++;
    }

    // Create new obstacle when needed
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

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();  // Add this line to draw the gradient background

    updateCurrent();
    moveFish();
    moveObstacles();

    drawFish();
    drawObstacles();
    drawCurrentIndicator();

    ctx.fillStyle = 'white';  // Change text color to white for better visibility
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    gameSpeed = 0.5 + (score * 0.01);

    if (checkCollision()) {
        alert(`Game Over! Your score: ${score}`);
        location.reload();
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

