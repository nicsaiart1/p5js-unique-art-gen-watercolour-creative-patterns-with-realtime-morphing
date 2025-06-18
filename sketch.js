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
function draw() { /* ... */ }
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
    else if (key === 'p' || key === 'P') { /* ... pattern switching ... */ }

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
