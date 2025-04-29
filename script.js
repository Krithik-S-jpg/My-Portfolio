import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faHome, faUser, faProjectDiagram, faEnvelope } from "@fortawesome/free-solid-svg-icons";

// FontAwesome setup
library.add(faHome, faUser, faProjectDiagram, faEnvelope);
dom.watch();

// Add loading screen HTML
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

camera.position.set(0, 2, 5);
camera.lookAt(0, 1.5, 0);

// GLTF Loader
const loader = new GLTFLoader();
let laptopObject = null;
let cupboardDoor = null;

loader.load("/models/room.glb", function (gltf) {
    const model = gltf.scene;
    model.scale.set(1, 1, 1);

    model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
      
          if (node.name.includes("Pc_e_monitor")) laptopObject = node;
          if (node.name === "pCube4_Armario1_0") cupboardDoor = node;
        }
    });

    scene.add(model);

    // Fade out loading screen
    const screen = document.getElementById("loading-screen");
    if (screen) {
        screen.style.opacity = "0";
        setTimeout(() => screen.style.display = "none", 500);
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

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);
controls.update();

// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let laptopOpened = false;
let overlayOpen = false; // NEW flag to know when an overlay is open

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
  if (overlayOpen) return; // ✋ Prevent clicking behind overlay
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
        console.log("You clicked on:", clickedObject.name);
    }
});

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

    const zoomTarget = new THREE.Vector3(
        laptopScreenPosition.x,
        laptopScreenPosition.y + 0.8,
        laptopScreenPosition.z + 0.5
    );

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

function showVirtualDesktop() {
    if (document.getElementById("desktop-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "desktop-overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        backdrop-filter: blur(20px);
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transform: translateY(100%);
        transition: transform 0.5s ease-out;
        z-index: 10000;
    `;

    overlay.innerHTML = `
        <div style="
            width: 90vw;
            height: 85vh;
            background: rgba(0, 0, 0, 0.92);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        ">
            <div style="width: 100%; background: rgba(255, 255, 255, 0.12); padding: 10px; display: flex; justify-content: space-between; font-weight: bold; border-radius: 10px 10px 0 0;">
                <span style="color: white;">Portfolio</span>
                <button id="close-btn" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">X</button>
            </div>
            <iframe src="about-me.html" style="flex: 1; width: 100%; border: none;"></iframe>
        </div>
    `;

    document.body.appendChild(overlay);
    overlayOpen = true;

    setTimeout(() => {
        overlay.style.transform = "translateY(0%)";
    }, 50);

    document.getElementById("close-btn").addEventListener("click", () => {
      overlayOpen = false;
        overlay.style.transform = "translateY(100%)";
        setTimeout(() => {
            document.body.removeChild(overlay);
            controls.enabled = true;
        }, 400);
    });
}


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


function showProjectsScreen() {
  if (document.getElementById("projects-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "projects-overlay";

  overlay.innerHTML = `
    <div class="cupboard">
      <div class="rack">
        <div class="project-card">Project 1</div>
        <div class="project-card">Project 2</div>
      </div>
      <div class="rack">
        <div class="project-card">Project 3</div>
        <div class="project-card">Project 4</div>
      </div>
      <div class="rack">
        <div class="project-card">Project 5</div>
      </div>
    </div>
    <button id="close-projects">Close</button>
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
      controls.enabled = true;
    }, 400);
  });

  // ✨ ADD: When project is clicked, show glass popup
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
      const popup = document.createElement("div");
      popup.className = "project-detail-overlay";

      popup.innerHTML = `
        <div class="project-detail">
          <h2>${card.innerText}</h2>
          <p>This is a detailed view of <strong>${card.innerText}</strong>. 🚀</p>
          <button onclick="alert('Opening project...')">View Demo</button><br><br>
          <button class="close-detail">Close</button>
        </div>
      `;

      document.body.appendChild(popup);

      popup.querySelector(".close-detail").addEventListener("click", () => {
        document.body.removeChild(popup);
      });
    });
  });
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

  overlay.innerHTML = `
      <div class="notice-board">
          <h2>🧠 My Skills</h2>
          <div class="skill-notes">
              <div class="note yellow"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />JavaScript</div>
              <div class="note blue"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />Three.js</div>
              <div class="note pink"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />HTML/CSS</div>
              <div class="note green"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />React</div>
              <div class="note orange"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />Node.js</div>
              <div class="note yellow"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />Python</div>
              <div class="note blue"><img src="https://cdn-icons-png.flaticon.com/512/560/560277.png" class="pin" />Firebase</div>
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
    @keyframes float {
      0% { transform: rotate(var(--rotate)) translateY(0px); }
      50% { transform: rotate(calc(var(--rotate) + 2deg)) translateY(5px); }
      100% { transform: rotate(var(--rotate)) translateY(0px); }
    }

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
      background-size: 200% 200%;
      border: 2px dashed #33333344;
      animation: float 4s ease-in-out infinite;
      --rotate: calc(-5deg + 10deg * var(--random));
      transform: rotate(var(--rotate));
      background-image: url('https://www.transparenttextures.com/patterns/paper-fibers.png');
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

    #close-skills:hover {
      background: #4b2c2022;
    }
  `;
  document.head.appendChild(noticeBoardStyle);

  // Assign random rotation values
  document.querySelectorAll('.note').forEach((note) => {
    note.style.setProperty('--random', Math.random());
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
