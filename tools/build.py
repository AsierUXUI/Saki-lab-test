"""Builds the site from tools/content.py (the words) and tools/places.py (the photos).

Run from the repository root:  python3 tools/build.py
It writes index.html (the whole site, one long page), contacto.html (the booking page),
lugares/<slug>.html (one page per project, also opened over the home page),
and small pages that forward old addresses (lugares.html, sobre.html, metodo.html).
"""
import datetime
import hashlib
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from places import PLACES, SITE_PHOTOS, GEO, photo_path, cover_path, services_done  # noqa: E402
from icons import icon, AREAS, ITEMS  # noqa: E402
from content import (NAV, START, HERO, STUDIO, SERVICES, PROJECTS, PROJECT_TEXT, PROJECT_ORDER,  # noqa: E402
                     PROCESS, ABOUT, CONTACT, PRESS, PRESS_LABEL, PRESS_TITLE, MIKAS)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BY_SLUG = {p["slug"]: p for p in PLACES}
EMAIL = "studio@sakinlab.com"
INSTAGRAM = "sakinlab"
# His WhatsApp number in international format, digits only.
# Visitors can send their request on WhatsApp or by email; while this is empty only email is offered.
WHATSAPP = "351913915323"
WHATSAPP_SHOWN = "+351 913 915 323"

# Photos that appear inside the headline, in order
TORCH = [("a-tabacaria", "balcao"), ("so-what", "abobada-acesa"), ("social-b", "bar-violeta"),
         ("o-terraco", "lanternas"), ("velha-senhora", "candeeiros"), ("sakim", "sala-comprida"),
         ("clube-ferroviario", "anoitecer"), ("bicaense", "jardim-de-luz"), ("ricucu", "porta-roxa"),
         ("monte-da-lua", "cabana-a-noite")]


def esc(s):
    return html.escape(s, quote=True)


def v(rel):
    """Version tag for a CSS/JS file, so browsers fetch it again whenever it changes."""
    with open(os.path.join(ROOT, rel), "rb") as f:
        return f"{rel}?v={hashlib.md5(f.read()).hexdigest()[:8]}"


def t(pt, en, tag="span", attrs=""):
    """Bilingual element: Portuguese by default, swapped to English by site.js."""
    a = f" {attrs}" if attrs else ""
    return f'<{tag}{a} data-pt="{esc(pt)}" data-en="{esc(en)}">{pt}</{tag}>'


def tp(pair, tag="span", attrs=""):
    return t(pair[0], pair[1], tag, attrs)


def photo(slug, name):
    p = BY_SLUG[slug]
    for i, ph in enumerate(p["photos"]):
        if ph[1] == name:
            return photo_path(p, i), ph[2], ph[3]
    raise KeyError((slug, name))


def img(src, alt_pt, alt_en, cls="photo", extra=""):
    return (f'<img class="{cls}" src="{src}" alt="{esc(alt_pt)}" data-alt-pt="{esc(alt_pt)}" '
            f'data-alt-en="{esc(alt_en)}" loading="lazy"{extra}>')


# ---------------------------------------------------------------- SHELL
def plain(s):
    """Text without tags, for the big condensed lines."""
    return re.sub(r"<[^>]+>", "", s)


def lang_pill():
    return """<div class="pill pill-lang lang" role="group" aria-label="Idioma / Language">
    <button type="button" data-lang="pt" class="on">PT</button><button type="button" data-lang="en">EN</button>
  </div>"""


