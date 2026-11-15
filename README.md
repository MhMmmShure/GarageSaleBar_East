# Garage Sale Bar — East Nashville

Static one-page site for Garage Sale Bar (747 Douglas Ave, Suite 101A, Nashville, TN 37207).
No build step: plain HTML, CSS and JavaScript.

## Structure

- `index.html` — home page (hero, vintage, bar, happy hour, menu, short events list, booking, map, footer)
- `vintage.html` — vintage page (mission, what's on the racks, vendor application)
- `book.html` — private events page with the fill-in-the-blanks booking note
- `calendar.html` — full events listing with thumbnails, descriptions and ticket/social links
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

## After changing events

Run `node tools/prerender-events.js`. It reads `js/events-data.js` and writes the listings and their
event data into `calendar.html`, so search and answer engines can read them without running scripts.

## Search files

- `robots.txt`, `sitemap.xml`, `_redirects` (old Squarespace addresses) and `404.html`.
- Canonical and share tags assume the site lives at https://www.garagesalebar.com.

## Forms

The booking form (home), booking note (book.html) and newsletter forms use Netlify Forms (`data-netlify="true"`).
They start collecting submissions once the site is deployed on Netlify with form detection enabled.

## Preview locally

    python3 -m http.server 8000

## Brand components

- **Cutout headings**: add `class="ransom" data-ransom` to any heading and the letters are cut out automatically.
- **Alternate lockup**: the `<svg class="lockup">` block (see any footer).
- **Eyes, lips, collage banner**: `assets/img/eye-*.webp`, `eyes-strip.webp`, `lips.webp`, `collage-banner-neon.webp`.
