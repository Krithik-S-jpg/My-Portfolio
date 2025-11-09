
document.addEventListener("DOMContentLoaded", () => {

  let lampObject = null;
  let lampLight = null;
  let lampOn = false;
  let lampToggleSound;
  let lampClicked = false;
  const interactableObjects = [];
  // Home camera snapshot (used to restore view after overlays)
  let homeCameraPosition = null;
  let homeCameraTarget = null;
  

  // Your existing code
  const loadingScreen = document.createElement("div");
  loadingScreen.id = "loading-screen";
  loadingScreen.innerHTML = `
    <div class="advanced-loader">
      <div class="neon-circle"></div>
      <div class="loading-animation">
        <p class="loading-text">Initializing<span class="dots"></span></p>
      </div>
    </div>
  `;
  document.body.appendChild(loadingScreen);

  // Add disclaimer notification after a delay
  setTimeout(() => {
    showDisclaimerNotification();
  }, 2000);

  function showDisclaimerNotification() {
    const notification = document.createElement("div");
    notification.className = "disclaimer-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⚠️</span>
        <span class="notification-text">If loading shows "Infinity%" or gets stuck, press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> to fix it</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('slide-out');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 500);
      }
    }, 5000);
  }

// Add loading screen CSS
const style = document.createElement("style");
style.textContent = `
  #loading-screen {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: radial-gradient(ellipse at center,rgb(46, 30, 83) 0%, #000000 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.8s ease;
    font-family: 'Segoe UI', sans-serif;
  }

  .advanced-loader {
    text-align: center;
  }

  .neon-circle {
    width: 80px;
    height: 80px;
    border: 5px solid #00ffff;
    border-top: 5px solid transparent;
    border-radius: 50%;
    animation: spin 1.2s linear infinite;
    margin-bottom: 20px;
    box-shadow: 0 0 20px #00ffff88;
  }

  .loading-text {
    color: #00ffff;
    font-size: 1.4rem;
    text-shadow: 0 0 10px #00ffff99;
  }

  .dots::after {
    content: '';
    display: inline-block;
    animation: dots 1.2s infinite steps(4);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes dots {
    0%   { content: ''; }
    25%  { content: '.'; }
    50%  { content: '..'; }
    75%  { content: '...'; }
    100% { content: ''; }
  }

  .loading-animation {
  display: flex;
  align-items: center;
  gap: 20px;
}

.disclaimer-notification {
  position: fixed;
  bottom: 30px;
  right: -400px;
  width: 380px;
  background: rgba(255, 193, 7, 0.95);
  border: 2px solid #ffc107;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3);
  z-index: 10000;
  animation: slide-in 0.5s ease-out forwards;
  transition: transform 0.5s ease-out;
}

.disclaimer-notification.slide-out {
  transform: translateX(400px);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  position: relative;
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-text {
  color: #000;
  font-size: 0.9rem;
  line-height: 1.4;
  flex-grow: 1;
}

.notification-close {
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.notification-text kbd {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  padding: 2px 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  margin: 0 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes slide-in {
  from {
    right: -400px;
  }
  to {
    right: 30px;
  }
}

#bookshelf-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(#1e1a2c, #0c0c0f);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.4s ease;
}

.bookshelf-container {
  background: #4b2c20;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0,0,0,0.6);
  text-align: center;
  color: #fff;
  width: 80%;
  max-width: 900px;
}

.bookshelf-container h2 {
  font-size: 2rem;
  margin-bottom: 30px;
}

.shelf {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px;
  background: #6f4439;
  border-radius: 10px;
  position: relative;
}

.book {
  width: 100px;
  height: 140px;
  background: #c48166;
  border-radius: 5px;
  box-shadow: 2px 2px 8px #000;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-2deg);
  transition: transform 0.2s ease;
}

.book:hover {
  transform: scale(1.05) rotate(0deg);
}

.book-cover {
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.book-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2e1f1b;
  color: white;
  padding: 30px;
  border-radius: 12px;
  z-index: 1100;
  box-shadow: 0 0 20px rgba(0,0,0,0.8);
}

.book-popup .book-detail {
  max-width: 300px;
  text-align: center;
}

#close-bookshelf,
.close-book-popup {
  background: white;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

#hover-tooltip {
  font-family: 'Segoe UI', sans-serif;
  font-weight: 500;
  pointer-events: none;
  z-index: 999;
}

`;
document.head.appendChild(style);

//project screen css
const projectCardStyle = document.createElement("style");
projectCardStyle.textContent = `
.project-card {
    background: linear-gradient(#222, #111);
    border: 2px solid #00ffff88;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    font-size: 18px;
    color: #00ffff;
    transition: transform 0.3s;
    box-shadow: 0 0 20px #00ffff44;
}

.project-card:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px #00ffffaa;
}
`;
document.head.appendChild(projectCardStyle);

// Orientation tip overlay CSS and container
const orientationStyle = document.createElement('style');
orientationStyle.textContent = `
  #orientation-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none; /* do not block the UI */
    display: none;
    z-index: 10050;
    font-family: 'Segoe UI', sans-serif;
  }
  #orientation-overlay .panel {
    position: fixed;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%) translateY(18px);
    opacity: 0;
    background: linear-gradient(160deg, rgba(20,24,40,0.9), rgba(10,12,24,0.88));
    border: 1px solid rgba(0,170,255,0.35);
    border-radius: 14px;
    padding: 12px 16px;
    width: min(92vw, 520px);
    color: #eaf6ff;
    box-shadow: 0 12px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    text-align: center;
    transition: all .25s ease;
  }
  #orientation-overlay.visible .panel { opacity: 1; transform: translateX(-50%) translateY(0); }
  #orientation-overlay .icon { font-size: 28px; margin-right: 8px; vertical-align: -2px; }
  #orientation-overlay h3 { display: inline; font-size: 15px; font-weight: 700; margin: 0; }
  #orientation-overlay p { margin: 6px 0 0 0; opacity: 0.95; font-size: 12px; }
`;
document.head.appendChild(orientationStyle);

const orientationOverlay = document.createElement('div');
orientationOverlay.id = 'orientation-overlay';
orientationOverlay.innerHTML = `
  <div class="panel">
    <span class="icon">📱↔️</span>
    <h3>Rotate your phone</h3>
    <p>Landscape works best for 3D and the desktop UI.</p>
  </div>
`;
document.body.appendChild(orientationOverlay);



// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

camera.position.set(15, 10, 25); // initial view (will be stored as home below)
camera.lookAt(0, 1.5, 0);

// --- Fullscreen helpers ---
function isFullscreen() {
  return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}
