"""Builds every page of the site from tools/places.py.

Run from the repository root:  python3 tools/build.py
It writes index.html, lugares.html (the map), sobre.html, metodo.html, contacto.html and lugares/<slug>.html.
"""
import datetime
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from places import PLACES, MAP, SITE_PHOTOS, photo_path, cover_path  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BY_SLUG = {p["slug"]: p for p in PLACES}
EMAIL = "studio@sakinlab.com"
INSTAGRAM = "sakinlab"
# His WhatsApp number in international format, digits only (e.g. "351912345678").
# Visitors can send their request on WhatsApp or by email; while this is empty only email is offered.
WHATSAPP = "351913915323"

# What he can take on. Shown on the method page and offered in the booking conversation.
SERVICES = [
    ("conceito", ("Conceito & identidade", "Concept & identity"),
     ("Nome, história, posicionamento, identidade visual.", "Name, story, positioning, visual identity.")),
    ("espaco", ("Espaço & atmosfera", "Space & atmosphere"),
     ("Decoração, luz, mobiliário, as zonas da casa.", "Décor, lighting, furniture, the zones of the house.")),
    ("ritmo", ("O ritmo do dia", "The rhythm of the day"),
     ("Horários, música, como o lugar muda da manhã à última ronda.", "Hours, music, how the place changes from morning to last round.")),
    ("cartas", ("Cartas", "Menus"),
     ("Cocktails, vinhos, petiscos, brunch, o prato do dia.", "Cocktails, wine, small plates, brunch, the dish of the day.")),
    ("fornecedores", ("Fornecedores", "Suppliers"),
     ("Produtores, vinhos, conservas, peças com história.", "Producers, wine, tinned fish, pieces with a past.")),
    ("negocio", ("Plano de negócio", "Business plan"),
     ("Investimento, custos e o que o lugar pode render.", "Investment, costs and what the place can earn.")),
    ("digital", ("Digital & redes", "Digital & social"),
     ("Instagram, Google, o calendário das primeiras semanas.", "Instagram, Google, the calendar for the first weeks.")),
    ("equipa", ("Equipa & serviço", "Team & service"),
     ("Manual de operação, formação, ritmo de serviço.", "Operations manual, training, the rhythm of service.")),
    ("abertura", ("Abertura", "Opening"),
     ("Soft opening, noite de inauguração, as primeiras semanas.", "Soft opening, opening night, the first weeks.")),
]


def v(rel):
    """Version tag for a CSS/JS file, so browsers fetch it again whenever it changes."""
    import hashlib
    with open(os.path.join(ROOT, rel), "rb") as f:
        return f"{rel}?v={hashlib.md5(f.read()).hexdigest()[:8]}"


def esc(s):
    return html.escape(s, quote=True)


def t(pt, en, tag="span", attrs=""):
    """Bilingual element: Portuguese by default, swapped to English by site.js."""
    a = f" {attrs}" if attrs else ""
    return f'<{tag}{a} data-pt="{esc(pt)}" data-en="{esc(en)}">{pt}</{tag}>'


def img(src, alt_pt, alt_en, cls="photo", extra=""):
    return (f'<img class="{cls}" src="{src}" alt="{esc(alt_pt)}" data-alt-pt="{esc(alt_pt)}" '
            f'data-alt-en="{esc(alt_en)}" loading="lazy"{extra}>')


def photo(slug, name):
    p = BY_SLUG[slug]
    for i, ph in enumerate(p["photos"]):
        if ph[1] == name:
            return photo_path(p, i), ph[2], ph[3]
    raise KeyError((slug, name))


NAV = [("lugares", "lugares.html", "Lugares", "Places"),
       ("sobre", "sobre.html", "Sobre", "About"),
       ("metodo", "metodo.html", "Método", "Method"),
       ("contacto", "contacto.html", "Marcar consulta", "Book a consultation")]


