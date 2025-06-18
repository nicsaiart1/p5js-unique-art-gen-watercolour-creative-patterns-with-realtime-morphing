let watercolorBrush;
let patternGraphics;

let xOff = 0;
let yOff = 0;
let zOff = 0;

let morphSpeed = 0.002;

let perlinNoiseScale = 0.03;
let perlinNoiseIntensityMax = 0.7;
let perlinInteractionStrength = 5.0;
let perlinInteractionRadius = 150;
let perlinPanActive = false;
let perlinPanXOffset = 0;
let perlinPanYOffset = 0;
let perlinPanXSpeed = 0.005;
let perlinPanYSpeed = 0.005;


let currentBrushType = 'watercolor';
let textureGraphics;
let currentPatternType = 'perlin';

// L-System variables
let lsystemAxiom = 'F';
let lsystemRules = { 'F': 'FF+[+F-F-F]-[-F+F+F]' };
let lsystemString = '';
let lsystemGenerations = 3;
let lsystemDrawLength = 10;
let lsystemAngle = 25;
let lsystemStartX = -1;
let lsystemStartY = -1;
let lsystemAngleMorphActive = false;
let lsystemLengthMorphActive = false;
let lsystemAngleMorphSpeed = 0.1;
let lsystemLengthMorphSpeed = 0.05;
let lsystemAngleMorphDir = 1;
let lsystemLengthMorphDir = 1;
const LSYSTEM_ANGLE_MIN = 5;
const LSYSTEM_ANGLE_MAX = 90;
const LSYSTEM_LENGTH_MIN = 2;
const LSYSTEM_LENGTH_MAX = 50;

// L-System Brush Interaction variables
let brushLSystems = []; // Array to store temporary L-Systems
let lsBrushInteractionActive = true; // Controls if brush interaction is enabled for L-System
let lsBrushGenerations = 1;    // Generations for brush-spawned L-Systems
let lsBrushLength = 5;       // Segment length for brush-spawned L-Systems
let lsBrushAngle = 22.5;     // Angle for brush-spawned L-Systems (slightly different for variety)
let lsBrushAxiom = 'F';      // Axiom for brush L-Systems
let lsBrushRules = { 'F': 'F[+F]F[-F]F' }; // Simpler rules for brush L-Systems


// Voronoi pattern variables
let voronoiSeedPoints = [];
let numVoronoiSeeds = 20; // Initial number of seeds
let voronoiBrushInteractionActive = true; // Enable adding points with brush
let voronoiMorphActive = false;
let voronoiMorphSpeed = 0.5;


// Reaction-Diffusion (RD) variables
let rdGridA, rdNextGridA;
let rdGridB, rdNextGridB;
let rdDA = 1.0; rdDB = 0.5;
let rdFeed = 0.055;
let rdKill = 0.062;
let rdTimeStep = 1.0; rdGridScale = 5; rdUpdatesPerFrame = 1;
let rdFeedMorphActive = false;
let rdKillMorphActive = false;
let rdFeedMorphSpeed = 0.0001;
let rdKillMorphSpeed = 0.0001;
let rdFeedMorphDir = 1;
let rdKillMorphDir = 1;
const RD_FEED_MIN = 0.01;
const RD_FEED_MAX = 0.1;
const RD_KILL_MIN = 0.04;
const RD_KILL_MAX = 0.07;

// RD Brush Interaction variables
let rdInteractionStrength = 0.5; // How much the brush affects chemical B
let rdInteractionRadius = 20;   // Radius of brush effect in canvas pixels
// rdBrushInteractionActive is implicitly true when mouseIsPressed and currentPatternType === 'rd'

// Pattern Combination Variables
let secondaryPatternType = null; // e.g., 'perlin', 'lsystem', 'voronoi', 'rd', or null
let patternBlendMode = 'BLEND'; // Default p5.js blend mode
let secondaryPatternAlpha = 128; // Transparency of the secondary pattern (0-255)
const availablePatterns = ['perlin', 'lsystem', 'voronoi', 'rd', null]; // Helper for cycling
const availableBlendModes = ['BLEND', 'ADD', 'SUBTRACT', 'LIGHTEST', 'DARKEST', 'MULTIPLY', 'SCREEN'];


// Color palette variables
let themedPalettes = [];
let currentThemeIndex = 0;
let currentColorIndex = 0;

// Harmony mode variables
let harmonyColors = [];
let currentHarmonyIndex = 0;
let harmonyModeActive = false;

// Audio-reactive variables
let mic;
let audioReactivePerlinSpeed = false;
let baseMorphSpeed = 0.002;
let audioReactiveBrushColor = false;


// --- Color Harmony Calculation Functions ---
function getComplementaryColor(p5Color) { /* ... */ return color(0); }
function getAnalogousColors(p5Color) { /* ... */ return [color(0), color(0)]; }
function updateHarmonyColors() { /* ... */ }

// Helper function to get a random color from the current theme's palette
function getRandomColorFromPalette() {
  if (themedPalettes.length > 0 &&
      themedPalettes[currentThemeIndex] &&
      themedPalettes[currentThemeIndex].colors.length > 0) {
    let palette = themedPalettes[currentThemeIndex].colors;
    return palette[floor(random(palette.length))];
  }
  // Fallback to a random bright color if palettes are not set up
  return color(random(100, 255), random(100, 255), random(100, 255));
}

function setup() {
  createCanvas(800, 600); // Default size, can be adjusted
  pixelDensity(1); // For consistent pixel operations

  patternGraphics = createGraphics(width, height);
  textureGraphics = createGraphics(width, height); // Assuming this is still used

  // Initialize default pattern (Perlin)
  // currentPatternType is already 'perlin' by default
  // If Perlin needs specific initialization, it would go here. e.g. generateVoronoiSeeds(); for voronoi if it was default

  // Initialize RD grids if it were the default (it's not, perlin is)
  // if (currentPatternType === 'rd') {
  //   initializeRDGrids();
  // }

  // Setup for audio input if needed (assuming mic setup from previous steps)
  // mic = new p5.AudioIn();
  // mic.start();

  // Initialize color palettes (assuming themedPalettes setup from previous steps)
  // setupThemedPalettes(); // Placeholder for where palette setup would be

  console.log("Setup complete. Current pattern: " + currentPatternType);
  // The watercolorBrush and other brush initializations would be here from previous steps
  // watercolorBrush = new WatercolorBrush(); // Example
}

