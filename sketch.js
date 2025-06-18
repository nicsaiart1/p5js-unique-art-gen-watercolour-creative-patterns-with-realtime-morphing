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

let currentBrushSize = 10;
const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 100;

let currentBrushFlow = 0.5; // Range 0.0 to 1.0
const MIN_BRUSH_FLOW = 0.05;
const MAX_BRUSH_FLOW = 1.0;
const FLOW_INCREMENT = 0.05;

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


// Voronoi pattern variables
let voronoiSeedPoints = [];
let numVoronoiSeeds = 20;
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


function setup() { /* ... Full setup from previous steps ... */ }
function drawProceduralTexture(pg) { /* ... */ }
function initializeRDGrids() { /* ... */ }
function rdLaplacian(grid, x, y) { /* ... */ return 0; }
function safeGridAccess(grid, y, x) { /* ... */ return 0; }
function updateReactionDiffusion() { /* ... */ }
function drawReactionDiffusionPattern() { /* ... */ }
function generateLSystemString() { /* ... */ return lsystemAxiom; }
function drawLSystem() { /* ... */ }
function drawPerlinNoisePattern() { /* ... */ }
function generateVoronoiSeeds() { /* ... */ }
function drawVoronoiPattern() { /* ... */ }
function generateDynamicPattern() { /* ... */ }
function draw() {
    background(255); // Clear the background each frame for the main canvas

    // Generate and draw the dynamic pattern on patternGraphics
    generateDynamicPattern(); // This function now handles the currentPatternType logic

    // Update and draw Perlin noise if it's the current pattern and active
    if (currentPatternType === 'perlin') {
        drawPerlinNoisePattern(); // Draws onto patternGraphics
        if (perlinPanActive) {
            perlinPanXOffset += perlinPanXSpeed;
            perlinPanYOffset += perlinPanYSpeed;
        }
    } else if (currentPatternType === 'rd') {
        updateReactionDiffusion(); // Update RD simulation state
        drawReactionDiffusionPattern(); // Draw RD pattern onto patternGraphics
    }


    // Display the pattern from patternGraphics onto the main canvas
    image(patternGraphics, 0, 0);

    // Apply the watercolor brush strokes from the watercolorBrush graphics object
    image(watercolorBrush, 0, 0);


    // Brush interaction logic
    if (mouseIsPressed && mouseButton === LEFT) {
        if (currentBrushType === 'watercolor') {
            drawWatercolorStroke(mouseX, mouseY);
        } else if (currentBrushType === 'textured') {
            drawTexturedStroke(mouseX, mouseY);
        } else if (currentBrushType === 'calligraphy') {
            drawCalligraphyStroke(mouseX, mouseY, pmouseX, pmouseY);
        }
    }

    // L-System specific drawing (if active, potentially on top or separate)
    // This might need adjustment based on how L-systems are integrated visually
    if (currentPatternType === 'lsystem' && lsystemString !== '') {
        // Assuming drawLSystem() draws directly or onto a specific layer
        // If it draws to patternGraphics, ensure it's called before image(patternGraphics,...)
        // If it's an overlay, its current placement might be fine.
        // For now, let's assume it draws where appropriate.
        // drawLSystem(); // This was called inside generateDynamicPattern, ensure it's correctly placed.
    }

    // Update morph speed if audio-reactive for Perlin noise is enabled
    if (currentPatternType === 'perlin' && audioReactivePerlinSpeed && mic && mic.getLevel) {
        let micLevel = mic.getLevel();
        morphSpeed = map(micLevel, 0, 0.1, 0.0001, baseMorphSpeed * 5); // Modest range for morphSpeed
        morphSpeed = constrain(morphSpeed, 0.0001, baseMorphSpeed * 10);
         // console.log("Audio-Reactive Morph Speed: " + morphSpeed);
    }
}
function mousePressed() { /* ... */ }

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

function drawWatercolorStroke(mx, my) {
    let col = getCurrentBrushColor();
    // Apply flow to alpha for fill
    watercolorBrush.fill(hue(col), saturation(col), brightness(col), currentBrushFlow * alpha(col));
    watercolorBrush.noStroke(); // Watercolor dabs are usually fill only
    watercolorBrush.ellipse(mx, my, currentBrushSize, currentBrushSize); // Draw an ellipse
}

