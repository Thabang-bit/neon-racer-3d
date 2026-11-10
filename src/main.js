
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
// ROAD - NEON HIGHWAY
// ------------------------------------

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 240),
  new THREE.MeshStandardMaterial({
    color: 0x090d19,
    roughness: 0.32,
    metalness: 0.65
  })
);

road.rotation.x = -Math.PI / 2;
road.position.z = -85;
road.receiveShadow = true;
scene.add(road);

// Road shoulder strips
for (const side of [-1, 1]) {
  const shoulder = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.035, 240),
    new THREE.MeshStandardMaterial({
      color: 0x10182a,
      metalness: 0.5,
      roughness: 0.4
    })
  );

  shoulder.position.set(side * 7.15, 0.015, -85);
  scene.add(shoulder);
}

// Neon road edges
for (const side of [-1, 1]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.06, 240),
    new THREE.MeshBasicMaterial({
      color: side === -1 ? 0x00eaff : 0xff00aa
    })
  );

  edge.position.set(side * 7.35, 0.055, -85);
  scene.add(edge);

  // Inner road glow
  const innerGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.025, 240),
    new THREE.MeshBasicMaterial({
      color: side === -1 ? 0x0077ff : 0xff2266
    })
  );

  innerGlow.position.set(side * 6.95, 0.045, -85);
  scene.add(innerGlow);
}

// Roadside reflective markings
for (const side of [-1, 1]) {
  for (let i = 0; i < 60; i++) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.025, 1.2),
      new THREE.MeshBasicMaterial({
        color: 0x8799b8
      })
    );

    marker.position.set(side * 6.4, 0.035, -i * 4);
    scene.add(marker);
  }
}

// Lane markings
const laneMarkers = [];

for (const x of [-2.5, 2.5]) {
  for (let i = 0; i < 30; i++) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.025, 2.5),
      new THREE.MeshBasicMaterial({
        color: 0xd6e7ff
      })
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
  const wheels = [];

  // CAR MATERIALS
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.08
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x071426,
    metalness: 0.65,
    roughness: 0.12,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1
  });

  const blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x080a12,
    metalness: 0.4,
    roughness: 0.4
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xbac9dc,
    metalness: 1,
    roughness: 0.18
  });

  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x9eeeff,
    emissiveIntensity: 3
  });

  const tailLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff003c,
    emissive: 0xff0022,
    emissiveIntensity: 3
  });

  const neonMaterial = new THREE.MeshBasicMaterial({
    color: isPlayer ? 0x00eaff : 0xff0055,
    transparent: true,
    opacity: 0.7
  });

  // HELPER TO CREATE CAR PARTS
  function addBox(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    car.add(mesh);
    return mesh;
  }

  // MAIN LOWER BODY
  addBox(
    1.95, 0.42, 4.15,
    bodyMaterial,
    0, 0.57, 0
  );

  // LOWER CHASSIS
  addBox(
    1.85, 0.18, 3.7,
    blackMaterial,
    0, 0.34, 0
  );

  // FRONT HOOD
  addBox(
    1.78, 0.16, 1.35,
    bodyMaterial,
    0, 0.84, -1.25
  );

  // FRONT BUMPER
  addBox(
    1.92, 0.22, 0.22,
    bodyMaterial,
    0, 0.43, -2.08
  );

  // FRONT GRILLE
  addBox(
    0.85, 0.18, 0.035,
    blackMaterial,
    0, 0.53, -2.205
  );

  // FRONT SPLITTER
  addBox(
    2.1, 0.07, 0.35,
    blackMaterial,
    0, 0.27, -2.08
  );

  // SPORTY CABIN ROOF
  addBox(
    1.38, 0.12, 1.25,
    bodyMaterial,
    0, 1.52, 0.15
  );

  // FRONT WINDSCREEN
  const windshield = addBox(
    1.38, 0.58, 0.08,
    glassMaterial,
    0, 1.15, -0.65
  );

  windshield.rotation.x = -0.28;

  // REAR WINDSCREEN
  const rearGlass = addBox(
    1.35, 0.48, 0.08,
    glassMaterial,
    0, 1.16, 0.95
  );

  rearGlass.rotation.x = 0.3;

  // SIDE WINDOWS
  for (const side of [-1, 1]) {
    const window = addBox(
      0.06, 0.48, 1.15,
      glassMaterial,
      side * 0.72, 1.16, 0.15
    );

    window.rotation.x = 0.08;
  }

  // SIDE MIRRORS
  for (const side of [-1, 1]) {
    const mirror = addBox(
      0.18, 0.12, 0.25,
      bodyMaterial,
      side * 0.98, 1.12, -0.48
    );

    mirror.rotation.y = side * 0.15;
  }

  // SIDE SKIRTS
  for (const side of [-1, 1]) {
    addBox(
      0.13, 0.16, 2.8,
      blackMaterial,
      side * 0.98, 0.38, 0
    );
  }

  // FRONT HEADLIGHTS
  for (const side of [-1, 1]) {
    const headlight = addBox(
      0.58, 0.13, 0.07,
      headlightMaterial,
      side * 0.63, 0.76, -2.12
    );

    headlight.rotation.z = side * -0.08;
  }

  // REAR BUMPER
  addBox(
    1.95, 0.23, 0.2,
    bodyMaterial,
    0, 0.46, 2.08
  );

  // REAR LIGHT BAR
  addBox(
    1.5, 0.12, 0.06,
    tailLightMaterial,
    0, 0.79, 2.13
  );

  // REAR DIFFUSER
  addBox(
    1.7, 0.12, 0.3,
    blackMaterial,
    0, 0.3, 2.0
  );

  // EXHAUST PIPES
  for (const side of [-1, 1]) {
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12),
      chromeMaterial
    );

    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(side * 0.55, 0.34, 2.18);
    car.add(exhaust);
  }

  // REAR SPOILER
  addBox(
    1.65, 0.09, 0.35,
    blackMaterial,
    0, 1.25, 1.85
  );

  for (const side of [-1, 1]) {
    addBox(
      0.09, 0.3, 0.09,
      chromeMaterial,
      side * 0.58, 1.1, 1.82
    );
  }

  // SPORT ALLOY WHEELS
  for (const x of [-1.02, 1.02]) {
    for (const z of [-1.28, 1.28]) {
      const wheelGroup = new THREE.Group();

      wheelGroup.position.set(x, 0.43, z);

      // Rubber tyre
      const tyre = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.27, 32),
        new THREE.MeshStandardMaterial({
          color: 0x08090c,
          roughness: 0.9
        })
      );

      tyre.rotation.z = Math.PI / 2;
      tyre.castShadow = true;
      wheelGroup.add(tyre);

      // Metallic rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.27, 0.035, 8, 24),
        chromeMaterial
      );

      rim.rotation.y = Math.PI / 2;
      rim.position.x = 0.14;
      wheelGroup.add(rim);

      // Wheel centre
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16),
        chromeMaterial
      );

      hub.rotation.z = Math.PI / 2;
      wheelGroup.add(hub);

      // Five alloy spokes
      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, 0.39, 0.055),
          chromeMaterial
        );

        spoke.position.x = 0.15;
        spoke.rotation.x = (Math.PI * 2 * i) / 5;
        wheelGroup.add(spoke);
      }

      car.add(wheelGroup);
      wheels.push(wheelGroup);
    }
  }

  // NEON UNDERGLOW
  const underglow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 4.4),
    new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x00eaff : 0xff0055,
      transparent: true,
      opacity: 0.42,
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
