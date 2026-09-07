/**
 * typewriter.js — types the hero's SQL query out character by character,
 * then reveals the "results" table underneath. (unchanged)
 */
const QUERY_TEXT =
  'SELECT name, title, experience\n' +
  'FROM   professionals\n' +
  "WHERE  skills @> ARRAY['SQL','Python','Azure']\n" +
  "  AND  location = 'Dublin, IE';";

const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'AND', 'ARRAY'];

function highlightSQL(raw) {
  let escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  KEYWORDS.forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'g');
    escaped = escaped.replace(re, `<span style="color: var(--amber)">${kw}</span>`);
  });
  return escaped;
}

export function initTypewriter() {
  const typedEl = document.getElementById('typed-query');
  const cursorEl = document.getElementById('type-cursor');
  const resultEl = document.getElementById('console-result');
  if (!typedEl) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    typedEl.innerHTML = highlightSQL(QUERY_TEXT);
    if (cursorEl) cursorEl.style.display = 'none';
    if (resultEl) resultEl.classList.add('show');
    return;
  }

  let i = 0;
  const speed = 22;

  function step() {
    if (i <= QUERY_TEXT.length) {
      typedEl.innerHTML = highlightSQL(QUERY_TEXT.slice(0, i));
      i++;
      setTimeout(step, speed);
    } else {
      if (cursorEl) setTimeout(() => { cursorEl.style.display = 'none'; }, 400);
      if (resultEl) setTimeout(() => { resultEl.classList.add('show'); }, 300);
    }
  }

  setTimeout(step, 500);
}