function drawTexturedStroke(mx, my) {
    // Draws the pre-rendered texture from textureGraphics onto the watercolorBrush canvas,
    // scaled by currentBrushSize and tinted by currentBrushFlow.
    let displaySize = currentBrushSize * 2; // Adjust scaling factor as needed
    if (textureGraphics) { // Ensure textureGraphics is initialized
        watercolorBrush.push(); // Save current drawing style
        watercolorBrush.tint(255, currentBrushFlow * 255); // Apply flow as alpha tint
        watercolorBrush.image(textureGraphics, mx - displaySize / 2, my - displaySize / 2, displaySize, displaySize);
        watercolorBrush.pop(); // Restore drawing style (removes tint)
    }
}

function drawCalligraphyStroke(mx, my, pmx, pmy) {
    let speed = dist(mx, my, pmx, pmy);
    // Max and min stroke weights are now relative to currentBrushSize
    let maxWeight = currentBrushSize * 1.5;
    let minWeight = max(MIN_BRUSH_SIZE, currentBrushSize * 0.2); // Ensure minWeight is at least MIN_BRUSH_SIZE
    let strokeWeightValue = map(speed, 0, 20, maxWeight, minWeight);
    strokeWeightValue = constrain(strokeWeightValue, minWeight, maxWeight);
    watercolorBrush.strokeWeight(strokeWeightValue);
    let col = getCurrentBrushColor();
    // Apply flow to alpha for stroke
    watercolorBrush.stroke(hue(col), saturation(col), brightness(col), currentBrushFlow * alpha(col));
    watercolorBrush.strokeCap(ROUND);
    watercolorBrush.line(pmx, pmy, mx, my);
}

function drawSprayPaintStroke(mx, my) {
    let col = getCurrentBrushColor();
    // Apply flow to alpha of spray dots
    watercolorBrush.fill(hue(col), saturation(col), brightness(col), currentBrushFlow * 0.1 * 255);
    watercolorBrush.noStroke();

    let sprayRadius = currentBrushSize; // Use currentBrushSize
    let dotsPerFrame = 50; // Density of spray - could also scale with brush size if desired

    for (let i = 0; i < dotsPerFrame; i++) {
        let angle = random(TWO_PI);
        let radius = random(sprayRadius);
        let offsetX = cos(angle) * radius;
        let offsetY = sin(angle) * radius;
        watercolorBrush.ellipse(mx + offsetX, my + offsetY, 3, 3); // Small dot size
    }
}

function drawEraserStroke(mx, my, pmx, pmy) {
    watercolorBrush.strokeWeight(currentBrushSize); // Use currentBrushSize
    watercolorBrush.strokeCap(ROUND);

    // Use p5.js erase() mode, with erase intensity affected by flow
    watercolorBrush.erase(currentBrushFlow * 255, 255);
    watercolorBrush.line(pmx, pmy, mx, my);
    watercolorBrush.noErase();
}


