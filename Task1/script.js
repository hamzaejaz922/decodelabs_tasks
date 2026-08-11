/* ==========================================================================
   Craft Studio — script.js
   Covers "JavaScript: The Logic" requirement from the brief:
   basic state management + interactive functionality (no frameworks).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Mobile navigation toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  navToggle.addEventListener('click', () => {
    // Read current state from the DOM (single source of truth = aria-expanded)
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';

    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    primaryNav.classList.toggle('is-open', !isOpen);
  });

  // Close the mobile menu automatically after a nav link is tapped
  primaryNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      primaryNav.classList.remove('is-open');
    });
  });

  /* ---------- 2. Footer year (small dynamic touch) ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- 3. Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: (v) => v.trim().length >= 2 || 'Please enter your name (min 2 characters).'
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.'
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.'
    }
  };

  function validateField(field) {
    const result = field.validate(field.input.value);
    const isValid = result === true;

    field.input.classList.toggle('invalid', !isValid);
    field.error.textContent = isValid ? '' : result;
    return isValid;
  }

  // Validate on blur (as the user moves through the form)
  Object.values(fields).forEach(field => {
    field.input.addEventListener('blur', () => validateField(field));
  });

  // Validate everything on submit
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const allValid = Object.values(fields)
      .map(validateField)
      .every(Boolean);

    if (allValid) {
      successMsg.textContent = `Thanks! We'll get back to you soon.`;
      form.reset();
      Object.values(fields).forEach(f => f.input.classList.remove('invalid'));
    } else {
      successMsg.textContent = '';
    }
  });

});
