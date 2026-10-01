/* =========================================================
   Sir Talha Aday Serad — Portfolio
   script.js — all interactivity, no libraries
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. MOBILE NAV ---------- */
  var navToggle = $('#navToggle');
  var navLinks  = $('#navLinks');

  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', function (e) {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 2. THEME TOGGLE ---------- */
  var themeToggle = $('#themeToggle');
  var metaTheme   = $('meta[name="theme-color"]');

  themeToggle.addEventListener('click', function () {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    var next  = light ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    if (metaTheme) metaTheme.setAttribute('content', light ? '#0a0e14' : '#f4f6f8');
    try { localStorage.setItem('ts-theme', next); } catch (err) {}
    toast(next === 'light' ? 'Light theme enabled' : 'Dark theme enabled');
  });

  /* ---------- 3. TOAST ---------- */
  var toastEl = $('#toast');
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2000);
  }

  /* ---------- 4. COPY TO CLIPBOARD ---------- */
  $$('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var original = btn.textContent;
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        toast('Copied to clipboard');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1800);
      };
      var fail = function () { toast('Copy failed — select manually'); };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          legacyCopy(text) ? done() : fail();
        });
      } else {
        legacyCopy(text) ? done() : fail();
      }
    });
  });

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      return false;
    }
  }

  /* ---------- 5. HERO TERMINAL TYPING ---------- */
  var typeTarget = $('#typeTarget');
  var typeCaret  = $('#typeCaret');
  var termOut    = $('#termOut');
  var codePanel  = $('#codePanel');

  var CMD = 'cat developer.json';

  function typeCmd() {
    if (reduceMotion) {
      typeTarget.textContent = CMD;
      revealTerminal();
      return;
    }
    var i = 0;
    typeCaret.classList.remove('done');
    (function step() {
      if (i > CMD.length) {
        revealTerminal();
        return;
      }
      typeTarget.textContent = CMD.slice(0, i++);
      setTimeout(step, 52 + Math.random() * 45);
    })();
  }

  function revealTerminal() {
    typeCaret.classList.add('done');
    termOut.classList.add('fade-in');
    if (codePanel) {
      codePanel.classList.add('dim');
      setTimeout(function () { codePanel.classList.remove('dim'); }, 420);
    }
  }

  setTimeout(typeCmd, 420);

  /* ---------- 6. LIVE CLOCK ---------- */
  var clock = $('#liveClock');

  function tick() {
    var d = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  if (clock) { tick(); setInterval(tick, 1000); }

  /* ---------- 7. SCROLL REVEAL ---------- */
  var revealEls = $$('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          revealIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- 8. NAV STATE + SCROLL PROGRESS + BACK TO TOP ---------- */
  var nav            = $('#nav');
  var progress       = $('#scrollProgress');
  var toTop          = $('#toTop');
  var ticking        = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    nav.classList.toggle('scrolled', y > 24);
    toTop.classList.toggle('show', y > 520);

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- 9. SCROLL SPY ---------- */
  var navAs    = $$('[data-nav]');
  var sections = navAs
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function setActive(id) {
    navAs.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 10. PROJECT FILTER ---------- */
  var filters   = $$('#filters .filter');
  var projects  = $$('#projectsGrid .project');
  var emptyNote = $('#emptyNote');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var want = btn.getAttribute('data-filter');
      var shown = 0;

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      projects.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(' ');
        var match = want === 'all' || cats.indexOf(want) !== -1;

        card.classList.toggle('is-hidden', !match);
        card.classList.remove('filter-in');

        if (match) {
          shown++;
          if (!reduceMotion) {
            void card.offsetWidth;   // restart animation
            card.classList.add('filter-in');
          }
        }
      });

      emptyNote.hidden = shown > 0;
    });
  });

  /* ---------- 11. MINDSET LOOP INTERACTION ---------- */
  var loopSteps = $$('.loop-step');
  var note      = $('#mindsetNote');

  var NOTES = [
    'Perseverance matters more than being fast. Most of what I know about programming, I know because something did not work and I stayed with it until it did.',
    'Reading the error instead of guessing is most of the job. The stack trace is usually telling me exactly where I went wrong.',
    'Expecting to break something is what keeps it normal. A bug is information, not a verdict on my ability.',
    'Debugging teaches more than the first working version would have. The fix is the part I remember a month later.',
    'Coming back to old code and making it clearer is real progress, even when the feature works.'
  ];

  loopSteps.forEach(function (step, i) {
    step.addEventListener('click', function () {
      loopSteps.forEach(function (s) { s.classList.remove('is-current'); });
      step.classList.add('is-current');

      note.style.opacity = '0';
      setTimeout(function () {
        note.textContent = NOTES[i];
        note.style.opacity = '1';
      }, 180);
    });
  });

  /* ---------- 12. KEYBOARD ACCESSIBILITY ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.activeElement === document.body) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

})();