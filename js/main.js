/* IPGS main.js — minimal interactions, vanilla JS, no dependencies */
(function () {
  'use strict';

  // --- Mobile nav toggle ---
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // --- Highlight current page in nav ---
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var links = document.querySelectorAll('.main-nav a');
  links.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var hrefPath = href.replace(/\/$/, '');
    if (hrefPath === path || (path.endsWith('/index.html') && hrefPath === path.replace('/index.html', ''))) {
      a.setAttribute('aria-current', 'page');
    }
    // Also match section roots (e.g. /about/governance.html should mark /about)
    if (hrefPath && hrefPath !== '/' && path.indexOf(hrefPath + '/') === 0) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // --- Close mobile nav on link click (UX nicety) ---
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth <= 960 && nav) {
        nav.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // --- Copy-to-clipboard on elements with data-copy ---
  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function () {
      var text = el.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          var original = el.textContent;
          el.textContent = 'Copied';
          setTimeout(function () { el.textContent = original; }, 1400);
        });
      }
    });
  });

  // --- Basic form demo handler (non-production) ---
  var demoForms = document.querySelectorAll('form[data-demo]');
  demoForms.forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = f.querySelector('.form-status');
      if (status) {
        status.textContent = 'Thank you — your submission was received locally. Server-side processing will be enabled once the Secretariat wires up the form backend.';
        status.style.color = 'var(--ipgs-green)';
      }
    });
  });
})();
