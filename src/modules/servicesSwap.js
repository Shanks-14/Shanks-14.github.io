/**
 * servicesSwap.js — a numbered list of services where hovering (desktop)
 * or scrolling past (touch/mobile, via IntersectionObserver) an item swaps
 * a large visual panel to match it.
 */
export function initServicesSwap() {
  const list = document.getElementById('services-list');
  const panel = document.getElementById('services-panel');
  if (!list || !panel) return;

  const items = Array.from(list.querySelectorAll('.service-item'));
  const panelInner = panel.querySelector('.services-panel-inner');
  const fine = window.matchMedia('(pointer: fine)').matches;
  let active = null;

  function setActive(item) {
    if (active === item) return;
    active = item;
    items.forEach((el) => el.classList.toggle('active', el === item));
    panelInner.dataset.variant = item.dataset.variant || '0';
    panelInner.querySelector('.services-panel-title').textContent = item.dataset.title || '';
    panelInner.querySelector('.services-panel-desc').textContent = item.dataset.desc || '';
  }

  if (fine) {
    items.forEach((item) => {
      item.addEventListener('mouseenter', () => setActive(item));
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target);
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    items.forEach((item) => observer.observe(item));
  }

  setActive(items[0]);
}
