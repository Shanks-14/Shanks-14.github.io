/**
 * cursor.js — a small dot + trailing ring that follows the pointer and
 * expands over interactive elements (anything with [data-cursor="link"],
 * plus native links/buttons as a safety net).
 *
 * Safety rails baked in:
 *  - Only activates on devices that report a fine pointer (mouse/trackpad)
 *    via a media query match, so touch devices never get `cursor: none`
 *    or a ghost cursor stuck on screen.
 *  - Re-checks that media query on every pointer event, so a 2-in-1
 *    laptop that switches between touch and mouse doesn't get stuck in
 *    the wrong mode.
 *  - Fully skips the animation loop (not just visually hides) when
 *    prefers-reduced-motion is set, or when the fine-pointer check fails.
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

  if (!active) {
    // No mouse-like pointer at all — nothing further to do. The CSS rule
    // `html:not(.has-fine-pointer) .cursor-dot/.cursor-ring { display: none }`
    // keeps them hidden, and native cursors are left untouched.
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let rafId = null;

  function onPointerMove(e) {
    // A touchscreen dispatches pointer events with pointerType 'touch';
    // ignore those so a finger tap doesn't drag the desktop cursor around.
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
    // Ease the ring toward the raw mouse position for a soft trailing feel.
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animateRing);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  if (prefersReducedMotion) {
    // Snap instantly instead of running a continuous rAF loop.
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

  // Hide the custom cursor when the pointer leaves the viewport entirely.
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