// Helper function to initialize pattern-specific states
function initializePattern(patternType, isPrimaryOrJustInitializing) {
  // For L-System, primary and secondary might share state or need distinct state.
  // For now, if initializing L-System, reset main L-System globals.
  // A more advanced setup would have separate state objects for primary/secondary instances of same pattern type.
  if (patternType === 'lsystem') {
    lsystemString = ''; // Force regeneration
    brushLSystems = []; // Clear brush strokes
    lsystemStartX = -1; lsystemStartY = -1; // Reset position
    console.log(`L-System '${patternType}' initialized.`);
  } else if (patternType === 'rd') {
    initializeRDGrids(); // Assumes initializeRDGrids sets up for a single RD instance
    console.log(`Reaction-Diffusion '${patternType}' initialized.`);
  } else if (patternType === 'voronoi') {
    generateVoronoiSeeds(); // Assumes this sets up for a single Voronoi instance
    console.log(`Voronoi '${patternType}' initialized.`);
  } else if (patternType === 'perlin') {
    // Perlin noise typically doesn't need explicit data reset like this,
    // its parameters (zOff etc.) are updated in its draw/update logic.
    console.log(`Perlin Noise '${patternType}' selected/initialized.`);
  } else if (patternType === null && !isPrimaryOrJustInitializing) {
    console.log("Secondary pattern disabled.");
  }
  // Ensure all relevant morphs are reset when a pattern changes
    lsystemAngleMorphActive = false; lsystemLengthMorphActive = false;
    perlinPanActive = false;
    voronoiMorphActive = false;
    rdFeedMorphActive = false; rdKillMorphActive = false;
    audioReactivePerlinSpeed = false; morphSpeed = baseMorphSpeed;
}

function drawProceduralTexture(pg) { /* ... */ }
function initializeRDGrids() {
  let gridWidth = floor(width / rdGridScale);
  let gridHeight = floor(height / rdGridScale);

  rdGridA = [];
  rdNextGridA = [];
  rdGridB = [];
  rdNextGridB = [];

  for (let x = 0; x < gridWidth; x++) {
    rdGridA[x] = [];
    rdNextGridA[x] = [];
    rdGridB[x] = [];
    rdNextGridB[x] = [];
    for (let y = 0; y < gridHeight; y++) {
      rdGridA[x][y] = 1.0;
      rdNextGridA[x][y] = 0.0; // Will be calculated in update
      rdGridB[x][y] = 0.0;
      rdNextGridB[x][y] = 0.0; // Will be calculated in update
    }
  }

  // Seed B in the center
  let centerX = floor(gridWidth / 2);
  let centerY = floor(gridHeight / 2);
  let seedSize = 5; // Adjust as needed

  for (let i = -floor(seedSize / 2); i <= floor(seedSize / 2); i++) {
    for (let j = -floor(seedSize / 2); j <= floor(seedSize / 2); j++) {
      let seedX = centerX + i;
      let seedY = centerY + j;
      if (seedX >= 0 && seedX < gridWidth && seedY >= 0 && seedY < gridHeight) {
        rdGridB[seedX][seedY] = 1.0;
      }
    }
  }
  console.log("RD Grids Initialized. Dimensions: " + gridWidth + "x" + gridHeight);
  console.log("Seed placed in rdGridB at center.");
}
function rdLaplacian(grid, x, y) {
  let sum = 0;
  // Center
  sum += grid[x][y] * -1.0;
  // Adjacent neighbors
  sum += safeGridAccess(grid, x - 1, y) * 0.2;
  sum += safeGridAccess(grid, x + 1, y) * 0.2;
  sum += safeGridAccess(grid, x, y - 1) * 0.2;
  sum += safeGridAccess(grid, x, y + 1) * 0.2;
  // Diagonal neighbors
  sum += safeGridAccess(grid, x - 1, y - 1) * 0.05;
  sum += safeGridAccess(grid, x + 1, y - 1) * 0.05;
  sum += safeGridAccess(grid, x - 1, y + 1) * 0.05;
  sum += safeGridAccess(grid, x + 1, y + 1) * 0.05;
  return sum;
}
function safeGridAccess(grid, x, y) { // Note: Standard practice is (grid, x, y)
  if (!grid || grid.length === 0) {
    // console.error("safeGridAccess: Grid is undefined or empty.");
    return 0; // Should not happen if grids are initialized
  }
  let gridWidth = grid.length;
  let gridHeight = grid[0].length;

  // Wrap boundaries (toroidal)
  let wrappedX = (x + gridWidth) % gridWidth;
  let wrappedY = (y + gridHeight) % gridHeight;

  return grid[wrappedX][wrappedY];
}
function updateReactionDiffusion() {
  if (!rdGridA || !rdGridB) {
    console.error("RD grids not initialized before update.");
    return;
  }

  let gridWidth = rdGridA.length;
  let gridHeight = rdGridA[0].length;

  // Calculate next state for all cells
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      let a = rdGridA[x][y];
      let b = rdGridB[x][y];

      let laplacianA = rdLaplacian(rdGridA, x, y);
      let laplacianB = rdLaplacian(rdGridB, x, y);

      let nextA = a + (rdDA * laplacianA - a * b * b + rdFeed * (1.0 - a)) * rdTimeStep;
      let nextB = b + (rdDB * laplacianB + a * b * b - (rdKill + rdFeed) * b) * rdTimeStep;

      // Constrain values to prevent instability
      nextA = constrain(nextA, 0.0, 1.0);
      nextB = constrain(nextB, 0.0, 1.0);

      if (isNaN(nextA) || isNaN(nextB)) {
        console.error(`NaN detected at grid cell (${x},${y})! nextA: ${nextA}, nextB: ${nextB}. Inputs: a=${a}, b=${b}, lapA=${laplacianA}, lapB=${laplacianB}, feed=${rdFeed}, kill=${rdKill}`);
        // Optional: reset to a safe state or stop simulation
        rdNextGridA[x][y] = 0.0;
        rdNextGridB[x][y] = 0.0;
      } else {
        rdNextGridA[x][y] = nextA;
        rdNextGridB[x][y] = nextB;
      }
    }
  }

  // Swap grids
  let tempA = rdGridA;
  rdGridA = rdNextGridA;
  rdNextGridA = tempA;

  let tempB = rdGridB;
  rdGridB = rdNextGridB;
  rdNextGridB = tempB;
}
function drawReactionDiffusionPattern() {
  if (!rdGridA || rdGridA.length === 0) {
    // console.warn("drawReactionDiffusionPattern: rdGridA not initialized or empty.");
    return;
  }
  patternGraphics.loadPixels();
  let gridWidth = rdGridA.length;
  let gridHeight = rdGridA[0].length;

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      let a = rdGridA[x][y];
      // let b = rdGridB[x][y]; // b is not used in this coloring scheme, but available

      // Simple grayscale: map 'a' to color.
      // (1-a) makes areas with high 'a' dark, and low 'a' (where 'b' might be high) light.
      let c = floor((1.0 - a) * 255);
      c = constrain(c, 0, 255);

      for (let screenXOffset = 0; screenXOffset < rdGridScale; screenXOffset++) {
        for (let screenYOffset = 0; screenYOffset < rdGridScale; screenYOffset++) {
          let canvasX = x * rdGridScale + screenXOffset;
          let canvasY = y * rdGridScale + screenYOffset;

          if (canvasX < patternGraphics.width && canvasY < patternGraphics.height) {
            let idx = (canvasX + canvasY * patternGraphics.width) * 4;
            patternGraphics.pixels[idx + 0] = c;
            patternGraphics.pixels[idx + 1] = c;
            patternGraphics.pixels[idx + 2] = c;
            patternGraphics.pixels[idx + 3] = 255;
          }
        }
      }
    }
  }
  patternGraphics.updatePixels();
}