function requestFullscreenSafely() {
  try {
    if (isFullscreen()) return;
    const elem = document.documentElement; // fullscreen the page
    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
    if (typeof req === 'function') {
      req.call(elem).catch?.(() => {});
    }
  } catch (_) {}
}
// Try fullscreen on first user gesture (non-blocking)
['pointerdown','touchend','keydown'].forEach(evt => {
  window.addEventListener(evt, () => requestFullscreenSafely(), { once: true, passive: true });
});

// GLTF Loader
// GLTF Loader
const manager = new THREE.LoadingManager();
const loader = new THREE.GLTFLoader(manager);
let laptopObject = null;
let cupboardDoor = null;


loader.load("public/models/room.glb", function (gltf) {
  const model = gltf.scene;
  model.scale.set(1, 1, 1);

  // Inside loader.load() → model.traverse
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.name === "pCube82_Assessorios_PC_0") {
        node.castShadow = true;
        node.receiveShadow = true;
        lampObject = node;
        lampObject.userData.tag = "Desk Lamp";
        interactableObjects.push(lampObject);
        interactableObjects.push(node); // make it clickable
      }
    }
  });

  const tooltipTargets = {
    pCube84_Pc_e_monitor_0: "PC",
    pCube27_Livros_0: "Bookshelf",
    pCube81_Cama_quadro_0: "Notice Board",
    pCube4_Armario1_0: "Cupboard",
    pSphere21_Lixeira_Som_0: "Speaker"
  };


  let lampClicked = false;

  renderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedObj = intersects[0].object;

      if (clickedObj.name === "pCube82_Assessorios_PC_0") {
        lampClicked = !lampClicked;

        // Toggle lamp light
        lampLight.visible = lampClicked;

        // Dark mode toggle
        ambientLight.intensity = lampClicked ? 0.1 : 0.1;
        scene.background = new THREE.Color(lampClicked ? 0x0b0b0b : 0xffffff);

        // Lamp glow
        if (lampObject.material) {
          lampObject.material.emissive = new THREE.Color(0xffffaa);
          lampObject.material.emissiveIntensity = lampClicked ? 0.7 : 0;
        }

        // Play sound
        if (lampToggleSound) lampToggleSound.play();
      }
    }
  });


  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;

      if (tooltipTargets[node.name]) {
        node.userData.tag = tooltipTargets[node.name];
        interactableObjects.push(node);
      }

      if (node.name.includes("Pc_e_monitor")) laptopObject = node;
      if (node.name === "pCube4_Armario1_0") cupboardDoor = node;
    }
  });

  scene.add(model);


  // Create lamp light
  lampLight = new THREE.PointLight(0xffe9aa, 2, 5); // warm color
  lampLight.position.set(0.2, 1.1, 0.5); // adjust to match lamp location
  lampLight.visible = false;
  scene.add(lampLight);

  // Hide loading screen
  const screen = document.getElementById("loading-screen");
  if (screen) {
    screen.style.opacity = "0";
    setTimeout(() => {
      screen.style.display = "none";
      setTimeout(showIntroPaperNote, 500); // Show note after fade
    }, 500);
  }
},
function (xhr) {
    const percent = Math.round((xhr.loaded / xhr.total) * 100);
    const textElem = document.querySelector(".loading-text");
    if (textElem) {
      textElem.innerHTML = `Loading ${percent}%<span class="dots"></span>`;
    }
},

undefined, function (error) {
    console.error("Error loading model:", error);
});

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Orientation guidance: show overlay for phones in portrait
function updateOrientationOverlay() {
  try {
    const isNarrow = window.innerWidth < 768;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const overlay = document.getElementById('orientation-overlay');
    if (!overlay) return;
    if (isNarrow && isPortrait) {
      overlay.style.display = 'block';
      overlay.classList.add('visible');
      // Auto-hide after 5s to avoid forcing user
      clearTimeout(window.__orientTO);
      window.__orientTO = setTimeout(() => {
        overlay.classList.remove('visible');
        // fade away but keep clickable UI
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
      }, 5000);
    } else {
      overlay.classList.remove('visible');
      overlay.style.display = 'none';
    }
  } catch (_) {}
}
window.addEventListener('orientationchange', updateOrientationOverlay);
window.addEventListener('resize', updateOrientationOverlay);
// Initial check shortly after load
setTimeout(updateOrientationOverlay, 50);


// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);


controls.maxDistance = 25; // adjust this value based on what you see in the screenshot
controls.minDistance = 5;  // optional: restrict how close users can zoom in

// Restrict vertical rotation (top and bottom)
controls.minPolarAngle = Math.PI / 3; // Prevent looking up from below (raise as needed)
controls.maxPolarAngle = Math.PI / 3.2; // Prevent looking from above (lower as needed)

// Restrict horizontal rotation (left/right walls)
controls.minAzimuthAngle = -Math.PI / 12; // Decrease left (narrower)
controls.maxAzimuthAngle = Math.PI / 1.5;  // Increase right (wider)

// You can fine-tune the above angles for your room layout

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);
controls.update();

// Store initial camera position and target as the "home" intimate view
homeCameraPosition = camera.position.clone();
homeCameraTarget = controls.target.clone();

// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let laptopOpened = false;
let overlayOpen = false; // NEW flag to know when an overlay is open
let blockSceneClicksUntilMs = 0; // UI click shield to avoid accidental scene clicks

// Project Panel inside cupboard
const projectPanel = new THREE.Group();
projectPanel.visible = false;
for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BoxGeometry(0.5, 0.3, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const projectBox = new THREE.Mesh(geometry, material);

    const x = -0.8;
    const y = 0.8 + i * 0.5;
    const z = -2.5;

    if (cupboardDoor) {
        const cupboardPos = new THREE.Vector3();
        cupboardDoor.getWorldPosition(cupboardPos);

        projectBox.position.set(
            cupboardPos.x - 0.2,
            cupboardPos.y + i * 0.4,
            cupboardPos.z - 0.3
        );
    }

    projectBox.position.set(x, y, z);
    projectBox.name = `project-${i}`;

    projectPanel.add(projectBox);
}
scene.add(projectPanel);

// Click Handling
window.addEventListener("click", (event) => {
  // Temporary shield after UI clicks, and while overlays are open
  if (overlayOpen) return;
  if (Date.now() < blockSceneClicksUntilMs) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if (laptopObject && (clickedObject === laptopObject || clickedObject.parent === laptopObject) && !laptopOpened) {
            laptopOpened = true;
            zoomInOnLaptop();
        }

        if (lampObject && (clickedObject === lampObject || clickedObject.parent === lampObject)) {
          lampOn = !lampOn;
          lampLight.visible = lampOn;
          lampObject.material.emissive = new THREE.Color(lampOn ? 0xffffaa : 0x000000);
        }

        if (
            clickedObject.name.toLowerCase().includes("cupboard") ||
            clickedObject === cupboardDoor ||
            clickedObject.parent === cupboardDoor
        ) {
            zoomInOnCupboard();
        }

        if (clickedObject.name.startsWith("project-")) {
            alert(`Clicked on ${clickedObject.name}`);
        }

        if (clickedObject.name === "pSphere21_Lixeira_Som_0") {
          openSoundControlPanel();
        }

        if (clickedObject.name === "pCube81_Cama_quadro_0") {
          openSkillsNoticeBoard();
        }

        if (clickedObject.name === "pCube27_Livros_0") {
          openLearningShelf();
        }        
        console.log("You clicked on:", clickedObject.name);
    }
});

