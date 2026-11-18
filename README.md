# The_Forgotten_Palace
A hands-first, controller-free VR story where natural bare-hand gestures transform a dusty, shadowy attic into a radiant sunlit golden palace.

About the Project
Most virtual reality applications rely on controllers and button mappings that create a barrier between the user and the story. The Forgotten Palace is a seated-optimized, hands-only interactive story designed to feel natural from the very first second:
Act I — The Shadowy Attic: You begin seated in front of an old wooden chest wrapped in a heavy burlap tarp while an atmospheric narrator guides your curiosity.
Bare-Hand Interaction Loop: Using natural hand tracking (no controllers required), you peel back the burlap tarp, twist open the brass latch, lift the wooden lid, cradle a glowing dreamcatcher with both hands, and gently brush its web to release a pearl scallop shell.
Act II — The Golden Palace Reveal: As the seashell drops to the floor, the gloomy attic dissolves in a burst of golden light into a grand Baroque palace rotunda featuring streaming volumetric sunbeams, procedural marble floors, glowing cyan chandeliers, and concentric golden magic rings.

Technologies Used
Framework & XR Runtime: Meta Immersive Web SDK (@iwsdk), WebXR Hand Tracking API
3D Rendering & Shaders: Three.js, WebGL, Custom GLSL Shaders, Procedural HTML5 Canvas Textures
Audio & Narration: Web Speech API (window.speechSynthesis) with synchronized subtitles
Build & Testing Tools: Vite, Node.js, Immersive Web Emulator (iwer)
Languages: JavaScript (ES6+), HTML5, CSS3

Project Structure
├── public/                 # Static assets and textures
├── src/
│   ├── atticScene.js       # Act I environment, chest, tarp, dust particles, and narration
│   ├── palaceScene.js      # Act II Baroque rotunda, sunbeams, magic rings, and props
│   ├── handInteraction.js  # Bare-hand tracking state machine and gesture triggers
│   └── main.js             # WebXR session setup, renderer, and scene lifecycle
├── index.html              # Entry HTML and HUD subtitle overlay
├── package.json            # Dependencies and scripts
└── vite.config.js          # HTTPS dev server configuration for WebXR

How to Run Locally
Prerequisites
Node.js (v18 or higher recommended)

A WebXR-compatible browser (Meta Quest Browser on headset, or Google Chrome / Edge on desktop with the Immersive Web Emulator extension)

Installation & Setup
Clone the repository:
  git clone https://github.com/<your-username>/<your-repo-name>.git
  cd <your-repo-name>
Install dependencies:
  npm install
Start the local HTTPS development server:
  npm run dev

Open in Browser / Headset:
Open https://localhost:8081/ in Chrome (accept the self-signed local certificate warning if prompted).
Click Enter VR (or use the desktop showcase controls) to begin the experience.
Controls & Interaction
In Meta Quest Headset (Hand Tracking):
Reach out and pinch/grab the tarp corner to pull it off the chest.
Pinch and twist the brass latch, then lift the chest lid.
Hold the glowing dreamcatcher with both hands and brush across the center web to drop the seashell and trigger the palace transition.

Desktop Preview Shortcuts:
Space: Start / advance automated showcase sequence
2 / B: Jump directly to the Golden Palace scene