// Creates and adds a new L-System object to the brushLSystems array based on mouse position.
function addBrushLSystem(mx, my) {
  if (!lsBrushInteractionActive) return;

  // Could add a cap to brushLSystems.length here if needed for performance
  // if (brushLSystems.length > 50) return;

  let newSystem = {
    x: mx,
    y: my,
    angle: random(TWO_PI), // Start with a random angle, or derive from mouse direction
    length: lsBrushLength,
    axiom: lsBrushAxiom,
    rules: lsBrushRules,
    generations: lsBrushGenerations,
    // life: 100 // Example if lifespan was to be added
  };
  brushLSystems.push(newSystem);
  console.log(`Added brush L-System at (${mx}, ${my}). Total: ${brushLSystems.length}`);
}

// Applies brush interaction to the RD grid B, increasing its concentration.
// Called once per draw frame if mouse is pressed during RD pattern.
function applyRDBrushInteraction() {
  if (!mouseIsPressed || !rdGridB) return; // Only apply if mouse is pressed and grid exists

  let gridWidth = rdGridB.length;
  let gridHeight = rdGridB[0].length;
  let scaledRadius = rdInteractionRadius; // Radius is in canvas pixels

  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      // Calculate the center of the grid cell in canvas coordinates
      let canvasX = x * rdGridScale + rdGridScale / 2;
      let canvasY = y * rdGridScale + rdGridScale / 2;

      if (dist(mouseX, mouseY, canvasX, canvasY) < scaledRadius) {
        rdGridB[x][y] += rdInteractionStrength;
        rdGridB[x][y] = constrain(rdGridB[x][y], 0.0, 1.0);
        // Potentially also decrease rdGridA slightly?
        // rdGridA[x][y] = constrain(rdGridA[x][y] - rdInteractionStrength * 0.5, 0.0, 1.0);
      }
    }
  }
  // console.log("RD Brush interaction applied."); // Can be noisy
}

function generateVoronoiSeeds() {
  voronoiSeedPoints = []; // Clear existing seeds
  for (let i = 0; i < numVoronoiSeeds; i++) {
    voronoiSeedPoints.push({
      x: random(patternGraphics.width),
      y: random(patternGraphics.height),
      color: getRandomColorFromPalette()
    });
  }
  console.log(`Generated ${numVoronoiSeeds} new Voronoi seeds. Total: ${voronoiSeedPoints.length}`);
  // If using p5.voronoi library, you might recompute/redraw here or ensure drawVoronoiPattern does.
}

function drawVoronoiPattern() {
  if (!patternGraphics) return; // Ensure patternGraphics is initialized

  // Clear the buffer for Voronoi.
  // A background is drawn here. If layering with other patterns is desired without clearing,
  // this background call should be conditional or moved.
  patternGraphics.background(255);

  // Check if the p5.voronoi library functions seem to exist globally
  if (typeof voronoiClearSites !== 'function' ||
      typeof voronoiSites !== 'function' || // p5.voronoi uses voronoiSites (plural) to add multiple
      typeof voronoiGetDiagram !== 'function' || // or voronoiGetEdges, voronoiGetCells
      typeof voronoiDraw !== 'function') { // This is the simplest way to draw

    // Fallback: Draw circles if Voronoi library isn't loaded/available
    patternGraphics.push(); // Isolate style changes
    patternGraphics.fill(100); // Gray color for text
    patternGraphics.noStroke();
    patternGraphics.textAlign(CENTER, CENTER);
    patternGraphics.textSize(14);
    let message = "p5.voronoi library not detected.\nDisplaying seeds as circles.";
    patternGraphics.text(message, patternGraphics.width / 2, patternGraphics.height / 2 - 20);

    for (let point of voronoiSeedPoints) {
      patternGraphics.fill(point.color || color(0)); // Use point's color or black
      patternGraphics.noStroke();
      patternGraphics.ellipse(point.x, point.y, 10, 10);
    }
    patternGraphics.pop(); // Restore previous styles
    return;
  }

  // Standard p5.voronoi library usage
  voronoiClearSites(); // Clears previous sites from the voronoi system

  // Add current seed points as Voronoi sites
  // The p5.voronoi library associates the color with the site if provided during add.
  // voronoiSites() takes an array of [x,y] or [x,y,color]
  let sitesData = voronoiSeedPoints.map(p => [p.x, p.y, p.color]);
  voronoiSites(sitesData);

  // Compute the Voronoi diagram for the current sites
  // Dimensions of the diagram usually match the canvas or graphics buffer.
  // This function might not be explicitly needed if voronoiDraw handles computation.
  // For some versions of p5.voronoi, you might use voronoiGetCells() or voronoiGetEdges()
  // after computing with something like:
  // voronoi(width, height, true); // true for Lloyd iterations
  // For now, assuming voronoiDraw is smart enough or diagram is implicitly computed.

  // Draw the computed Voronoi diagram onto patternGraphics
  // Parameters for voronoiDraw: (graphicsContext, drawCellsFilled, drawSites, drawEdges, edgeColor)
  // true, true: draw cells filled (using site color), draw sites (points)
  voronoiDraw(patternGraphics, true, true, false, color(0)); // Fill cells, show sites, don't show edges initially
}

