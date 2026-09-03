/**
 * contactForm.js — no backend involved. The form composes a mailto: link
 * from the visitor's input and hands off to their email client; the copy
 * button uses the async Clipboard API with a manual fallback for browsers
 * that don't support it (or block it outside a secure context).
 */
export function initContactForm() {
  initCopyButton();
  initForm();
}

function initCopyButton() {
  const copyBtn = document.querySelector('.copy-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const value = copyBtn.getAttribute('data-copy') || '';
    const restoreText = copyBtn.textContent;

    function markCopied() {
      copyBtn.textContent = 'copied';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = restoreText;
        copyBtn.classList.remove('copied');
      }, 1800);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(markCopied).catch(() => {
        fallbackCopy(value, markCopied);
      });
    } else {
      fallbackCopy(value, markCopied);
    }
  });
}

function fallbackCopy(text, done) {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', '');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    /* no-op: clipboard unavailable, user can still select the text manually */
  }
  document.body.removeChild(temp);
  if (done) done();
}

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const hint = document.getElementById('form-hint');

    if (!name || !email || !message) {
      if (hint) {
        hint.textContent = 'Please fill in every field before sending.';
        hint.style.color = 'var(--danger)';
      }
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:shashank.shettywk@gmail.com?subject=${subject}&body=${body}`;
  });
}
