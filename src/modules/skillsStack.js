/**
 * skillsStack.js — drives the "What I work with" stacking card deck.
 *
 * Rather than relying on N independent `position: sticky` elements (which
 * is what the previous version did, and which silently does nothing in
 * some browsers when any ancestor sets a non-visible `overflow` — exactly
 * the failure mode reported: cards just sat in one fixed spot), this uses
 * a single sticky "viewport" and computes scroll progress through a tall
 * spacer container directly, positioning each card with a transform.
 *
 * As the user scrolls through `.skills-stack`:
 *   - the currently "active" card sits at rest, fully visible
 *   - the next card slides up from below and, because it's later in the
 *     DOM (and has a higher z-index), visually lands on top of the
 *     current one — the "throwing a card onto the deck" effect
 *   - already-settled cards stay put underneath, fully covered
 *
 * Falls back to a plain static stacked list (no JS, no sticky) on narrow
 * screens and under prefers-reduced-motion.
 */
export function initSkillsStack() {
  const container = document.getElementById('skills-stack');
  if (!container) return;

  const viewport = container.querySelector('.stack-viewport');
  const cards = Array.from(container.querySelectorAll('.stack-card-wrap'));
  if (!viewport || !cards.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const isNarrow = () => window.matchMedia('(max-width: 1024px)').matches;

  if (prefersReducedMotion || isNarrow()) {
    container.classList.add('is-static');
    return;
  }

  const N = cards.length;
  const VH_PER_CARD = 90; // scroll distance allotted to each card, in vh units
  let ticking = false;

  function headerHeight() {
    const header = document.getElementById('site-header');
    return header ? header.offsetHeight : 76;
  }

  function layout() {
    container.style.height = `${N * VH_PER_CARD}vh`;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function update() {
    const rect = container.getBoundingClientRect();
    const viewportH = viewport.offsetHeight || window.innerHeight;
    const total = container.offsetHeight - viewportH;

    if (total <= 0) return;

    const scrolled = clamp(headerHeight() - rect.top, 0, total);
    const progress = scrolled / total;
    const rawIndex = progress * (N - 1);
    const activeIndex = Math.min(N - 1, Math.floor(rawIndex));
    const localProgress = rawIndex - activeIndex;

    cards.forEach((card, i) => {
      card.style.zIndex = String(i + 1);

      if (i < activeIndex) {
        // Already settled underneath — fully covered, just keep it put.
        card.style.transform = 'translateY(0) scale(1)';
        card.style.opacity = '1';
      } else if (i === activeIndex) {
        // The current front card — recedes slightly as the next arrives.
        const scale = 1 - localProgress * 0.05;
        const lift = -localProgress * 16;
        card.style.transform = `translateY(${lift}px) scale(${scale})`;
        card.style.opacity = '1';
      } else if (i === activeIndex + 1) {
        // The incoming card, sliding up from below into place.
        const offset = (1 - localProgress) * 55;
        const scale = 0.94 + localProgress * 0.06;
        card.style.transform = `translateY(${offset}vh) scale(${scale})`;
        card.style.opacity = String(0.6 + localProgress * 0.4);
      } else {
        // Not yet in play — parked below, invisible.
        card.style.transform = 'translateY(55vh) scale(0.94)';
        card.style.opacity = '0';
      }
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  function onResize() {
    if (isNarrow()) {
      container.classList.add('is-static');
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      return;
    }
    layout();
    update();
  }

  layout();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
}