// Generates an L-System string based on provided axiom, rules, and generations.
function generateLSystemString(axiom, rules, generations) {
  let currentString = axiom;
  for (let i = 0; i < generations; i++) {
    let nextString = '';
    for (let char of currentString) {
      nextString += rules[char] || char; // Apply rule or keep char if no rule
    }
    currentString = nextString;
  }
  return currentString;
}

// Helper function to execute the drawing of an L-System string
function executeLSystemDrawing(systemString, startX, startY, initialAngle, segmentLength, angleStep, targetGraphics) {
  targetGraphics.push();
  targetGraphics.translate(startX, startY);
  targetGraphics.rotate(initialAngle); // initialAngle should be in radians

  // Use a default color for L-Systems for now, or could use getCurrentBrushColor()
  // For simplicity, let's use a slightly transparent black for patternGraphics
  targetGraphics.stroke(0, 0, 0, 150); // Black with alpha
  targetGraphics.strokeWeight(1);


  for (let char of systemString) {
    switch (char) {
      case 'F':
        targetGraphics.line(0, 0, 0, -segmentLength);
        targetGraphics.translate(0, -segmentLength);
        break;
      case '+':
        targetGraphics.rotate(radians(angleStep));
        break;
      case '-':
        targetGraphics.rotate(-radians(angleStep));
        break;
      case '[':
        targetGraphics.push();
        break;
      case ']':
        targetGraphics.pop();
        break;
    }
  }
  targetGraphics.pop();
}

function drawLSystem() {
  // Ensure patternGraphics is the target
  // patternGraphics.background(255); // Optional: Clear for L-System if it's the only thing
                                    // Or rely on higher-level clear in main draw loop

  // 1. Draw the main L-System
  // Initialize start positions if not set (e.g., center of patternGraphics)
  if (lsystemStartX === -1 || lsystemStartY === -1) {
    lsystemStartX = patternGraphics.width / 2;
    lsystemStartY = patternGraphics.height / 2;
  }
  // Generate main L-system string if it's empty or needs update (simplistic: generate if empty)
  // A more robust system would regenerate if parameters like lsystemGenerations change.
  if (lsystemString === '') {
      lsystemString = generateLSystemString(lsystemAxiom, lsystemRules, lsystemGenerations);
      console.log("Generated main L-System string.");
  }

  // Convert main L-system's angle to radians for executeLSystemDrawing
  // Assuming lsystemAngle is in degrees. The executeLSystemDrawing expects radians for initialAngle.
  // The angleStep parameter for executeLSystemDrawing is also in degrees (radians() is applied inside).
  // For initial orientation, let's use a common default like -PI/2 (upwards) or allow lsystemAngle to define it.
  // The current lsystemAngle is likely the turtle's turning angle, not initial orientation.
  // Let's assume initial orientation is upwards (-PI/2) for main L-system for now.
  executeLSystemDrawing(lsystemString, lsystemStartX, lsystemStartY, -PI/2, lsystemDrawLength, lsystemAngle, patternGraphics);

  // 2. Draw all brush-induced L-Systems
  for (let i = 0; i < brushLSystems.length; i++) {
    let sys = brushLSystems[i];
    let brushString = generateLSystemString(sys.axiom, sys.rules, sys.generations);
    // sys.angle is already in radians (from random(TWO_PI))
    executeLSystemDrawing(brushString, sys.x, sys.y, sys.angle, sys.length, lsBrushAngle, patternGraphics);

    // Future: Implement life decay and removal here
    // sys.life--;
    // if (sys.life <= 0) {
    //   brushLSystems.splice(i, 1);
    //   i--; // Adjust index after removal
    // }
  }
}

function drawPerlinNoisePattern() {
  if (!patternGraphics) return;
  patternGraphics.loadPixels();

  // Use global zOff for animation, potentially modified by interaction
  // Pan offsets are applied in runPatternUpdates if perlinPanActive is true
  let currentGlobalZOff = zOff;

  for (let x = 0; x < patternGraphics.width; x++) {
    for (let y = 0; y < patternGraphics.height; y++) {
      // Apply pan offsets. Note: perlinPanXOffset and YOffset are fractions of width/height.
      let effectiveX = x + perlinPanXOffset * patternGraphics.width;
      let effectiveY = y + perlinPanYOffset * patternGraphics.height;

      let noiseVal;
      let zOffForPixel = currentGlobalZOff;

      // Check for mouse interaction ONLY if Perlin is the current (primary) pattern
      if (currentPatternType === 'perlin' && mouseIsPressed && dist(x, y, mouseX, mouseY) < perlinInteractionRadius) {
        let interactionEffect = map(dist(x, y, mouseX, mouseY), 0, perlinInteractionRadius, 1, 0);
        // Locally accelerate zOff for interaction effect, stronger at center
        zOffForPixel = currentGlobalZOff + perlinInteractionStrength * interactionEffect;
      }

      noiseVal = noise(effectiveX * perlinNoiseScale,
                       effectiveY * perlinNoiseScale,
                       zOffForPixel);

      let c = map(noiseVal, 0, 1, 0, 255);
      // Apply global intensity max if needed, or make it part of palette/color mapping
      c *= perlinNoiseIntensityMax;
      c = constrain(c, 0, 255);

      let index = (x + y * patternGraphics.width) * 4;
      patternGraphics.pixels[index + 0] = c;
      patternGraphics.pixels[index + 1] = c;
      patternGraphics.pixels[index + 2] = c;
      patternGraphics.pixels[index + 3] = 255; // Full alpha
    }
  }
  patternGraphics.updatePixels();
}

