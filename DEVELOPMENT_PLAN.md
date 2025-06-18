# p5.js Unique Art Generator - Multi-Stream Development Plan

## Overarching Goal
Evolve the p5.js Unique Art Generator into a more feature-rich, customizable, and performant application.

## Asynchronous Development Streams / Branches

This plan outlines several parallel development streams (branches) to significantly expand the features and capabilities of the p5.js art generator over time. Each stream represents a distinct area of enhancement that can be worked on independently.

---

### 1. Stream: Advanced Brush Engine
*   **Branch:** `feature/advanced-brushes`
*   **Goal:** Offer a wider variety of brushes and more nuanced control over painting.
*   **Tasks:**
    *   Implement different brush types (e.g., textured brushes, calligraphy brushes, spray paint).
        *   *Status: Basic textured brush implemented.*
    *   Allow users to customize brush parameters (size, flow, wetness, bristle characteristics).
    *   Explore physics-based brush interactions (e.g., paint mixing on canvas, water pooling).
    *   Add an eraser tool with watercolor-like blending.
*   **Potential Sub-branch:** `feature/brush-presets` for saving and loading custom brush settings.

---

### 2. Stream: Expanded Pattern Generation
*   **Branch:** `feature/expanded-patterns`
*   **Goal:** Increase the diversity and complexity of generative patterns.
*   **Tasks:**
    *   Implement new pattern algorithms (e.g., L-systems, reaction-diffusion, Voronoi diagrams, flow fields).
        *   *Status: L-system implemented.*
    *   Allow users to select and combine different pattern generators.
        *   *Status: Selection between Perlin noise and L-system implemented. Combination is pending.*
    *   Introduce controls for pattern parameters (e.g., scale, density, color palettes, animation speed).
        *   *Status: Controls for Perlin noise (morph speed, scale, intensity) and L-system (generations, angle, length) implemented.*
    *   Enable patterns to react to user brush strokes or other inputs.
        *   *Status: Perlin noise pattern now reacts to brush strokes by locally altering its morphing behavior. Controls for interaction strength and radius implemented.*
*   **Potential Sub-branch:** `feature/pattern-layering` for combining multiple pattern layers.

---

### 3. Stream: Color Palette & Management
*   **Branch:** `feature/color-tools`
*   **Goal:** Provide sophisticated color selection and manipulation tools.
*   **Tasks:**
    *   Implement a user-friendly color picker (e.g., HSB, RGB, hex).
    *   Allow users to create, save, and load custom color palettes.
    *   Integrate pre-defined thematic color palettes.
    *   Explore color harmony suggestions (e.g., complementary, analogous).
    *   Add tools for color adjustments on the canvas (e.g., brightness, contrast, hue shift on specific layers).

---

### 4. Stream: Morphing & Animation Control
*   **Branch:** `feature/animation-control`
*   **Goal:** Give users more control over the real-time morphing and animation aspects.
*   **Tasks:**
    *   Allow users to adjust the speed and intensity of pattern morphing.
        *   *Status: Perlin morph speed/intensity adjustable. L-system, Voronoi, RD parameters that affect their evolution are adjustable. Continuous morph speeds for L-system, Voronoi, RD are currently fixed but could be made adjustable.*
    *   Introduce different morphing styles or algorithms for all pattern types.
        *   *Status: Perlin noise has z-axis evolution and XY panning. L-system has angle/length oscillation. Voronoi seeds animate. RD parameters (feed/kill) can oscillate.*
    *   Enable animation of brush strokes (e.g., replaying strokes, animated textures on strokes).
        *   *Status: Animated procedural texture for the textured brush implemented.*
    *   Explore audio-reactive elements where patterns or colors change with sound input.
        *   *Status: Perlin noise morph speed and brush color (hue) are now audio-reactive via microphone input.*
*   **Potential Sub-branch:** `feature/timeline-animation` for more complex, keyframe-based animations.

---

### 5. Stream: UI/UX Enhancements
*   **Branch:** `feature/ui-ux-improvements`
*   **Goal:** Improve the user interface and overall user experience.
*   **Tasks:**
    *   Design and implement a clean, intuitive UI for accessing tools and settings (e.g., using a library like dat.GUI or a custom HTML overlay instead of keyboard-only controls).
    *   Add functionality for undo/redo.
    *   Implement saving and loading of artwork (e.g., as images, or project files).
    *   Provide options for changing canvas size and background color/texture.
    *   Improve touch support for mobile devices.

---

### 6. Stream: Performance Optimization & Refactoring
*   **Branch:** `develop` or `refactor/performance` (This is an ongoing stream that often integrates with others)
*   **Goal:** Ensure the application remains performant as new features are added and refactor code for maintainability.
*   **Tasks:**
    *   Profile and optimize drawing functions and algorithms.
    *   Explore WebGL for rendering performance gains where applicable (e.g., for shader-based effects or large numbers of particles).
    *   Refactor code into modular components/classes for better organization.
    *   Improve the unit testing setup and increase test coverage.
    *   Optimize memory usage, especially for graphics buffers.

---

### 7. Stream: Advanced Effects & Post-Processing
*   **Branch:** `feature/effects-postprocessing`
*   **Goal:** Add visual effects and post-processing options to enhance the final artwork.
*   **Tasks:**
    *   Implement post-processing filters (e.g., bloom, vignette, noise, paper textures).
    *   Explore shader-based effects for unique visual styles.
    *   Add layering capabilities with blend modes (e.g., multiply, screen, overlay).
    *   Allow users to apply effects to specific layers or the entire composition.

---

## General Workflow for Each Stream
*   Create a new feature branch from the latest `main` or `develop` branch.
*   Develop features and add corresponding unit/integration tests.
*   Regularly merge changes from `main`/`develop` into the feature branch to stay updated and resolve conflicts early.
*   Once a feature set within a stream is complete and tested, create a Pull Request to merge it back into `main` or `develop`.
*   Conduct code reviews before merging.