// Capture clicks on UI overlays/windows and shield scene clicks briefly
const uiClickContainers = [
  '#intro-note-overlay',
  '#skills-overlay',
  '#projects-overlay',
  '#shelf-overlay',
  '#sound-control-overlay',
  '#desktop-overlay',
  '.project-detail-overlay',
  '.book-popup',
  '.window',
];
document.addEventListener('click', (e) => {
  for (const sel of uiClickContainers) {
    if (e.target.closest && e.target.closest(sel)) {
      blockSceneClicksUntilMs = Date.now() + 400; // 0.4s shield
      break;
    }
  }
}, true);

// === Background Music ===
const backgroundMusic = new Audio('Audio.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // Default volume 50%
backgroundMusic.play().catch((err) => {
    console.log('Autoplay blocked, will play after user interaction');
});

function zoomInOnLaptop() {
  if (!laptopObject) return;

  const laptopScreenPosition = new THREE.Vector3();
  laptopObject.getWorldPosition(laptopScreenPosition);

  const zoomTarget = laptopScreenPosition.clone().add(new THREE.Vector3(0, 0.5, 1)); // forward from screen

  controls.enabled = false;

  gsap.to(camera.position, {
    x: zoomTarget.x,
    y: zoomTarget.y,
    z: zoomTarget.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(laptopScreenPosition),
    onComplete: showVirtualDesktop
  });
}

function zoomBackToIntimateView() {
  // Zoom back to stored home camera position and target
  const targetPos = homeCameraPosition ? homeCameraPosition.clone() : new THREE.Vector3(15, 10, 25);
  const lookAtTarget = homeCameraTarget ? homeCameraTarget.clone() : new THREE.Vector3(0, 1.5, 0);
  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(lookAtTarget),
    onComplete: () => {
      controls.enabled = true;
      controls.target.copy(lookAtTarget);
      controls.update();
    }
  });
}

function showVirtualDesktop() {
    if (document.getElementById("desktop-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "desktop-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.92)";
    overlay.style.zIndex = "10000";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.transition = "transform 0.5s ease-out";
    overlay.style.transform = "translateY(100%)";

    overlay.innerHTML = `
        <button id="close-btn" style="position:absolute;top:20px;right:30px;background:rgba(0,0,0,0.7);color:#fff;border:none;font-size:2rem;z-index:10001;cursor:pointer;border-radius:8px;padding:6px 18px;">×</button>
        <iframe src="about-me.html" style="width:100vw;height:100vh;border:none;display:block;"></iframe>
    `;

    document.body.appendChild(overlay);
    overlayOpen = true;
    // Attempt fullscreen when opening desktop
    requestFullscreenSafely();

    setTimeout(() => {
        overlay.style.transform = "translateY(0%)";
    }, 50);

    document.getElementById("close-btn").addEventListener("click", () => {
      overlayOpen = false;
        overlay.style.transform = "translateY(100%)";
        setTimeout(() => {
            document.body.removeChild(overlay);
            zoomBackToIntimateView(); // Zoom back to intimate view
        }, 400);
    });
}

// Function to close virtual desktop (used by power menu)
function closeVirtualDesktop() {
    const overlay = document.getElementById("desktop-overlay");
    if (overlay) {
        overlayOpen = false;
        overlay.style.transform = "translateY(100%)";
        setTimeout(() => {
            if (overlay.parentElement) {
                document.body.removeChild(overlay);
            }
            zoomBackToIntimateView(); // Zoom back to intimate view
        }, 400);
    }
}

// Make it globally accessible for the power menu
window.closeVirtualDesktop = closeVirtualDesktop;

// Listen for messages from the iframe (power menu)
window.addEventListener('message', (event) => {
    console.log("Message received from iframe:", event.data);
    if (event.data && event.data.action === 'closeVirtualDesktop') {
        console.log("Closing virtual desktop...");
        closeVirtualDesktop();
    }
});


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function zoomInOnCupboard() {
    let target = new THREE.Vector3(-1, 1.5, -2.5);
    if (cupboardDoor) cupboardDoor.getWorldPosition(target);

    gsap.to(camera.position, {
      x: target.x + 0.5,
      y: target.y,
      z: target.z + 1,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(target),
      onComplete: showProjectsScreen // <- New function
    });
}


function showProjectsInCupboard(basePos) {
    projectPanel.visible = true;

    const rowCount = 2; // how many rows inside cupboard
    const projectsPerRow = 3; // how many projects per row
    const spacingX = 0.5; // left-right gap
    const spacingY = 0.4; // up-down gap

    projectPanel.children.forEach((box, i) => {
        const row = Math.floor(i / projectsPerRow); // which shelf
        const col = i % projectsPerRow; // left-center-right

        box.scale.set(1, 1, 1); // reset scaling

        box.position.set(
            basePos.x - 0.5 + (col * spacingX), // left to right
            basePos.y + 0.5 - (row * spacingY),  // top to bottom
            basePos.z - 0.4                      // little inside cupboard
        );

        gsap.from(box.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: "back.out(1.7)"
        });
    });
}


// === Project Data ===
const projects = [
  {
    title: "Portfolio Website",
    description: "A 3D interactive portfolio built with Three.js, featuring a virtual room and interactive objects.",
    tech: ["Three.js", "GSAP", "HTML", "CSS", "JavaScript"],
    image: "profile.jpg",
    github: "https://github.com/yourusername/portfolio",
    demo: "https://your-portfolio-demo.com"
  },
  {
    title: "E-commerce App",
    description: "A modern e-commerce web app with real-time cart, payments, and admin dashboard.",
    tech: ["React", "Node.js", "MongoDB", "Stripe API"],
    image: "profile.jpg",
    github: "https://github.com/yourusername/ecommerce",
    demo: "https://your-ecommerce-demo.com"
  },
  {
    title: "Chatbot Assistant",
    description: "AI-powered chatbot for customer support, built with Python and deployed on the web.",
    tech: ["Python", "Flask", "TensorFlow", "JavaScript"],
    image: "profile.jpg",
    github: "https://github.com/yourusername/chatbot",
    demo: "https://your-chatbot-demo.com"
  }
];

