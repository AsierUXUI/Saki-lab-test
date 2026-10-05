# Sakim Lab

Website for Sakim Lab: bars, restaurants and places created in Lisbon over 30+ years.

## Pages

The site is one long page, `index.html`: light paper, huge condensed type with photos set inside the lines, and a black pill bar on top.

| Section | What happens |
|---|---|
| Hero | The headline over columns of bar photos drifting on their own; the photo inside the headline changes by itself; under the cursor the headline ripples like water |
| Studio | An editorial page between two rules: the quote, the numbers, two columns of text |
| Services | Four big lines that open on click; a round photo and a round colour follow the mouse |
| Projects | A horizontal gallery: the section holds still while scrolling down moves sideways through one big photo per bar; it opens the project over the page (swiped on phones) |
| Process | One evening from 18:00 to opening: the five steps on a line that moves sideways as you scroll, the section going from day to night (down the page on phones) |
| About | Each value is a round photo with a round colour that slides out on hover |
| Contact | The big lines again, then the ways to reach him |

A card at the bottom of the screen opens the booking conversation from anywhere.

Every time the home page loads (and when the logo is clicked) an intro plays: the logo, the name in a pill, a window onto a bar that fills the screen and then lands inside the headline. A click skips it. It does not play for links to a section or a project (`index.html#projectos`, `index.html#/so-what`), or with reduced motion.

Other files:

| File | Page |
|---|---|
| `lugares/<project>.html` | One page per project (also opens over the home page): name, description, the services it had, a still map of where it is, and its photos in a grid |
| `contacto.html` | Book a conversation (it also opens as a side panel from every page) |
| `lugares.html`, `sobre.html`, `metodo.html` | Old addresses; they forward to their section |

All pages are generated. **Don't edit the HTML files by hand.** The words are in `tools/content.py` (taken from the original site, PT and EN), the photos in `tools/places.py`, and the layout in `tools/build.py`. After a change, run:

```bash
python3 tools/build.py
```

## Folders

```
assets/
  css/site.css             styles for every page
  fonts/                   Anton, Newsreader and Roboto Mono (open licences), served from the site
  js/site.js               the light effects, language switch, booking conversation
  js/*.min.js              GSAP, ScrollTrigger and Lenis
  img/
    mini/                  small copies of the photos for the moving grid (made by tools/thumbs.py)
    marca/                 the Sakim logo
    lisboa/                photos not tied to one place
    lugares/<place>/       photos shown on that place's page
    lugares/<place>/logo.jpg     the place's logo, when there is one
    lugares/<place>/arquivo/     every other photo of that place, kept but not shown
tools/
  content.py               every text on the site (PT and EN)
  places.py                photo list for each project
  build.py                 builds the pages
  thumbs.py                makes the small copies in assets/img/mini (run after adding photos)
```

## Project pages

- **Where it is:** `GEO` in `tools/places.py` (coordinates, zoom, and `pin`, `area` or nothing while the address is unknown). The map is drawn with MapLibre (`assets/js/maplibre-gl.js`, loaded only when a map comes into view) from OpenFreeMap: free, no API key, fine for commercial use. It is a still picture, not draggable.
- **Which services it had:** `SERVICES_DONE` in `tools/places.py`, e.g. `"some-project": ["A", "B"]`. Projects not listed had all four.
- **Photo sizes:** photos that were sharp to begin with are shown larger. Their original sizes are in `tools/photo_sizes.json`.

## Adding or changing photos

1. Put the photo in `assets/img/lugares/<place>/`.
2. Add it to that place's `photos` list in `tools/places.py`, in the position it should appear on the page.
3. Run `python3 tools/build.py`. The build stops if a listed photo is missing.

To show a photo from the archive, add it to the list the same way.
