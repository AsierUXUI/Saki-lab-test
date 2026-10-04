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
from places import PLACES, SITE_PHOTOS, photo_path, cover_path  # noqa: E402
from icons import icon, AREAS, ITEMS  # noqa: E402
from content import (NAV, START, HERO, STUDIO, SERVICES, PROJECTS, PROJECT_TEXT, PROJECT_ORDER,  # noqa: E402
                     PROCESS, ABOUT, CONTACT)

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
        rows.append(f'<span class="row">{t(rp, re_)}{pic}</span>')
    label = esc(plain(pair[0].replace("<br>", " ")))
    return f'<{tag} class="mega {cls}" aria-label="{label}" data-label-pt="{label}" data-label-en="{esc(plain(pair[1].replace("<br>", " ")))}">{"".join(rows)}</{tag}>'


def label(pair, attrs=""):
    return tp((f"[ {pair[0]} ]", f"[ {pair[1]} ]"), "p", f'class="tag mono"{(" " + attrs) if attrs else ""}')


HERO_PICS = TORCH
PROCESS_PICS = [("o-larguinho", "electrico"), ("a-tabacaria", "fachada"), ("velha-senhora", "mesas-em-obra"),
                ("a-tabacaria", "torneiras"), ("so-what", "fila-a-porta")]
CONTACT_PICS = [("sakim", "mesa-longa"), ("so-what", "mesa-posta"), ("a-tabacaria", "espuma"), ("o-terraco", "hora-azul")]


