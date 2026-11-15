/* Garage Sale Bar — events page listing (built from js/events-data.js) */
(function () {
  'use strict';
  var GSB = window.GSB;
  var grid = document.getElementById('events-grid');
  if (!GSB || !grid) return;

  var PAGE = 9;          // cards shown per "page"
  var HORIZON = 70;      // days ahead to list
  var all = GSB.upcoming(HORIZON);
  var shown = 0;
  var more = document.getElementById('events-more');
  var count = document.getElementById('events-count');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function thumb(ev) {
    var wrap = el('div', 'ecard__thumb');
    if (ev.image) {
      var img = el('img');
      img.src = ev.image;
      img.alt = ev.title + ' poster';
      img.loading = 'lazy';
      wrap.appendChild(img);
    } else if (ev.photo) {
      var ph = el('div', 'pthumb');
      var ht = el('div', 'pthumb__ht');
      var pimg = el('img');
      pimg.src = ev.photo;
      pimg.alt = (ev.photoName || ev.title);
      pimg.loading = 'lazy';
      ht.appendChild(pimg);
      ph.appendChild(ht);
      var deco = ['pthumb__wash', 'pthumb__shade', 'pthumb__frame'];
      deco.forEach(function (c) { var d = el('div', c); d.setAttribute('aria-hidden', 'true'); ph.appendChild(d); });
      var cap = el('div', 'pthumb__caption');
      cap.setAttribute('aria-hidden', 'true');
      if (ev.tag) cap.appendChild(el('span', 'pthumb__tag', ev.tag));
      cap.appendChild(el('span', 'pthumb__name', ev.photoName || ev.title));
      ph.appendChild(cap);
      wrap.appendChild(ph);
    } else {
      var f = ev.flyer || { style: 'neon', big: ev.title, hand: '' };
      var flyer = el('div', 'flyer flyer--' + (f.style || 'neon'));
      flyer.setAttribute('aria-hidden', 'true');
      flyer.appendChild(el('span', 'flyer__big', f.big || ev.title));
      if (f.hand) flyer.appendChild(el('span', 'flyer__hand', f.hand));
      flyer.appendChild(el('span', 'flyer__venue', 'Garage Sale Bar'));
      wrap.appendChild(flyer);
    }
    var badge = el('div', 'ecard__date');
    badge.appendChild(el('b', null, ev.date.getDate()));
    badge.appendChild(el('span', null, GSB.DAYS[ev.date.getDay()] + ' ' + GSB.MONTHS[ev.date.getMonth()]));
    wrap.appendChild(badge);
    return wrap;
  }

  var uid = 0;

  /* Card rows, in this order on every card so they line up across a row:
     thumbnail, title (max 2 lines), time/price (1 line), description (3 lines, rest behind "More"), button */
  function card(ev) {
    var li = el('li', 'ecard');
    li.appendChild(thumb(ev));

    var title = el('h3', 'ecard__title', ev.title);
    title.title = ev.title;
    li.appendChild(title);

    li.appendChild(el('p', 'ecard__meta', [ev.time, ev.price].filter(Boolean).join(', ')));

    var text = ev.description || ev.short || '';
    var wrap = el('div', 'ecard__descwrap');
    var desc = el('p', 'ecard__desc', text);
    wrap.appendChild(desc);
    var id = 'ecard-full-' + (++uid);
    var moreBtn = el('button', 'ecard__more', 'Read more');
    moreBtn.type = 'button';
    moreBtn.hidden = true;
    moreBtn.setAttribute('aria-expanded', 'false');
    moreBtn.setAttribute('aria-controls', id);
    moreBtn.setAttribute('aria-label', 'Read more about ' + ev.title);
    wrap.appendChild(moreBtn);
    var full = el('div', 'ecard__full');
    full.id = id;
    full.appendChild(el('p', null, text));
    var closeBtn = el('button', 'ecard__close', 'Close');
    closeBtn.type = 'button';
    full.appendChild(closeBtn);
    wrap.appendChild(full);
    function setOpen(open) {
      wrap.classList.toggle('is-open', open);
      moreBtn.setAttribute('aria-expanded', String(open));
    }
    moreBtn.addEventListener('click', function () { setOpen(!wrap.classList.contains('is-open')); });
    closeBtn.addEventListener('click', function () { setOpen(false); moreBtn.focus(); });
    wrap._close = function () { setOpen(false); };
    li.appendChild(wrap);

    var link = GSB.eventLink(ev);
    var a = el('a', 'btn ecard__btn' + (link.kind === 'tickets' ? '' : ' btn--blue'), link.label);
    a.href = link.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', link.label + ': ' + ev.title + ', ' +
      GSB.DAYS[ev.date.getDay()] + ' ' + GSB.MONTHS[ev.date.getMonth()] + ' ' + ev.date.getDate());
    li.appendChild(a);
    return li;
  }

  /* Show "Read more" only on cards whose description is actually cut off */
  function markTruncated() {
    [].forEach.call(grid.querySelectorAll('.ecard__descwrap'), function (wrap) {
      var desc = wrap.querySelector('.ecard__desc');
      var cut = desc.scrollHeight > desc.clientHeight + 1;
      wrap.classList.toggle('is-truncated', cut);
      wrap.querySelector('.ecard__more').hidden = !cut;
      if (!cut && wrap._close) wrap._close();
    });
  }
  function closeAll(except) {
    [].forEach.call(grid.querySelectorAll('.ecard__descwrap.is-open'), function (w) {
      if (w !== except && w._close) w._close();
    });
  }
  document.addEventListener('click', function (e) {
    closeAll(e.target.closest ? e.target.closest('.ecard__descwrap') : null);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(null); });
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(markTruncated, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(markTruncated);

  function render() {
    var next = all.slice(shown, shown + PAGE);
    next.forEach(function (ev) { grid.appendChild(card(ev)); });
    shown += next.length;
    if (more) more.hidden = shown >= all.length;
    if (count) count.textContent = 'Showing ' + shown + ' of ' + all.length + ' upcoming dates';
    markTruncated();
  }

  grid.innerHTML = '';
  if (!all.length) {
    var empty = el('li', 'ecard ecard--empty');
    empty.appendChild(el('p', null, 'No dates are listed right now. New shows are announced on Instagram first.'));
    grid.appendChild(empty);
    if (more) more.hidden = true;
    return;
  }
  render();
  if (more) more.addEventListener('click', render);
})();
