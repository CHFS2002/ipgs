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
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

  // --- Formspree AJAX handler (production forms) ---
  // Usage: add data-formspree="https://formspree.io/f/<id>" to any <form>
  var liveForms = document.querySelectorAll('form[data-formspree]');
  liveForms.forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = f.querySelector('.form-status');
      var btn = f.querySelector('[type="submit"]');
      var endpoint = f.getAttribute('data-formspree');
      if (btn) btn.disabled = true;
      if (status) { status.textContent = 'Sending\u2026'; status.style.color = 'inherit'; }

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(f),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (res.ok) {
            if (status) {
              status.textContent = 'Thank you \u2014 your message has been sent. We aim to respond within five working days.';
              status.style.color = 'var(--ipgs-green)';
            }
            f.reset();
          } else {
            // Formspree returns { errors: [{field, message}] } on validation failure
            var msg = 'Something went wrong \u2014 please email us directly at chfsfao@mail.hzau.edu.cn';
            if (res.data && res.data.errors && res.data.errors.length) {
              msg = res.data.errors.map(function (e) {
                return e.field ? (e.field + ': ' + e.message) : e.message;
              }).join(' \u00b7 ');
            }
            throw new Error(msg);
          }
        })
        .catch(function (err) {
          if (status) {
            status.textContent = err.message || 'Something went wrong \u2014 please email us directly at chfsfao@mail.hzau.edu.cn';
            status.style.color = 'var(--ipgs-danger)';
          }
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  });

  // --- Basic form demo handler (non-production placeholder) ---
  var demoForms = document.querySelectorAll('form[data-demo]');
  demoForms.forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = f.querySelector('.form-status');
      if (status) {
        status.textContent = 'Thank you \u2014 your submission was received. The Secretariat will be in touch shortly.';
        status.style.color = 'var(--ipgs-green)';
      }
    });
  });
})();