function generateVoronoiSeeds() { /* ... */ }
function drawVoronoiPattern() { /* ... */ }
function generateDynamicPattern() {
  // Morph RD parameters if active
  if (rdFeedMorphActive) {
    rdFeed += rdFeedMorphDir * rdFeedMorphSpeed;
    if (rdFeed > RD_FEED_MAX || rdFeed < RD_FEED_MIN) {
      rdFeedMorphDir *= -1;
      rdFeed = constrain(rdFeed, RD_FEED_MIN, RD_FEED_MAX); // Keep in bounds
    }
  }
  if (rdKillMorphActive) {
    rdKill += rdKillMorphDir * rdKillMorphSpeed;
    if (rdKill > RD_KILL_MAX || rdKill < RD_KILL_MIN) {
      rdKillMorphDir *= -1;
      rdKill = constrain(rdKill, RD_KILL_MIN, RD_KILL_MAX); // Keep in bounds
    }
  }

  if (currentPatternType === 'perlin') {
    drawPerlinNoisePattern();
  } else if (currentPatternType === 'lsystem') {
    // Assuming L-system is static once generated or has its own update logic
    // If it needs regeneration on morph, that should be handled in its own section
    drawLSystem(); // Needs to be drawn to patternGraphics
  } else if (currentPatternType === 'voronoi') {
    // Similar to L-system, Voronoi might be static or have its own update
    drawVoronoiPattern(); // Needs to be drawn to patternGraphics
  } else if (currentPatternType === 'rd') {
    if (rdGridA) { // Ensure grids are initialized
      if (mouseIsPressed && mouseButton === LEFT) { // Apply brush only on left click
        applyRDBrushInteraction();
      }
      for (let i = 0; i < rdUpdatesPerFrame; i++) {
        updateReactionDiffusion();
      }
      drawReactionDiffusionPattern();
    } else {
      // console.warn("generateDynamicPattern: RD Grids not ready for RD pattern type.");
      // Potentially draw a placeholder or initialize here if not done elsewhere
      // However, keyPressed 'p' should have initialized it.
    }
  }
  // else: other patterns or default state
}

// Helper function to call the appropriate draw function for a given pattern type
function drawPattern(patternType, targetGraphics) {
  // Assuming all draw functions are designed to draw on the passed targetGraphics
  // For this subtask, they all draw on the global patternGraphics.
  // A future refactor might pass targetGraphics to each draw...() function.
  if (patternType === 'perlin') {
    drawPerlinNoisePattern();
  } else if (patternType === 'lsystem') {
    drawLSystem();
  } else if (patternType === 'voronoi') {
    drawVoronoiPattern();
  } else if (patternType === 'rd') {
    // Ensure RD grids are ready before drawing, though initialization should handle this.
    if (rdGridA) {
      drawReactionDiffusionPattern();
    }
  }
}

// General Note on Brush Interactions:
// All brush interactions (clicking to add L-System/Voronoi points, mouse-painting for RD or Perlin)
// are designed to exclusively target the PRIMARY pattern (`currentPatternType`).
// Secondary patterns are for visual blending and do not receive direct brush inputs.

// Helper function to call appropriate update logic for a pattern type
// This is important for patterns that have ongoing state changes (morphs, physics etc.)
function runPatternUpdates(patternType) {
    if (patternType === 'perlin') {
        if (perlinPanActive) { // Panning update
            perlinPanXOffset += perlinPanXSpeed;
            perlinPanYOffset += perlinPanYSpeed;
            // Keep offsets from growing indefinitely, wrap around if desired or reset periodically
            // For now, they just accumulate.
        }
        // Global zOff animation for Perlin, runs if Perlin is primary or secondary.
        // audioReactivePerlinSpeed is handled in draw() by updating morphSpeed.
        // Here, we just apply the current morphSpeed to zOff.
        // This means if both primary and secondary are perlin, zOff effectively advances twice.
        // This is a known issue with shared global state without full instancing.
        // For this subtask, we ensure brush interaction is primary-only. Animation is shared.
        zOff += morphSpeed;

    } else if (patternType === 'lsystem') {
        // L-System morph logic (angle, length)
        if (lsystemAngleMorphActive) {
            lsystemAngle += lsystemAngleMorphDir * lsystemAngleMorphSpeed;
            if (lsystemAngle > LSYSTEM_ANGLE_MAX || lsystemAngle < LSYSTEM_ANGLE_MIN) {
                lsystemAngleMorphDir *= -1;
                lsystemAngle = constrain(lsystemAngle, LSYSTEM_ANGLE_MIN, LSYSTEM_ANGLE_MAX);
            }
            lsystemString = ''; // Force regen if angle an L-System param changes
        }
        if (lsystemLengthMorphActive) {
            lsystemDrawLength += lsystemLengthMorphDir * lsystemLengthMorphSpeed;
            if (lsystemDrawLength > LSYSTEM_LENGTH_MAX || lsystemDrawLength < LSYSTEM_LENGTH_MIN) {
                lsystemLengthMorphDir *= -1;
                lsystemDrawLength = constrain(lsystemDrawLength, LSYSTEM_LENGTH_MIN, LSYSTEM_LENGTH_MAX);
            }
            lsystemString = ''; // Force regen if length an L-System param changes
        }
    } else if (patternType === 'voronoi') {
        // Voronoi morph logic (seed points)
        if (voronoiMorphActive && voronoiSeedPoints.length > 0) {
            for (let i = 0; i < voronoiSeedPoints.length; i++) {
                voronoiSeedPoints[i].x += random(-voronoiMorphSpeed, voronoiMorphSpeed);
                voronoiSeedPoints[i].y += random(-voronoiMorphSpeed, voronoiMorphSpeed);
                voronoiSeedPoints[i].x = constrain(voronoiSeedPoints[i].x, 0, width);
                voronoiSeedPoints[i].y = constrain(voronoiSeedPoints[i].y, 0, height);
            }
        }
    } else if (patternType === 'rd') {
        // RD specific updates (feed/kill morphs, and the simulation itself)
        if (rdFeedMorphActive) {
            rdFeed += rdFeedMorphDir * rdFeedMorphSpeed;
            if (rdFeed > RD_FEED_MAX || rdFeed < RD_FEED_MIN) {
                rdFeedMorphDir *= -1;
                rdFeed = constrain(rdFeed, RD_FEED_MIN, RD_FEED_MAX);
            }
        }
        if (rdKillMorphActive) {
            rdKill += rdKillMorphDir * rdKillMorphSpeed;
            if (rdKill > RD_KILL_MAX || rdKill < RD_KILL_MIN) {
                rdKillMorphDir *= -1;
                rdKill = constrain(rdKill, RD_KILL_MIN, RD_KILL_MAX);
            }
        }
        // Simulation and brush interaction only if RD is the CURRENT (primary) active pattern
        if (currentPatternType === 'rd' && patternType === currentPatternType) {
            if (rdGridA) { // Ensure grids are initialized
                if (mouseIsPressed && mouseButton === LEFT) { // Apply brush only if RD is primary
                    applyRDBrushInteraction();
                }
                for (let i = 0; i < rdUpdatesPerFrame; i++) {
                    updateReactionDiffusion();
                }
            }
        }
    }
}