def shell(page, root, title, desc, body, head=""):
    home = page == "home"
    links = "\n      ".join(tp(name, "a", f'href="{"" if home else root + "index.html"}#{key}" data-sec="{key}"')
                           for key, name in NAV if key != "contacto")
    menu_links = "\n      ".join(tp(name, "a", f'href="{"" if home else root + "index.html"}#{key}"') for key, name in NAV)
    if page == "lugar":
        top = f"""<header class="bar">
  {t("← Voltar", "← Back", "a", f'class="pill pill-back" href="{root}index.html#projectos"')}
  {lang_pill()}
</header>"""
    else:
        top = f"""<header class="bar">
  <a href="{root}index.html#top" class="pill pill-logo" aria-label="Sakim Lab"><span class="pill-icon"><img src="{root}{SITE_PHOTOS[2]}" alt=""></span><span>Sakim Lab</span></a>
  <nav class="pill pill-links" aria-label="Menu">
      {links}
  </nav>
  {lang_pill()}
  <button type="button" class="pill-round menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Menu"><i></i></button>
</header>
<aside class="menu" id="menu" aria-hidden="true">
  <div class="menu-scrim" data-close-menu></div>
  <div class="menu-panel">
    {t("Fechar ✕", "Close ✕", "button", 'type="button" class="menu-close mono" data-close-menu')}
    <nav>
      {menu_links}
    </nav>
    {tp(START, "a", f'class="btn" href="{root}contacto.html"')}
  </div>
</aside>"""
    overlays = ""
    if page not in ("contacto", "lugar"):
        overlays += booking_drawer(root)
        overlays += f"""
<a class="dock" href="{root}contacto.html">
  <img src="{root}{photo('a-tabacaria', 'balcao')[0]}" alt="">
  <span>{tp(START, "b")}{t("[Uma conversa à mesa]", "[A conversation at the table]", "small")}</span>
</a>"""
    if page == "home":
        overlays += place_sheet()
        overlays += f"""
<div class="intro" aria-hidden="true">
  <div class="intro-bg"></div>
  <div class="intro-mark"><span class="intro-dot"><img src="{root}{SITE_PHOTOS[2]}" alt=""></span><span class="intro-word"><span>Sakim Lab</span></span></div>
  <div class="intro-win"><img alt=""><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i></div>
</div>"""
        # decided before the first paint, so the page never flashes before the intro
        # every full load plays it, except links that jump to a section or open a project (#projectos, #/so-what)
        head += """<script>try{if((!location.hash||location.hash==='#top')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro-on')}catch(e){}</script>
"""
    year = datetime.date.today().year
    footer = "" if page == "lugar" else f"""
<footer class="foot mono">
  <span>© {year} Sakim Lab · {tp(CONTACT["rights"])}</span>
  <span><a href="mailto:{EMAIL}">Email</a> · <a href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a> · <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener">Instagram</a></span>
</footer>"""
    return f"""<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#e9e6e0">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<link rel="icon" href="{root}{SITE_PHOTOS[2]}">
<link rel="preload" href="{root}assets/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{root}assets/fonts/newsreader-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{root}{v("assets/css/site.css")}">
<script src="{root}{v("assets/js/gsap.min.js")}" defer></script>
<script src="{root}{v("assets/js/ScrollTrigger.min.js")}" defer></script>
<script src="{root}{v("assets/js/lenis.min.js")}" defer></script>
<script src="{root}{v("assets/js/site.js")}" defer></script>
{head}</head>
<body class="no-js" data-page="{page}">
{t("Saltar para o conteúdo", "Skip to content", "a", 'class="skip" href="#main"')}
<div class="cursor" aria-hidden="true"><span></span></div>
{top}
{overlays}
<main id="main">
{body}
</main>
{footer}
</body>
</html>
"""


# ---------------------------------------------------------------- BOOKING (the conversation)
def booking_chat(root=""):
    data = {
        "whatsapp": WHATSAPP,
        "email": EMAIL,
        "services": [{"id": a["letter"], "pt": a["name"][0], "en": a["name"][1]} for a in SERVICES["areas"]],
    }
    return f"""<div class="chat" id="booking" aria-live="polite">
      <div class="chat-head">
        <img src="{root}{SITE_PHOTOS[2]}" alt="">
        <div><strong>Sakim</strong>{t("Responde em pessoa", "Replies in person", "span", 'class="mono"')}</div>
        {t("Recomeçar", "Start again", "button", 'type="button" class="chat-restart mono" hidden')}
      </div>
      <div class="chat-log" id="chat-log"></div>
      <div class="chat-input" id="chat-input"></div>
      <noscript><p class="chat-msg">{t("Escreva-nos para", "Write to us at")} <a href="mailto:{EMAIL}">{EMAIL}</a>.</p></noscript>
    </div>
  <script type="application/json" id="booking-data">{json.dumps(data, ensure_ascii=False)}</script>"""


def booking_drawer(root):
    return f"""
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-scrim" data-close></div>
  <aside class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <div class="drawer-top">
      <div>{tp(CONTACT["label"], "span", 'class="mono"')}
      {t("Pronto para Construir <em>Algo Real?</em>", "Ready to Build <em>Something Real?</em>", "h2", 'id="drawer-title"')}</div>
      <button type="button" class="drawer-close" data-close aria-label="Fechar / Close">×</button>
    </div>
    {booking_chat(root)}
  </aside>
</div>"""


