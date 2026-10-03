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
import sys

sys.path.insert(0, os.path.dirname(__file__))
from places import PLACES, SITE_PHOTOS, photo_path, cover_path  # noqa: E402
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

# Photos the torch reveals in the hero, in order
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
def shell(page, root, title, desc, body, head=""):
    home = page == "home"
    links = "\n    ".join(tp(name, "a", f'href="{"" if home else root + "index.html"}#{key}"') for key, name in NAV)
    start = tp(START, "a", f'class="nav-cta magnetic" href="{root}contacto.html"')
    if page == "lugar":
        top = f"""<div class="place-bar">
  {t("← Voltar", "← Back", "a", f'class="back" href="{root}index.html#projectos"')}
  <div class="lang" role="group" aria-label="Idioma / Language">
    <button type="button" data-lang="pt" class="on">PT</button><button type="button" data-lang="en">EN</button>
  </div>
</div>"""
    else:
        top = f"""<header class="nav">
  <a href="{root}index.html#top" class="logo" aria-label="Sakim Lab"><span>Sakim</span><i></i><small>Lab</small></a>
  <nav class="nav-links" aria-label="Menu">
    {links}
  </nav>
  <div class="nav-right">
    <div class="lang" role="group" aria-label="Idioma / Language">
      <button type="button" data-lang="pt" class="on">PT</button><button type="button" data-lang="en">EN</button>
    </div>
    {start}
    {t("Menu", "Menu", "button", 'type="button" class="menu-btn" aria-expanded="false" aria-controls="menu"')}
  </div>
</header>
<aside class="menu" id="menu" aria-hidden="true">
  <div class="menu-scrim" data-close-menu></div>
  <div class="menu-panel">
    {t("Fechar", "Close", "button", 'type="button" class="menu-close mono" data-close-menu')}
    <nav>{links}</nav>
    {tp(START, "a", f'class="btn" href="{root}contacto.html"')}
  </div>
</aside>"""
    overlays = ""
    if page not in ("contacto", "lugar"):
        overlays += booking_drawer(root)
    if page == "home":
        overlays += place_sheet()
    year = datetime.date.today().year
    footer = "" if page == "lugar" else f"""
<footer class="foot mono">
  <span>© {year} Sakim Lab. {tp(CONTACT["rights"])}</span>
  <span><a href="mailto:{EMAIL}">Email</a> · <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener">Instagram</a></span>
</footer>"""
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
  <div class="sheet-bar">{t("← Voltar", "← Back", "button", 'type="button" class="back"')}</div>
  <div class="sheet-body" data-lenis-prevent></div>
