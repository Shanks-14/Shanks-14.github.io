/**
 * scene.js — the hero's WebGL background: a "data constellation."
 *
 * Concept: a wireframe icosahedron (representing a structured schema/graph)
 * sits inside a loose shell of drifting particles (unstructured data),
 * connected by a handful of live "query lines" that pulse between the
 * structured core and the particle field — a visual metaphor for turning
 * raw data into a defined shape, which is the whole pitch of the page.
 *
 * Design goals baked into this file:
 *  - Never block the main thread for long: geometry is generated once,
 *    the animation loop only updates rotations/positions.
 *  - Never runs when it can't be seen: an IntersectionObserver stops the
 *    render loop the moment the hero scrolls out of view, and the Page
 *    Visibility API stops it when the tab is backgrounded.
 *  - Respects prefers-reduced-motion: renders one static frame instead of
 *    a continuous animation loop.
 *  - Degrades cleanly if WebGL isn't available at all: init() returns
 *    false and the caller just leaves the canvas empty (the hero's CSS
 *    gradient background is a perfectly fine fallback on its own).
 *  - Scales geometry complexity down on small / low-powered screens.
 */
import * as THREE from 'three';

const COLOR_AMBER = 0xf2b84b;
const COLOR_TEAL = 0x45d8c0;

export class HeroScene {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement} boundsEl - element whose size the canvas should match (the hero section)
   */
  constructor(canvas, boundsEl) {
    this.canvas = canvas;
    this.boundsEl = boundsEl;
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.isRunning = false;
    this.isVisible = true;
    this.frameId = null;

    this.mouse = { x: 0, y: 0 }; // normalised -1..1
    this.mouseTarget = { x: 0, y: 0 };
    this.scrollProgress = 0; // 0 at top of hero, 1 once scrolled a full viewport past it

    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._tick = this._tick.bind(this);
  }

  /** Returns true if the scene initialised successfully. */
  init() {
    if (!this._isWebGLAvailable()) return false;

    const width = this.boundsEl.clientWidth;
    const height = this.boundsEl.clientHeight;
    const isSmallScreen = width < 720;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(width, height, false);
    } catch (err) {
      console.warn('HeroScene: renderer init failed, skipping 3D scene.', err);
      return false;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, isSmallScreen ? 9 : 7.5);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._buildCore();
    this._buildParticles(isSmallScreen ? 260 : 550);
    this._buildQueryLines();

    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('scroll', this._onScroll, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibilityChange);

    if (!this.prefersReducedMotion) {
      window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    }

    // Pause rendering while the hero is scrolled out of view.
    if ('IntersectionObserver' in window) {
      this._observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isVisible = entry.isIntersecting;
            if (this.isVisible) this._start();
            else this._stop();
          });
        },
        { threshold: 0 }
      );
      this._observer.observe(this.boundsEl);
    }

    if (this.prefersReducedMotion) {
      // Render a single static frame; no continuous loop.
      this._render();
    } else {
      this._start();
    }

    return true;
  }

  _isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  _buildCore() {
    // Wireframe icosahedron: the "structured schema."
    const geometry = new THREE.IcosahedronGeometry(2.1, 1);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: COLOR_TEAL,
      transparent: true,
      opacity: 0.55,
    });
    this.core = new THREE.LineSegments(edges, lineMaterial);
    this.group.add(this.core);

    // Vertex points, slightly larger and amber, sitting on the same geometry.
    const pointsMaterial = new THREE.PointsMaterial({
      color: COLOR_AMBER,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    this.coreVertices = new THREE.Points(geometry, pointsMaterial);
    this.group.add(this.coreVertices);
  }

  _buildParticles(count) {
    const positions = new Float32Array(count * 3);
    const radius = 4.6;

    for (let i = 0; i < count; i++) {
      // Distribute points in a spherical shell (not a filled ball) so the
      // field reads as a "cloud" around the core rather than noise inside it.
      const r = radius * (0.6 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8c9ab4,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  _buildQueryLines() {
    // A handful of thin, slowly-pulsing lines connecting the core to a few
    // particles — reads as "live queries" running between structured and
    // unstructured data. Purely decorative, kept cheap (6 short segments).
    const material = new THREE.LineBasicMaterial({
      color: COLOR_AMBER,
      transparent: true,
      opacity: 0.35,
    });

    this.queryLines = [];
    const linkCount = 6;

    for (let i = 0; i < linkCount; i++) {
      const start = new THREE.Vector3(0, 0, 0);
      const angle = (i / linkCount) * Math.PI * 2;
      const end = new THREE.Vector3(
        Math.cos(angle) * 3.6,
        Math.sin(angle * 1.3) * 2.6,
        Math.sin(angle) * 3.2
      );
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(geometry, material.clone());
      this.queryLines.push({ line, baseOpacity: 0.15 + Math.random() * 0.25, phase: Math.random() * Math.PI * 2 });
      this.group.add(line);
    }
  }

  _onPointerMove(e) {
    // Normalise to -1..1, only really meaningful near the hero at the top
    // of the page, but harmless (and cheap) to track globally.
    this.mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
  }

  _onScroll() {
    const heroHeight = this.boundsEl.clientHeight || 1;
    const scrolled = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    this.scrollProgress = scrolled;
  }

  _onResize() {
    const width = this.boundsEl.clientWidth;
    const height = this.boundsEl.clientHeight;
    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);

    if (this.prefersReducedMotion) this._render();
  }

  _onVisibilityChange() {
    if (document.hidden) this._stop();
    else if (this.isVisible) this._start();
  }

  _start() {
    if (this.isRunning || this.prefersReducedMotion) return;
    this.isRunning = true;
    this.frameId = requestAnimationFrame(this._tick);
  }

  _stop() {
    this.isRunning = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  _tick() {
    if (!this.isRunning) return;

    // Smoothly ease the tracked mouse position (lerp) so the parallax
    // feels fluid rather than snapping to the raw pointer position.
    this.mouse.x += (this.mouseTarget.x - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouseTarget.y - this.mouse.y) * 0.04;

    const t = performance.now() * 0.001;

    this.core.rotation.y = t * 0.12 + this.mouse.x * 0.3;
    this.core.rotation.x = t * 0.07 + this.mouse.y * 0.2;
    this.coreVertices.rotation.copy(this.core.rotation);

    this.particles.rotation.y = -t * 0.035;
    this.particles.rotation.x = t * 0.015;

    this.queryLines.forEach(({ line, baseOpacity, phase }) => {
      line.material.opacity = baseOpacity + Math.sin(t * 1.4 + phase) * 0.12;
      line.rotation.y = this.core.rotation.y * 0.6;
      line.rotation.x = this.core.rotation.x * 0.6;
    });

    // Scroll response: as the hero scrolls away, dolly the camera back and
    // fade the whole group slightly so it recedes rather than just vanishing.
    const dolly = this.scrollProgress * 2.4;
    this.camera.position.z = 7.5 + dolly;
    const fade = 1 - this.scrollProgress * 0.7;
    this._setGroupOpacity(fade);

    this._render();
    this.frameId = requestAnimationFrame(this._tick);
  }

  _setGroupOpacity(value) {
    this.core.material.opacity = 0.55 * value;
    this.coreVertices.material.opacity = 0.9 * value;
    this.particles.material.opacity = 0.5 * value;
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  /** Fully tears down the scene and removes all listeners/GPU resources. */
  destroy() {
    this._stop();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    if (this._observer) this._observer.disconnect();

    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    if (this.renderer) this.renderer.dispose();
  }
}