def shell(page, root, title, desc, body, head=""):
    def links():
        out = []
        for key, href, pt, en in NAV:
            cur = ' aria-current="page"' if key == page else ""
            cls = ' class="nav-cta"' if key == "contacto" else ""
            out.append(t(pt, en, "a", f'href="{"" if href.startswith("#") else root}{href}"{cls}{cur}'))
        return "\n    ".join(out)

    return f"""<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#0b0908">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<link rel="icon" href="{root}{SITE_PHOTOS[2]}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}{v("assets/css/site.css")}">
<script src="{root}{v("assets/js/gsap.min.js")}" defer></script>
<script src="{root}{v("assets/js/ScrollTrigger.min.js")}" defer></script>
<script src="{root}{v("assets/js/lenis.min.js")}" defer></script>
<script src="{root}{v("assets/js/site.js")}" defer></script>
{head}</head>
<body class="no-js" data-page="{page}">
{t("Saltar para o conteúdo", "Skip to content", "a", 'class="skip" href="#main"')}
<div class="grain" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span></span></div>
<div class="veil" aria-hidden="true">
  <div class="veil-num"><span>0</span><sup>+</sup></div>
  {t("Anos de noites em Lisboa", "Years of nights in Lisbon", "div", 'class="veil-cap mono"')}
</div>

{place_bar(root) if page == "lugar" else ""}<header class="nav"{' hidden' if page == "lugar" else ''}>
  <a href="{root}index.html" class="logo" aria-label="Sakim Lab"><span>Sakim</span><i></i><small>Lab</small></a>
  <nav class="nav-links" aria-label="Menu">
    {links()}
  </nav>
  <div class="nav-right">
    <span class="clock-nav mono">{t("Lisboa", "Lisbon")} <span class="js-clock">--:--</span></span>
    <div class="lang" role="group" aria-label="Idioma / Language">
      <button type="button" data-lang="pt" class="on">PT</button><button type="button" data-lang="en">EN</button>
    </div>
    {t("Consulta", "Book", "a", f'class="nav-book" href="{root}contacto.html"')}
    {t("Menu", "Menu", "button", 'type="button" class="menu-btn" aria-expanded="false" aria-controls="menu"')}
  </div>
</header>
<div class="menu" id="menu">
  {t("Início", "Home", "a", f'href="{root}index.html"' + (' aria-current="page"' if page == "home" else ""))}
  {links()}
</div>

{booking_drawer(root) if page not in ("contacto", "lugar") else ""}
{place_sheet() if page not in ("lugar",) else ""}
<main id="main">
{body}
{cta(root) if page not in ("contacto", "lugar") else ""}
</main>

<footer{' hidden' if page == "lugar" else ''}>
  {t("Até <em>já.</em>", "See you <em>soon.</em>", "a", f'class="bye" href="{root}contacto.html"')}
  <div class="foot mono">
    <span><span class="js-greet">Boa noite</span> — {t("em Lisboa são", "in Lisbon it's")} <span class="js-clock">--:--</span></span>
    <span class="foot-links"><a href="mailto:{EMAIL}">Email</a><a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener">Instagram</a><span>© <span class="js-year">2026</span> Sakim Lab</span></span>
  </div>
</footer>
</body>
</html>
"""


def back_label():
    return t("← Voltar", "← Back")


def place_bar(root):
    """The only navigation on a place page: back to the map, and the language."""
    return f"""<div class="place-bar">
  <a class="back" href="{root}lugares.html">{back_label()}</a>
  <div class="lang" role="group" aria-label="Idioma / Language">
    <button type="button" data-lang="pt" class="on">PT</button><button type="button" data-lang="en">EN</button>
  </div>
</div>
"""


def place_sheet():
    """Places open over the page in this sheet, with only a way back."""
    return f"""<div class="sheet" id="sheet" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="sheet-bar"><button type="button" class="back">{back_label()}</button></div>
  <div class="sheet-body" data-lenis-prevent></div>
</div>
"""


def cta(root):
    """Invitation to book, closing every page except the booking page itself."""
    return f"""  <section class="cta">
    <div>
      {t("Pronto para construir <em>algo real?</em>", "Ready to build <em>something real?</em>", "h2")}
      {t("Umas perguntas rápidas, e o resto conversamos à mesa.", "A few quick questions, and we'll talk about the rest at the table.", "p")}
    </div>
    <a class="btn" href="{root}contacto.html">{t("Marcar consulta", "Book a consultation")} <span aria-hidden="true">→</span></a>
  </section>"""


def hero_lines(*pairs):
    return "\n".join(f'<span class="line">{t(pt, en)}</span>' for pt, en in pairs)


