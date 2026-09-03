/**
 * tilt.js — gives every `.tilt` card a subtle 3D rotation that follows the
 * cursor, via CSS custom properties (--rx / --ry) consumed by the `.tilt`
 * rule in main.css. Pure CSS transitions handle the easing back to flat on
 * mouseleave, so this file only ever sets two numbers per mousemove.
 *
 * Skipped entirely for touch/coarse pointers and prefers-reduced-motion —
 * both groups get the flat card defined in main.css instead.
 */
export function initTilt() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!fine || prefersReducedMotion) return;

  const MAX_DEGREES = 6;

  document.querySelectorAll('.tilt').forEach((card) => {
    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1

      const ry = (px - 0.5) * MAX_DEGREES * 2; // rotateY follows horizontal position
      const rx = (0.5 - py) * MAX_DEGREES * 2; // rotateX follows vertical position

      card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    }

    function onLeave() {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
}