function showProjectsScreen() {
  if (document.getElementById("projects-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "projects-overlay";
  overlay.innerHTML = `
    <div class="cupboard-wood">
      <div class="cupboard-frame">
        <button id="close-projects" class="cupboard-close-x" title="Close">&times;</button>
        <div class="cupboard-shelves" id="dynamic-cupboard-shelves">
          <div style="color:#00ffff;">Loading projects...</div>
      </div>
      </div>
      </div>
  `;

  document.body.appendChild(overlay);
  overlayOpen = true;

  setTimeout(() => {
    overlay.style.transform = "translateY(0%)";
  }, 50);

  document.getElementById("close-projects").addEventListener("click", () => {
    overlayOpen = false;
    overlay.style.transform = "translateY(100%)";
    setTimeout(() => {
      document.body.removeChild(overlay);
      zoomBackToIntimateView(); // Zoom back to intimate view
    }, 400);
  });

  // Fetch and display projects from JSON, arranged on shelves
  fetch('public/projects.json')
    .then(res => res.json())
    .then(projects => {
      const shelvesDiv = overlay.querySelector('#dynamic-cupboard-shelves');
      // Split projects into 2-3 shelves
      const shelfCount = 3;
      const shelves = Array.from({length: shelfCount}, () => []);
      projects.forEach((p, i) => {
        shelves[i % shelfCount].push(p);
      });
      shelvesDiv.innerHTML = shelves.map(shelf => `
        <div class="cupboard-shelf">
          ${shelf.map(p => `
            <div class="cupboard-project-card" tabindex="0">
              <h2>${p.name}</h2>
              <p><a href="${p.link}" target="_blank">${p.link ? 'View Project' : 'No Link'}</a></p>
              <span class="cupboard-source">${p.source}</span>
            </div>
          `).join('')}
        </div>
      `).join('');
      // Modal for project details
      shelvesDiv.querySelectorAll('.cupboard-project-card').forEach((card, idx) => {
        card.addEventListener('click', () => {
          // Find the project by flattening shelves
          const flatProjects = shelves.flat();
          const proj = flatProjects[idx];
          const popup = document.createElement('div');
          popup.className = 'project-detail-overlay';
      popup.innerHTML = `
        <div class="project-detail">
              <h2>${proj.name}</h2>
              <p><a href="${proj.link}" target="_blank">${proj.link ? proj.link : 'No Link'}</a></p>
              <span style="font-size:0.9em;color:#aaa;">${proj.source}</span>
              <br><br>
          <button class="close-detail">Close</button>
        </div>
      `;
      document.body.appendChild(popup);
          popup.querySelector('.close-detail').addEventListener('click', () => {
        document.body.removeChild(popup);
      });
    });
  });
    })
    .catch(() => {
      const shelvesDiv = overlay.querySelector('#dynamic-cupboard-shelves');
      shelvesDiv.innerHTML = '<div style="color:red;">Failed to load projects.</div>';
    });

  // Add cupboard styles if not already present
  if (!document.getElementById('cupboard-style')) {
    const style = document.createElement('style');
    style.id = 'cupboard-style';
    style.textContent = `
      #projects-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: radial-gradient(ellipse at center, #1c0c24, #000000 80%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        z-index: 10000;
        transform: translateY(100%);
        transition: transform 0.5s ease-out;
        padding: 40px;
      }
      .cupboard-wood {
        background: url('https://www.transparenttextures.com/patterns/wood-pattern.png'), linear-gradient(120deg, #6b4226 80%, #3b2314 100%);
        border-radius: 30px;
        box-shadow: 0 0 60px #000a, 0 0 0 12px #3b2314;
        padding: 30px 40px 50px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 320px;
        max-width: 98vw;
        width: 100%;
        box-sizing: border-box;
      }
      .cupboard-frame {
        background: rgba(80, 40, 20, 0.7);
        border: 8px solid #a97c50;
        border-radius: 18px;
        box-shadow: 0 0 30px #0008 inset;
        padding: 30px 20px 20px 20px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: auto;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
      }
      .cupboard-shelves {
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
      .cupboard-shelf {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 24px;
        min-height: 0;
        position: relative;
        background: linear-gradient(0deg, #a97c50 70%, #d2b48c 100%);
        border-radius: 0 0 16px 16px;
        padding: 18px 0 8px 0;
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .cupboard-shelf::after {
        content: '';
        display: block;
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 10px;
        background: linear-gradient(90deg, #a97c50 60%, #d2b48c 100%);
        border-radius: 0 0 12px 12px;
        box-shadow: 0 4px 12px #0006;
        z-index: 1;
      }
      .cupboard-project-card {
        background: linear-gradient(120deg, #181818 80%, #2a1a0f 100%);
        border: 3px solid #00ffff;
        border-radius: 16px 16px 10px 10px;
        box-shadow: 0 8px 24px #000a, 0 0 18px #00ffff44;
        padding: 18px 12px 14px 12px;
        min-width: 160px;
        max-width: 200px;
        width: 100%;
        flex: 1 1 180px;
        color: #00ffff;
        font-weight: bold;
        font-size: 1.1em;
        text-align: center;
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
        position: relative;
        margin-bottom: 8px;
        box-sizing: border-box;
        z-index: 2;
      }
      .cupboard-project-card::before {
        content: '';
        display: block;
        position: absolute;
        left: 18px; right: 18px; bottom: -10px;
        height: 12px;
        background: radial-gradient(ellipse at center, #0006 60%, transparent 100%);
        border-radius: 50%;
        z-index: 0;
      }
      .cupboard-project-card:hover {
        transform: translateY(-8px) scale(1.04);
        box-shadow: 0 0 32px #00ffffcc, 0 12px 32px #000a;
        z-index: 3;
      }
      .cupboard-project-card h2 {
        font-size: 1.05em;
        margin-bottom: 8px;
        color: #00ffff;
      }
      .cupboard-project-card a {
        color: #00ffff;
        text-decoration: underline;
        font-size: 1em;
      }
      .cupboard-source {
        color: #bdbdbd;
        font-size: 0.9em;
        font-weight: normal;
      }
      .cupboard-close-btn {
        margin-top: 30px;
        background: none;
        border: 2px solid #00ffff;
        color: #00ffff;
        font-size: 20px;
        padding: 8px 20px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.3s;
      }
      .cupboard-close-btn:hover {
        background: #00ffff22;
      }
      @media (max-width: 900px) {
        .cupboard-wood {
          min-width: 0;
          padding: 10px 2vw 20px 2vw;
        }
        .cupboard-frame {
          padding: 10px 2vw 10px 2vw;
        }
        .cupboard-shelf {
          gap: 12px;
          padding: 10px 0 6px 0;
          max-width: 98vw;
        }
        .cupboard-project-card {
          min-width: 120px;
          max-width: 150px;
          font-size: 0.95em;
          padding: 10px 4px 8px 4px;
        }
      }
      @media (max-width: 520px) {
        #projects-overlay { padding: 16px; }
        .cupboard-wood { border-radius: 16px; padding: 14px; }
        .cupboard-frame { border-width: 6px; max-height: 82vh; }
        .cupboard-shelf { gap: 8px; }
        .cupboard-project-card { min-width: 110px; max-width: 130px; font-size: 0.9em; }
      }
      .cupboard-close-x {
        position: absolute;
        top: 18px;
        right: 28px;
        width: 38px;
        height: 38px;
        background: rgba(0,0,0,0.18);
        border: 2px solid #00ffff;
        color: #00ffff;
        font-size: 2rem;
        font-weight: bold;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        box-shadow: 0 2px 8px #00ffff33;
      }
      .cupboard-close-x:hover {
        background: #00ffff;
        color: #181818;
        box-shadow: 0 0 16px #00ffffcc;
      }
    `;
    document.head.appendChild(style);
  }
}



const racksStyle = document.createElement("style");
racksStyle.textContent = `
/* Cupboard and racks */
#projects-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: radial-gradient(ellipse at center, #1c0c24, #000000 80%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  z-index: 10000;
  transform: translateY(100%);
  transition: transform 0.5s ease-out;
  padding: 40px;
}

.cupboard {
  width: 80%;
  background: linear-gradient(#4a2c2a, #2b1817);
  border: 10px solid #2b1817;
  border-radius: 20px;
  box-shadow: 0 0 40px #00ffff33, inset 0 0 30px #000000aa;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.rack {
  background: #1d1d1d;
  border-top: 4px solid #00ffff99;
  border-bottom: 4px solid #00ffff99;
  padding: 20px 30px;
  display: flex;
  justify-content: center;
  gap: 40px;
  border-radius: 15px;
  box-shadow: inset 0 0 15px #00ffff55;
}

.project-card {
  background: linear-gradient(#111, #222);
  border: 2px solid #00ffff;
  border-radius: 12px;
  padding: 20px 40px;
  font-size: 18px;
  color: #00ffff;
  box-shadow: 0 0 15px #00ffffaa;
  transition: transform 0.3s;
  font-weight: bold;
  cursor: pointer;
}

.project-card:hover {
  transform: scale(1.08);
  box-shadow: 0 0 25px #00ffffcc;
}

/* Close button */
#close-projects {
  margin-top: 30px;
  background: none;
  border: 2px solid #00ffff;
  color: #00ffff;
  font-size: 20px;
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
}
#close-projects:hover {
  background: #00ffff22;
}

/* Glassmorphic popup for Project Detail */
.project-detail-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20000;
}

.project-detail {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #00ffffaa;
  padding: 30px;
  border-radius: 16px;
  backdrop-filter: blur(15px);
  color: #00ffff;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 0 30px #00ffff66;
  animation: pop 0.5s ease;
}

.project-detail h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.project-detail p {
  font-size: 16px;
  line-height: 1.5;
}

.project-detail button {
  margin-top: 20px;
  background: #00ffff22;
  border: 1px solid #00ffff88;
  color: #00ffff;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}

.project-detail button:hover {
  background: #00ffff44;
}

@keyframes pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;
document.head.appendChild(racksStyle);


function openSkillsNoticeBoard() {
  if (document.getElementById("skills-overlay")) return;

  overlayOpen = true;
  const overlay = document.createElement("div");
  overlay.id = "skills-overlay";

  const skills = [
    {
      name: "JavaScript",
      color: "yellow",
      desc: "Versatile scripting language for web development.",
      path: "Self-taught + Practice",
      progress: 90,
    },
    {
      name: "Three.js",
      color: "blue",
      desc: "3D rendering library for creating interactive web graphics.",
      path: "Docs + Demos + Projects",
      progress: 85,
    },
    {
      name: "HTML/CSS",
      color: "pink",
      desc: "Fundamentals of web layout and design.",
      path: "Courses + Projects",
      progress: 95,
    },
    {
      name: "React",
      color: "green",
      desc: "JavaScript library for building user interfaces.",
      path: "React Docs + YouTube",
      progress: 80,
    },
    {
      name: "Node.js",
      color: "orange",
      desc: "JavaScript runtime for server-side apps.",
      path: "Backend Practice + APIs",
      progress: 70,
    },
    {
      name: "Python",
      color: "yellow",
      desc: "General-purpose language used in automation, AI, and more.",
      path: "Courses + Scripts",
      progress: 85,
    },
    {
      name: "Firebase",
      color: "blue",
      desc: "Google's platform for backend services like auth, DB, and hosting.",
      path: "Firebase Docs + Integration",
      progress: 75,
    }
  ];

  overlay.innerHTML = `
    <div class="notice-board">
      <h2>🧠 My Skills</h2>
      <div class="skill-notes">
        ${skills.map(s =>
          `<div class="note ${s.color}" data-skill='${JSON.stringify(s)}'>
            <img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />
            ${s.name}
          </div>`
        ).join("")}
      </div>
      <button id="close-skills">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.transform = "translateY(0%)";
  }, 50);

  document.getElementById("close-skills").addEventListener("click", () => {
    overlay.style.transform = "translateY(100%)";
    setTimeout(() => {
      document.body.removeChild(overlay);
      overlayOpen = false;
      controls.enabled = true;
    }, 400);
  });

  const noticeBoardStyle = document.createElement("style");
  noticeBoardStyle.textContent = `
    #skills-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: radial-gradient(circle, #3b2716, #1c0d06);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
      z-index: 10000;
      transform: translateY(100%);
      transition: transform 0.5s ease-out;
    }

    .notice-board {
      width: 90%;
      max-width: 1200px;
      height: 80%;
      background: url('https://www.transparenttextures.com/patterns/cork-board.png');
      background-color: #deb887;
      background-size: cover;
      border: 15px solid #6b4226;
      border-radius: 30px;
      box-shadow: 0 0 100px #000000aa, inset 0 0 40px #65432188;
      padding: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;
    }

    .notice-board h2 {
      font-family: 'Patrick Hand', cursive;
      font-size: 48px;
      margin-bottom: 40px;
      color: #5b3920;
      text-shadow: 2px 2px 3px #ffffffaa;
    }

    .skill-notes {
      display: flex;
      flex-wrap: wrap;
      gap: 40px;
      justify-content: center;
    }

    .note {
      position: relative;
      min-width: 140px;
      min-height: 100px;
      padding: 25px 15px 10px 15px;
      font-size: 20px;
      font-weight: bold;
      font-family: 'Patrick Hand', cursive;
      border-radius: 15px;
      box-shadow: 5px 7px 15px rgba(0,0,0,0.5);
      border: 2px dashed #33333344;
      background-size: 200% 200%;
      background-image: url('https://www.transparenttextures.com/patterns/paper-fibers.png');
      cursor: pointer;
    }

    .note:hover {
      box-shadow: 0 0 25px #ffffffaa;
      z-index: 5;
    }

    .yellow { background-color: #fff9a6; color: #5b4b00; }
    .blue { background-color: #a6d8ff; color: #003a5b; }
    .pink { background-color: #ffc6e0; color: #5b0030; }
    .green { background-color: #b7f5c4; color: #0b5b1a; }
    .orange { background-color: #ffd9a6; color: #5b3500; }

    .pin {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 22px;
      height: 22px;
      pointer-events: none;
      filter: drop-shadow(0px 2px 2px #000);
    }

    #close-skills {
      margin-top: 30px;
      background: none;
      border: 2px solid #4b2c20;
      color: #4b2c20;
      font-size: 22px;
      padding: 10px 25px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.3s;
    }
    @media (max-width: 520px) {
      #skills-overlay { padding: 12px; }
      .notice-board { width: 94vw; height: 86vh; padding: 18px; border-width: 10px; }
      .skill-notes { gap: 16px; }
      .note { min-width: 120px; font-size: 18px; }
    }

    #close-skills:hover {
      background: #4b2c2022;
    }

    .skill-popup {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20000;
    }

    .skill-popup-content {
      background: #fff;
      color: #333;
      border-radius: 20px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 0 30px #000;
      font-family: 'Segoe UI', sans-serif;
      text-align: center;
    }

    .skill-popup-content h3 {
      margin-bottom: 10px;
      font-size: 26px;
    }

    .skill-popup-content p {
      margin: 10px 0;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background: #ddd;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress {
      height: 100%;
      background: #00c3ff;
      width: 0%;
      transition: width 0.6s ease;
    }

    .skill-popup-content button {
      margin-top: 20px;
      background: #333;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(noticeBoardStyle);

  // Add click event to each note
  document.querySelectorAll('.note').forEach(note => {
    note.addEventListener('click', () => {
      const skill = JSON.parse(note.dataset.skill);
      const popup = document.createElement("div");
      popup.className = "skill-popup";
      popup.innerHTML = `
        <div class="skill-popup-content">
          <h3>${skill.name}</h3>
          <p><strong>Description:</strong> ${skill.desc}</p>
          <p><strong>Learning Path:</strong> ${skill.path}</p>
          <div class="progress-bar"><div class="progress" style="width: ${skill.progress}%;"></div></div>
          <button class="close-skill-popup">Close</button>
        </div>
      `;
      document.body.appendChild(popup);
      popup.querySelector(".close-skill-popup").addEventListener("click", () => {
        document.body.removeChild(popup);
      });
    });
  });
}





function openSoundControlPanel() {
  if (document.getElementById("sound-control-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "sound-control-overlay";

  overlay.innerHTML = `
      <div class="sound-panel">
          <h2>Sound Control 🎵</h2>
          <input type="range" id="volume-slider" min="0" max="100" value="50" />
          <div class="volume-label">Volume: <span id="volume-value">50</span>%</div>
          <button id="mute-button">Mute</button>
          <button id="close-sound-panel">Close</button>
      </div>
  `;

  document.body.appendChild(overlay);
  overlayOpen = true;

  setTimeout(() => {
      overlay.style.transform = "translateY(0%)";
  }, 50);

  document.getElementById("close-sound-panel").addEventListener("click", () => {
      overlay.style.transform = "translateY(100%)";
      setTimeout(() => {
          document.body.removeChild(overlay);
          overlayOpen = false;
          controls.enabled = true;
      }, 400);
  });

  const volumeSlider = document.getElementById("volume-slider");
  const volumeValue = document.getElementById("volume-value");
  const muteButton = document.getElementById("mute-button");

  volumeSlider.addEventListener("input", () => {
    const volume = volumeSlider.value / 100;
    volumeValue.textContent = volumeSlider.value;
    backgroundMusic.volume = volume;
  });


  muteButton.addEventListener("click", () => {
    backgroundMusic.volume = 0;
    volumeSlider.value = 0;
    volumeValue.textContent = "0";
  });


  // Add beautiful style:
  const soundPanelStyle = document.createElement("style");
  soundPanelStyle.textContent = `
    #sound-control-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      backdrop-filter: blur(10px);
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      transform: translateY(100%);
      transition: transform 0.5s ease-out;
    }
    .sound-panel {
      background: rgba(0,0,0,0.8);
      border: 2px solid #00ffffaa;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 0 20px #00ffff88;
      text-align: center;
      color: #00ffff;
      font-family: 'Segoe UI', sans-serif;
    }
    .sound-panel h2 {
      margin-bottom: 20px;
    }
    #volume-slider {
      width: 300px;
      margin: 20px 0;
    }
    .volume-label {
      margin-bottom: 20px;
      font-size: 18px;
    }
    #mute-button, #close-sound-panel {
      background: none;
      border: 2px solid #00ffffaa;
      color: #00ffff;
      padding: 10px 20px;
      margin: 5px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.3s;
    }
    #mute-button:hover, #close-sound-panel:hover {
      background: #00ffff22;
    }
  `;
  document.head.appendChild(soundPanelStyle);
}


function openLearningShelf() {
  // Close any other overlays or popups before opening bookshelf
  [
    'skills-overlay',
    'projects-overlay',
    'sound-control-overlay',
    'intro-note-overlay',
    'shelf-overlay'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) document.body.removeChild(el);
  });
  // Remove any lingering book popups
  document.querySelectorAll('.book-popup').forEach(p => p.remove());

  // Load qualifications from JSON file
  fetch('public/data/qualifications.json')
    .then(response => response.json())
    .then(qualifications => {
      createBookshelf(qualifications);
    })
    .catch(error => {
      console.error('Error loading qualifications:', error);
      // Fallback to empty array if loading fails
      createBookshelf([]);
    });
}

function createBookshelf(qualifications) {

  const overlay = document.createElement("div");
  overlay.id = "shelf-overlay";

  overlay.innerHTML = `
    <div class="shelf-container">
      <h2>📚 My Qualifications</h2>
      <div class="bookshelf-books">
        ${qualifications.map((q, i) => `
          <div class="book-qualification" data-index="${i}" tabindex="0">
            <div class="book-spine ${q.type.toLowerCase()}"></div>
            <div class="book-front">
              <span>${q.title}</span>
              <span class="book-year">${q.year}</span>
            </div>
          </div>
        `).join("")}
      </div>
      <button id="close-shelf">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlayOpen = true;

  setTimeout(() => {
    overlay.style.transform = "translateY(0%)";
  }, 50);

  document.getElementById("close-shelf").addEventListener("click", () => {
    overlayOpen = false;
    overlay.style.transform = "translateY(100%)";
    setTimeout(() => {
      // Remove any lingering book popups when closing
      document.querySelectorAll('.book-popup').forEach(p => p.remove());
      document.body.removeChild(overlay);
    }, 400);
  });

  // Book click popup with pull-out animation
  overlay.querySelectorAll(".book-qualification").forEach(card => {
    card.addEventListener("click", () => {
      // Remove any existing book popup before opening a new one
      document.querySelectorAll('.book-popup').forEach(p => p.remove());
      card.classList.add("pull-out");
      setTimeout(() => {
        const idx = card.dataset.index;
        const q = qualifications[idx];
      const popup = document.createElement("div");
      popup.className = "book-popup";
      popup.innerHTML = `
        <div class="popup-content">
            <h3>${q.title}</h3>
            <p><strong>Institution:</strong> ${q.institution}</p>
            <p><strong>Year:</strong> ${q.year}</p>
            <p>${q.description}</p>
            <span class="badge ${q.type.toLowerCase()}">${q.type}</span>
          <button class="close-popup">Close</button>
        </div>
      `;
      document.body.appendChild(popup);
      popup.querySelector(".close-popup").addEventListener("click", () => {
        document.body.removeChild(popup);
          card.classList.remove("pull-out");
      });
      }, 250);
    });
  });

  // Inject Styles
  const shelfStyle = document.createElement("style");
  shelfStyle.textContent = `
    #shelf-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: radial-gradient(circle, #120a1e, #000);
      display: flex;
      justify-content: center;
      align-items: center;
      transform: translateY(100%);
      transition: transform 0.5s ease-out;
      z-index: 10000;
    }
    .shelf-container {
      width: 85%;
      max-width: 900px;
      background: #442c1d url('https://www.transparenttextures.com/patterns/wood-pattern.png');
      padding: 40px;
      border-radius: 25px;
      box-shadow: 0 0 80px #000000aa;
      text-align: center;
    }
    .shelf-container h2 {
      font-size: 36px;
      color: #fff;
      margin-bottom: 30px;
      font-family: 'Georgia', serif;
    }
    .bookshelf-books {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      justify-content: center;
      margin-bottom: 30px;
    }
    .book-qualification {
      width: 160px;
      height: 220px;
      perspective: 1000px;
      cursor: pointer;
      position: relative;
      transition: transform 0.4s cubic-bezier(.4,2,.6,1);
      display: flex;
      flex-direction: column;
      align-items: center;
      background: none;
    }
    .book-qualification.pull-out {
      transform: translateY(-30px) scale(1.08) rotate(-3deg);
      z-index: 2;
      box-shadow: 0 8px 32px #00ffff99;
    }
    .book-front {
      background: #a96b5c;
      border-radius: 8px;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 2px 4px 15px rgba(0,0,0,0.4);
      padding: 10px;
      position: relative;
    }
    .book-spine {
      background: #844c3b;
      width: 12px;
      height: 100%;
      position: absolute;
      left: -12px;
      top: 0;
      border-radius: 4px 0 0 4px;
    }
    .book-spine.college { background: #2e86c1; }
    .book-spine.school { background: #27ae60; }
    .book-year {
      font-size: 13px;
      color: #ffe;
      margin-top: 8px;
      font-weight: normal;
    }
    .book-popup {
      position: fixed;
      inset: 0;
      transform: translate(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 12000;
      animation: fadeIn 0.4s ease-out;
    }
    .popup-content {
      background: #fff8f0;
      padding: 30px;
      border-radius: 20px;
      width: 350px;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 8px 30px #000000aa;
      animation: popIn 0.4s ease;
    }
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .popup-content h3 {
      margin-bottom: 15px;
      color: black;
    }
    .popup-content p {
      margin-bottom: 10px;
      color: black;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      padding: 6px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: bold;
      color: #fff;
    }
    .badge.college { background: #2e86c1; }
    .badge.school { background: #27ae60; }
    .popup-content button {
      margin: 10px 0 0 0;
      padding: 8px 18px;
      border: none;
      border-radius: 8px;
      background: #a96b5c;
      color: #fff;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .popup-content button:hover {
      background: #844c3b;
    }
    #close-shelf {
      background: none;
      border: 2px solid #fff;
      color: #fff;
      padding: 10px 20px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 18px;
      transition: background 0.3s ease;
    }
    #close-shelf:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    @media (max-width: 520px) {
      #shelf-overlay { padding: 12px; }
      .shelf-container { width: 94vw; padding: 18px; border-radius: 16px; }
      .bookshelf-books { gap: 16px; }
      .book-qualification { width: 120px; height: 180px; }
      .popup-content { width: 90vw; padding: 18px; }
      #close-shelf { width: 100%; font-size: 16px; }
    }
  `;
  document.head.appendChild(shelfStyle);
}

