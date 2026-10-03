# Sakim Lab

Website for Sakim Lab: bars, restaurants and places created in Lisbon over 30+ years.

## Pages

The site is one long page, `index.html`: light paper, huge condensed type with photos set inside the lines, and a black pill bar on top.

| Section | What happens |
|---|---|
| Hero | The headline fills the screen; the photo inside it changes as the mouse moves (on a phone, on its own) |
| Studio | An editorial page between two rules: the quote, the numbers, two columns of text |
| Services | Four big lines that open on click; a round photo and a round colour follow the mouse |
| Projects | A dark room with one big screen; the names below change it, moving across it runs through the photos; it opens the project over the page |
| Process | Steps light up as you scroll, the photo beside them changes with each step |
| About | Each value is a round photo with a round colour that slides out on hover |
| Contact | The big lines again, then the ways to reach him |

A card at the bottom of the screen opens the booking conversation from anywhere.

Other files:

| File | Page |
|---|---|
| `lugares/<project>.html` | One page per project (also opens over the home page) |
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
    marca/                 the Sakim logo
    lisboa/                photos not tied to one place
    lugares/<place>/       photos shown on that place's page
    lugares/<place>/logo.jpg     the place's logo, when there is one
    lugares/<place>/arquivo/     every other photo of that place, kept but not shown
tools/
  content.py               every text on the site (PT and EN)
  places.py                photo list for each project
  build.py                 builds the pages
```

## Adding or changing photos

1. Put the photo in `assets/img/lugares/<place>/`.
2. Add it to that place's `photos` list in `tools/places.py`, in the position it should appear on the page.
3. Run `python3 tools/build.py`. The build stops if a listed photo is missing.

To show a photo from the archive, add it to the list the same way.