MANIFESTO = {
    "pt": ("Um lugar não é paredes e um balcão. É a luz às onze da noite, a música um pouco mais alta do que devia, "
           "o copo que chega antes de o pedir, o estranho que à saída já é amigo. Passei a vida a afinar estes "
           "detalhes invisíveis — são eles que as pessoas levam para casa."),
    "en": ("A place isn't walls and a counter. It's the light at eleven at night, the music a little louder than it "
           "should be, the glass that arrives before you ask, the stranger who leaves as a friend. I've spent my life "
           "tuning those invisible details — they're what people take home."),
}


# ---------------------------------------------------------------- HOME
def build_home():
    slides = [cover_path(BY_SLUG[s]) for s in ("a-tabacaria", "so-what", "social-b", "sakim")]
    slide_html = "\n      ".join(
        f'<img class="photo on" src="{s}" alt="">' if i == 0 else f'<img class="photo" src="{s}" alt="" loading="lazy">'
        for i, s in enumerate(slides))
    nights = []
    for slug in ["sakim", "so-what", "a-tabacaria"]:
        p = BY_SLUG[slug]
        nights.append(f"""
  <a class="night" href="lugares/{slug}.html" data-cursor="Entrar">
    <img class="photo" src="{cover_path(p)}" alt="" loading="lazy">
    <div class="night-body">
      <div>{t(p["where"]["pt"], p["where"]["en"], "span", 'class="mono"')}<div class="night-name">{p["name"]}</div></div>
      <div>{t(p["line"]["pt"], p["line"]["en"], "p", 'class="night-line"')}
        <span class="link-arrow">{t("Entrar", "Step inside")} <b>→</b></span></div>
    </div>
  </a>""")
    body = f"""
  <section class="hero hero-home">
    <div class="hero-media slides" aria-hidden="true">
      {slide_html}
    </div>
    <div class="hero-content">
      <h1>
{hero_lines(("Não desenho bares.", "I don't design bars."), ("Desenho <em>experiências.</em>", "I design <em>experiences.</em>"))}
      </h1>
      <div class="hero-foot">
        {t("Há mais de trinta anos que crio bares, restaurantes e lugares em Lisboa — do primeiro esboço à última ronda.",
           "For more than thirty years I've been creating bars, restaurants and places in Lisbon — from the first sketch to the last round.",
           "p", 'class="hero-sub"')}
        <div class="hero-actions">
          <a class="btn" href="contacto.html">{t("Marcar consulta", "Book a consultation")} <span aria-hidden="true">→</span></a>
          <div class="scroll-cue mono"><b></b>{t("A noite começa aqui", "The night starts here")}</div>
        </div>
      </div>
    </div>
  </section>

  <section class="nights" aria-label="Três noites">
    <div class="nights-head">
      <div>{t("Três noites", "Three nights", "div", 'class="label mono"')}
      {t("Cada lugar,<br>uma <em>pergunta.</em>", "Every place,<br>a <em>question.</em>", "h2")}</div>
      <a class="link-arrow" href="lugares.html">{t("Ver todos no mapa", "See them all on the map")} <b>→</b></a>
    </div>
    {"".join(nights)}
  </section>
"""
    return shell("home", "", "Sakim Lab — Lugares para a noite, Lisboa",
                 "Há mais de trinta anos a criar bares, restaurantes e lugares em Lisboa — do primeiro esboço à última ronda.", body)


# ---------------------------------------------------------------- PLACES
def build_places():
    body, head = places_section()
    return shell("lugares", "", "Lugares — Sakim Lab",
                 "Trinta anos de bares, restaurantes e lugares em Lisboa e além, num mapa que acende ano a ano.", body, head)