def place_sheet():
    return f"""
<div class="sheet" id="sheet" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="sheet-bar">{t("← Voltar", "← Back", "button", 'type="button" class="pill pill-back back"')}</div>
  <div class="sheet-body" data-lenis-prevent></div>
</div>"""


# ---------------------------------------------------------------- HOME: one long page
def accent_stop(text):
    """A full stop at the end of a big line is set in the accent colour."""
    return text[:-1] + '<span class="acc">.</span>' if text.endswith(".") else text


def mega(pair, pic_row=None, pics=None, cls="", tag="h1"):
    """Big condensed lines. A strip of photos can sit at the end of one line."""
    pt_rows, en_rows = [plain(x) for x in pair[0].split("<br>")], [plain(x) for x in pair[1].split("<br>")]
    rows = []
    for i, (rp, re_) in enumerate(zip(pt_rows, en_rows)):
        pic = ""
        if i == pic_row and pics:
            imgs = "".join(f'<img class="photo{" on" if j == 0 else ""}" src="{pc[0]}" alt="" data-name="{esc(pc[1])}"'
                           + (f' data-meta-pt="{esc(pc[2][0])}" data-meta-en="{esc(pc[2][1])}"' if len(pc) > 2 else "")
                           + f'{"" if j < 2 else " loading=" + chr(34) + "lazy" + chr(34)}>' for j, pc in enumerate(pics))
            pic = f' <span class="pic" aria-hidden="true">{imgs}</span>'
        tall = " row-acc" if re.search("[ÁÀÂÃÉÊÈÍÓÔÕÚáàâãéêèíóôõú]", rp + re_) else ""
        rows.append(f'<span class="row{tall}">{t(accent_stop(rp), accent_stop(re_))}{pic}</span>')
    label = esc(plain(pair[0].replace("<br>", " ")))
    return f'<{tag} class="mega {cls}" aria-label="{label}" data-label-pt="{label}" data-label-en="{esc(plain(pair[1].replace("<br>", " ")))}">{"".join(rows)}</{tag}>'


def label(pair, attrs=""):
    return tp((f"[ {pair[0]} ]", f"[ {pair[1]} ]"), "p", f'class="tag mono"{(" " + attrs) if attrs else ""}')


HERO_PICS = TORCH
# opening years confirmed online (Time Out, Observador, Público, listings); others are left without one
YEARS = {"bicaense": 2002, "clube-ferroviario": 2010, "a-tabacaria": 2015, "social-b": 2018, "so-what": 2024}
# the photo inside the headline: only the three bars that look best, alternating
HEADLINE_PICS = [("a-tabacaria", "balcao"), ("so-what", "abobada-acesa"), ("social-b", "bar-violeta"),
                 ("a-tabacaria", "fachada"), ("so-what", "telefone-vermelho"), ("social-b", "bartenders"),
                 ("a-tabacaria", "sala-a-noite"), ("so-what", "sala-cheia"), ("social-b", "musica"),
                 ("a-tabacaria", "ultima-luz"), ("so-what", "tunel-vermelho"), ("social-b", "balcao-rosas")]
CONTACT_PICS = [("sakim", "mesa-longa"), ("so-what", "mesa-posta"), ("a-tabacaria", "espuma"), ("o-terraco", "hora-azul")]


