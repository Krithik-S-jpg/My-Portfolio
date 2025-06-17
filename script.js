

let lampObject = null;
let lampLight = null;
let lampOn = false;
let lampToggleSound;
let lampClicked = false;


document.addEventListener("DOMContentLoaded", () => {
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

  // other logic (scene init, render, loaders etc.)
});


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

camera.position.set(15, 10, 25); // ← zoom out by increasing Z or Y
camera.lookAt(0, 1.5, 0);

// GLTF Loader
const loader = new THREE.GLTFLoader(); // not `new GLTFLoader()`
let laptopObject = null;
let cupboardDoor = null;

loader.load("/models/room.glb", function (gltf) {
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
        ambientLight.intensity = lampClicked ? 0.1 : 1;
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


// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.maxDistance = 25; // adjust this value based on what you see in the screenshot
controls.minDistance = 5;  // optional: restrict how close users can zoom in

controls.maxPolarAngle = Math.PI / 2.1;

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
  if (document.getElementById("shelf-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "shelf-overlay";

  overlay.innerHTML = `
    <div class="shelf-container">
      <h2>📚 My Learning Shelf</h2>
      <div class="books">
        ${[
          { title: "JavaScript Basics", desc: "Learn the fundamentals of JavaScript including variables, loops, and functions.", progress: 90, link: "#" },
          { title: "React Essentials", desc: "Understand components, hooks, and the virtual DOM.", progress: 80, link: "#" },
          { title: "Three.js Journey", desc: "Create stunning 3D scenes using Three.js.", progress: 75, link: "#" },
          { title: "Firebase Intro", desc: "Master authentication and cloud data storage with Firebase.", progress: 70, link: "#" },
        ].map(book => `
          <div class="book-card" data-title="${book.title}" data-desc="${book.desc}" data-progress="${book.progress}" data-link="${book.link}">
            <div class="book-spine"></div>
            <div class="book-front">
              <span>${book.title}</span>
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
      document.body.removeChild(overlay);
    }, 400);
  });

  // Book click popup
  overlay.querySelectorAll(".book-card").forEach(card => {
    card.addEventListener("click", () => {
      const title = card.dataset.title;
      const desc = card.dataset.desc;
      const progress = card.dataset.progress;
      const link = card.dataset.link;

      const popup = document.createElement("div");
      popup.className = "book-popup";
      popup.innerHTML = `
        <div class="popup-content">
          <h3>${title}</h3>
          <p>${desc}</p>
          <div class="progress-bar">
            <div class="filled" style="width: ${progress}%"></div>
          </div>
          <button onclick="window.open('${link}', '_blank')">View Resource</button>
          <button class="close-popup">Close</button>
        </div>
      `;
      document.body.appendChild(popup);
      popup.querySelector(".close-popup").addEventListener("click", () => {
        overlayOpen = false;
        document.body.removeChild(popup);
      });
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
      max-width: 1100px;
      background: #442c1d url('https://www.transparenttextures.com/patterns/wood-pattern.png');
      padding: 40px;
      border-radius: 25px;
      box-shadow: 0 0 80px #000000aa;
      text-align: center;
    }

    .shelf-container h2 {
      font-size: 40px;
      color: #fff;
      margin-bottom: 30px;
      font-family: 'Georgia', serif;
    }

    .books {
      display: flex;
      flex-wrap: wrap;
      gap: 25px;
      justify-content: center;
      margin-bottom: 30px;
    }

    .book-card {
      width: 160px;
      height: 220px;
      perspective: 1000px;
      cursor: pointer;
      position: relative;
      transform: translateY(0);
      transition: transform 0.4s ease;
    }

    .book-card:hover {
      transform: translateY(-10px);
    }

    .book-front {
      background: #a96b5c;
      border-radius: 8px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 2px 4px 15px rgba(0,0,0,0.4);
      padding: 10px;
    }

    .book-spine {
      background: #844c3b;
      width: 10px;
      height: 100%;
      position: absolute;
      left: -10px;
      top: 0;
      border-radius: 4px 0 0 4px;
    }

    .book-popup {
      position: fixed;
      inset: 0;
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
      width: 400px;
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
    }

    .popup-content p {
      margin-bottom: 20px;
    }

    .progress-bar {
      background: #ddd;
      height: 16px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .progress-bar .filled {
      height: 100%;
      background: #4caf50;
      transition: width 0.4s ease;
    }

    .popup-content button {
      margin: 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      background: #4a2c1d;
      color: #fff;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .popup-content button:hover {
      background: #5f3b2a;
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
        padding-top: 80px;
        font-family: 'Georgia', serif;
        animation: fadeIn 0.5s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .note-paper {
        position: relative;
        background: linear-gradient(135deg, #fdf1c0, #f9e5b5);
        border: 2px solid #d1b37f;
        border-radius: 20px;
        box-shadow: 0 6px 25px rgba(0,0,0,0.3);
        padding: 30px 40px;
        max-width: 560px;
        text-align: center;
      }

      .note-paper::before {
        content: "";
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 30px;
        background: radial-gradient(ellipse at center, #fffbe2, #f2dc9e);
        border-radius: 50% 50% 0 0;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      .note-paper p {
        font-size: 18px;
        color: #443322;
        line-height: 1.6;
      }

      .note-paper p strong {
        font-weight: bold;
      }

      .note-paper .quill-icon {
        display: inline-block;
        font-size: 24px;
        margin-bottom: 8px;
      }

      .note-paper button {
        margin-top: 20px;
        padding: 10px 22px;
        font-weight: bold;
        font-size: 14px;
        border: none;
        border-radius: 12px;
        background: radial-gradient(circle, #7b3f00, #5a2d00);
        color: #fff;
        box-shadow: inset 0 0 8px #432100;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .note-paper button:hover {
        transform: scale(1.05);
        background: radial-gradient(circle, #a0522d, #7b3f00);
      }
    </style>

    <div class="note-paper">
      <div class="quill-icon">🪶</div>
      <p><strong>Most of the things are <span style="color:#c08400;">clickable</span></strong> in this room,<br>
      but <strong>first click on the <span style="color:#d58f00;">PC screen</span></strong> for the instructions.</p>
      <button onclick="document.body.removeChild(document.getElementById('intro-note-overlay'))">Got it!</button>
    </div>
  `;

  document.body.appendChild(introOverlay);
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
const interactableObjects = [];

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