function generateBooks(resources) {
  return resources.map(res => `
    <div class="book"
      data-title="${res.title}" 
      data-issuer="${res.issuer}" 
      data-date="${res.date}" 
      data-link="${res.link}">
      <div class="book-cover">${res.title}</div>
    </div>
  `).join('');
}

function showIntroPaperNote() {
  // Respect user preference to hide intro
  if (localStorage.getItem('hideIntroNote') === 'true') return;

  const introOverlay = document.createElement("div");
  introOverlay.id = "intro-note-overlay";

  introOverlay.innerHTML = `
    <style>
      #intro-note-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 60px;
        font-family: 'Segoe UI', sans-serif;
        animation: fadeIn 0.4s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .note-paper {
        position: relative;
        background: linear-gradient(135deg, #fdf1c0, #f9e5b5);
        border: 2px solid #d1b37f;
        border-radius: 18px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        padding: 22px 24px;
        width: min(820px, 92vw);
        color: #2c1e13;
      }

      .note-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 20px;
        margin-bottom: 10px;
      }

      .note-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 14px;
      }

      .note-section {
        background: rgba(255,255,255,0.55);
        border: 1px dashed #d1b37f;
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06) inset;
      }

      .note-section h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
      }

      .note-section ul {
        margin: 0;
        padding-left: 18px;
        font-size: 14px;
        line-height: 1.5;
      }

      .note-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-top: 14px;
      }

      .btn-primary, .btn-ghost {
        border: none;
        border-radius: 10px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 600;
      }
      .btn-primary {
        background: linear-gradient(90deg, #0078D7 60%, #00aaff 100%);
        color: #fff;
        box-shadow: 0 2px 8px #00aaff33;
      }
      .btn-ghost {
        background: #ffffffaa;
        color: #2c1e13;
        border: 1px solid #d1b37f;
      }

      .note-check {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        margin-left: auto;
      }
    </style>

    <div class="note-paper">
      <div class="note-title">🪶 Welcome! Quick Guide</div>
      <div class="note-sections">
        <div class="note-section">
          <h4>🎮 Controls</h4>
          <ul id="intro-controls">
            <li>Drag to look around the room</li>
            <li>Scroll to zoom</li>
            <li>Click highlighted objects to open overlays</li>
            <li>Press Esc to close this guide</li>
          </ul>
        </div>
        <div class="note-section">
          <h4>🏠 In the Room</h4>
          <ul>
            <li>🖥️ PC Screen: Opens a Windows-like desktop</li>
            <li>🗄️ Cupboard: Projects (cards + details)</li>
            <li>📌 Notice Board: Skills (sticky notes)</li>
            <li>📚 Bookshelf: Qualifications (books)</li>
            <li>🔊 Speaker: Sound controls</li>
            <li>💡 Lamp: Toggle ambience</li>
          </ul>
        </div>
        <div class="note-section">
          <h4>💻 Inside the Desktop</h4>
          <ul id="intro-desktop">
            <li>Windows with minimize/maximize/taskbar</li>
            <li>Double‑click title bar to maximize/restore</li>
            <li>Resize windows from the bottom‑right corner</li>
            <li>File Explorer with previews & search</li>
            <li>Shortcuts: Backspace (Up), Alt+←/→ (history), F5 (refresh)</li>
            <li>Start Menu: Esc closes, Ctrl+Esc toggles</li>
            <li>Chatbot for projects, skills, contact</li>
            <li>Instructions app available anytime</li>
          </ul>
        </div>
      </div>
      <div class="note-actions">
        <button id="intro-open-pc-btn" class="btn-primary">Open PC Desktop</button>
        <button id="intro-close-btn" class="btn-ghost">Start Exploring</button>
        <label class="note-check"><input type="checkbox" id="dont-show-intro"> Don't show again</label>
      </div>
    </div>
  `;

  document.body.appendChild(introOverlay);

  // Prevent background clicks while note is open
  overlayOpen = true;

  // Wire up buttons and checkbox
  const closeBtn = introOverlay.querySelector('#intro-close-btn');
  const openPcBtn = introOverlay.querySelector('#intro-open-pc-btn');
  const dontShow = introOverlay.querySelector('#dont-show-intro');
  const controlsList = introOverlay.querySelector('#intro-controls');
  const desktopList = introOverlay.querySelector('#intro-desktop');

  function dismissIntro() {
    const hide = dontShow && dontShow.checked;
    if (hide) localStorage.setItem('hideIntroNote', 'true');
    if (document.getElementById('intro-note-overlay')) {
      document.body.removeChild(document.getElementById('intro-note-overlay'));
    }
    overlayOpen = false;
  }

  closeBtn?.addEventListener('click', dismissIntro);
  openPcBtn?.addEventListener('click', () => {
    dismissIntro();
    showVirtualDesktop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismissIntro(); }, { once: true });

  // Subtle runtime tweaks without changing look
  try {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch && controlsList) {
      controlsList.innerHTML = `
        <li>Drag with one finger to look around</li>
        <li>Pinch with two fingers to zoom</li>
        <li>Tap highlighted objects to open overlays</li>
        <li>Tap outside to dismiss popups; Back button closes this guide</li>
      `;
    }
  } catch(_) {}
}



