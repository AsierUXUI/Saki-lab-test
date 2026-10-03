# Sakim Lab

Website for Sakim Lab: bars, restaurants and places created in Lisbon over 30+ years.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: the hero, then the map of Lisbon with the years |
| `sobre.html` | About: the manifesto and three featured places |
| `lugares/<place>.html` | One page per place |
| `metodo.html` | How he works: a night in five acts |
| `contacto.html` | Book a conversation |
| `lugares.html` | Old address; forwards to the map on the home page |

Where each place is on the map and the year it opened live in `MAP` at the end of `tools/places.py`.

All pages are generated. **Don't edit the HTML files by hand.** Edit `tools/places.py` (place texts and photos) or `tools/build.py` (the other page texts and layout), then run:

```bash
python3 tools/build.py
```

## Folders

```
assets/
  css/site.css             styles for every page
  js/site.js               animations, language switch, page transitions
  js/*.min.js              GSAP, ScrollTrigger and Lenis
  img/
    marca/                 the Sakim logo
    lisboa/                photos not tied to one place
    lugares/<place>/       photos shown on that place's page
    lugares/<place>/logo.jpg     the place's logo, when there is one
    lugares/<place>/arquivo/     every other photo of that place, kept but not shown
tools/
  places.py                texts and photo list for each place
  build.py                 builds the pages
```

## Adding or changing photos

1. Put the photo in `assets/img/lugares/<place>/`.
2. Add it to that place's `photos` list in `tools/places.py`, in the position it should appear on the page.
3. Run `python3 tools/build.py`. The build stops if a listed photo is missing.

To show a photo from the archive, add it to the list the same way.
