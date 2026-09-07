import './styles/main.css';

import { initCustomCursor } from './modules/cursor.js';
import { initTilt } from './modules/tilt.js';
import { initRevealAnimations } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initTypewriter } from './modules/typewriter.js';
import { initContactForm } from './modules/contactForm.js';
import { initSelectedWork } from './modules/selectedWork.js';
import { initServicesSwap } from './modules/servicesSwap.js';
import { initSkillsStack } from './modules/skillsStack.js';

/**
 * Each feature is wrapped in its own try/catch — the site is a portfolio,
 * and no single module (3D scene, bubble physics, scroll panel...) should
 * ever be able to take the whole page down with it.
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

  import('./modules/scene.js')
    .then(({ HeroScene }) => {
      const scene = new HeroScene(canvas, hero);
      const ok = scene.init();
      if (!ok) {
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
  safeInit('selected work preview', initSelectedWork);
  safeInit('services swap panel', initServicesSwap);
  safeInit('skills stacking deck', initSkillsStack);
});
