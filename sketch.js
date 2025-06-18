let watercolorBrush;
let patternGraphics;

let xOff = 0;
let yOff = 0;
let zOff = 0; // For time-based evolution of noise

// Control the speed of morphing
let morphSpeed = 0.002; // Slow and gentle morphing

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255); // White background for the main canvas

    watercolorBrush = createGraphics(width, height);
    watercolorBrush.noStroke();
    // Ensure watercolorBrush starts transparent if strokes are added before background elements
    watercolorBrush.background(0,0,0,0);


    patternGraphics = createGraphics(width, height);
    patternGraphics.noStroke();
    // Initialize with a transparent background for the pattern layer
    patternGraphics.background(0,0,0,0);

    generatePattern(); // Initial pattern generation
}

function draw() {
    // Evolve the noise field for the pattern
    zOff += morphSpeed;

    // Regenerate the pattern with the new noise offset
    // This will be done every frame for continuous morphing
    generatePattern();

    // Simulate watercolor bleeding by drawing semi-transparent circles
    if (mouseIsPressed) {
        let brushSize = random(30, 60); // Slightly larger brush for better effect
        let r = random(50, 150);  // Adjusted color palette for more watercolor-like feel
        let g = random(100, 180);
        let b = random(150, 255);
        let alpha = random(3, 10); // Reduced alpha for softer strokes

        for (let i = 0; i < 25; i++) { // Reduced iterations, more impact from alpha
            let offsetX = random(-brushSize, brushSize) * 0.7; // Wider, softer spread
            let offsetY = random(-brushSize, brushSize) * 0.7;
            let currentSize = random(brushSize * 0.7, brushSize * 1.3);
            watercolorBrush.fill(r, g, b, alpha);
            watercolorBrush.ellipse(mouseX + offsetX, mouseY + offsetY, currentSize, currentSize);
        }
    }

    // Clear main canvas to white before drawing layers
    background(255);

    // Display the morphed pattern first
    image(patternGraphics, 0, 0);
    // Then overlay the watercolor brush strokes
    image(watercolorBrush, 0, 0);
}

function generatePattern() {
    // Clear previous pattern from the buffer by making it transparent
    patternGraphics.clear();
    // patternGraphics.background(255, 0); // Optional: Ensure transparent background if clear() isn't enough

    let noiseMax = 0.7; // Controls the intensity/visibility of the pattern
    let baseRadius = 10; // Base size of pattern elements
    let spacing = 10;    // Spacing between pattern elements

    // Iterate with yOff for rows, xOff for columns
    // We need to reset yOff for each call to generatePattern to ensure
    // the pattern is drawn consistently based on the current zOff
    let currentYOff = 0;
    for (let y = 0; y < height; y += spacing) {
        let currentXOff = 0; // Reset xOff for each row
        for (let x = 0; x < width; x += spacing) {
            // Use zOff in noise calculation for time-based evolution
            let n = noise(currentXOff, currentYOff, zOff);

            if (n > 0.45) { // Adjusted threshold for visibility
                let alpha = map(n, 0.45, noiseMax, 10, 60); // More visible alpha
                // Color determined by noise, also evolving with zOff
                let r = map(noise(currentXOff + 10, currentYOff + 10, zOff), 0, 1, 150, 220); // Warmer reds
                let g = map(noise(currentXOff + 20, currentYOff + 20, zOff), 0, 1, 180, 230); // Greener greens
                let b = map(noise(currentXOff + 30, currentYOff + 30, zOff), 0, 1, 200, 255); // Bluer blues

                patternGraphics.fill(r, g, b, alpha);

                let sizeVariance = map(noise(currentXOff + 40, currentYOff + 40, zOff), 0, 1, -baseRadius/2, baseRadius/2);
                patternGraphics.ellipse(x, y, baseRadius + sizeVariance, baseRadius + sizeVariance);
            }
            currentXOff += 0.03; // Increment for noise field
        }
        currentYOff += 0.03; // Increment for noise field
    }
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Recreate and setup watercolorBrush
    watercolorBrush = createGraphics(width, height);
    watercolorBrush.noStroke();
    watercolorBrush.background(0,0,0,0);


    // Recreate and setup patternGraphics
    patternGraphics = createGraphics(width, height);
    patternGraphics.noStroke();
    patternGraphics.background(0,0,0,0);

    // No need to call generatePattern() here as it's called in draw()
}

function keyPressed() {
    if (key === 'c' || key === 'C') {
        // Clear the watercolor brush strokes
        watercolorBrush.clear();
        // watercolorBrush.background(0,0,0,0); // ensure it's transparent

        // The main canvas background is set in draw(),
        // and patternGraphics is regenerated in draw(),
        // so no explicit background clear or pattern regeneration needed here.
        // If you want an immediate visual clear of pattern, you could call generatePattern()
        // but it will naturally refresh in the next draw() call.
        // For an immediate reset of the pattern's morphing state:
        zOff = 0;
    }
}
