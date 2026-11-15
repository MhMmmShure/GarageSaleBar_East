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

  function card(ev) {
    var li = el('li', 'ecard');
    li.appendChild(thumb(ev));
    var body = el('div', 'ecard__body');
    body.appendChild(el('h3', null, ev.title));
    var meta = [ev.time, ev.price].filter(Boolean).join(', ');
    if (meta) body.appendChild(el('p', 'ecard__meta', meta));
    body.appendChild(el('p', 'ecard__desc', ev.description || ev.short || ''));
    var link = GSB.eventLink(ev);
    var a = el('a', 'btn' + (link.kind === 'tickets' ? '' : ' btn--blue'), link.label);
    a.href = link.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', link.label + ': ' + ev.title + ', ' +
      GSB.DAYS[ev.date.getDay()] + ' ' + GSB.MONTHS[ev.date.getMonth()] + ' ' + ev.date.getDate());
    body.appendChild(a);
    li.appendChild(body);
    return li;
  }

  function render() {
    var next = all.slice(shown, shown + PAGE);
    next.forEach(function (ev) { grid.appendChild(card(ev)); });
    shown += next.length;
    if (more) more.hidden = shown >= all.length;
    if (count) count.textContent = 'Showing ' + shown + ' of ' + all.length + ' upcoming dates';
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
