/**
 * reveal.js — all GSAP-driven motion that isn't the 3D scene, the cursor,
 * or the scroll-driven projects panel:
 *  - the hero's staggered entrance (title lines, subtext, CTAs, tags)
 *  - scroll-triggered reveals for every `.reveal-up` block
 *  - the animated stat counters in the hero
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initRevealAnimations() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
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
    }, 0.3)
    .from('.social-rail .social-icon', {
      opacity: 0,
      x: -16,
      duration: 0.5,
      stagger: 0.07,
    }, 0.2);
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
