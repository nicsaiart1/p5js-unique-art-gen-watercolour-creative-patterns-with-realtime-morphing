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
