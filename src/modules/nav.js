/**
 * nav.js — header chrome: scrolled-state border, mobile slide-in menu,
 * active-link highlighting via IntersectionObserver, and anchor smooth
 * scroll with a correction for the fixed header's height. (unchanged)
 */
export function initNav() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');
  const scrollCue = document.getElementById('scroll-cue');
  const backToTop = document.getElementById('back-to-top');

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-link, .nav-cta').forEach((link) => {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  const headerH = header ? header.offsetHeight : 76;

  function scrollToTarget(target) {
    const top =
      target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      history.pushState(null, '', id);
    });
  });

  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      const about = document.getElementById('About') || document.getElementById('about');
      if (about) scrollToTarget(about);
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href').toLowerCase() === `#${id.toLowerCase()}`);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }
}
