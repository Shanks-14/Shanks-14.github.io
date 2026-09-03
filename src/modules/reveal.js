/**
 * reveal.js — all GSAP-driven motion that isn't the 3D scene or the cursor:
 *  - the hero's staggered entrance (title lines, subtext, CTAs, tags)
 *  - scroll-triggered reveals for every `.reveal-up` block (cards, section
 *    headers, etc.), batched per-section so items already inside the
 *    viewport on load animate together instead of one at a time
 *  - the animated stat counters in the hero
 *
 * ScrollTrigger and all other GSAP plugins have been 100% free (including
 * for commercial use, no account/license key required) since Webflow's
 * acquisition of GreenSock in 2025 — see README.md for the source.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initRevealAnimations() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Motion is disabled at the CSS level too (see main.css), but we still
    // need to flip these elements to their visible state since GSAP would
    // otherwise never touch them.
    gsap.set('.reveal-up, .reveal-line', { opacity: 1, y: 0 });
    animateCounters(true);
    return;
  }

  heroIntro();
  scrollReveals();
  animateCounters(false);
}

function heroIntro() {
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    delay: 0.15,
  });

  tl.from('#query-console', { opacity: 0, y: 24, duration: 0.6 }, 0)
    .to('.hero-title .reveal-line', {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.12,
    }, 0.15)
    .to('.hero-sub.reveal-line', { y: 0, opacity: 1, duration: 0.6 }, 0.4)
    .to('.hero-actions.reveal-line', { y: 0, opacity: 1, duration: 0.6 }, 0.5)
    .to('.hero-tags.reveal-line', { y: 0, opacity: 1, duration: 0.6 }, 0.58)
    .from('.hero-stats .stat-card', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.08,
      clearProps: 'transform',
    }, 0.3);
}

function scrollReveals() {
  const items = gsap.utils.toArray('.reveal-up');

  items.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        // Several `.reveal-up` elements are also `.tilt` cards, whose
        // CSS-driven `transform` (perspective/rotateX/rotateY, updated by
        // tilt.js on mousemove) would otherwise be permanently overridden
        // by the inline `transform` GSAP leaves behind after animating `y`.
        // clearProps hands the property back to CSS once the reveal finishes.
        // Using fromTo (rather than to) also means GSAP owns the explicit
        // starting transform itself instead of reading it off the CSS
        // cascade, which avoids it ever trying to decompose `.tilt`'s
        // perspective/rotateX matrix as a starting point.
        clearProps: 'transform',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  });
}

function animateCounters(instant) {
  const cards = document.querySelectorAll('.stat-card[data-count]');

  cards.forEach((card) => {
    const target = parseInt(card.getAttribute('data-count'), 10) || 0;
    const suffix = card.getAttribute('data-suffix') || '';
    const numEl = card.querySelector('.stat-num');
    if (!numEl) return;

    if (instant) {
      numEl.textContent = target + suffix;
      return;
    }

    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.hero-stats',
        start: 'top 90%',
        once: true,
      },
      onUpdate: () => {
        numEl.textContent = Math.round(counter.value) + suffix;
      },
    });
  });
}