function generateDynamicPattern() {
  // Clear the main pattern buffer at the beginning of each frame.
  // TODO: Make background color a parameter or use a default from theme.
  patternGraphics.background(0); // Default to black background for patterns to draw on.

  // Run updates for primary pattern
  if (currentPatternType) {
    runPatternUpdates(currentPatternType);
  }

  // Run updates for secondary pattern if it's active AND different from primary
  // (to avoid double-processing identical pattern types if they shared global state significantly for updates)
  // The RD simulation is already guarded to run only if patternType === currentPatternType.
  // Other pattern updates (Perlin pan, L-System morphs, Voronoi morphs) affect global shared state,
  // so running them twice if primary=secondary=Perlin, for example, would double their speed.
  // This is a complex area: true independent instances would require separate state objects.
  // For now, if primary and secondary are IDENTICAL types, secondary update is skipped.
  // If they are different types, both update their respective global states.
  if (secondaryPatternType && secondaryPatternType !== currentPatternType) {
    runPatternUpdates(secondaryPatternType);
  }
  // If secondaryPatternType IS THE SAME as currentPatternType, its specific parameter morphs
  // (like rdFeedMorphActive for RD) would have already been processed by the primary call to runPatternUpdates
  // if those parameters are global. This avoids doubling morph speeds for shared params.


  // Draw primary pattern
  if (currentPatternType) {
    drawPattern(currentPatternType, patternGraphics);
  }

  // Draw secondary pattern if active
  if (secondaryPatternType) {
    patternGraphics.blendMode(patternBlendMode);
    patternGraphics.tint(255, secondaryPatternAlpha);

    drawPattern(secondaryPatternType, patternGraphics);

    patternGraphics.blendMode(BLEND); // Reset to default
    patternGraphics.noTint();
  }
}
function draw() {
  // Generate the current dynamic pattern onto patternGraphics
  generateDynamicPattern();

  // Draw the pattern from the graphics buffer to the main canvas
  image(patternGraphics, 0, 0);

  // Handle brush strokes on top
  if (mouseIsPressed && mouseButton === LEFT) {
    if (currentBrushType === 'watercolor') {
      drawWatercolorStroke(mouseX, mouseY);
    } else if (currentBrushType === 'textured') {
      drawTexturedStroke(mouseX, mouseY);
    }
    // Add other brush types if necessary
  }

  // Update morphSpeed based on audio input if audioReactivePerlinSpeed is active
  // This was likely in the original draw() or an update function called by draw()
  if (audioReactivePerlinSpeed && mic && mic.getLevel) {
    let micLevel = mic.getLevel();
    // Example: Modulate morphSpeed based on micLevel
    // Adjust sensitivity and range as needed.
    let minSpeed = 0.0005;
    let maxSpeed = 0.01;
    morphSpeed = map(micLevel, 0, 0.1, minSpeed, maxSpeed); // 0.1 is a guess for mic sensitivity
    morphSpeed = constrain(morphSpeed, minSpeed, maxSpeed);
  } else if (!audioReactivePerlinSpeed && currentPatternType === 'perlin') {
    // Reset to base if not audio reactive and perlin is active
    // This specific logic might need review based on overall app structure
    // morphSpeed = baseMorphSpeed; // This might be too simplistic, depends on when it should reset
  }
}
function mousePressed() {
  if (currentPatternType === 'lsystem' && lsBrushInteractionActive && mouseButton === LEFT) {
    addBrushLSystem(mouseX, mouseY);
  } else if (currentPatternType === 'voronoi' && voronoiBrushInteractionActive && mouseButton === LEFT) {
    let newSeed = {
      x: mouseX,
      y: mouseY,
      color: getRandomColorFromPalette()
      // Optional: add a unique ID or other properties if needed for advanced interaction
    };
    voronoiSeedPoints.push(newSeed);
    console.log(`Added Voronoi seed at (${mouseX}, ${mouseY}). Total seeds: ${voronoiSeedPoints.length}`);
    // No need to call drawVoronoiPattern() here, it's called by generateDynamicPattern()
  }
  // Potentially other mousePressed logic for other patterns or general interaction
  // For example, if other patterns had clickable seed points, etc.
  // The existing brush stroke drawing is handled in draw() via mouseIsPressed,
  // but specific one-off click actions would go here.

  // Prevent default browser action for right-click if you want to use it for something else
  // if (mouseButton === RIGHT) {
  //   return false;
  // }
}

