/* Garage Sale Bar — event data
   This is the only file to edit when events change. Both the home page (short list)
   and events.html (full listing) are built from it.

   Fields
     title        Event name
     day          WEEKLY only: 0 = Sunday ... 6 = Saturday
     date         ONE_OFFS only: 'YYYY-MM-DD'
     time         Shown after the date, e.g. '7 to 10 PM' or 'Doors 9 PM'
     short        One line for the home page list
     description  Longer text for the events page
     price        Optional, e.g. '$10 cover'
     ticketUrl    Link to tickets. Leave '' if there are none.
     socialUrl    Link to the social post about the event. Used when there is no ticketUrl.
                  If both are '', the button goes to the Instagram profile.
     image        Optional poster/thumbnail, e.g. 'assets/img/events/jake-morgan.jpg' (square works best).
                  If '', a flyer is drawn from `flyer`.
     flyer        { style: 'paper' | 'pink' | 'blue' | 'green' | 'neon', big: 'BIG WORDS', hand: 'small words' }
*/
(function () {
  'use strict';
  var GSB = window.GSB = window.GSB || {};

  GSB.INSTAGRAM = 'https://www.instagram.com/garagesalebar/';

  GSB.WEEKLY = [
    {
      day: 1,
      title: "Nashville Tour Stop Writers' Round",
      time: '7 to 10 PM',
      short: 'Local songwriters in the round, hosted by Nashville Tour Stop.',
      description: 'Nashville songwriters take turns playing their own songs in the round. Hosted every Monday by Nashville Tour Stop.',
      price: '',
      ticketUrl: '',
      socialUrl: '',
      image: '',
      flyer: { style: 'paper', big: "Writers' Round", hand: 'Mondays' }
    },
    {
      day: 2,
      title: 'Karaoke Tuesdays',
      time: 'From 8 PM',
      short: 'Hosted by Sma.',
      description: 'Pick a song and take the mic. Karaoke runs every Tuesday from 8 PM, with Sma hosting.',
      price: '',
      ticketUrl: '',
      socialUrl: '',
      image: '',
      flyer: { style: 'pink', big: 'Karaoke', hand: 'Tuesdays' }
    }
  ];

  GSB.ONE_OFFS = [
    /* Example:
    {
      date: '2026-12-31',
      title: "New Year's Eve",
      time: 'Doors 9 PM',
      short: 'Ring it in at Garage Sale.',
      description: 'Longer description for the events page.',
      price: '$10 cover',
      ticketUrl: 'https://www.eventbrite.com/...',
      socialUrl: '',
      image: '',
      flyer: { style: 'neon', big: 'NYE', hand: 'at Garage Sale' }
    }
    */
  ];

  /* Today's date in Nashville, as a local-midnight Date */
  GSB.today = function () {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago', year: 'numeric', month: 'numeric', day: 'numeric'
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return new Date(+o.year, +o.month - 1, +o.day);
    } catch (e) {
      var d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  };

  /* All events from today through the next `days` days, soonest first */
  GSB.upcoming = function (days) {
    var today = GSB.today();
    var out = [];
    function withDate(ev, date, weekly) {
      var copy = {};
      for (var k in ev) copy[k] = ev[k];
      copy.date = date;
      copy.weekly = weekly;
      return copy;
    }
    for (var i = 0; i <= days; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      GSB.WEEKLY.forEach(function (w) {
        if (w.day === d.getDay()) out.push(withDate(w, d, true));
      });
    }
    var last = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
    GSB.ONE_OFFS.forEach(function (o) {
      var p = String(o.date).split('-');
      var od = new Date(+p[0], +p[1] - 1, +p[2]);
      if (od >= today && od <= last) out.push(withDate(o, od, false));
    });
    out.sort(function (a, b) { return a.date - b.date || (a.weekly ? 1 : -1); });
    return out;
  };

  /* Where an event's button goes: tickets first, then the social post, then the profile */
  GSB.eventLink = function (ev) {
    if (ev.ticketUrl) return { href: ev.ticketUrl, label: 'Get tickets', kind: 'tickets' };
    if (ev.socialUrl) return { href: ev.socialUrl, label: 'See the post', kind: 'social' };
    return { href: GSB.INSTAGRAM, label: 'See it on Instagram', kind: 'social' };
  };

  GSB.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  GSB.DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
})();
