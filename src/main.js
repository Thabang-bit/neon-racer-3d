
import * as THREE from 'three';

// ------------------------------------
// NEON RACER 3D - GAME ENGINE
// ------------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050512);
scene.fog = new THREE.Fog(0x08091b, 35, 180);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

camera.position.set(0, 5, 11);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.querySelector('#game').prepend(renderer.domElement);

// ------------------------------------
// LIGHTING
// ------------------------------------

scene.add(new THREE.HemisphereLight(0x8299ff, 0x171022, 2));

const moonLight = new THREE.DirectionalLight(0x9abaff, 2);
moonLight.position.set(-10, 20, 10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientGlow = new THREE.PointLight(0x00aaff, 30, 50);
ambientGlow.position.set(0, 8, -15);
scene.add(ambientGlow);

// ------------------------------------
// MATERIALS
// ------------------------------------

const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x151824,
  roughness: 0.85,
  metalness: 0.15
});

const lineMaterial = new THREE.MeshBasicMaterial({
  color: 0x00eaff
});

const pinkMaterial = new THREE.MeshBasicMaterial({
  color: 0xff00aa
});

const buildingMaterials = [
  0x10172d,
  0x17132c,
  0x101d35,
  0x20132d
].map(color => new THREE.MeshStandardMaterial({
  color,
  roughness: 0.8
}));

// ------------------------------------
// ROAD
// ------------------------------------

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 240),
  roadMaterial
);

road.rotation.x = -Math.PI / 2;
road.position.z = -85;
road.receiveShadow = true;
scene.add(road);

// Road edges
for (const x of [-7.35, 7.35]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.04, 240),
    lineMaterial
  );

  edge.position.set(x, 0.04, -85);
  scene.add(edge);
}

// Lane markings
const laneMarkers = [];

for (const x of [-2.5, 2.5]) {
  for (let i = 0; i < 30; i++) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.025, 2.5),
      new THREE.MeshBasicMaterial({ color: 0xd6e7ff })
    );

    marker.position.set(x, 0.035, -i * 8);
    scene.add(marker);
    laneMarkers.push(marker);
  }
}

// ------------------------------------
// CITY BUILDINGS
// ------------------------------------

const buildings = [];

function createBuilding(x, z) {
  const height = 8 + Math.random() * 22;
  const width = 3 + Math.random() * 5;
  const depth = 4 + Math.random() * 5;

  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    buildingMaterials[
      Math.floor(Math.random() * buildingMaterials.length)
    ]
  );

  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  // Neon roof outline
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.12, 0.12, depth + 0.12),
    Math.random() > 0.5 ? lineMaterial : pinkMaterial
  );

  roof.position.set(x, height, z);
  scene.add(roof);

  // Random glowing windows
  for (let i = 0; i < 8; i++) {
    const windowLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.45, 0.06),
      Math.random() > 0.5
        ? lineMaterial
        : new THREE.MeshBasicMaterial({ color: 0xffbb55 })
    );

    windowLight.position.set(
      x + (Math.random() - 0.5) * width * 0.7,
      1.5 + Math.random() * (height - 3),
      z + depth / 2 + 0.04
    );

    scene.add(windowLight);
  }

  buildings.push({ building, roof, z });
}

for (let i = 0; i < 35; i++) {
  const z = -i * 9;

  createBuilding(-12 - Math.random() * 5, z);
  createBuilding(12 + Math.random() * 5, z);
}

// ------------------------------------
// STREETLIGHTS
// ------------------------------------

const streetLights = [];

function createStreetLight(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x555c78 })
  );

  pole.position.set(x, 3, z);
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    lineMaterial
  );

  lamp.position.set(x, 6, z);
  scene.add(lamp);

  const glow = new THREE.PointLight(0x00bbff, 18, 12);
  glow.position.set(x, 5.8, z);
  scene.add(glow);

  streetLights.push({ pole, lamp, glow, z });
}

for (let i = 0; i < 20; i++) {
  createStreetLight(-8.2, -i * 14);
  createStreetLight(8.2, -i * 14);
}