</div>"""


# ---------------------------------------------------------------- HOME: one long page
def section_head(label, title, body=None, cls=""):
    return f"""<div class="sec-head {cls}">
      {tp(label, "p", 'class="label mono"')}
      {tp(title, "h2", 'class="sec-title"')}
      {tp(body, "p", 'class="sec-body"') if body else ""}
    </div>"""


def build_home():
    # HERO: a torch in the dark
    torch = []
    for i, (slug, name) in enumerate(TORCH):
        src, _, _ = photo(slug, name)
        tx = PROJECT_TEXT[slug]
        lazy = "" if i < 2 else ' loading="lazy"'
        torch.append(f'<img class="photo{" on" if i == 0 else ""}" src="{src}" alt="" data-name="{esc(tx["name"])}" '
                     f'data-meta-pt="{esc(tx["meta"][0])}" data-meta-en="{esc(tx["meta"][1])}"{lazy}>')
    hero = f"""
  <section class="torch" id="top">
    <div class="torch-under" aria-hidden="true">{"".join(torch)}</div>
    <div class="torch-dark" aria-hidden="true"></div>
    <div class="torch-caption mono" aria-hidden="true"><b></b><span></span></div>
    <div class="torch-content">
      {tp(HERO["title"], "h1", 'class="torch-title"')}
      <div class="torch-foot">
        {tp(HERO["sub"], "p", 'class="torch-sub"')}
        <div class="actions">
          {tp(START, "a", 'class="btn magnetic" href="contacto.html"')}
          {t(HERO["services"][0] + " ↓", HERO["services"][1] + " ↓", "a", 'class="link magnetic" href="#servicos"')}
        </div>
      </div>
    </div>
    {t("Mova a luz", "Move the light", "p", 'class="torch-hint mono" aria-hidden="true"')}
  </section>"""

    # STUDIO: the quote under a lens
    lens_photo, _, _ = photo("social-b", "bar-violeta")
    stats = "".join(f'<div class="stat"><strong>{n}</strong>{tp(lbl, "span", "class=" + chr(34) + "mono" + chr(34))}</div>'
                    for n, lbl in STUDIO["stats"])
    studio = f"""
  <section class="studio" id="estudio">
    {tp(STUDIO["label"], "p", 'class="label mono"')}
    <div class="lens lens-quote" data-lens>
      <div class="lens-top">{tp(STUDIO["quote"], "blockquote")}</div>
      <div class="lens-under" aria-hidden="true" style="background-image:url('{lens_photo}')">{tp(STUDIO["quote"], "blockquote")}</div>
    </div>
    <div class="studio-foot">
      {tp(STUDIO["body"], "p", 'class="sec-body"')}
      <div class="stats">{stats}</div>
    </div>
  </section>"""

    # SERVICES: four areas that open under the cursor
    areas = []
    for a in SERVICES["areas"]:
        src, _, _ = photo(*a["photo"])
        items = "".join(f'<li>{tp(n, "h4")}{tp(d, "p")}</li>' for n, d in a["items"])
        areas.append(f"""
      <li class="area" data-photo="{src}">
        <button type="button" class="area-head" aria-expanded="false">
          <span class="area-letter">{a["letter"]}</span>
          {tp(a["name"], "span", 'class="area-name"')}
          {tp(a["summary"], "span", 'class="area-sum"')}
          <span class="area-plus" aria-hidden="true">+</span>
        </button>
        <div class="area-body"><ul>{items}</ul></div>
      </li>""")
    services = f"""
  <section class="services" id="servicos">
    {section_head(SERVICES["label"], SERVICES["title"], SERVICES["body"])}
    <ol class="areas">{"".join(areas)}
    </ol>
    <div class="float-photo" aria-hidden="true"><img alt=""></div>
    <div class="inline-cta">
      {tp(SERVICES["cta"], "p")}
      {t("Agendar uma Consulta", "Schedule a Consultation", "a", 'class="btn magnetic" href="contacto.html"')}
    </div>
  </section>"""

    # PROJECTS: names that leave a trail of their photos
    rows = []
    for n, slug in enumerate(PROJECT_ORDER):
        p, tx = BY_SLUG[slug], PROJECT_TEXT[slug]
        trail = esc(json.dumps([photo_path(p, i) for i in range(min(8, len(p["photos"])))]))
        rows.append(f"""
      <li class="proj"><a href="lugares/{slug}.html" data-trail="{trail}" data-cursor="{PROJECTS["open"][0]}" data-cursor-en="{PROJECTS["open"][1]}">
        <span class="proj-n mono">{n + 1:02d}</span>
        <img class="proj-thumb photo" src="{cover_path(p)}" alt="" loading="lazy">
        <span class="proj-name">{esc(tx["name"])}</span>
        {tp(tx["meta"], "span", 'class="proj-meta mono"')}
      </a></li>""")
    projects = f"""
  <section class="projects" id="projectos">
    {section_head(PROJECTS["label"], PROJECTS["title"], PROJECTS["body"])}
    <ol class="proj-list">{"".join(rows)}
    </ol>
    <div class="trail" aria-hidden="true"></div>
  </section>"""

    # PROCESS: five steps that light up in turn
    steps = "".join(f"""
      <li class="step"><span class="step-n">{i + 1:02d}</span><div>{tp(n, "h3")}{tp(d, "p")}</div></li>"""
                    for i, (n, d) in enumerate(PROCESS["steps"]))
    process = f"""
  <section class="process" id="processo">
    {section_head(PROCESS["label"], PROCESS["title"], PROCESS["body"])}
    <ol class="steps">{steps}
    </ol>
  </section>"""

    # ABOUT: words, and three values with a photo under each
    values = []
    for name, desc, (slug, ph) in ABOUT["values"]:
        src, _, _ = photo(slug, ph)
        values.append(f"""
      <li class="value lens" data-lens>
        <div class="lens-top">{tp(name, "h4")}{tp(desc, "p")}</div>
        <div class="lens-under" aria-hidden="true" style="background-image:url('{src}')">{tp(name, "h4")}{tp(desc, "p")}</div>
      </li>""")
    paras = "".join(tp(p, "p") for p in ABOUT["paras"])
    about = f"""
  <section class="about" id="sobre">
    {tp(ABOUT["label"], "p", 'class="label mono"')}
    {tp(ABOUT["title"], "h2", 'class="about-title"')}
    <div class="about-grid">
      {tp(ABOUT["side"], "p", 'class="about-side mono"')}
      <div class="about-body">
        {tp(ABOUT["lead"], "h3")}
        {paras}
      </div>
    </div>
    <ul class="values">{"".join(values)}
    </ul>
  </section>"""

    # CONTACT
    contact = f"""
  <section class="contact" id="contacto">
    {tp(CONTACT["label"], "p", 'class="label mono"')}
    {tp(CONTACT["title"], "h2", 'class="contact-title"')}
    <div class="contact-grid">
      <div>
        {tp(CONTACT["body"], "p", 'class="sec-body"')}
        {tp(START, "a", 'class="btn btn-big magnetic" href="contacto.html"')}
      </div>
      <div class="contact-links">
        <a href="mailto:{EMAIL}"><span class="mono">Email</span><span>{EMAIL}</span></a>
        <a href="https://wa.me/{WHATSAPP}" target="_blank" rel="noopener"><span class="mono">WhatsApp</span><span>{WHATSAPP_SHOWN}</span></a>
        <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener"><span class="mono">Instagram</span><span>@{INSTAGRAM}</span></a>
        <div>{tp(CONTACT["based"], "span", 'class="mono"')}{tp(CONTACT["city"])}</div>
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
    <section class="place-hero">
      <img class="photo" src="{root}{cover_path(p)}" alt="">
      <div class="place-hero-text">
        <span class="mono">{n:02d} / {len(PROJECT_ORDER)} · {tp(tx["meta"])}</span>
        <h1>{esc(tx["name"])}</h1>
      </div>
    </section>
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
      {tp(CONTACT["label"], "p", 'class="label mono"')}
      {t("Pronto para Construir <em>Algo Real?</em>", "Ready to Build <em>Something Real?</em>", "h1")}
      {tp(CONTACT["body"], "p", 'class="sec-body"')}
      <div class="contact-links">
        <a href="mailto:{EMAIL}"><span class="mono">Email</span><span>{EMAIL}</span></a>
        <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener"><span class="mono">Instagram</span><span>@{INSTAGRAM}</span></a>
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
<body style="background:#0b0908;color:#efe7da;font-family:system-ui,sans-serif;padding:24px">
<a href="{target}" style="color:#e8621a">{esc(title)} →</a>
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