//Name tags
const tooltipObjects = [
  { name: "pCube81_Cama_quadro_0", label: "Notice Board" },
  { name: "pCube27_Livros_0", label: "Bookshelf" },
  { name: "pCube4_Armario1_0", label: "Cupboard" },
  { name: "pSphere21_Lixeira_Som_0", label: "Speaker" },
  { name: "pCube84_Pc_e_monitor_0", label: "PC" },
  { name: "pCube82_Assessorios_PC_0", tag: "Lamp" }
];

// Hover tag setup
const tooltip = document.createElement('div');
tooltip.id = 'hover-tooltip';
tooltip.style.position = 'absolute';
tooltip.style.padding = '6px 12px';
tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
tooltip.style.color = 'white';
tooltip.style.fontSize = '14px';
tooltip.style.borderRadius = '6px';
tooltip.style.pointerEvents = 'none';
tooltip.style.transition = 'opacity 0.2s ease';
tooltip.style.opacity = '0';
document.body.appendChild(tooltip);

// Raycaster + mouse

const objectsWithTags = [
  { name: "pCube84_Pc_e_monitor_0", tag: "PC" },
  { name: "pCube27_Livros_0", tag: "Bookshelf" },
  { name: "pCube81_Cama_quadro_0", tag: "Noticeboard" },
  { name: "pCube4_Armario1_0", tag: "Cupboard" },
  { name: "pSphere21_Lixeira_Som_0", tag: "Speaker" },
  { name: "pCube82_Assessorios_PC_0", tag: "Lamp" }
];