# ---------------------------------------------------------------- ABOUT
def build_about():
    manifesto_pt = MANIFESTO["pt"]
    manifesto_en = MANIFESTO["en"]
    slides = [cover_path(BY_SLUG[s]) for s in ("a-tabacaria", "so-what", "social-b", "sakim")]
    slide_html = "\n      ".join(
        f'<img class="photo on" src="{s}" alt="">' if i == 0 else f'<img class="photo" src="{s}" alt="" loading="lazy">'
        for i, s in enumerate(slides))
    body = f"""
  <section class="hero hero-about">
    <div class="hero-media slides" aria-hidden="true">
      {slide_html}
    </div>
    <div class="hero-content">
      <div class="hero-eyebrow mono">{t("Sobre", "About")}<span>38°42′N 9°08′W</span></div>
      <h1>
{hero_lines(("Trinta anos", "Thirty years"), ("de <em>noites.</em>", "of <em>nights.</em>"))}
      </h1>
      <div class="hero-foot">
        {t("Há mais de trinta anos que crio bares, restaurantes e lugares em Lisboa — do primeiro esboço à última ronda.",
           "For more than thirty years I've been creating bars, restaurants and places in Lisbon — from the first sketch to the last round.",
           "p", 'class="hero-sub"')}
        <div class="scroll-cue mono"><b></b>{t("Continue", "Keep going")}</div>
      </div>
    </div>
  </section>
  <section class="manifesto">
    {t("Sobre", "About", "div", 'class="label mono"')}
    <p class="manifesto-text" id="manifesto-text" data-pt="{esc(manifesto_pt)}" data-en="{esc(manifesto_en)}">{manifesto_pt}</p>
    <div class="manifesto-sign mono" data-reveal>
      <img src="{SITE_PHOTOS[2]}" alt="Sakim">
      {t("Sakim — Lisboa", "Sakim — Lisbon")}
    </div>
  </section>

  <section class="window">
    <div class="window-sticky">
      <div class="window-img"><img class="photo" src="{SITE_PHOTOS[3]}" alt="" loading="lazy"></div>
      <div class="window-text">
        {t("Cada lugar começa com uma pergunta — e só acaba quando alguém <em>não quer ir para casa.</em>",
           "Every place begins with a question — and only ends when someone <em>doesn't want to go home.</em>", "p")}
        <a class="link-arrow" href="lugares.html">{t("Todos os lugares", "All the places")} <b>→</b></a>
        <a class="link-arrow" href="metodo.html">{t("Como trabalho", "How I work")} <b>→</b></a>
        <a class="link-arrow" href="contacto.html">{t("Marcar consulta", "Book a consultation")} <b>→</b></a>
      </div>
    </div>
  </section>
"""
    return shell("sobre", "", "Sobre — Sakim Lab",
                 "Há mais de trinta anos a afinar os detalhes invisíveis de bares, restaurantes e lugares em Lisboa.", body)


# ---------------------------------------------------------------- PLACES INDEX
# The map is a stylised drawing of central Lisbon, projected from real coordinates.
MAP_BOX = (-9.175, -9.105, 38.698, 38.728)          # lon min, lon max, lat min, lat max
MAP_W = 1000
SHORE = [(38.6995, -9.1760), (38.7030, -9.1620), (38.7050, -9.1520), (38.7056, -9.1460),
         (38.7062, -9.1400), (38.7068, -9.1345), (38.7085, -9.1290), (38.7110, -9.1250),
         (38.7135, -9.1215), (38.7175, -9.1165), (38.7230, -9.1110), (38.7290, -9.1040)]
HOODS = [("Príncipe Real", 38.7168, -9.1495), ("Bairro Alto", 38.7136, -9.1452),
         ("Santos", 38.7072, -9.1585), ("Baixa", 38.7118, -9.1378), ("Mouraria", 38.7160, -9.1360),
         ("Castelo", 38.7139, -9.1334), ("Graça", 38.7178, -9.1308), ("Alfama", 38.7105, -9.1290),
         ("Cais do Sodré", 38.7052, -9.1478), ("Santa Apolónia", 38.7162, -9.1205)]


def project(lat, lon):
    import math
    lon0, lon1, lat0, lat1 = MAP_BOX
    k = math.cos(math.radians((lat0 + lat1) / 2))
    scale = MAP_W / ((lon1 - lon0) * k)
    return round((lon - lon0) * k * scale, 1), round((lat1 - lat) * scale, 1)


