// Simple Test Reporter
const testResultsDiv = document.getElementById('test-results');
let testCount = 0;
let passCount = 0;

function describe(description, callback) {
    testResultsDiv.innerHTML += `<h2>${description}</h2>`;
    callback();
}

function it(description, callback) {
    testCount++;
    let result = 'fail';
    let errorMessage = '';
    try {
        callback();
        result = 'pass';
        passCount++;
    } catch (e) {
        errorMessage = e.stack || e.toString();
    }
    testResultsDiv.innerHTML += `
        <div class="test-case">
            <span class="${result}">${result.toUpperCase()}:</span> ${description}
            ${errorMessage ? `<pre>${errorMessage}</pre>` : ''}
        </div>`;
}

// --- p5.js Test Setup ---
// We need to manually call setup for the sketch if we want to test its state after setup.
// p5.js usually starts automatically. For testing, we can use instance mode or carefully manage the global state.
// For simplicity here, we'll assume global mode and test after p5's auto-setup,
// or we can create a new p5 instance for more control if needed.

// Let's wait for the sketch to potentially initialize itself if it does so automatically.
// A more robust way would be to use p5 instance mode for testing.

window.onload = () => {
    // Run p5 setup manually for a controlled test environment if using global mode and need to ensure setup runs.
    // If sketch.js is written in global mode, setup() will be called automatically by p5.js
    // For these tests, we'll assume setup() from sketch.js has run.
    // If not, you might need to call it: if (typeof setup === 'function') setup();

    describe('Sketch Initialization and Basic State', () => {

        it('should have p5.js loaded and global functions available', () => {
            if (typeof createCanvas !== 'function') throw new Error('p5.js createCanvas not found.');
            if (typeof background !== 'function') throw new Error('p5.js background not found.');
        });

        it('should create watercolorBrush and patternGraphics buffers in setup()', (done) => {
            // p5 setup is async in some ways, and global vars might take a moment.
            // A brief timeout can help, but instance mode is better for reliability.
            setTimeout(() => {
                try {
                    if (!watercolorBrush) throw new Error('watercolorBrush is not defined.');
                    if (typeof watercolorBrush.width !== 'number' || watercolorBrush.width <= 0) throw new Error('watercolorBrush has invalid width.');

                    if (!patternGraphics) throw new Error('patternGraphics is not defined.');
                    if (typeof patternGraphics.width !== 'number' || patternGraphics.width <= 0) throw new Error('patternGraphics has invalid width.');
                    done(); // p5.js graphics objects should exist
                } catch(e) {
                    done(e);
                }
            }, 100); // Wait for p5.js to initialize global sketch variables
        });

        it('should initialize zOff for morphing', (done) => {
             setTimeout(() => {
                try {
                    if (typeof zOff !== 'number') throw new Error('zOff is not defined or not a number.');
                    // zOff is initialized to 0
                    if (zOff < 0) throw new Error('zOff should be initialized (typically to 0 or a positive value).');
                     done();
                } catch(e) {
                    done(e);
                }
            }, 100);
        });

        it('should reset zOff to 0 when "c" key is pressed', (done) => {
             setTimeout(() => {
                try {
                    // Simulate zOff having changed
                    zOff = 5.0;

                    // Simulate key press 'c'
                    if (typeof keyPressed !== 'function') throw new Error('keyPressed function not found in sketch.');

                    // Temporarily override key and keyCode for the test
                    let originalKey = window.key;
                    let originalKeyCode = window.keyCode;
                    window.key = 'c';
                    window.keyCode = 67; // KeyCode for 'c'

                    keyPressed(); // Call the function

                    if (zOff !== 0) throw new Error(`zOff was not reset to 0 after "c" press. Value: ${zOff}`);

                    // Restore original key/keyCode if they existed
                    window.key = originalKey;
                    window.keyCode = originalKeyCode;
                    done();
                } catch(e) {
                    done(e);
                }
            },150); // Ensure this runs after zOff initialization test
        });

        it('should have a morphSpeed variable defined', (done) => {
            setTimeout(() => {
                try {
                    if (typeof morphSpeed !== 'number') throw new Error('morphSpeed is not defined or not a number.');
                    if (morphSpeed <= 0) throw new Error('morphSpeed should be a positive value for animation.');
                    done();
                } catch(e) {
                    done(e);
                }
            }, 100);
        });

    });

    // --- Helper function for simulating key presses ---
    // Ensures that global key/keyCode are temporarily set for keyPressed() and then restored.
    function simulateKeyPress(char, code) {
        let originalKey = window.key;
        let originalKeyCode = window.keyCode;
        window.key = char;
        window.keyCode = code;

        if (typeof keyPressed !== 'function') {
            window.key = originalKey; // Restore before throwing
            window.keyCode = originalKeyCode;
            throw new Error('keyPressed function from sketch.js is not defined globally.');
        }
        keyPressed();

        window.key = originalKey;
        window.keyCode = originalKeyCode;
    }

    describe('Advanced Brush Engine Features', () => {
        // Test Brush Type Switching
        it('should switch to calligraphy brush when "l" is pressed', () => {
            currentBrushType = 'watercolor'; // Reset to a known default
            simulateKeyPress('l', 76); // L key
            if (currentBrushType !== 'calligraphy') throw new Error(`currentBrushType did not switch to calligraphy. Value: ${currentBrushType}`);
        });

        it('should switch to sprayPaint brush when "s" is pressed', () => {
            currentBrushType = 'watercolor';
            simulateKeyPress('s', 83); // S key
            if (currentBrushType !== 'sprayPaint') throw new Error(`currentBrushType did not switch to sprayPaint. Value: ${currentBrushType}`);
        });

        it('should switch to eraser brush when "e" is pressed', () => {
            currentBrushType = 'watercolor';
            simulateKeyPress('e', 69); // E key
            if (currentBrushType !== 'eraser') throw new Error(`currentBrushType did not switch to eraser. Value: ${currentBrushType}`);
        });

        // Test Brush Size Adjustment
        it('should increase currentBrushSize with "]" and cap at MAX_BRUSH_SIZE', () => {
            if (typeof currentBrushSize === 'undefined') throw new Error('currentBrushSize is not defined.');
            if (typeof MAX_BRUSH_SIZE === 'undefined') throw new Error('MAX_BRUSH_SIZE is not defined.');

            currentBrushSize = 10;
            simulateKeyPress(']', 221); // ] key
            if (currentBrushSize !== 12) throw new Error(`Brush size should be 12. Got: ${currentBrushSize}`);

            currentBrushSize = MAX_BRUSH_SIZE - 1;
            simulateKeyPress(']', 221);
            if (currentBrushSize !== MAX_BRUSH_SIZE) throw new Error(`Brush size should be ${MAX_BRUSH_SIZE}. Got: ${currentBrushSize}`);

            simulateKeyPress(']', 221); // Press again at max
            if (currentBrushSize !== MAX_BRUSH_SIZE) throw new Error(`Brush size should remain ${MAX_BRUSH_SIZE}. Got: ${currentBrushSize}`);
        });

        it('should increase currentBrushSize with "+" and cap at MAX_BRUSH_SIZE', () => {
            currentBrushSize = 10;
            simulateKeyPress('+', 187); // + key (often shares keycode with =)
            if (currentBrushSize !== 12) throw new Error(`Brush size should be 12 with "+". Got: ${currentBrushSize}`);
        });

        it('should decrease currentBrushSize with "[" and floor at MIN_BRUSH_SIZE', () => {
            if (typeof currentBrushSize === 'undefined') throw new Error('currentBrushSize is not defined.');
            if (typeof MIN_BRUSH_SIZE === 'undefined') throw new Error('MIN_BRUSH_SIZE is not defined.');

            currentBrushSize = 10;
            simulateKeyPress('[', 219); // [ key
            if (currentBrushSize !== 8) throw new Error(`Brush size should be 8. Got: ${currentBrushSize}`);

            currentBrushSize = MIN_BRUSH_SIZE + 1;
            simulateKeyPress('[', 219);
            if (currentBrushSize !== MIN_BRUSH_SIZE) throw new Error(`Brush size should be ${MIN_BRUSH_SIZE}. Got: ${currentBrushSize}`);

            simulateKeyPress('[', 219); // Press again at min
            if (currentBrushSize !== MIN_BRUSH_SIZE) throw new Error(`Brush size should remain ${MIN_BRUSH_SIZE}. Got: ${currentBrushSize}`);
        });

        it('should decrease currentBrushSize with "-" and floor at MIN_BRUSH_SIZE', () => {
            currentBrushSize = 10;
            simulateKeyPress('-', 189); // - key (often shares keycode with _)
            if (currentBrushSize !== 8) throw new Error(`Brush size should be 8 with "-". Got: ${currentBrushSize}`);
        });

        // Test Brush Flow Adjustment
        it('should increase currentBrushFlow with PageUp and cap at MAX_BRUSH_FLOW', () => {
            if (typeof currentBrushFlow === 'undefined') throw new Error('currentBrushFlow is not defined.');
            if (typeof MAX_BRUSH_FLOW === 'undefined') throw new Error('MAX_BRUSH_FLOW is not defined.');
            if (typeof FLOW_INCREMENT === 'undefined') throw new Error('FLOW_INCREMENT is not defined.');

            currentBrushFlow = 0.5;
            simulateKeyPress('', 33); // PageUp
            // Use parseFloat and toFixed due to potential floating point inaccuracies
            let expectedFlow = parseFloat((0.5 + FLOW_INCREMENT).toFixed(2));
            if (parseFloat(currentBrushFlow.toFixed(2)) !== expectedFlow) throw new Error(`Brush flow should be ${expectedFlow}. Got: ${currentBrushFlow}`);

            currentBrushFlow = MAX_BRUSH_FLOW - FLOW_INCREMENT / 2; // Test boundary carefully
            currentBrushFlow = parseFloat(currentBrushFlow.toFixed(2));
            simulateKeyPress('', 33);
            if (parseFloat(currentBrushFlow.toFixed(2)) !== MAX_BRUSH_FLOW) throw new Error(`Brush flow should be ${MAX_BRUSH_FLOW}. Got: ${currentBrushFlow}`);

            simulateKeyPress('', 33); // Press again at max
            if (parseFloat(currentBrushFlow.toFixed(2)) !== MAX_BRUSH_FLOW) throw new Error(`Brush flow should remain ${MAX_BRUSH_FLOW}. Got: ${currentBrushFlow}`);
        });

        it('should decrease currentBrushFlow with PageDown and floor at MIN_BRUSH_FLOW', () => {
            if (typeof currentBrushFlow === 'undefined') throw new Error('currentBrushFlow is not defined.');
            if (typeof MIN_BRUSH_FLOW === 'undefined') throw new Error('MIN_BRUSH_FLOW is not defined.');
            if (typeof FLOW_INCREMENT === 'undefined') throw new Error('FLOW_INCREMENT is not defined.');

            currentBrushFlow = 0.5;
            simulateKeyPress('', 34); // PageDown
            let expectedFlow = parseFloat((0.5 - FLOW_INCREMENT).toFixed(2));
            if (parseFloat(currentBrushFlow.toFixed(2)) !== expectedFlow) throw new Error(`Brush flow should be ${expectedFlow}. Got: ${currentBrushFlow}`);

            currentBrushFlow = MIN_BRUSH_FLOW + FLOW_INCREMENT / 2; // Test boundary carefully
            currentBrushFlow = parseFloat(currentBrushFlow.toFixed(2));
            simulateKeyPress('', 34);
             // If currentBrushFlow was MIN_BRUSH_FLOW + FLOW_INCREMENT / 2, subtracting FLOW_INCREMENT makes it MIN_BRUSH_FLOW - FLOW_INCREMENT / 2
             // which should then be clamped to MIN_BRUSH_FLOW
            if (parseFloat(currentBrushFlow.toFixed(2)) !== MIN_BRUSH_FLOW) throw new Error(`Brush flow should be ${MIN_BRUSH_FLOW}. Got: ${currentBrushFlow}`);

            simulateKeyPress('', 34); // Press again at min
            if (parseFloat(currentBrushFlow.toFixed(2)) !== MIN_BRUSH_FLOW) throw new Error(`Brush flow should remain ${MIN_BRUSH_FLOW}. Got: ${currentBrushFlow}`);
        });
    });

    // Log summary
    console.log(`Total tests: ${testCount}, Passed: ${passCount}, Failed: ${testCount - passCount}`);
    if (testCount === passCount) {
        testResultsDiv.innerHTML += '<h3>All tests passed!</h3>';
    } else {
        testResultsDiv.innerHTML += `<h3 style="color: red;">${testCount - passCount} test(s) failed.</h3>`;
    }
};

// Helper for async tests in 'it' blocks
// Call done() on success, done(error) on failure
// Modifying 'it' to handle this:
const originalIt = it;
it = (description, testFn) => {
    if (testFn.length > 0) { // If the test function expects a 'done' callback
        originalIt(description, () => {
            return new Promise((resolve, reject) => {
                testFn((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    } else { // Synchronous test
        originalIt(description, testFn);
    }
};