def hero_photos():
    """The photos inside the headline: the cover of every project, then a second photo of each."""
    out = [(slug, BY_SLUG[slug]["cover"]) for slug in PROJECT_ORDER]
    for slug in PROJECT_ORDER:
        other = [ph[1] for ph in BY_SLUG[slug]["photos"] if ph[1] != BY_SLUG[slug]["cover"]]
        if other:
            out.append((slug, other[len(other) // 2]))
    return [(slug, ph, photo(slug, ph)[0]) for slug, ph in out[:28]]


def pics_of(lst):
    return [(photo(s, n)[0], PROJECT_TEXT[s]["name"]) for s, n in lst]


def build_home():
    # HERO: the headline set huge, with a photo inside it that changes on its own
    pics = [(src, PROJECT_TEXT[slug]["name"], PROJECT_TEXT[slug]["meta"]) for slug, ph, src in hero_photos()]
    first = PROJECT_TEXT[hero_photos()[0][0]]
    hero = f"""
  <section class="hero" id="top">
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

    # SERVICES: four big lines; a round photo and a round colour follow the mouse
    areas = []
    for k, a in enumerate(SERVICES["areas"]):
        src, _, _ = photo(*a["photo"])
        items = "".join(f'<li>{icon(ic, "item-icon")}{tp(n, "h4")}{tp(d, "p")}</li>'
                        for (n, d), ic in zip(a["items"], ITEMS[a["letter"]]))
        areas.append(f"""
      <li class="area" data-photo="{src}">
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
    <div class="follow" aria-hidden="true"><span class="follow-dot"></span><span class="follow-pic"><img alt=""></span></div>
    <div class="inline-cta">
      {tp(SERVICES["cta"], "p")}
      {t("Agendar uma Consulta", "Schedule a Consultation", "a", 'class="btn magnetic" href="contacto.html"')}
    </div>
  </section>"""

    # PROJECTS: a dark room with one big screen; the names below change it, the mouse scrubs through its photos
    shots, names = [], []
    for n, slug in enumerate(PROJECT_ORDER):
        p, tx = BY_SLUG[slug], PROJECT_TEXT[slug]
        gallery = [photo_path(p, i) for i in range(min(10, len(p["photos"])))]
        shots.append(f'<figure class="shot{" on" if n == 0 else ""}" data-gallery="{esc(json.dumps(gallery))}" '
                     f'data-meta-pt="{esc(tx["meta"][0])}" data-meta-en="{esc(tx["meta"][1])}">'
                     f'<img class="photo" src="{cover_path(p)}" alt=""{"" if n < 2 else " loading=" + chr(34) + "lazy" + chr(34)}></figure>')
        names.append(f"""
      <li><a href="lugares/{slug}.html" data-i="{n}" data-cursor="{PROJECTS["open"][0]}" data-cursor-en="{PROJECTS["open"][1]}"><sup class="mono">{n + 1:02d}</sup>{esc(tx["name"])}</a></li>""")
    first = PROJECT_TEXT[PROJECT_ORDER[0]]
    projects = f"""
  <section class="projects" id="projectos">
    <div class="sec-head">
      {label(PROJECTS["label"])}
      {tp(PROJECTS["title"], "h2", 'class="sec-title"')}
    </div>
    <div class="screen">
      {"".join(shots)}
      <p class="screen-cap mono"><span class="screen-n">01 / {len(PROJECT_ORDER)}</span> <b>{esc(first["name"])}</b> {tp(first["meta"], "span", 'class="screen-meta"')}</p>
      <a class="btn btn-play screen-open" href="lugares/{PROJECT_ORDER[0]}.html">{t("Ver projecto", "View project")}<i aria-hidden="true"></i></a>
      <span class="scrub mono" aria-hidden="true"></span>
    </div>
    <ol class="reel">{"".join(names)}
    </ol>
    {tp(PROJECTS["body"], "p", 'class="sec-body reel-note"')}
  </section>"""

    # PROCESS: steps on the left, a tall photo on the right that changes with each step
    steps, frames = [], []
    for i, ((n, d), (slug, ph)) in enumerate(zip(PROCESS["steps"], PROCESS_PICS)):
        steps.append(f"""
      <li class="step" data-i="{i}"><span class="mono">[ {i + 1:02d} ]</span>{tp(n, "h3")}{tp(d, "p")}</li>""")
        frames.append(f'<img class="photo{" on" if i == 0 else ""}" src="{photo(slug, ph)[0]}" alt="" loading="lazy">')
    process = f"""
  <section class="process" id="processo">
    <div class="process-text">
      {label(PROCESS["label"])}
      {mega((plain(PROCESS["title"][0]), plain(PROCESS["title"][1])), cls="mega-s", tag="h2")}
      {tp(PROCESS["body"], "p", 'class="sec-body"')}
      <ol class="steps">{"".join(steps)}
      </ol>
    </div>
    <div class="process-pic" aria-hidden="true"><div class="process-frame">{"".join(frames)}</div></div>
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
      <ul class="values">{"".join(values)}
      </ul>
    </div>
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
LAYOUT = ["f-full", "f-narrow-l", "f-narrow-r", "f-center", "f-left", "f-right", "f-narrow-l", "f-narrow-r"]


def build_place(slug, n):
    p, tx = BY_SLUG[slug], PROJECT_TEXT[slug]
    root = "../"
    frames = []
    for j, ph in enumerate(p["photos"]):
        _, _, alt_pt, alt_en = ph
        cls = LAYOUT[j % len(LAYOUT)] if len(p["photos"]) > 3 else ("f-full" if j == 0 else ["f-narrow-l", "f-narrow-r"][j % 2])
        frames.append(f"""
    <figure class="frame {cls}">{img(root + photo_path(p, j), alt_pt, alt_en)}</figure>""")
    body = f"""
  <div class="place-content" data-place="{slug}">
    <header class="place-head">
      <p class="tag mono">[ {n:02d} / {len(PROJECT_ORDER)} ] · {tp(tx["meta"])}</p>
      <h1 class="mega place-mega"><span class="row">{esc(tx["name"])}</span></h1>
    </header>
    <figure class="place-cover"><img class="photo" src="{root}{cover_path(p)}" alt=""></figure>
    {tp(tx["desc"], "p", 'class="place-desc"')}
    <section class="frames" aria-label="Fotografias">{"".join(frames)}
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