def map_svg(placed):
    _, h = project(MAP_BOX[2], MAP_BOX[0])
    shore = [project(lat, lon) for lat, lon in SHORE]
    river = "M" + " L".join(f"{x},{y}" for x, y in shore) + f" L{MAP_W + 20},{h + 20} L-20,{h + 20} Z"
    hoods = "".join(f'<text class="hood" x="{x}" y="{y}">{name}</text>'
                    for name, lat, lon in HOODS for x, y in [project(lat, lon)])
    rx, ry = project(38.7015, -9.1430)
    dots = []
    for i, p in placed:
        x, y = project(*MAP[p["slug"]]["geo"])
        label = (f'<text class="dot-label" x="{x - 12}" y="{y + 4}" text-anchor="end">' if x > 650 or MAP[p["slug"]].get("label") == "left"
                 else f'<text class="dot-label" x="{x + 12}" y="{y + 4}">')
        dots.append(f'<a class="dot" href="lugares/{p["slug"]}.html" data-i="{i}" data-year="{MAP[p["slug"]]["year"] or ""}" data-cursor="Entrar" aria-label="{esc(p["name"])}">'
                    f'<circle class="dot-hit" cx="{x}" cy="{y}" r="18"/><circle class="dot-ring" cx="{x}" cy="{y}" r="7"/>'
                    f'<circle class="dot-core" cx="{x}" cy="{y}" r="5"/>{label}{esc(p["name"])}</text></a>')
    return (f'<svg class="map-svg" viewBox="0 0 {MAP_W} {h}" data-mobile-box="200 150 520 560" data-hero-box="-292 -40 1150 719" role="img" aria-label="Lisboa">'
            f'<defs><linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a35e" stop-opacity=".16"/>'
            f'<stop offset="1" stop-color="#f0a35e" stop-opacity=".02"/></linearGradient></defs>'
            f'<path class="river" d="{river}"/>'
            f'<path class="shore" d="M' + " L".join(f"{x},{y}" for x, y in shore) + '"/>'
            f'<text class="river-name" x="{rx}" y="{ry}">Tejo</text>{hoods}{"".join(dots)}</svg>')


def places_section():
    placed = [(i, p) for i, p in enumerate(PLACES) if MAP[p["slug"]].get("geo")]
    far = [(i, p) for i, p in enumerate(PLACES) if MAP[p["slug"]].get("far")]
    unplaced = [(i, p) for i, p in enumerate(PLACES) if not MAP[p["slug"]].get("geo") and not MAP[p["slug"]].get("far")]

    cards = {}
    for i, p in enumerate(PLACES):
        m = MAP[p["slug"]]
        cards[i] = {"name": p["name"], "href": f"lugares/{p['slug']}.html", "cover": cover_path(p),
                    "where": p["where"], "line": p["line"], "addr": m.get("addr", ""),
                    "geo": m.get("geo"), "year": m.get("year"), "left": m.get("label") == "left"}

    far_links = "".join(
        '<a class="far" href="lugares/' + p["slug"] + '.html" data-year="' + str(MAP[p["slug"]]["year"] or "") + '" data-cursor="Entrar"><span aria-hidden="true">↓</span> '
        + t(p["where"]["pt"], p["where"]["en"], "span", 'class="mono"') + " <b>" + p["name"] + "</b></a>" for i, p in far)
    gaps = "".join(f'<a href="lugares/{p["slug"]}.html">{p["name"]}</a>' for i, p in unplaced)
    first_year = 1996
    ticks = sorted({MAP[p["slug"]]["year"] for p in PLACES if MAP[p["slug"]]["year"]})
    tick_marks = "".join(f'<span style="--at:{y}" title="{y}"></span>' for y in ticks)

    body = f"""
  <section class="map-hero" id="lugares">
      <div class="map-hero-text">
        <h1>
{hero_lines(("Trinta anos de", "Thirty years of"), ("<em>portas abertas.</em>", "<em>open doors.</em>"))}
        </h1>
        {t("Quase todas em Lisboa. Veja-as acender, uma a uma.",
           "Almost all of them in Lisbon. Watch them light up, one by one.", "p", 'class="hero-sub"')}
        <a class="btn" href="contacto.html">{t("Marcar consulta", "Book a consultation")} <span aria-hidden="true">→</span></a>
      </div>
    <div class="map-wrap">
      <div class="map-gl" id="map-gl" aria-label="Mapa de Lisboa"></div>
      {map_svg(placed)}
      <div class="map-shade" aria-hidden="true"></div>
      <div class="map-far">{far_links}</div>
      <div class="map-card" hidden></div>
      <div class="map-time">
        <div class="odo serif" aria-hidden="true"><span class="odo-col"><span class="odo-strip"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i></span></span><span class="odo-col"><span class="odo-strip"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i></span></span><span class="odo-col"><span class="odo-strip"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i></span></span><span class="odo-col"><span class="odo-strip"><i>0</i><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i><i>7</i><i>8</i><i>9</i><i>0</i></span></span></div>
        <span class="sr-only" id="map-year" aria-live="polite">{first_year}</span>
        <button type="button" class="years-play" aria-label="Play">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-play" d="M8 5v14l11-7z"/><path class="i-pause" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
        </button>
        <div class="years-track" style="--from:{first_year};--to:{datetime.date.today().year}">
          <div class="years-ticks" aria-hidden="true">{tick_marks}</div>
          <input type="range" id="years-range" min="{first_year}" max="{datetime.date.today().year}" step="any" value="{first_year}" aria-label="Ano">
          <span class="years-flag mono" id="map-opened" aria-live="polite"></span>
        </div>
      </div>
    </div>
  </section>
  <section class="map-after">
    <div class="map-gaps">
      {t("Ainda sem lugar no mapa", "Not on the map yet", "span", 'class="mono"')}
      <div>{gaps}</div>
    </div>
  </section>
  <script type="application/json" id="places-data">{json.dumps({"first": first_year, "last": datetime.date.today().year, "places": cards}, ensure_ascii=False)}</script>
"""
    head = (f'<link rel="stylesheet" href="{v("assets/css/maplibre-gl.css")}">\n'
            f'<script src="{v("assets/js/maplibre-gl.js")}" defer></script>\n')
    return body, head