// Modify getCurrentBrushColor for audio-reactive hue
function getCurrentBrushColor() {
    let baseColor;

    if (harmonyModeActive && harmonyColors.length > 0) {
        baseColor = harmonyColors[currentHarmonyIndex];
    } else {
        if (themedPalettes.length === 0 || themedPalettes[currentThemeIndex].colors.length === 0) {
            return color(0, 0, 0, 0.6);
        }
        baseColor = themedPalettes[currentThemeIndex].colors[currentColorIndex];
    }

    if (audioReactiveBrushColor && mic && mic.getLevel) { // Check if mic.getLevel is a function
        let micLevel = mic.getLevel();

        let h = hue(baseColor);
        let s = saturation(baseColor);
        let b = brightness(baseColor);
        let a = alpha(baseColor);

        let hueShiftRange = 180;
        let hueShift = map(micLevel, 0, 0.3, 0, hueShiftRange);
        hueShift = constrain(hueShift, 0, hueShiftRange);

        let newHue = (h + hueShift) % 360;

        // console.log(`Mic: ${micLevel.toFixed(2)}, Hue: ${h.toFixed(0)} -> ${newHue.toFixed(0)}`);
        return color(newHue, s, b, a);
    }

    return baseColor;
}

function drawWatercolorStroke(mx, my) { /* ... */ }
function drawTexturedStroke(mx, my) { /* ... */ }


