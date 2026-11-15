/* Garage Sale Bar — event data
   This is the only file to edit when events change. Both the home page (short list)
   and events.html (full listing) are built from it.

   Fields
     title        Event name
     day          WEEKLY only: 0 = Sunday ... 6 = Saturday
     date         ONE_OFFS only: 'YYYY-MM-DD'
     time         Shown after the date, e.g. '7 to 10 PM' or 'Doors 9 PM'
     short        One line for the home page list
     description  Longer text for the events page (see the writing guide below)
     price        Optional, e.g. '$10 cover'
     ticketUrl    Link to tickets. Leave '' if there are none.
     socialUrl    Link to the social post about the event. Used when there is no ticketUrl.
                  If both are '', the button goes to the Instagram profile.
     linkLabel    Optional button text for a socialUrl that is not a single post, e.g. 'Ross on Instagram'.
     photo        Artist photo for shows, e.g. 'assets/img/events/ross-livermore.jpg' (square, 800px or larger).
                  The site applies the halftone + neon treatment and adds the name, so use a plain photo.
     photoName    Name shown in neon over the photo. Defaults to the title.
     tag          Optional small sticker on the photo, e.g. 'Live show'.
     image        Optional finished poster, shown exactly as supplied (square works best).
                  Order of use: image, then photo, then a flyer drawn from `flyer`.
     flyer        { style: 'paper' | 'pink' | 'blue' | 'green' | 'neon', big: 'BIG WORDS', hand: 'small words' }

   Writing guide for event cards (every card has the same rows, so they line up)
     title        Up to about 45 characters. Shows on 2 lines at most; longer titles are cut with "...".
     time/price   One line, about 30 characters, e.g. 'Doors 9 PM, $10 cover'.
     description  The first 3 lines (roughly 110 characters) are always visible, so lead with
                  who is playing and what kind of night it is. Anything longer is cut with "..."
                  and the full text opens on hover or with "Read more". Keep the full text
                  under about 400 characters; link out for anything longer.
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
    {
      date: '2026-11-20',
      title: 'Ross Livermore',
      time: '9:30 PM to 12 AM',
      short: 'Live show. $10 at the door.',
      description: 'Nashville singer-songwriter Ross Livermore plays soul-leaning rock and R&B, sung in a powerful tenor. Originally from Peabody, Massachusetts, he has been based in Nashville for years. Tickets are $10 at the door.',
      price: '$10 at the door',
      ticketUrl: '',
      socialUrl: 'https://www.instagram.com/rosslivermore',
      linkLabel: 'Ross on Instagram',
      photo: 'assets/img/events/placeholder-artist.svg',   // stand-in: replace with a real photo of the artist
      photoName: 'Ross Livermore',
      tag: 'Live show',
      image: '',
      flyer: { style: 'neon', big: 'Ross Livermore', hand: 'live' }
    }
    /* Copy the block above for each new show. */
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
    if (ev.socialUrl) return { href: ev.socialUrl, label: ev.linkLabel || 'See the post', kind: 'social' };
    return { href: GSB.INSTAGRAM, label: 'See it on Instagram', kind: 'social' };
  };

  GSB.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  GSB.DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
})();