# ---------------------------------------------------------------- PLACE PAGE
LAYOUT = ["f-full", "f-narrow-l", "f-narrow-r", "f-center", "f-left", "f-right", "f-narrow-l", "f-narrow-r"]


def build_place(i):
    p = PLACES[i]
    root = "../"
    logo = f'<img class="logo-mark" src="{root}assets/img/lugares/{p["slug"]}/logo.jpg" alt="">' if "logo" in p else ""

    frames = []
    for j, ph in enumerate(p["photos"]):
        _, _, alt_pt, alt_en = ph
        cls = LAYOUT[j % len(LAYOUT)] if len(p["photos"]) > 3 else ("f-full" if j == 0 else ["f-narrow-l", "f-narrow-r"][j % 2])
        frames.append(f"""
    <figure class="frame {cls}">
      {img(root + photo_path(p, j), alt_pt, alt_en)}
      <figcaption>{j + 1:02d} — {t(alt_pt, alt_en)}</figcaption>
    </figure>""")

    body = f"""
  <div class="place-content" data-place="{p["slug"]}">
  <section class="hero place-hero{"" if p["photos"] else " no-photo"}">
    {f'<div class="hero-media" aria-hidden="true"><img class="photo" src="{root}{cover_path(p)}" alt=""></div>' if cover_path(p) else ""}
    <div class="hero-content">
      <div class="hero-eyebrow mono">
        <span>{i + 1:02d} / {len(PLACES)}</span>
        {t(p["where"]["pt"], p["where"]["en"])}
        {t(p["kind"]["pt"], p["kind"]["en"])}
      </div>
      <h1><span class="line"><span>{p["name"]}</span></span></h1>
    </div>
    {logo}
  </section>

  <section class="lead">
    {t(p["line"]["pt"], p["line"]["en"], "p", "data-reveal")}
  </section>

  <section class="story">
    {t("A pergunta", "The question", "div", 'class="label mono"')}
    <div data-reveal>
      {t(p["question"]["pt"], p["question"]["en"], "p")}
      <p class="story-did">{t("O que desenhei:", "What I shaped:")} {t(p["did"]["pt"], p["did"]["en"])}</p>
    </div>
  </section>

  {f'<section class="frames" aria-label="Fotografias">{"".join(frames)}</section>' if frames else '<p class="no-photos mono">' + t("Ainda sem fotografias — em breve.", "No photos yet — coming soon.") + '</p>'}
  </div>

"""
    return shell("lugar", root, f"{p['name']} — Sakim Lab", p["line"]["pt"], body)


