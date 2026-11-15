# Garage Sale Bar — East Nashville

Static one-page site for Garage Sale Bar (747 Douglas Ave, Suite 101A, Nashville, TN 37207).
No build step: plain HTML, CSS and JavaScript.

## Structure

- `index.html` — all page content (hero, vintage, bar, happy hour, menu, events, booking, map, footer)
- `css/styles.css` — styles; brand colors and fonts are CSS variables at the top
- `js/main.js` — scroll effects, today's hours, upcoming events, form submission
- `assets/` — logo, collage art, SVG illustrations and self-hosted fonts

## Common edits

- **Menu**: edit the `<section class="menu">` block in `index.html`.
- **Weekly nights / one-off shows**: edit `WEEKLY` and `ONE_OFFS` near the bottom of `js/main.js`.
  Upcoming dates are generated from these, so the list never goes stale.
- **Hours**: update the footer table in `index.html` and `HOURS` in `js/main.js`.

## Forms

The booking and newsletter forms use Netlify Forms (`data-netlify="true"`).
They start collecting submissions once the site is deployed on Netlify with form detection enabled.

## Preview locally

    python3 -m http.server 8000