// Modify keyPressed to add a toggle for audio-reactive brush color
function keyPressed() {
    // Deactivate audio-reactive brush color on major mode changes
    // Added 'l', 's', and 'e' to the list of keys that reset flags
    if (key === 'c' || key === 'C' || key === 'b' || key === 'B' || key === 'p' || key === 'P' || key === 'v' || key === 'V' || key.toLowerCase() === 'l' || key.toLowerCase() === 's' || key.toLowerCase() === 'e') {
        audioReactiveBrushColor = false;
        // Other morph deactivations from previous steps
        harmonyModeActive = false;
        lsystemAngleMorphActive = false; lsystemLengthMorphActive = false;
        perlinPanActive = false;
        voronoiMorphActive = false;
        rdFeedMorphActive = false; rdKillMorphActive = false;
        if (currentPatternType !== 'perlin' || (key === 'c' || key === 'C') || key.toLowerCase() === 'l' || key.toLowerCase() === 's' || key.toLowerCase() === 'e') { // Also reset for 'l', 's', and 'e'
             audioReactivePerlinSpeed = false;
             morphSpeed = baseMorphSpeed;
        }
    }

    if (key === 'c' || key === 'C') { /* ... clear logic ... */ }
    else if (key === 'b' || key === 'B') { /* ... brush type ... */ }
    else if (key.toLowerCase() === 'l') {
        currentBrushType = 'calligraphy';
        console.log("Brush type: Calligraphy");
        // Ensure other flags are reset, similar to other brush type switches
        audioReactivePerlinSpeed = false;
        morphSpeed = baseMorphSpeed;
        harmonyModeActive = false;
        lsystemAngleMorphActive = false;
        lsystemLengthMorphActive = false;
        perlinPanActive = false;
        voronoiMorphActive = false;
        rdFeedMorphActive = false;
        rdKillMorphActive = false;
    }
    else if (key.toLowerCase() === 's') {
        currentBrushType = 'sprayPaint';
        console.log("Brush type: Spray Paint");
        // Ensure other flags are reset
        audioReactivePerlinSpeed = false;
        morphSpeed = baseMorphSpeed;
        harmonyModeActive = false;
        lsystemAngleMorphActive = false;
        lsystemLengthMorphActive = false;
        perlinPanActive = false;
        voronoiMorphActive = false;
        rdFeedMorphActive = false;
        rdKillMorphActive = false;
    }
    else if (key.toLowerCase() === 'e') {
        currentBrushType = 'eraser';
        console.log("Brush type: Eraser");
        // Ensure other flags are reset
        audioReactivePerlinSpeed = false;
        morphSpeed = baseMorphSpeed;
        harmonyModeActive = false;
        lsystemAngleMorphActive = false;
        lsystemLengthMorphActive = false;
        perlinPanActive = false;
        voronoiMorphActive = false;
        rdFeedMorphActive = false;
        rdKillMorphActive = false;
    }
    else if (key === 'v' || key === 'V') { /* ... theme switch ... */ }
    else if (key === 'x' || key === 'X') { /* ... color switch ... */ }
    else if (key === 'h' || key === 'H') { /* ... harmony mode ... */ }
    else if (key.toLowerCase() === 'u') { // Toggle for audio-reactive brush color
        audioReactiveBrushColor = !audioReactiveBrushColor;
        console.log("Audio-Reactive Brush Color (Hue): " + (audioReactiveBrushColor ? "ON" : "OFF"));
    }
    else if (key === 'p' || key === 'P') { /* ... pattern switching ... */ }
    else if (key === '+' || key === '=' || key === ']') {
        currentBrushSize += 2;
        if (currentBrushSize > MAX_BRUSH_SIZE) {
            currentBrushSize = MAX_BRUSH_SIZE;
        }
        console.log("Brush size: " + currentBrushSize);
    }
    else if (key === '-' || key === '_' || key === '[') {
        currentBrushSize -= 2;
        if (currentBrushSize < MIN_BRUSH_SIZE) {
            currentBrushSize = MIN_BRUSH_SIZE;
        }
        console.log("Brush size: " + currentBrushSize);
    }
    else if (keyCode === 33) { // PageUp for flow increase
        currentBrushFlow += FLOW_INCREMENT;
        if (currentBrushFlow > MAX_BRUSH_FLOW) {
            currentBrushFlow = MAX_BRUSH_FLOW;
        }
        currentBrushFlow = parseFloat(currentBrushFlow.toFixed(2));
        console.log("Brush flow: " + currentBrushFlow);
    }
    else if (keyCode === 34) { // PageDown for flow decrease
        currentBrushFlow -= FLOW_INCREMENT;
        if (currentBrushFlow < MIN_BRUSH_FLOW) {
            currentBrushFlow = MIN_BRUSH_FLOW;
        }
        currentBrushFlow = parseFloat(currentBrushFlow.toFixed(2));
        console.log("Brush flow: " + currentBrushFlow);
    }

    // Pattern-specific controls
    if (currentPatternType === 'lsystem') { /* ... L-System controls ... */ }
    else if (currentPatternType === 'perlin') {
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
    else if (currentPatternType === 'voronoi') { /* ... Voronoi controls ... */ }
    else if (currentPatternType === 'rd') { /* ... RD controls ... */ }

    // ... (Simplified default prevention check)
}

function windowResized() { /* ... */ }