def hero_photos():
    """The photos inside the headline: the cover of every project, then a second photo of each."""
    out = [(slug, BY_SLUG[slug]["cover"]) for slug in PROJECT_ORDER]
    for slug in PROJECT_ORDER:
        other = [ph[1] for ph in BY_SLUG[slug]["photos"] if ph[1] != BY_SLUG[slug]["cover"]]
        if other:
            out.append((slug, other[len(other) // 2]))
    return [(slug, ph, photo(slug, ph)[0]) for slug, ph in out[:28]]


def hero_drift(cols=6):
    """Behind the headline: columns of bar photos drifting up and down on their own, like a slow carousel.
    Uses the small copies made by tools/thumbs.py; each column is repeated once so the loop has no seam."""
    minis = [src.replace("img/lugares/", "img/mini/") for _, _, src in hero_photos()]
    columns = []
    for c in range(cols):
        col = minis[c::cols]
        imgs = "".join(f'<img src="{m}" alt="" loading="{"eager" if c < 4 and k < 3 else "lazy"}">' for k, m in enumerate(col + col))
        columns.append(f'<div class="drift-col">{imgs}</div>')
    return f'<div class="hero-drift" aria-hidden="true">{"".join(columns)}</div>'


def pics_of(lst):
    return [(photo(s, n)[0], PROJECT_TEXT[s]["name"]) for s, n in lst]


def press_section():
    """In the press: a bar through time; pointing at an article shows its teaser underneath."""
    dated = sorted([a for a in PRESS if a["year"]], key=lambda a: a["year"])
    undated = [a for a in PRESS if not a["year"]]
    stops, teasers, last = [], [], None
    for i, a in enumerate(dated + undated):
        if a["about"] == "mikas":
            about, src = "Mikas", SITE_PHOTOS[2]
        else:
            about = PROJECT_TEXT[a["about"]]["name"]
            src = cover_path(BY_SLUG[a["about"]]).replace("img/lugares/", "img/mini/")
        year = str(a["year"]) if a["year"] else ""
        # the year is written where it changes; undated articles get one "Sem data" mark
        mark = (year or t("Sem data", "Undated")) if year != last else ""
        last = year
        stops.append(f"""
        <li class="stop{" on" if i == 0 else ""}{" new-year" if mark else ""}">
          <span class="stop-year mono">{mark}</span>
          <button type="button" data-i="{i}" aria-label="{esc(a["outlet"] + ": " + a["title"])}"><i></i></button>
        </li>""")
        teasers.append(f"""
        <div class="teaser{" on" if i == 0 else ""}" data-i="{i}">
          <img src="{src}" alt="" loading="lazy">
          <span class="teaser-text">
            <span class="teaser-meta mono"><b>{esc(a["outlet"])}</b><span>{year}</span><span>{esc(about)}</span></span>
            <span class="teaser-title">“{esc(a["title"])}”</span>
            <a class="teaser-read mono" href="{esc(a["url"])}" target="_blank" rel="noopener">{t("Ler artigo", "Read the article")} ↗</a>
          </span>
        </div>""")
    return f"""<div class="press" id="imprensa">
      <div class="press-head">
        {label(PRESS_LABEL)}
        {tp(PRESS_TITLE, "h3", 'class="sec-title"')}
      </div>
      <div class="timeline">
        <ol class="stops">{"".join(stops)}
        </ol>
      </div>
      <div class="teasers">
        <div class="track">{"".join(teasers)}
        </div>
      </div>

    </div>"""


def build_home():
    # HERO: the headline set huge, with a photo inside it that changes on its own
    pics = [(photo(slug, ph)[0], PROJECT_TEXT[slug]["name"], PROJECT_TEXT[slug]["meta"]) for slug, ph in HEADLINE_PICS]
    first = PROJECT_TEXT[HEADLINE_PICS[0][0]]
    hero = f"""
  <section class="hero" id="top">
    {hero_drift()}
    <div class="hero-wash" aria-hidden="true"></div>
    {mega(HERO["title"], 1, pics, "hero-mega")}
    <div class="hero-foot">
      <p class="tag mono pic-name" aria-hidden="true">[ <b>{esc(first["name"])}</b> · <span>{esc(first["meta"][0])}</span> ]</p>
      {tp(HERO["sub"], "p", 'class="hero-sub"')}
    </div>
  </section>"""

    # STUDIO: an editorial page between two rules
    stats = "".join(f'<span><b>{n}</b> {tp(lbl)}</span>' for n, lbl in STUDIO["stats"])
    studio = f"""
  <section class="editorial" id="estudio">
    <div class="ed-page">
      {mega((plain(STUDIO["label"][0]), plain(STUDIO["label"][1])), cls="mega-s", tag="h2")}
      {tp(STUDIO["quote"], "blockquote", 'class="ed-title"')}
      <div class="ed-meta mono">{stats}</div>
      <div class="ed-cols">
        {tp(STUDIO["body"], "p")}
        {tp(ABOUT["paras"][0], "p")}
      </div>
    </div>
  </section>"""

    # SERVICES: four big lines; on hover the name turns orange and the icon moves
    areas = []
    for k, a in enumerate(SERVICES["areas"]):
        items = "".join(f'<li>{icon(ic, "item-icon")}{tp(n, "h4")}{tp(d, "p")}</li>'
                        for (n, d), ic in zip(a["items"], ITEMS[a["letter"]]))
        areas.append(f"""
      <li class="area" data-move="{["spin", "tilt", "swing", "hop"][k]}">
        <button type="button" class="area-head" aria-expanded="false">
          <span class="area-icon">{icon(AREAS[a["letter"]])}</span>
          <span class="area-title">
            {t(f"Serviço {a['letter']} · {len(a['items'])} incluídos", f"Service {a['letter']} · {len(a['items'])} included", "span", 'class="area-letter mono"')}
            {tp(a["name"], "span", 'class="area-name"')}
          </span>
          {tp(a["summary"], "span", 'class="area-sum"')}
          <span class="area-more mono">{t("Ver", "See")}<i aria-hidden="true">+</i></span>
        </button>
        <div class="area-body"><ul>{items}</ul></div>
      </li>""")
    services = f"""
  <section class="services" id="servicos">
    <div class="sec-head">
      {label(SERVICES["label"])}
      {tp(SERVICES["title"], "h2", 'class="sec-title"')}
      {tp(SERVICES["body"], "p", 'class="sec-body"')}
    </div>
    <ol class="areas">{"".join(areas)}
    </ol>
    <div class="inline-cta">
      {tp(SERVICES["cta"], "p")}
      {t("Agendar uma Consulta", "Schedule a Consultation", "a", 'class="btn magnetic" href="contacto.html"')}
    </div>
  </section>"""

    # PROJECTS: a horizontal gallery; scrolling down moves sideways through the bars, one big photo each
    cards = []
    for n, slug in enumerate(PROJECT_ORDER):
        p, tx = BY_SLUG[slug], PROJECT_TEXT[slug]
        year = YEARS.get(slug)
        meta_pt = tx["meta"][0] + (f" · {year}" if year else "")
        meta_en = tx["meta"][1] + (f" · {year}" if year else "")
        cards.append(f"""
      <a class="pg-card" href="lugares/{slug}.html" data-cursor="{PROJECTS["open"][0]}" data-cursor-en="{PROJECTS["open"][1]}">
        <figure><img class="photo" src="{cover_path(p)}" alt="" loading="{"eager" if n < 3 else "lazy"}"></figure>
        <span class="pg-n mono">{n + 1:02d}</span>
        <span class="pg-name">{esc(tx["name"])}</span>
        {t(meta_pt, meta_en, "span", 'class="pg-meta mono"')}
      </a>""")
    projects = f"""
  <section class="projects" id="projectos">
    <div class="pg-pin">
      <div class="pg-head">
        {label(PROJECTS["label"])}
        {tp(PROJECTS["title"], "h2", 'class="sec-title"')}
        <p class="pg-count mono"><b>01</b> / {len(PROJECT_ORDER):02d}</p>
      </div>
      <div class="pg-viewport">
        <div class="pg-track">{"".join(cards)}
        </div>
      </div>
      <div class="pg-bar" aria-hidden="true"><i></i></div>
    </div>
  </section>"""

    # PROCESS: an evening, from 18:00 to opening; the steps lie along one line and the section goes from day to night
    times = ["18:00", "19:30", "21:00", "22:30", "00:00"]
    steps = []
    for i, ((n, d), hour) in enumerate(zip(PROCESS["steps"], times)):
        steps.append(f"""
        <li class="night-step">
          <span class="night-time">{hour}</span>
          <span class="night-dot" aria-hidden="true"></span>
          <span class="mono night-n">[ {i + 1:02d} ]</span>
          {tp(n, "h3")}
          {tp(d, "p")}
        </li>""")
    process = f"""
  <section class="process night" id="processo">
    <div class="night-pin">
      <div class="night-head">
        {label(PROCESS["label"])}
        {mega((plain(PROCESS["title"][0]), plain(PROCESS["title"][1])), cls="mega-s", tag="h2")}
        {tp(PROCESS["body"], "p", 'class="sec-body"')}
      </div>
      <div class="night-viewport">
        <ol class="night-track">
          <li class="night-line" aria-hidden="true"><i></i></li>{"".join(steps)}
        </ol>
      </div>
    </div>
  </section>"""

    # ABOUT: an editorial page; each value is a round photo with a round colour behind it
    values = []
    for name, desc, (slug, ph) in ABOUT["values"]:
        values.append(f"""
      <li class="value"><span class="circles" aria-hidden="true"><img class="photo" src="{photo(slug, ph)[0]}" alt="" loading="lazy"><i></i></span>
        <div>{tp(name, "h4")}{tp(desc, "p")}</div></li>""")
    about = f"""
  <section class="editorial about" id="sobre">
    <div class="ed-page">
      {label(ABOUT["label"])}
      {tp(ABOUT["title"], "h2", 'class="ed-title"')}
      <div class="ed-meta mono"><span>{tp(ABOUT["lead"])}</span><span>{tp(CONTACT["city"])}</span></div>
      <div class="ed-cols">
        {tp(ABOUT["paras"][1], "p")}
        {tp(ABOUT["paras"][2], "p")}
      </div>
      <div class="mikas">
        {label(MIKAS["label"])}
        {tp(MIKAS["text"], "p", 'class="mikas-text"')}
        <a class="mikas-source mono" href="{MIKAS["source_url"]}" target="_blank" rel="noopener">{tp(MIKAS["source"])} ↗</a>
      </div>
      <ul class="values">{"".join(values)}
      </ul>
    </div>
    {press_section()}
  </section>"""

    # CONTACT: the big lines again, with the table photos inside
    contact = f"""
  <section class="contact" id="contacto">
    {label(CONTACT["label"])}
    {mega(CONTACT["title"], 1, pics_of(CONTACT_PICS), "contact-mega", "h2")}
    <div class="contact-grid">
      <div>
        {tp(CONTACT["body"], "p", 'class="contact-body"')}
        {tp(START, "a", 'class="btn btn-play btn-big magnetic" href="contacto.html"')}
      </div>
      <div class="contact-links mono">
        <a href="mailto:{EMAIL}"><span>Email</span><span>{EMAIL}</span></a>
        <a href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener"><span>WhatsApp</span><span>{WHATSAPP_SHOWN}</span></a>
        <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener"><span>Instagram</span><span>@{INSTAGRAM}</span></a>
        <div>{tp(CONTACT["based"])}{tp(CONTACT["city"])}</div>
      </div>
    </div>
  </section>"""

    body = hero + studio + services + projects + process + about + contact
    return shell("home", "", "Sakim Lab — Estúdio de Conceito de Hospitalidade", HERO["sub"][0], body)


# ---------------------------------------------------------------- PROJECT PAGE
with open(os.path.join(ROOT, "tools", "photo_sizes.json")) as f:
    ORIGINAL_SIZE = json.load(f)   # longest side of each photo before it was upscaled


SPAN = {"g-l": 6, "g-m": 4, "g-s": 3}


def pack(p, order):
    """Lays the photos out in rows of 12 columns that always end flush: when the next photo does
    not fit, a later one that does is pulled forward, and any space left over widens the row's
    last photos."""
    queue, rows, row, used = list(order), [], [], 0
    while queue:
        pick = next((k for k in range(min(4, len(queue))) if used + SPAN[tier(p, queue[k])] <= 12), None)
        if pick is None:
            rows.append(row); row, used = [], 0
            continue
        j = queue.pop(pick)
        row.append([j, SPAN[tier(p, j)]]); used += row[-1][1]
        if used == 12:
            rows.append(row); row, used = [], 0
    if row:
        rows.append(row)
    for r in rows:
        left = 12 - sum(sp for _, sp in r)
        k = len(r) - 1
        while left > 0:
            r[k][1] += 1; left -= 1
            k = k - 1 if k > 0 else len(r) - 1
    return [item for r in rows for item in r]


def tier(p, j):
    """Photos that were sharp to begin with are shown larger than the small ones."""
    side = ORIGINAL_SIZE.get(photo_path(p, j).split("lugares/")[1], 800)
    return "g-l" if side >= 1000 else ("g-m" if side >= 750 else "g-s")


MAP_W, MAP_H = 640, 440


def map_snapshot(slug):
    """A still map of where the project is. site.js draws it with MapLibre from OpenFreeMap
    (free, no API key, fine for commercial use); until then, and if it cannot load, a paper grid
    with the same pin is shown. Nothing to drag: it is a picture, not a widget."""
    g = GEO[slug]
    lat, lon = g["geo"]
    mark = {"pin": '<span class="map-pin"></span>', "area": '<span class="map-area"></span>'}.get(g["mark"], "")
    return f"""<figure class="map">
      <div class="map-view" style="aspect-ratio:{MAP_W}/{MAP_H}" data-lat="{lat}" data-lon="{lon}" data-zoom="{g["zoom"] - 1}">{mark}</div>
      <figcaption class="mono"><span>{esc(g["addr"])}</span>
        <span class="map-credit"><a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></span></figcaption>
    </figure>"""


def services_row(slug):
    done = services_done(slug)
    chips = "".join(f'<li class="{"on" if a["letter"] in done else "off"}">{icon(AREAS[a["letter"]])}'
                    f'<span class="mono">{a["letter"]}</span>{tp(a["name"])}</li>' for a in SERVICES["areas"])
    pct = round(100 * len(done) / len(SERVICES["areas"]))
    return f"""<div class="done">
        <p class="mono">{t("Serviços", "Services")} · {len(done)}/{len(SERVICES["areas"])} · {pct}%</p>
        <ul>{chips}</ul>
      </div>"""


def build_place(slug, n):
    p, tx = BY_SLUG[slug], PROJECT_TEXT[slug]
    root = "../"
    # the cover first, then the rest in their order
    order = sorted(range(len(p["photos"])), key=lambda j: p["photos"][j][1] != p["cover"])
    frames = []
    for j, span in pack(p, order):
        _, _, alt_pt, alt_en = p["photos"][j]
        frames.append(f"""
      <figure class="g {tier(p, j)}" style="--span:{span}">{img(root + photo_path(p, j), alt_pt, alt_en)}</figure>""")
    body = f"""
  <div class="place-content" data-place="{slug}">
    <header class="place-head">
      <p class="tag mono">[ {n:02d} / {len(PROJECT_ORDER)} ] · {tp(tx["meta"])}</p>
      <h1 class="mega place-mega"><span class="row">{esc(tx["name"])}</span></h1>
    </header>
    <div class="place-intro">
      <div class="place-text">
        {tp(tx["desc"], "p", 'class="place-desc"')}
        {services_row(slug)}
      </div>
      {map_snapshot(slug)}
    </div>
    <section class="gallery" aria-label="Fotografias">{"".join(frames)}
    </section>
  </div>
"""
    return shell("lugar", root, f"{tx['name']} — Sakim Lab", tx["desc"][0], body)


# ---------------------------------------------------------------- BOOKING PAGE
def build_contact():
    body = f"""
  <section class="booking">
    <div class="booking-intro">
      {label(CONTACT["label"])}
      {mega(("Pronto para<br>Construir<br>Algo Real?", "Ready to<br>Build Something<br>Real?"), cls="mega-s")}
      {tp(CONTACT["body"], "p", 'class="sec-body"')}
      <div class="contact-links mono">
        <a href="mailto:{EMAIL}"><span>Email</span><span>{EMAIL}</span></a>
        <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener"><span>Instagram</span><span>@{INSTAGRAM}</span></a>
      </div>
    </div>
    {booking_chat()}
  </section>
"""
    return shell("contacto", "", "Iniciar Projecto — Sakim Lab", CONTACT["body"][0], body)


def forward(target, title):
    """Old addresses forward to their part of the one-page site."""
    return f"""<!doctype html>
<html lang="pt">
<head>
<meta charset="utf-8">
<title>{esc(title)} — Sakim Lab</title>
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{target}">
</head>
<body style="background:#e9e6e0;color:#161616;font-family:system-ui,sans-serif;padding:24px">
<a href="{target}" style="color:#161616">{esc(title)} →</a>
</body>
</html>
"""


def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", rel)


def main():
    for p in PLACES:
        for j in range(len(p["photos"])):
            assert os.path.exists(os.path.join(ROOT, photo_path(p, j))), photo_path(p, j)
    write("index.html", build_home())
    write("contacto.html", build_contact())
    for n, slug in enumerate(PROJECT_ORDER, 1):
        write(f"lugares/{slug}.html", build_place(slug, n))
    write("lugares.html", forward("index.html#projectos", "Projectos"))
    write("sobre.html", forward("index.html#sobre", "Sobre"))
    write("metodo.html", forward("index.html#processo", "Processo"))


if __name__ == "__main__":
    main()