// ------------------------------------
// SPORTS CAR CREATOR
// ------------------------------------

function createCar(color, isPlayer = false) {
  const car = new THREE.Group();

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.75,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  });

  // Main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.55, 4),
    bodyMaterial
  );

  body.position.y = 0.65;
  body.castShadow = true;
  car.add(body);

  // Hood
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.2, 1.1),
    bodyMaterial
  );

  hood.position.set(0, 0.9, -1.25);
  car.add(hood);

  // Cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.65, 1.8),
    new THREE.MeshPhysicalMaterial({
      color: 0x07152b,
      metalness: 0.7,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    })
  );

  cabin.position.set(0, 1.2, 0.25);
  cabin.castShadow = true;
  car.add(cabin);

  // Wheels
  const wheels = [];

  for (const x of [-1, 1]) {
    for (const z of [-1.25, 1.25]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.25, 20),
        new THREE.MeshStandardMaterial({
          color: 0x08080c,
          roughness: 0.85
        })
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.42, z);
      wheel.castShadow = true;
      car.add(wheel);
      wheels.push(wheel);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.27, 12),
        new THREE.MeshStandardMaterial({
          color: 0x9da9bf,
          metalness: 0.9,
          roughness: 0.2
        })
      );

      rim.rotation.z = Math.PI / 2;
      rim.position.set(x * 1.01, 0.42, z);
      car.add(rim);
    }
  }

  // Headlights
  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9faff
  });

  for (const x of [-0.62, 0.62]) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.12, 0.08),
      headlightMaterial
    );

    light.position.set(x, 0.8, -2.02);
    car.add(light);
  }

  // Rear lights
  for (const x of [-0.65, 0.65]) {
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.13, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xff003c })
    );

    tail.position.set(x, 0.78, 2.02);
    car.add(tail);
  }

  // Neon underglow
  const underglow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 4.2),
    new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x00eaff : 0xff0055,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    })
  );

  underglow.rotation.x = -Math.PI / 2;
  underglow.position.y = 0.08;
  car.add(underglow);

  return { car, wheels };
}

// ------------------------------------
// PLAYER
// ------------------------------------

const playerData = createCar(0x075bff, true);
const player = playerData.car;

player.position.set(0, 0, 4);
scene.add(player);

// ------------------------------------
// TRAFFIC
// ------------------------------------

const traffic = [];
const trafficColors = [
  0xff1744,
  0xffaa00,
  0x7b2cff,
  0xffffff,
  0x00cc88
];

function spawnTraffic(z) {
  const lane = [-5, 0, 5][
    Math.floor(Math.random() * 3)
  ];

  const data = createCar(
    trafficColors[Math.floor(Math.random() * trafficColors.length)]
  );

  data.car.position.set(lane, 0, z);
  data.car.scale.setScalar(0.9);
  scene.add(data.car);

  traffic.push({
    car: data.car,
    wheels: data.wheels,
    speed: 8 + Math.random() * 9
  });
}

// ------------------------------------
// GAME STATE
// ------------------------------------

const speedElement = document.querySelector('#speed');
const distanceElement = document.querySelector('#distance');
const scoreElement = document.querySelector('#score');

const startScreen = document.querySelector('#start-screen');
const gameOverScreen = document.querySelector('#game-over');

let running = false;
let speed = 0;
let distance = 0;
let score = 0;
let playerX = 0;
let steering = 0;
let spawnTimer = 0;

const keys = {};

window.addEventListener('keydown', event => {
  keys[event.key.toLowerCase()] = true;

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', event => {
  keys[event.key.toLowerCase()] = false;
});

// ------------------------------------
// GAME START / RESTART
// ------------------------------------

function startGame() {
  traffic.forEach(item => scene.remove(item.car));
  traffic.length = 0;

  speed = 0;
  distance = 0;
  score = 0;
  playerX = 0;
  steering = 0;
  spawnTimer = 0;

  player.position.set(0, 0, 4);
  player.rotation.set(0, 0, 0);

  running = true;

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
}

