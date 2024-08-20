// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Add directional light for better visibility of the 3D text
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Create a rainbow texture
function createRainbowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    const context = canvas.getContext('2d');

    // Create a gradient from red to violet
    const gradient = context.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, '#FF0000'); // Red
    gradient.addColorStop(0.17, '#FF7F00'); // Orange
    gradient.addColorStop(0.33, '#FFFF00'); // Yellow
    gradient.addColorStop(0.5, '#00FF00'); // Green
    gradient.addColorStop(0.67, '#0000FF'); // Blue
    gradient.addColorStop(0.83, '#4B0082'); // Indigo
    gradient.addColorStop(1, '#8B00FF'); // Violet

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
}

// Function to create 3D text with rainbow colors
function createTextMesh(text, positionX) {
    const loader = new THREE.FontLoader();

    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new THREE.TextGeometry(text, {
            font: font,
            size: 2,
            height: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const rainbowTexture = createRainbowTexture();
        const textMaterial = new THREE.MeshStandardMaterial({ map: rainbowTexture });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textMesh.position.x = positionX;
        textMesh.position.y = 5; // Raised above the grid
        textMesh.position.z = 0;

        scene.add(textMesh);

        // Add rotation animation to the text
        animateTextMesh(textMesh);
    });
}

// Function to animate the 3D text
function animateTextMesh(mesh) {
    const animate = function () {
        // Spin the text horizontally
        mesh.rotation.y += 0.01;
    };

    animations.push(animate);
}

// Create the 3D text meshes for "RUNO"
createTextMesh('R', -6);
createTextMesh('U', -2);
createTextMesh('N', 2);
createTextMesh('O', 6);

// Create a grid for the ants
const gridSize = 64;
const squareSize = 0.3;
const squares = [];
const colors = [];

for (let i = 0; i < gridSize; i++) {
    colors[i] = [];
    for (let j = 0; j < gridSize; j++) {
        const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const square = new THREE.Mesh(geometry, material);

        // Rotate the plane to lie flat on the XZ plane
        square.rotation.x = -Math.PI / 2;

        square.position.x = (i - gridSize / 2) * squareSize;
        square.position.z = (j - gridSize / 2) * squareSize;

        scene.add(square);
        squares.push(square);
        colors[i][j] = 0; // 0 for white, 1 for black
    }
}

// Initial positions and directions for three ants, all starting at the same spot
let ants = [
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2), direction: Math.floor(Math.random() * 4) },
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2), direction: Math.floor(Math.random() * 4) },
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2), direction: Math.floor(Math.random() * 4) },
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2), direction: Math.floor(Math.random() * 4) }
];

// Function to move an ant with randomness
function moveAnt(ant) {
    const { x, y, direction } = ant;
    const currentColor = colors[x][y];
    colors[x][y] = 1 - currentColor; // Flip the color

    const squareIndex = x * gridSize + y;
    squares[squareIndex].material.color.set(currentColor ? 0xffffff : 0x000000);

    // Randomness factor: sometimes the ant turns differently
    const randomFactor = Math.random();
    if (randomFactor < 0.1) {
        // 10% chance to randomly turn
        ant.direction = (direction + Math.floor(Math.random() * 4)) % 4;
    } else {
        // Standard Langton's Ant behavior
        ant.direction = currentColor === 0 ? (direction + 1) % 4 : (direction + 3) % 4; // Turn right on white, left on black
    }

    // Move forward
    if (ant.direction === 0) ant.y++;
    else if (ant.direction === 1) ant.x++;
    else if (ant.direction === 2) ant.y--;
    else if (ant.direction === 3) ant.x--;

    // Wrap around the grid
    ant.x = (ant.x + gridSize) % gridSize;
    ant.y = (ant.y + gridSize) % gridSize;
}

// Animation array to store all animations
const animations = [];

// Set the camera position
camera.position.y = 10;
camera.position.z = 15;
camera.rotation.x = -Math.PI / 4;

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Move the ants
    ants.forEach(moveAnt);

    // Execute all animations
    animations.forEach(anim => anim());

    renderer.render(scene, camera);
}

animate();
