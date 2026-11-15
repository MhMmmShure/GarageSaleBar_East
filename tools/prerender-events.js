#!/usr/bin/env node
/* Writes the event listings and their structured data into calendar.html.
   Run from the repo root after editing js/events-data.js:  node tools/prerender-events.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const SITE = 'https://www.garagesalebar.com';
const ctx = { window: {}, Intl, Date }; ctx.window.GSB = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/events-data.js'), 'utf8'), ctx);
const GSB = ctx.window.GSB;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = GSB.today();
const parse = s => { const p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
const nextOn = day => { const d = new Date(today); d.setDate(d.getDate() + ((day - d.getDay() + 7) % 7)); return d; };

const shows = GSB.ONE_OFFS.map(o => Object.assign({}, o, { dateObj: parse(o.date) })).filter(o => o.dateObj >= today).sort((a, b) => a.dateObj - b.dateObj);
const weekly = GSB.WEEKLY.slice().sort((a, b) => a.day - b.day);

function thumb(ev, badgeTop, badgeBottom) {
  let inner;
  if (ev.image) inner = `<img src="${esc(ev.image)}" alt="${esc(ev.title)} poster" loading="lazy">`;
  else if (ev.photo) inner = `<div class="pthumb"><div class="pthumb__ht"><img src="${esc(ev.photo)}" alt="${esc(ev.photoName || ev.title)}" loading="lazy"></div><div class="pthumb__wash" aria-hidden="true"></div><div class="pthumb__shade" aria-hidden="true"></div><div class="pthumb__frame" aria-hidden="true"></div><div class="pthumb__caption" aria-hidden="true">${ev.tag ? `<span class="pthumb__tag">${esc(ev.tag)}</span>` : ''}<span class="pthumb__name">${esc(ev.photoName || ev.title)}</span></div></div>`;
  else { const f = ev.flyer || { style: 'neon', big: ev.title, hand: '' }; inner = `<div class="flyer flyer--${esc(f.style || 'neon')}" aria-hidden="true"><span class="flyer__big">${esc(f.big || ev.title)}</span>${f.hand ? `<span class="flyer__hand">${esc(f.hand)}</span>` : ''}<span class="flyer__venue">Garage Sale Bar</span></div>`; }
  return `<div class="ecard__thumb">${inner}<div class="ecard__date"><b>${esc(badgeTop)}</b><span>${esc(badgeBottom)}</span></div></div>`;
}
function card(ev, badgeTop, badgeBottom) {
  const link = GSB.eventLink(ev);
  return `      <li class="ecard">${thumb(ev, badgeTop, badgeBottom)}<h3 class="ecard__title">${esc(ev.title)}</h3><p class="ecard__meta">${esc([ev.time, ev.price].filter(Boolean).join(', '))}</p><div class="ecard__descwrap"><p class="ecard__desc">${esc(ev.description || ev.short || '')}</p></div><a class="btn ecard__btn${link.kind === 'tickets' ? '' : ' btn--blue'}" href="${esc(link.href)}" target="_blank" rel="noopener">${esc(link.label)}</a></li>`;
}
const cards = [
  ...shows.map(s => card(s, s.dateObj.getDate(), GSB.DAYS[s.dateObj.getDay()] + ' ' + GSB.MONTHS[s.dateObj.getMonth()])),
  ...weekly.map(w => card(w, GSB.DAYS[w.day], 'Weekly'))
];

const place = { '@type': 'BarOrPub', '@id': SITE + '/#business', name: 'Garage Sale Bar', address: { '@type': 'PostalAddress', streetAddress: '747 Douglas Ave, Suite 101A', addressLocality: 'Nashville', addressRegion: 'TN', postalCode: '37207', addressCountry: 'US' } };
function eventLd(ev, date, recurring) {
  const o = { '@type': 'Event', name: ev.title, description: ev.description || ev.short || '', startDate: iso(date) + (ev.startTime ? 'T' + ev.startTime : ''), eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: place, organizer: { '@id': SITE + '/#business' }, url: SITE + '/calendar' };
  if (ev.photo || ev.image) o.image = SITE + '/' + (ev.image || ev.photo);
  if (ev.photoName) o.performer = { '@type': 'MusicGroup', name: ev.photoName };
  if (typeof ev.priceUSD === 'number') o.offers = { '@type': 'Offer', price: String(ev.priceUSD), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: ev.ticketUrl || SITE + '/calendar' };
  if (recurring) { o.eventSchedule = { '@type': 'Schedule', byDay: 'https://schema.org/' + DAY_FULL[ev.day], repeatFrequency: 'P1W', scheduleTimezone: 'America/Chicago' }; if (ev.startTime) o.eventSchedule.startTime = ev.startTime; if (ev.endTime) o.eventSchedule.endTime = ev.endTime; }
  return o;
}
const graph = [...shows.map(s => eventLd(s, s.dateObj, false)), ...weekly.map(w => eventLd(w, nextOn(w.day), true))];
const ld = '<script type="application/ld+json">\n' + JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1) + '\n</script>';

const file = path.join(root, 'calendar.html');
let html = fs.readFileSync(file, 'utf8');
const swap = (name, body) => { const re = new RegExp('<!-- ' + name + ':START -->[\\s\\S]*?<!-- ' + name + ':END -->'); if (!re.test(html)) throw new Error('Marker ' + name + ' not found in calendar.html'); html = html.replace(re, () => '<!-- ' + name + ':START -->\n' + body + '\n' + (name === 'EVENTS' ? '      ' : '') + '<!-- ' + name + ':END -->'); };
swap('EVENTS', cards.join('\n'));
swap('EVENTS-DATA', ld);
fs.writeFileSync(file, html);
console.log('calendar.html: ' + shows.length + ' show(s), ' + weekly.length + ' weekly night(s) written.');
