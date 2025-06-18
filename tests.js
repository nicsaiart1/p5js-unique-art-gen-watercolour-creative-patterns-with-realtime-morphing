QUnit.module('Art Generator Extended Tests', function(hooks) {
  hooks.beforeEach(function() {
    // Reset core state variables from sketch.js to defaults before each test
    // This is crucial for test independence.

    // Simulate a minimal p5.js setup if needed by functions under test
    // createCanvas(100, 100); // A small canvas for p5 functions if needed
    // patternGraphics = createGraphics(100, 100); // If functions draw to it

    // Reset pattern types
    currentPatternType = 'perlin'; // Default initial pattern
    secondaryPatternType = null;
    patternBlendMode = 'BLEND';
    secondaryPatternAlpha = 128;

    // Reset Perlin parameters (if they were changed by tests)
    zOff = 0;
    perlinNoiseScale = 0.03;
    perlinNoiseIntensityMax = 0.7;
    perlinInteractionStrength = 5.0;
    perlinInteractionRadius = 150;
    perlinPanActive = false;
    perlinPanXOffset = 0;
    perlinPanYOffset = 0;


    // Reset L-System parameters
    lsystemAxiom = 'F';
    lsystemRules = { 'F': 'FF+[+F-F-F]-[-F+F+F]' };
    lsystemString = '';
    lsystemGenerations = 3;
    lsystemDrawLength = 10;
    lsystemAngle = 25;
    lsystemStartX = -1;
    lsystemStartY = -1;
    lsystemAngleMorphActive = false;
    lsystemLengthMorphActive = false;
    brushLSystems = [];
    lsBrushGenerations = 1;
    lsBrushLength = 5;
    lsBrushAngle = 22.5;

    // Reset Voronoi parameters
    voronoiSeedPoints = [];
    numVoronoiSeeds = 20;
    voronoiMorphActive = false;

    // Reset RD parameters
    rdGridA = undefined; rdNextGridA = undefined; // Grids
    rdGridB = undefined; rdNextGridB = undefined;
    rdDA = 1.0; rdDB = 0.5;
    rdFeed = 0.055;
    rdKill = 0.062;
    rdTimeStep = 1.0;
    rdGridScale = 5; // Important for RD brush test coordinate mapping
    rdUpdatesPerFrame = 1;
    rdFeedMorphActive = false;
    rdKillMorphActive = false;
    rdInteractionStrength = 0.5;
    rdInteractionRadius = 20;


    // Mock mouse state
    mouseIsPressed = false;
    mouseX = 0;
    mouseY = 0;
    mouseButton = LEFT; // Default to left button

    // Mock key state for keyPressed simulation
    key = '';
    keyCode = 0;
    // window.keyIsDown = function(k) { return false; }; // Mock keyIsDown if needed by SHIFT etc.
    // A more robust keyIsDown mock might be needed if complex key combos are tested.
    // For Shift+B, we'll set it directly.

    // It's good practice to ensure a patternGraphics exists if functions use it
    // even if we don't check rendered output.
    if (typeof createGraphics === 'function' && typeof patternGraphics === 'undefined') {
        patternGraphics = createGraphics(100, 100); // Minimal graphics buffer
    } else if (typeof patternGraphics !== 'undefined' && patternGraphics) {
        patternGraphics.clear(); // Clear it if it persists
    } else {
        // Fallback if createGraphics isn't available (e.g. pure node environment)
        // For this project, p5.js is expected.
        console.warn("patternGraphics could not be initialized for test setup.");
    }

    // Call setup from sketch.js if it initializes things not covered above
    // and is safe to call multiple times or handles its own reset.
    // For now, assuming manual reset of globals is sufficient for most logic tests.
    // setup(); // If setup() is idempotent or necessary for some state.
  });

  // Helper to simulate key presses more directly for testing keyPressed logic
  function simulateKeyPress(char, isShiftPressed = false) {
    key = char;
    keyCode = char.toUpperCase().charCodeAt(0); // Basic keyCode simulation

    // Mock keyIsDown for Shift key specifically for Shift+B test
    let originalKeyIsDown = window.keyIsDown;
    if (isShiftPressed) {
        // Ensure window.keyIsDown is a function before trying to modify it.
        // In some test environments, p5 globals might not be fully initialized.
        if (typeof window.keyIsDown !== 'function') {
            window.keyIsDown = function() { return false; }; // Stub it if not present
        }
        let oldKeyIsDown = window.keyIsDown; // Store potentially existing p5.keyIsDown
        window.keyIsDown = function(code) {
            if (code === SHIFT) return true;
            return oldKeyIsDown(code); // Delegate to original for other keys
        };
    }

    keyPressed(); // Call the global keyPressed function

    if (isShiftPressed) {
        window.keyIsDown = originalKeyIsDown; // Restore original
    }
    key = ''; // Reset key after press
    keyCode = 0;
  }

  QUnit.test("RD Parameter Controls", function(assert) {
    currentPatternType = 'rd'; // Set RD as active pattern
    initializePattern('rd', true); // Initialize RD grids and params

    let initialFeed = rdFeed;
    let initialKill = rdKill;

    // Test feed rate increase
    simulateKeyPress('F'); // 'F' increases feed
    assert.ok(rdFeed > initialFeed, "Feed rate increased: " + rdFeed.toFixed(4) + " > " + initialFeed.toFixed(4));
    let feedIncreased = rdFeed;
    simulateKeyPress('f'); // 'f' decreases feed
    assert.ok(rdFeed < feedIncreased, "Feed rate decreased: " + rdFeed.toFixed(4) + " < " + feedIncreased.toFixed(4));

    // Test kill rate increase
    simulateKeyPress('K'); // 'K' increases kill
    assert.ok(rdKill > initialKill, "Kill rate increased: " + rdKill.toFixed(4) + " > " + initialKill.toFixed(4));
    let killIncreased = rdKill;
    simulateKeyPress('k'); // 'k' decreases kill
    assert.ok(rdKill < killIncreased, "Kill rate decreased: " + rdKill.toFixed(4) + " < " + killIncreased.toFixed(4));

    // Test clamping (example for feed, assuming RD_FEED_MAX is 0.1)
    rdFeed = RD_FEED_MAX - 0.0005; // Set close to max
    simulateKeyPress('F'); // Try to increase
    simulateKeyPress('F'); // Try to increase again
    assert.propEqual(rdFeed, RD_FEED_MAX, "Feed rate clamped at RD_FEED_MAX");

    rdFeed = RD_FEED_MIN + 0.0005; // Set close to min
    simulateKeyPress('f'); // Try to decrease
    simulateKeyPress('f'); // Try to decrease again
    assert.propEqual(rdFeed, RD_FEED_MIN, "Feed rate clamped at RD_FEED_MIN");
  });

  QUnit.test("Voronoi Brush Interaction - Add Seed", function(assert) {
    currentPatternType = 'voronoi';
    initializePattern('voronoi', true); // This calls generateVoronoiSeeds

    let initialLength = voronoiSeedPoints.length;
    assert.ok(initialLength > 0, "Initial Voronoi seeds generated.");

    mouseX = 50;
    mouseY = 50;
    mouseButton = LEFT;
    mousePressed();

    assert.equal(voronoiSeedPoints.length, initialLength + 1, "Voronoi seed point added via mousePressed");
    assert.equal(voronoiSeedPoints[initialLength].x, 50, "New seed x position correct");
    assert.equal(voronoiSeedPoints[initialLength].y, 50, "New seed y position correct");
  });

  QUnit.test("L-System Brush Interaction - Add System", function(assert) {
    currentPatternType = 'lsystem';
    initializePattern('lsystem', true);

    assert.equal(brushLSystems.length, 0, "Brush L-Systems initially empty.");

    mouseX = 50;
    mouseY = 50;
    mouseButton = LEFT;
    mousePressed();

    assert.equal(brushLSystems.length, 1, "Brush L-System added via mousePressed");
    if (brushLSystems.length > 0) {
        assert.equal(brushLSystems[0].x, 50, "New L-System x position correct");
        assert.equal(brushLSystems[0].y, 50, "New L-System y position correct");
    }
  });

  QUnit.test("RD Brush Interaction - Modify Grid", function(assert) {
    currentPatternType = 'rd';
    initializePattern('rd', true);

    let gridW = Math.floor(100 / rdGridScale);
    let gridH = Math.floor(100 / rdGridScale);
    let targetGridX = Math.floor(gridW / 2);
    let targetGridY = Math.floor(gridH / 2);

    mouseX = targetGridX * rdGridScale + rdGridScale / 2;
    mouseY = targetGridY * rdGridScale + rdGridScale / 2;

    rdInteractionRadius = rdGridScale * 2; // Ensure it covers the cell center effectively
    rdInteractionStrength = 0.5;

    // Ensure target cell exists
    assert.ok(rdGridB && rdGridB[targetGridX] && typeof rdGridB[targetGridX][targetGridY] !== 'undefined',
              `Target grid cell (${targetGridX},${targetGridY}) exists.`);
    let initialValue = rdGridB[targetGridX][targetGridY];

    mouseIsPressed = true;
    mouseButton = LEFT;

    runPatternUpdates('rd');

    assert.ok(rdGridB[targetGridX][targetGridY] > initialValue,
              "RD grid B (" + rdGridB[targetGridX][targetGridY] +
              ") modified by brush, was (" + initialValue + ")");
    mouseIsPressed = false;
  });

  QUnit.test("Pattern Combination Selection", function(assert) {
    currentPatternType = 'perlin'; // Default
    secondaryPatternType = null;
    initializePattern(currentPatternType, true);

    simulateKeyPress('p'); // Cycle secondary pattern
    // Assuming 'perlin' is at index 0, 'lsystem' at 1 in availablePatterns
    let expectedSecondaryAfterP = availablePatterns[1]; // 'lsystem'
    if (currentPatternType === expectedSecondaryAfterP) { // If primary is also 'lsystem'
        assert.equal(secondaryPatternType, null, "Secondary pattern became null as it matched primary 'lsystem'.");
    } else {
        assert.equal(secondaryPatternType, expectedSecondaryAfterP, `Secondary pattern set to ${expectedSecondaryAfterP}.`);
    }

    // Test: If primary changes to match secondary, secondary becomes null
    currentPatternType = 'perlin'; // Reset for clarity
    secondaryPatternType = 'lsystem'; // Set a known secondary
    initializePattern(currentPatternType, true);
    if (secondaryPatternType) initializePattern(secondaryPatternType, false);

    let safety = 0;
    while(currentPatternType !== 'lsystem' && safety < availablePatterns.length + 2) {
        simulateKeyPress('P'); // Cycle primary pattern
        safety++;
    }
    assert.equal(currentPatternType, 'lsystem', "Primary pattern successfully cycled to L-System.");
    assert.equal(secondaryPatternType, null, "Secondary pattern auto-disabled as it matched new primary 'lsystem'.");
  });


  QUnit.test("Pattern Initialization on Switch", function(assert) {
    // Test Voronoi initialization
    currentPatternType = 'perlin';
    voronoiSeedPoints = [{x:0,y:0,color:0}]; // Non-empty to check if it's cleared

    simulateKeyPress('N');
    assert.equal(currentPatternType, 'voronoi', "Switched to Voronoi pattern type via 'N'.");
    assert.ok(voronoiSeedPoints.length > 0 && voronoiSeedPoints[0].x !== 0, "Voronoi seeds re-initialized on pattern switch via 'N'.");
    let initialSeedCount = numVoronoiSeeds; // Default number
    assert.equal(voronoiSeedPoints.length, initialSeedCount, `Voronoi seed count is ${initialSeedCount}.`);

    // Test reset of Voronoi via 'r'
    mouseX = 1; mouseY = 1; mousePressed();
    assert.equal(voronoiSeedPoints.length, initialSeedCount + 1, "Added a point to Voronoi.");
    simulateKeyPress('r');
    assert.equal(voronoiSeedPoints.length, initialSeedCount, "Voronoi reset via 'r', seed count back to initial.");

    // Test L-System initialization
    currentPatternType = 'perlin';
    brushLSystems = [{x:1,y:1}];
    lsystemString = "F";

    simulateKeyPress('M');
    assert.equal(currentPatternType, 'lsystem', "Switched to L-System pattern type via 'M'.");
    assert.equal(brushLSystems.length, 0, "L-System brushLSystems cleared on switch via 'M'.");
    assert.equal(lsystemString, "", "L-System main string cleared on switch via 'M'.");

    // Test RD initialization
    currentPatternType = 'perlin';
    rdGridA = undefined;

    // Cycle primary to RD using 'P'
    if (availablePatterns[0] === 'perlin' && availablePatterns[1] === 'lsystem' &&
        availablePatterns[2] === 'voronoi' && availablePatterns[3] === 'rd') {
        simulateKeyPress('P'); // To lsystem
        simulateKeyPress('P'); // To voronoi
        simulateKeyPress('P'); // To rd
        assert.equal(currentPatternType, 'rd', "Switched to RD pattern type via 'P' cycle.");
        assert.ok(typeof rdGridA !== 'undefined' && rdGridA.length > 0, "RD Grid A initialized on pattern switch to RD.");
        assert.ok(typeof rdGridB !== 'undefined' && rdGridB.length > 0, "RD Grid B initialized on pattern switch to RD.");
    } else {
        assert.ok(false, "Test skipped: availablePatterns order changed, RD init test needs update.")
    }
  });

  QUnit.test("Alpha and Blend Mode Controls", function(assert) {
    let initialAlpha = secondaryPatternAlpha;
    simulateKeyPress(']');
    assert.ok(secondaryPatternAlpha > initialAlpha || secondaryPatternAlpha === 255, "Secondary alpha increased or at max.");

    let alphaIncreased = secondaryPatternAlpha;
    simulateKeyPress('[');
    assert.ok(secondaryPatternAlpha < alphaIncreased || secondaryPatternAlpha === 0, "Secondary alpha decreased or at min.");

    secondaryPatternAlpha = 250;
    simulateKeyPress(']'); simulateKeyPress(']');
    assert.equal(secondaryPatternAlpha, 255, "Secondary alpha clamped at 255.");

    secondaryPatternAlpha = 10;
    simulateKeyPress('['); simulateKeyPress('[');
    assert.equal(secondaryPatternAlpha, 0, "Secondary alpha clamped at 0.");

    let initialBlendMode = patternBlendMode;
    simulateKeyPress('B', true); // Shift + B
    assert.notEqual(patternBlendMode, initialBlendMode, "Blend mode changed from: " + initialBlendMode + " to: " + patternBlendMode);

    let firstChangedBlendMode = patternBlendMode;
    for (let i = 0; i < availableBlendModes.length -1; i++) { // -1 because already changed once
        simulateKeyPress('B', true);
    }
    // After cycling through all, it should be back to the first changed one
    assert.equal(patternBlendMode, firstChangedBlendMode, "Blend modes cycled back to " + firstChangedBlendMode + " after full loop.");
  });

});
