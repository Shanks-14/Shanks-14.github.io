import './styles/main.css';

import { initCustomCursor } from './modules/cursor.js';
import { initTilt } from './modules/tilt.js';
import { initRevealAnimations } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initTypewriter } from './modules/typewriter.js';
import { initContactForm } from './modules/contactForm.js';

/**
 * Each feature is wrapped in its own try/catch. The site is a portfolio —
 * if, say, WebGL context creation throws on some exotic browser/GPU combo,
 * that must never take the whole page down with it. Every module below is
 * independent: nav, form and content all keep working even if the 3D scene
 * or an animation library fails to initialise.
 */
function safeInit(label, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`Portfolio: "${label}" failed to initialise.`, err);
  }
}

function setFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('top');
  if (!canvas || !hero) return;

  // Three.js is ~150KB gzipped — dynamically imported so it never blocks
  // the rest of the page (nav, content, form) from becoming interactive,
  // and so Vite splits it into its own chunk that only loads when a hero
  // section with a canvas actually exists.
  import('./modules/scene.js')
    .then(({ HeroScene }) => {
      const scene = new HeroScene(canvas, hero);
      const ok = scene.init();
      if (!ok) {
        // WebGL unavailable or init failed — remove the canvas so it
        // doesn't sit there blank; the hero's CSS gradient background
        // looks intentional on its own.
        canvas.remove();
      }
    })
    .catch((err) => {
      console.error('Portfolio: could not load the 3D scene module.', err);
      canvas.remove();
    });
}

document.addEventListener('DOMContentLoaded', () => {
  safeInit('footer year', setFooterYear);
  safeInit('navigation', initNav);
  safeInit('hero 3D scene', initHeroScene);
  safeInit('typewriter', initTypewriter);
  safeInit('scroll reveal animations', initRevealAnimations);
  safeInit('3D card tilt', initTilt);
  safeInit('custom cursor', initCustomCursor);
  safeInit('contact form', initContactForm);
});