// Find each object by name, assign a tooltip tag
objectsWithTags.forEach(({ name, tag }) => {
  const obj = scene.getObjectByName(name);
  if (obj) {
    obj.userData.tag = tag;
    interactableObjects.push(obj);
  } else {
    console.warn(`[Tooltip] Object not found: ${name}`);
  }
});


// Mouse move listener
window.addEventListener('mousemove', (event) => {
  // Normalize mouse position to -1 to 1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactableObjects, false);

  if (intersects.length > 0) {
    const hovered = intersects[0].object;
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
    tooltip.innerText = hovered.userData.tag || hovered.name;
    tooltip.style.opacity = 1;
  } else {
    tooltip.style.opacity = 0;
  }
});


// Create tooltip div

tooltip.style.position = "absolute";
tooltip.style.padding = "6px 12px";
tooltip.style.background = "rgba(0, 0, 0, 0.8)";
tooltip.style.color = "#fff";
tooltip.style.borderRadius = "6px";
tooltip.style.pointerEvents = "none";
tooltip.style.fontFamily = "Arial";
tooltip.style.fontSize = "14px";
tooltip.style.display = "none";
tooltip.style.zIndex = "1000";
document.body.appendChild(tooltip);

// Add in render/animation loop or pointermove event
renderer.domElement.addEventListener("pointermove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    const found = tooltipObjects.find(o => obj.name === o.name);

    if (found) {
      tooltip.textContent = found.label;
      tooltip.style.left = `${event.clientX + 12}px`;
      tooltip.style.top = `${event.clientY + 12}px`;
      tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }
  } else {
    tooltip.style.display = "none";
  }
});



//lamp sound
const lampAudio = new Audio("/lamp_sound.mp3");
function playLampSound() {
  lampAudio.currentTime = 0;
  lampAudio.play();
}

//lamp dark mode
function toggleLamp() {
  isLampOn = !isLampOn;
  lampLight.visible = isLampOn;

  // Adjust ambient lighting for dark mode
  ambientLight.intensity = isLampOn ? 0.3 : 1;

  // Optional: change lamp material emissive glow
  if (lampObject.material) {
    lampObject.material.emissive = new THREE.Color(isLampOn ? 0xffd700 : 0x000000);
  }

  // Play lamp sound
  playLampSound();
}

  // other logic (scene init, render, loaders etc.)
});



