# Garage Sale Bar — East Nashville

Static one-page site for Garage Sale Bar (747 Douglas Ave, Suite 101A, Nashville, TN 37207).
No build step: plain HTML, CSS and JavaScript.

## Structure

- `index.html` — home page (hero, vintage, bar, happy hour, menu, short events list, booking, map, footer)
- `events.html` — full events listing with thumbnails, descriptions and ticket/social links
- `js/events-data.js` — the event data both pages are built from
- `css/styles.css` — styles; brand colors and fonts are CSS variables at the top
- `js/main.js` — scroll effects, today's hours, upcoming events, form submission
- `assets/` — logo, collage art, SVG illustrations and self-hosted fonts

## Common edits

- **Menu**: edit the `<section class="menu">` block in `index.html`.
- **Weekly nights / one-off shows**: edit `WEEKLY` and `ONE_OFFS` in `js/events-data.js` (fields are documented at the top).
  Upcoming dates are generated from these, so the lists never go stale. Each event's button goes to its
  ticket link, or its social post if there are no tickets. Put poster images in `assets/img/events/`.
- **Header / footer**: these are repeated in each `.html` file, so change them in every page.
- **Hours**: update the footer table in `index.html` and `HOURS` in `js/main.js`.

## Forms

The booking and newsletter forms use Netlify Forms (`data-netlify="true"`).
They start collecting submissions once the site is deployed on Netlify with form detection enabled.

## Preview locally

    python3 -m http.server 8000