# ---------------------------------------------------------------- METHOD
ACTS = [
    ("18:00", "#c8742b", ("A <em>porta</em>", "The <em>door</em>"),
     ("Antes de tudo, uma pergunta: porque é que alguém há-de atravessar esta porta? Conceito, posicionamento, nome, história — a razão de existir.",
      "Before anything, one question: why would anyone walk through this door? Concept, positioning, name, story — the reason to exist."),
     ("a-tabacaria", "porta-a-noite")),
    ("20:00", "#e8621a", ("A <em>luz</em>", "The <em>light</em>"),
     ("Um espaço tem de se sentir antes de se ver. Atmosfera, interiores, materiais, objectos com história — e a luz certa à hora certa.",
      "A space should be felt before it's seen. Atmosphere, interiors, materials, objects with a past — and the right light at the right hour."),
     ("velha-senhora", "candeeiros")),
    ("22:00", "#b8322a", ("O <em>copo</em>", "The <em>glass</em>"),
     ("A carta, o bar, o vinho, o prato que se partilha ao centro da mesa. Tudo tem de contar a mesma história, do primeiro gole à conta.",
      "The menu, the bar, the wine, the plate shared in the middle of the table. Everything has to tell the same story, from first sip to the bill."),
     ("a-tabacaria", "vermelho")),
    ("00:00", "#6b2a6e", ("As <em>pessoas</em>", "The <em>people</em>"),
     ("Um lugar só ganha alma com quem lá trabalha e com quem lá vai. Equipa, formação, ritmo de serviço, música — até a casa funcionar de olhos fechados.",
      "A place only gets its soul from the people who work there and the people who come. Team, training, the rhythm of service, music — until the house runs with its eyes closed."),
     ("so-what", "sala-cheia")),
    ("02:00", "#24365e", ("A última <em>ronda</em>", "The last <em>round</em>"),
     ("Estou lá na noite de abertura, e fico depois dela. Ouvir, ajustar, afinar — porque um lugar nunca está terminado.",
      "I'm there on opening night, and I stay after it. Listening, adjusting, fine-tuning — because a place is never finished."),
     ("o-terraco", "hora-azul")),
]


def build_method():
    acts = []
    for time, glow, title, text, (slug, name) in ACTS:
        src, alt_pt, alt_en = photo(slug, name)
        acts.append(f"""
      <article class="act" data-glow="{glow}">
        <div>
          <div class="act-time">{time}</div>
          {t(title[0], title[1], "h2")}
          {t(text[0], text[1], "p")}
          <a class="link-arrow" href="lugares/{slug}.html">{BY_SLUG[slug]["name"]} <b>→</b></a>
        </div>
        <div class="act-img">{img(src, alt_pt, alt_en)}</div>
      </article>""")
    services = "".join(f"""
      <li data-reveal><span class="mono">{i + 1:02d}</span>{t(name[0], name[1], "h3")}{t(desc[0], desc[1], "p")}</li>"""
                       for i, (_, name, desc) in enumerate(SERVICES))
    body = f"""
  <section class="acts">
    <div class="acts-glow" aria-hidden="true"></div>
    <div class="acts-head">
      <div>
        {t("Método", "Method", "div", 'class="label mono"')}
        {t("Uma noite<br>em <em>cinco actos.</em>", "A night<br>in <em>five acts.</em>", "h1")}
        {t("Todos os lugares que criei seguiram a mesma noite, da pergunta à última ronda. É assim que trabalho.",
           "Every place I've created has followed the same night, from the question to the last round. This is how I work.", "p")}
      </div>
      <div class="dial" aria-hidden="true">
        <svg viewBox="-50 -50 100 100">
          <circle r="48" fill="none" stroke="rgba(239,231,218,.18)" stroke-width=".6"/>
          <g id="dial-ticks"></g>
          <line id="dial-hand" x1="0" y1="0" x2="0" y2="-34" stroke="#e8621a" stroke-width="1.6" stroke-linecap="round" transform="rotate(180)"/>
          <circle r="2.4" fill="#e8621a"/>
        </svg>
        <span class="dial-time mono" id="dial-time">18:00</span>
      </div>
    </div>
    <div class="acts-track">{"".join(acts)}
    </div>
  </section>

  <section class="services">
    <div class="services-head">
      {t("Do zero à porta aberta", "From zero to opening night", "div", 'class="label mono"')}
      {t("A noite inteira — <em>ou só a parte que falta.</em>", "The whole night — <em>or just the part that's missing.</em>", "h2", 'class="page-title"')}
      {t("Um lugar novo, de raiz. Algumas peças de um projecto que já anda. Ou um negócio que já existe e quer melhorar alguma coisa. Cada conversa começa no ponto em que está.",
         "A new place, from scratch. A few pieces of a project already under way. Or an existing business that wants to improve something. Every conversation starts where you are.", "p")}
    </div>
    <ol class="services-list">{services}
    </ol>
  </section>

  <section class="quote">
    {t("“Um conceito sem estratégia é teatro. Estratégia sem conceito é <em>maquinaria.</em>”",
       "“A concept without strategy is theatre. Strategy without concept is <em>machinery.</em>”", "blockquote", "data-reveal")}
    <a class="link-arrow" href="contacto.html">{t("Marcar consulta", "Book a consultation")} <b>→</b></a>
  </section>
"""
    return shell("metodo", "", "Método — Sakim Lab",
                 "Uma noite em cinco actos: a porta, a luz, o copo, as pessoas e a última ronda. É assim que Sakim cria lugares.", body)


