/**
 * cursor.js — the original small dot + trailing ring cursor, restored.
 * Only activates on devices with a fine pointer (mouse/trackpad); fully
 * inert (and CSS-hidden) on touch. Skips the rAF trail loop under
 * prefers-reduced-motion.
 */
export function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  const fine = window.matchMedia('(pointer: fine)');
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let active = fine.matches;
  document.documentElement.classList.toggle('has-fine-pointer', active);

  if (!active) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let rafId = null;

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;

    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    const target = e.target.closest(
      '[data-cursor="link"], a, button, input, textarea'
    );
    ring.classList.toggle('is-hovering', !!target);
  }

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animateRing);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  if (prefersReducedMotion) {
    window.addEventListener(
      'pointermove',
      (e) => {
        ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      },
      { passive: true }
    );
  } else {
    rafId = requestAnimationFrame(animateRing);
  }

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onPointerMove);
  };
}