// Modify keyPressed to add a toggle for audio-reactive brush color
function keyPressed() {
    // Deactivate audio-reactive brush color on major mode changes
    if (key === 'c' || key === 'C' || key === 'b' || key === 'B' || key === 'p' || key === 'P' || key === 'v' || key === 'V') {
        audioReactiveBrushColor = false;
        // Other morph deactivations from previous steps
        harmonyModeActive = false;
        lsystemAngleMorphActive = false; lsystemLengthMorphActive = false;
        perlinPanActive = false;
        voronoiMorphActive = false;
        rdFeedMorphActive = false; rdKillMorphActive = false;
        if (currentPatternType !== 'perlin' || (key === 'c' || key === 'C')) {
             audioReactivePerlinSpeed = false;
             morphSpeed = baseMorphSpeed;
        }
    }

    if (key === 'c' || key === 'C') { /* ... clear logic ... */ }
    else if (key === 'b' || key === 'B') { /* ... brush type ... */ }
    else if (key === 'v' || key === 'V') { /* ... theme switch ... */ }
    else if (key === 'x' || key === 'X') { /* ... color switch ... */ }
    else if (key === 'h' || key === 'H') { /* ... harmony mode ... */ }
    else if (key.toLowerCase() === 'u') { // Toggle for audio-reactive brush color
        audioReactiveBrushColor = !audioReactiveBrushColor;
        console.log("Audio-Reactive Brush Color (Hue): " + (audioReactiveBrushColor ? "ON" : "OFF"));
    }
    else if (key === 'P') { // Cycle Primary Pattern (Shift+P for secondary)
        let currentIndex = availablePatterns.indexOf(currentPatternType);
        currentIndex = (currentIndex + 1) % availablePatterns.length;
        currentPatternType = availablePatterns[currentIndex];

        if (currentPatternType === secondaryPatternType && currentPatternType !== null) {
            // If primary is now same as secondary, disable secondary to avoid confusion/conflict
            secondaryPatternType = null;
            console.log("Primary pattern matches secondary; disabling secondary pattern.");
        }

        initializePattern(currentPatternType, true);
        console.log(`Primary pattern: ${currentPatternType || 'None'}`);
        console.log(`Secondary pattern: ${secondaryPatternType || 'None'}`);

    } else if (key === 'p') { // 'p' (lowercase) for Secondary Pattern Cycle
        let currentIndex = availablePatterns.indexOf(secondaryPatternType);
        currentIndex = (currentIndex + 1) % availablePatterns.length;
        let newSecondaryType = availablePatterns[currentIndex];

        if (newSecondaryType === currentPatternType && newSecondaryType !== null) {
            // Skip if it matches current primary, or set to null if only one pattern is desired
            // For this cycle, let's set it to null to ensure they're different or one is off
            newSecondaryType = null;
        }
        secondaryPatternType = newSecondaryType;

        if (secondaryPatternType !== null) {
            initializePattern(secondaryPatternType, false);
        } else {
             console.log("Secondary pattern disabled.");
        }
        console.log(`Primary pattern: ${currentPatternType || 'None'}`);
        console.log(`Secondary pattern: ${secondaryPatternType || 'None'}`);

    } else if (key === '[') {
        secondaryPatternAlpha -= 15;
        if (secondaryPatternAlpha < 0) secondaryPatternAlpha = 0;
        console.log(`Secondary Alpha: ${secondaryPatternAlpha}, Blend Mode: ${patternBlendMode}`);
    } else if (key === ']') {
        secondaryPatternAlpha += 15;
        if (secondaryPatternAlpha > 255) secondaryPatternAlpha = 255;
        console.log(`Secondary Alpha: ${secondaryPatternAlpha}, Blend Mode: ${patternBlendMode}`);
    } else if (key.toUpperCase() === 'B' && keyIsDown(SHIFT)) { // Shift + B for Blend Mode
        let currentIndex = availableBlendModes.indexOf(patternBlendMode);
        currentIndex = (currentIndex + 1) % availableBlendModes.length;
        patternBlendMode = availableBlendModes[currentIndex];
        console.log(`Secondary Alpha: ${secondaryPatternAlpha}, Blend Mode: ${patternBlendMode}`);
    }
     else if (key === 'M' || key === 'm') { // Switch to L-System Mode (Legacy, keep for now or phase out)
        currentPatternType = 'lsystem';
        secondaryPatternType = null; // Ensure no secondary when using direct switch
        initializePattern('lsystem', true);
        console.log("Pattern switched to: L-System (Primary). Secondary disabled.");
    } else if (key === 'N' || key === 'n') { // Switch to Voronoi Mode (Legacy)
        currentPatternType = 'voronoi';
        secondaryPatternType = null;
        initializePattern('voronoi', true);
        console.log("Pattern switched to: Voronoi (Primary). Secondary disabled.");
    }
    // Note: The direct key for RD ('p' previously) is now secondary pattern cycle.
    // Users should use 'P' to cycle primary to RD.

    // Pattern-specific controls
    if (currentPatternType === 'lsystem') {
        // Existing L-System controls (angle, length morphs, etc.) would be here
        // For example:
        // if (key === 'A') { lsystemAngleMorphActive = !lsystemAngleMorphActive; ... }
        // if (key === 'L') { lsystemLengthMorphActive = !lsystemLengthMorphActive; ... }

        if (key === 'G') { // Increase brush L-System generations
            lsBrushGenerations++;
            if (lsBrushGenerations > 3) lsBrushGenerations = 3; // Cap for performance
            console.log(`Brush L-System Generations: ${lsBrushGenerations}`);
        } else if (key === 'g') { // Decrease brush L-System generations
            lsBrushGenerations--;
            if (lsBrushGenerations < 1) lsBrushGenerations = 1;
            console.log(`Brush L-System Generations: ${lsBrushGenerations}`);
        } else if (key === 'L') { // Increase brush L-System length (using different keys than main L-System length)
            lsBrushLength += 2;
            if (lsBrushLength > 30) lsBrushLength = 30; // Cap for brush systems
            console.log(`Brush L-System Length: ${lsBrushLength}`);
        } else if (key === 'l') { // Decrease brush L-System length
            lsBrushLength -= 2;
            if (lsBrushLength < 2) lsBrushLength = 2;
            console.log(`Brush L-System Length: ${lsBrushLength}`);
        } else if (key.toLowerCase() === 'r') { // Reset L-System pattern (clear brush, regen main)
            lsystemString = '';
            brushLSystems = [];
            lsystemStartX = -1; lsystemStartY = -1;
            console.log("L-System pattern reset. Main L-System will regenerate, brush L-Systems cleared.");
        }


    } else if (currentPatternType === 'perlin') {
        if (key.toLowerCase() === 'i') {
            audioReactivePerlinSpeed = !audioReactivePerlinSpeed;
            console.log("Audio-Reactive Perlin Morph Speed: " + (audioReactivePerlinSpeed ? "ON" : "OFF"));
            if (!audioReactivePerlinSpeed) {
                morphSpeed = baseMorphSpeed;
            }
        }
        else if (key === '1' && !audioReactivePerlinSpeed) { /* ... baseMorphSpeed ... */ }
        else if (key === '2' && !audioReactivePerlinSpeed) { /* ... baseMorphSpeed ... */ }
        // ... (other Perlin controls)
    }
    else if (currentPatternType === 'voronoi') {
        if (key.toLowerCase() === 'r') { // Reset Voronoi pattern
            generateVoronoiSeeds();
            console.log("Voronoi pattern reset. New seeds generated.");
        }
        // Add other Voronoi specific controls here if needed in future
        // e.g., toggling voronoiMorphActive, changing numVoronoiSeeds before reset etc.
    }
    else if (currentPatternType === 'rd') {
        if (key === 'F') { // Increase Feed
            rdFeed += 0.001;
            if (rdFeed > RD_FEED_MAX) rdFeed = RD_FEED_MAX;
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
        } else if (key === 'f') { // Decrease Feed
            rdFeed -= 0.001;
            if (rdFeed < RD_FEED_MIN) rdFeed = RD_FEED_MIN;
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
        } else if (key === 'T') { // Toggle Feed Morph
            rdFeedMorphActive = !rdFeedMorphActive;
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
        } else if (key === 'K') { // Increase Kill
            rdKill += 0.001;
            if (rdKill > RD_KILL_MAX) rdKill = RD_KILL_MAX;
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
        } else if (key === 'k') { // Decrease Kill
            rdKill -= 0.001;
            if (rdKill < RD_KILL_MIN) rdKill = RD_KILL_MIN;
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
        } else if (key === 'Y') { // Toggle Kill Morph
            rdKillMorphActive = !rdKillMorphActive;
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
        } else if (key === 'R') { // Reset RD
            initializeRDGrids();
            // Reset interaction params too on full RD reset
            rdInteractionStrength = 0.5;
            rdInteractionRadius = 20;
            console.log("RD pattern reset. Feed, Kill, and Interaction parameters restored to default.");
            console.log(`RD Feed: ${rdFeed.toFixed(4)}, Kill: ${rdKill.toFixed(4)}, FeedMorph: ${rdFeedMorphActive}, KillMorph: ${rdKillMorphActive}`);
            console.log(`RD Brush Strength: ${rdInteractionStrength.toFixed(2)}, Radius: ${rdInteractionRadius}`);
        } else if (key === 'S') { // Increase Brush Strength
            rdInteractionStrength += 0.05;
            if (rdInteractionStrength > 1.0) rdInteractionStrength = 1.0;
            console.log(`RD Brush Strength: ${rdInteractionStrength.toFixed(2)}, Radius: ${rdInteractionRadius}`);
        } else if (key === 's') { // Decrease Brush Strength
            rdInteractionStrength -= 0.05;
            if (rdInteractionStrength < 0.05) rdInteractionStrength = 0.05;
            console.log(`RD Brush Strength: ${rdInteractionStrength.toFixed(2)}, Radius: ${rdInteractionRadius}`);
        } else if (key === 'D') { // Increase Brush Radius
            rdInteractionRadius += 5;
            if (rdInteractionRadius > 100) rdInteractionRadius = 100;
            console.log(`RD Brush Strength: ${rdInteractionStrength.toFixed(2)}, Radius: ${rdInteractionRadius}`);
        } else if (key === 'd') { // Decrease Brush Radius
            rdInteractionRadius -= 5;
            if (rdInteractionRadius < 5) rdInteractionRadius = 5;
            console.log(`RD Brush Strength: ${rdInteractionStrength.toFixed(2)}, Radius: ${rdInteractionRadius}`);
        }
    }

    // ... (Simplified default prevention check)
}

function windowResized() { /* ... */ }