function endGame() {
  running = false;

  document.querySelector('#final-score').textContent =
    Math.floor(score);

  gameOverScreen.classList.remove('hidden');
}

document.querySelector('#start-button').addEventListener('click', startGame);
document.querySelector('#restart-button').addEventListener('click', startGame);

// ------------------------------------
// COLLISION DETECTION
// ------------------------------------

function checkCollision() {
  for (const item of traffic) {
    const dx = Math.abs(player.position.x - item.car.position.x);
    const dz = Math.abs(player.position.z - item.car.position.z);

    if (dx < 1.55 && dz < 2.5) {
      return true;
    }
  }

  return false;
}

// ------------------------------------
// ANIMATION LOOP
// ------------------------------------

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.04);
  const time = clock.elapsedTime;

  if (running) {
    // Acceleration and braking
    if (keys['w'] || keys['arrowup']) {
      speed += 30 * delta;
    } else {
      speed -= 12 * delta;
    }

    if (keys['s'] || keys['arrowdown']) {
      speed -= 45 * delta;
    }

    speed = THREE.MathUtils.clamp(speed, 0, 220);

    // Steering
    steering = 0;

    if (keys['a'] || keys['arrowleft']) steering = -1;
    if (keys['d'] || keys['arrowright']) steering = 1;

    playerX += steering * delta * (3 + speed / 30);
    playerX = THREE.MathUtils.clamp(playerX, -5.3, 5.3);

    player.position.x = THREE.MathUtils.damp(
      player.position.x,
      playerX,
      12,
      delta
    );

    player.rotation.z = THREE.MathUtils.damp(
      player.rotation.z,
      -steering * 0.13,
      8,
      delta
    );

    // Wheels
    playerData.wheels.forEach(wheel => {
      wheel.rotation.x -= speed * delta * 0.015;
    });

    // Road movement
    const roadMovement = speed * delta * 0.055;

    laneMarkers.forEach(marker => {
      marker.position.z += roadMovement;

      if (marker.position.z > 8) {
        marker.position.z -= 240;
      }
    });

    // Buildings movement
    buildings.forEach(item => {
      item.z += roadMovement;

      if (item.z > 12) item.z -= 315;

      item.building.position.z = item.z;
      item.roof.position.z = item.z;
    });

    // Streetlights movement
    streetLights.forEach(item => {
      item.z += roadMovement;

      if (item.z > 12) item.z -= 280;

      item.pole.position.z = item.z;
      item.lamp.position.z = item.z;
      item.glow.position.z = item.z;
    });

    // Spawn traffic
    spawnTimer += delta;

    if (spawnTimer > 1.4 && speed > 30) {
      spawnTraffic(-125);
      spawnTimer = 0;
    }

    // Move traffic
    for (let i = traffic.length - 1; i >= 0; i--) {
      const item = traffic[i];

      item.car.position.z += (
        speed * 0.055 - item.speed * 0.055
      ) * delta;

      item.wheels.forEach(wheel => {
        wheel.rotation.x -= delta * 2;
      });

      if (item.car.position.z > 18) {
        scene.remove(item.car);
        traffic.splice(i, 1);
        score += 100;
      }
    }

    // Collision
    if (checkCollision()) {
      endGame();
    }

    distance += speed * delta * 0.025;
    score += speed * delta * 0.5;

    speedElement.textContent = Math.floor(speed);
    distanceElement.textContent = Math.floor(distance);
    scoreElement.textContent = Math.floor(score);
  }

  // Camera follows player
  camera.position.x = THREE.MathUtils.damp(
    camera.position.x,
    player.position.x * 0.55,
    3,
    delta
  );

  camera.position.y = 5 + Math.sin(time * 2) * 0.025;
  camera.position.z = 11;

  camera.lookAt(player.position.x * 0.35, 0.8, -8);

  renderer.render(scene, camera);
}

animate();

// ------------------------------------
// WINDOW RESIZE
// ------------------------------------

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});
