
// Scene setup
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const d = 20;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

// DOM Elements
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// Game state
let score = 0;
let gameStarted = false;
let lanes = [];
let player;
const laneTypes = ['grass', 'road'];
const laneWidth = 2;
const laneCount = 30;

function init() {
    // Renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('container').appendChild(renderer.domElement);

    // Camera
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    scene.add(dirLight);

    // Player
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.castShadow = true;
    scene.add(player);

    // Initial lanes
    for (let i = 0; i < laneCount; i++) {
        const type = i === 0 ? 'grass' : laneTypes[Math.floor(Math.random() * laneTypes.length)];
        createLane(type, i);
    }

    // Event Listeners
    window.addEventListener('keydown', handleKeyDown);
    restartButton.addEventListener('click', restartGame);

    // Start game
    gameStarted = true;
    animate();
}

function createLane(type, index) {
    const z = -index * laneWidth;
    let lane;
    if (type === 'grass') {
        const geometry = new THREE.BoxGeometry(30, 0.2, laneWidth);
        const material = new THREE.MeshLambertMaterial({ color: 0x8BC34A });
        lane = new THREE.Mesh(geometry, material);
        lane.receiveShadow = true;
    } else { // road
        const geometry = new THREE.BoxGeometry(30, 0.1, laneWidth);
        const material = new THREE.MeshLambertMaterial({ color: 0x424242 });
        lane = new THREE.Mesh(geometry, material);
        lane.receiveShadow = true;
        lane.cars = [];
        const carCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < carCount; i++) {
            const car = createCar(z);
            lane.cars.push(car);
            scene.add(car);
        }
    }
    lane.position.set(0, -0.5, z);
    lanes.push({ type, mesh: lane, cars: lane.cars || [] });
}

function createCar(z) {
    const carGeometry = new THREE.BoxGeometry(2, 1, 1);
    const carMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.castShadow = true;
    car.position.y = 0.5;
    car.position.z = z;
    car.position.x = (Math.random() - 0.5) * 30;
    car.speed = (Math.random() + 0.2) * (Math.random() > 0.5 ? 1 : -1) * 0.1;
    return car;
}

function handleKeyDown(event) {
    if (!gameStarted) {
        if (event.key === ' ') {
            window.location.reload();
        }
        return;
    }

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            player.position.z -= laneWidth;
            updateScore(1);
            addNewLane();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            player.position.z += laneWidth;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            player.position.x -= 1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            player.position.x += 1;
            break;
    }
    // Clamp player position
    player.position.x = Math.max(-14, Math.min(14, player.position.x));
    player.position.z = Math.max(-(lanes.length - 1) * laneWidth, Math.min(0, player.position.z));
}

function updateScore(amount) {
    score += amount;
    scoreElement.innerText = `Score: ${score}`;
}

function addNewLane() {
    const newIndex = lanes.length;
    const type = laneTypes[Math.floor(Math.random() * laneTypes.length)];
    createLane(type, newIndex);
}

function checkCollision() {
    const playerBox = new THREE.Box3().setFromObject(player);
    for (const lane of lanes) {
        if (lane.type === 'road') {
            for (const car of lane.cars) {
                const carBox = new THREE.Box3().setFromObject(car);
                if (playerBox.intersectsBox(carBox)) {
                    gameOver();
                    return;
                }
            }
        }
    }
}

function gameOver() {
    gameStarted = false;
    finalScoreElement.innerText = score;
    gameOverElement.style.display = 'block';
}

function restartGame() {
    score = 0;
    updateScore(0);
    player.position.set(0, 0, 0);
    camera.position.set(10, 15, 10);
    
    lanes.forEach(lane => {
        scene.remove(lane.mesh);
        if (lane.cars) {
            lane.cars.forEach(car => scene.remove(car));
        }
    });
    lanes = [];

    for (let i = 0; i < laneCount; i++) {
        const type = i === 0 ? 'grass' : laneTypes[Math.floor(Math.random() * laneTypes.length)];
        createLane(type, i);
    }

    gameOverElement.style.display = 'none';
    gameStarted = true;
    animate();
}

function animate() {
    if (gameStarted) {
        requestAnimationFrame(animate);
    }

    // Move cars
    lanes.forEach(lane => {
        if (lane.type === 'road') {
            lane.cars.forEach(car => {
                car.position.x += car.speed;
                if (car.speed > 0 && car.position.x > 15) {
                    car.position.x = -15;
                } else if (car.speed < 0 && car.position.x < -15) {
                    car.position.x = 15;
                }
            });
        }
    });

    // Update camera to follow player
    camera.position.z = player.position.z + 10;
    
    checkCollision();

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    const newAspect = window.innerWidth / window.innerHeight;
    
    camera.left = -d * newAspect;
    camera.right = d * newAspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
