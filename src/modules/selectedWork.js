/**
 * selectedWork.js — a "Selected Work" list where hovering (desktop) or
 * tapping (touch) a project row raises a floating preview panel that
 * tracks the cursor, showing an abstract preview of that project. Clicking
 * a row (any device) opens a centered detail pop-up with the project's
 * full description, achievements, and tools.
 *
 * This mirrors the *interaction pattern* popularised by agency sites like
 * cosmos.studio (row list + cursor-following preview) — everything here
 * (markup, visuals, copy) is original and built from Shashank's own
 * project content.
 */
export function initSelectedWork() {
  const list = document.getElementById('work-list');
  const preview = document.getElementById('work-preview');
  if (!list || !preview) return;

  const rows = Array.from(list.querySelectorAll('.work-row'));
  const previewInner = preview.querySelector('.work-preview-inner');
  const fine = window.matchMedia('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  let rafId = null;
  let activeRow = null;

  function place() {
    px += (tx - px) * (prefersReducedMotion ? 1 : 0.18);
    py += (ty - py) * (prefersReducedMotion ? 1 : 0.18);
    preview.style.transform = `translate(${px}px, ${py}px) translate(-50%, -55%)`;
    if (!prefersReducedMotion) rafId = requestAnimationFrame(place);
  }

  function startFollow() {
    if (rafId || prefersReducedMotion) return;
    rafId = requestAnimationFrame(place);
  }

  function showPreview(row) {
    if (activeRow === row) return;
    activeRow = row;
    const variant = row.dataset.variant || '0';
    previewInner.dataset.variant = variant;
    previewInner.querySelector('.work-preview-title').textContent = row.dataset.name || '';
    previewInner.querySelector('.work-preview-niche').textContent = row.dataset.niche || '';
    preview.classList.add('is-visible');
  }

  function hidePreview() {
    activeRow = null;
    preview.classList.remove('is-visible');
  }

  if (fine) {
    list.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const listRect = list.getBoundingClientRect();
      tx = e.clientX - listRect.left;
      ty = e.clientY - listRect.top;
      if (!prefersReducedMotion) startFollow();
      else place();
    });

    rows.forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        showPreview(row);
      });
    });

    list.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      hidePreview();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    });
  }

  initWorkModal(rows);
}

function initWorkModal(rows) {
  const modal = document.getElementById('work-modal');
  if (!modal) return;

  const card = modal.querySelector('.work-modal-card');
  const nicheEl = document.getElementById('work-modal-niche');
  const yearEl = document.getElementById('work-modal-year');
  const titleEl = document.getElementById('work-modal-title');
  const descEl = document.getElementById('work-modal-desc');
  const pointsEl = document.getElementById('work-modal-points');
  const tagsEl = document.getElementById('work-modal-tags');
  const closers = modal.querySelectorAll('[data-close]');

  let lastFocused = null;

  function open(row) {
    nicheEl.textContent = row.dataset.niche || 'Project';
    yearEl.textContent = row.dataset.year || '';
    titleEl.textContent = row.querySelector('.work-row-title')?.textContent || row.dataset.name || '';
    descEl.textContent = row.dataset.description || '';

    pointsEl.innerHTML = '';
    (row.dataset.points || '')
      .split('|')
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((point) => {
        const li = document.createElement('li');
        li.textContent = point;
        pointsEl.appendChild(li);
      });

    tagsEl.innerHTML = '';
    (row.dataset.tools || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tool) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tool;
        tagsEl.appendChild(span);
      });

    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.work-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  rows.forEach((row) => {
    row.style.cursor = 'pointer';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.addEventListener('click', () => open(row));
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(row);
      }
    });
  });

  closers.forEach((el) => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  // Prevent clicks inside the card from bubbling to the backdrop's closer.
  if (card) card.addEventListener('click', (e) => e.stopPropagation());
}

