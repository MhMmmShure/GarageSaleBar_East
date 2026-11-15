/* Garage Sale Bar — interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('top-nav');
  var toTop = document.querySelector('.to-top');

  /* ---------- Magazine-cutout headings: <h2 class="ransom" data-ransom>Text</h2> ---------- */
  [].forEach.call(document.querySelectorAll('[data-ransom]'), function (node) {
    var text = node.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    node.setAttribute('aria-label', text);
    node.textContent = '';
    var n = 0;
    text.split(' ').forEach(function (word) {
      var w = document.createElement('span');
      w.className = 'ransom__w';
      w.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) {
        var l = document.createElement('span');
        l.className = 'ransom__l r' + (n % 9) + (/[.,!?'’]/.test(ch) ? ' ransom__p' : '');
        l.textContent = ch;
        w.appendChild(l);
        n++;
      });
      node.appendChild(w);
      n++;
    });
    node.classList.add('is-cut');
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
  }
  if (toggle) toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  if (mobileMenu) mobileMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !mobileMenu.hidden) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Scroll: shrinking nav, parallax, floating objects ---------- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var features = [].slice.call(document.querySelectorAll('[data-feature]')).map(function (el) {
    var floater = el.querySelector('[data-floater]');
    return {
      el: el,
      bg: el.querySelector('[data-bg]'),
      floater: floater,
      rotate: floater ? parseFloat(floater.getAttribute('data-rotate')) || 0 : 0
    };
  });
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    nav.classList.toggle('is-scrolled', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > vh * 0.8);

    if (reduceMotion) return;

    if (y < vh * 1.2) {
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = 'translate3d(0,' + (y * speed).toFixed(1) + 'px,0)';
      });
    }

    features.forEach(function (f) {
      var r = f.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      // p: -1 when the section is one viewport below centre, 0 centred, 1 above
      var p = (vh / 2 - (r.top + r.height / 2)) / vh;
      p = Math.max(-1.2, Math.min(1.2, p));
      if (f.floater) {
        var travel = window.innerWidth < 900 ? 36 : Math.min(vh * 0.28, 220);
        f.floater.style.transform =
          'translate3d(0,' + (-p * travel).toFixed(1) + 'px,0) rotate(' + (p * f.rotate).toFixed(2) + 'deg)';
      }
      if (f.bg) {
        f.bg.style.transform = 'translate3d(0,' + (p * 70).toFixed(1) + 'px,0)';
      }
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- Hours: "open today" + highlight today's row ---------- */
  // 0 = Sunday. Times are Nashville local.
  var HOURS = {
    0: ['10 AM', 'midnight'], 1: ['11 AM', 'midnight'], 2: ['11 AM', 'midnight'],
    3: ['11 AM', 'midnight'], 4: ['11 AM', 'midnight'], 5: ['11 AM', '2 AM'], 6: ['10 AM', '2 AM']
  };
  var GSB = window.GSB || {};
  var today = GSB.today ? GSB.today() : new Date();
  var dow = today.getDay();
  var openEl = document.getElementById('open-today');
  if (openEl) openEl.textContent = 'Open today ' + HOURS[dow][0] + ' to ' + HOURS[dow][1] + '.';
  var openEl2 = document.getElementById('open-today-2');
  if (openEl2) openEl2.textContent = 'Open today ' + HOURS[dow][0] + ' to ' + HOURS[dow][1] + '.';
  [].forEach.call(document.querySelectorAll('#hours tr'), function (tr) {
    if (tr.getAttribute('data-days').split(',').indexOf(String(dow)) !== -1) tr.classList.add('is-today');
  });
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = today.getFullYear();

  /* ---------- Home page: short list of upcoming events (data in js/events-data.js) ---------- */
  var list = document.getElementById('events-list');
  if (list && GSB.upcoming) {
    var upcoming = GSB.upcoming(28).slice(0, 4);
    if (upcoming.length) {
      list.innerHTML = '';
      upcoming.forEach(function (ev) {
        var li = document.createElement('li');
        li.className = 'event';
        var date = document.createElement('div');
        date.className = 'event__date';
        var b = document.createElement('b');
        b.textContent = ev.date.getDate();
        var s = document.createElement('span');
        s.textContent = GSB.DAYS[ev.date.getDay()] + ' ' + GSB.MONTHS[ev.date.getMonth()];
        date.appendChild(b); date.appendChild(s);
        var body = document.createElement('div');
        body.className = 'event__body';
        var h = document.createElement('h3');
        h.textContent = ev.title;
        var p = document.createElement('p');
        p.textContent = [ev.time, ev.short].filter(Boolean).join('. ');
        body.appendChild(h); body.appendChild(p);
        li.appendChild(date); li.appendChild(body);
        list.appendChild(li);
      });
    }
  }

  /* ---------- Forms (Netlify Forms, submitted in place) ---------- */
  var MESSAGES = {
    booking: 'Booking request sent. We\'ll reply by email.',
    'booking-note': 'Note sent. We\'ll reply by email.',
    newsletter: 'Subscribed. See you at the next one.'
  };
  [].forEach.call(document.querySelectorAll('form[data-ajax]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var button = form.querySelector('button[type="submit"]');
      var label = button.textContent;
      status.className = 'form__status';
      status.textContent = '';
      button.disabled = true;
      button.textContent = 'Sending';
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (res) {
          if (!res.ok) throw new Error(String(res.status));
          form.reset();
          status.textContent = MESSAGES[form.getAttribute('name')] || 'Sent.';
        })
        .catch(function () {
          status.className = 'form__status is-error';
          status.textContent = 'That didn\'t send. Try again, or email howdy@garagesalevintage.com.';
        })
        .then(function () {
          button.disabled = false;
          button.textContent = label;
        });
    });
  });
})();