# ---------------------------------------------------------------- BOOKING
def booking_chat(root=""):
    """The conversation: on the booking page, and in the side panel on every other page."""
    data = {
        "whatsapp": WHATSAPP,
        "email": EMAIL,
        "services": [{"id": k, "pt": n[0], "en": n[1]} for k, n, _ in SERVICES],
    }
    return f"""<div class="chat" id="booking" aria-live="polite">
      <div class="chat-head">
        <img src="{root}{SITE_PHOTOS[2]}" alt="">
        <div><strong>Sakim</strong>{t("Responde em pessoa", "Replies in person", "span", 'class="mono"')}</div>
        {t("Recomeçar", "Start again", "button", 'type="button" class="chat-restart mono" hidden')}
      </div>
      <div class="chat-log" id="chat-log"></div>
      <div class="chat-input" id="chat-input"></div>
      <noscript><p class="chat-msg">{t("Escreva-me para", "Write to me at")} <a href="mailto:{EMAIL}">{EMAIL}</a>.</p></noscript>
    </div>
  <script type="application/json" id="booking-data">{json.dumps(data, ensure_ascii=False)}</script>"""


def booking_drawer(root):
    return f"""
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-scrim" data-close></div>
  <aside class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <div class="drawer-top">
      <div>{t("Consulta", "Consultation", "span", 'class="mono"')}
      {t("Pronto para construir <em>algo real?</em>", "Ready to build <em>something real?</em>", "h2", 'id="drawer-title"')}</div>
      <button type="button" class="drawer-close" data-close aria-label="Fechar / Close">×</button>
    </div>
    {booking_chat(root)}
  </aside>
</div>"""


def build_contact():
    body = f"""
  <section class="booking">
    <div class="booking-intro">
      {t("Consulta", "Consultation", "div", 'class="label mono"')}
      <h1><span class="line">{t("Pronto para construir", "Ready to build")}</span><span class="line">{t("algo real?", "something real?")}</span><span class="line">{t("<em>Marque a sua consulta.</em>", "<em>Book your consultation.</em>")}</span></h1>
      {t("Umas perguntas rápidas, nada mais. O resto conversamos à mesa — de preferência com um copo à frente.",
         "A few quick questions, nothing more. We'll talk about the rest at the table — ideally with a glass in front of us.", "p", 'class="booking-sub"')}
      <div class="links">
        <a href="mailto:{EMAIL}" data-cursor="Email"><span class="mono">Email</span><span>{EMAIL}</span></a>
        <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener" data-cursor="Insta"><span class="mono">Instagram</span><span>@{INSTAGRAM}</span></a>
      </div>
    </div>
    {booking_chat()}
  </section>
"""
    return shell("contacto", "", "Marcar consulta — Sakim Lab",
                 "Pronto para construir algo real? Marque a sua consulta: três perguntas e o resto conversamos à mesa.", body)


def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", rel)


def main():
    for i, p in enumerate(PLACES):
        for j in range(len(p["photos"])):
            assert os.path.exists(os.path.join(ROOT, photo_path(p, j))), photo_path(p, j)
        if cover_path(p):
            assert os.path.exists(os.path.join(ROOT, cover_path(p))), cover_path(p)
    write("index.html", build_home())
    write("lugares.html", build_places())
    write("sobre.html", build_about())
    write("metodo.html", build_method())
    write("contacto.html", build_contact())
    for i, p in enumerate(PLACES):
        write(f"lugares/{p['slug']}.html", build_place(i))


if __name__ == "__main__":
    main()
