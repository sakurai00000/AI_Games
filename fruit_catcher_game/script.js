const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreBoard = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const restartButton = document.getElementById('restart-button');

// --- Game State Variables ---
let score = 0;
let playerPosition;
let isGameOver = false;
let isGameStarted = false;
let fallingObjects = [];
let keys = {};
let lastObjectCreationTime = 0;
let baseFontSize;

// --- Game Constants ---
const fruits = ['🍎', '🍌', '🍇', '🍊', '🍓'];
const bomb = '💣';
const playerSpeed = 8;
const objectCreationInterval = 200; // ms

// --- Player Input ---
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    // Start or Restart the game with Space key
    if (e.key === ' ') {
        if (!isGameStarted || isGameOver) {
            startGame();
        }
    }
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// --- Game Functions ---
function updatePlayer() {
    if (isGameOver) return;

    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        playerPosition -= playerSpeed;
    }
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        playerPosition += playerSpeed;
    }

    // Prevent player from going out of bounds
    const gameWidth = gameContainer.clientWidth;
    const playerWidth = player.clientWidth;
    if (playerPosition < 0) {
        playerPosition = 0;
    }
    if (playerPosition > gameWidth - playerWidth) {
        playerPosition = gameWidth - playerWidth;
    }

    player.style.left = playerPosition + 'px';
}

function createFallingObject() {
    const gameWidth = gameContainer.clientWidth;
    const gameHeight = gameContainer.clientHeight;
    const baseHeight = 600; // Speed calculation base height
    const speedScale = gameHeight / baseHeight; // Speed multiplier based on current screen size

    const isFruit = Math.random() > 0.5;
    const element = document.createElement('div');
    element.classList.add('falling-object');
    element.innerText = isFruit ? fruits[Math.floor(Math.random() * fruits.length)] : bomb;

    const scale = Math.random() * 0.5 + 1;
    element.style.fontSize = (baseFontSize * scale) + 'px';

    const object = {
        element: element,
        x: Math.random() * (gameWidth - 30),
        y: -40,
        speedY: (Math.random() * 2 + 1.5) * speedScale, // Scale speed
        speedX: (Math.random() - 0.5) * 4,
        gravity: (0.05 + Math.random() * 0.03) * speedScale, // Scale gravity
        type: isFruit ? 'fruit' : 'bomb'
    };

    element.style.left = object.x + 'px';
    element.style.top = object.y + 'px';

    fallingObjects.push(object);
    gameContainer.appendChild(element);
}

function updateFallingObjects() {
    if (isGameOver) return;
    const gameHeight = gameContainer.clientHeight;
    const gameWidth = gameContainer.clientWidth;

    fallingObjects.forEach((object, index) => {
        object.speedY += object.gravity;
        object.y += object.speedY;
        object.x += object.speedX;
        object.element.style.top = object.y + 'px';
        object.element.style.left = object.x + 'px';

        if (object.x <= 0 || object.x >= gameWidth - (baseFontSize * 1.5)) {
            object.speedX *= -0.8;
        }

        const playerRect = player.getBoundingClientRect();
        const objectRect = object.element.getBoundingClientRect();

        if (playerRect.left < objectRect.right && playerRect.right > objectRect.left &&
            playerRect.top < objectRect.bottom && playerRect.bottom > objectRect.top) {
            if (object.type === 'fruit') {
                score++;
                scoreBoard.innerText = score;
            } else {
                endGame();
            }
            object.element.remove();
            fallingObjects.splice(index, 1);
            return;
        }

        if (object.y > gameHeight) {
            object.element.remove();
            fallingObjects.splice(index, 1);
        }
    });
}

function gameLoop(timestamp) {
    if (isGameOver) return;

    if (timestamp - lastObjectCreationTime > objectCreationInterval) {
        createFallingObject();
        lastObjectCreationTime = timestamp;
    }

    updatePlayer();
    updateFallingObjects();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    isGameStarted = true;
    isGameOver = false;

    // Calculate dynamic sizes
    baseFontSize = gameContainer.clientWidth * 0.06;
    playerPosition = (gameContainer.clientWidth - player.clientWidth) / 2;

    score = 0;
    scoreBoard.innerText = score;
    player.style.left = playerPosition + 'px';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    keys = {};

    fallingObjects.forEach(obj => obj.element.remove());
    fallingObjects = [];
    
    lastObjectCreationTime = 0;
    requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    gameOverScreen.classList.remove('hidden');
}

// --- Event Listeners ---
restartButton.addEventListener('click', startGame);
window.addEventListener('resize', () => {
    window.location.reload();
});

// --- Touch Controls ---
let touchStartX = null;

gameContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
    }
}, { passive: true });

gameContainer.addEventListener('touchmove', (e) => {
    if (touchStartX === null || isGameOver) return;

    if (e.touches.length > 0) {
        const touchCurrentX = e.touches[0].clientX;
        const deltaX = touchCurrentX - touchStartX;
        
        playerPosition += deltaX;
        touchStartX = touchCurrentX;

        // Prevent player from going out of bounds immediately
        const gameWidth = gameContainer.clientWidth;
        const playerWidth = player.clientWidth;
        if (playerPosition < 0) playerPosition = 0;
        if (playerPosition > gameWidth - playerWidth) playerPosition = gameWidth - playerWidth;

        player.style.left = playerPosition + 'px';
    }
}, { passive: true });

gameContainer.addEventListener('touchend', (e) => {
    touchStartX = null;
});

