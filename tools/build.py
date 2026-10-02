"""Builds every page of the site from tools/places.py.

Run from the repository root:  python3 tools/build.py
It writes index.html, lugares.html, metodo.html, contacto.html and lugares/<slug>.html.
"""
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from places import PLACES, SITE_PHOTOS, photo_path, cover_path  # noqa: E402

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
       ("metodo", "metodo.html", "Método", "Method"),
       ("contacto", "contacto.html", "Marcar consulta", "Book a consultation")]


def shell(page, root, title, desc, body):
    def links():
        out = []
        for key, href, pt, en in NAV:
            cur = ' aria-current="page"' if key == page else ""
            cls = ' class="nav-cta"' if key == "contacto" else ""
            out.append(t(pt, en, "a", f'href="{root}{href}"{cls}{cur}'))
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
<link rel="stylesheet" href="{root}assets/css/site.css">
<script src="{root}assets/js/gsap.min.js" defer></script>
<script src="{root}assets/js/ScrollTrigger.min.js" defer></script>
<script src="{root}assets/js/lenis.min.js" defer></script>
<script src="{root}assets/js/site.js" defer></script>
</head>
<body class="no-js" data-page="{page}">
{t("Saltar para o conteúdo", "Skip to content", "a", 'class="skip" href="#main"')}
<div class="grain" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span></span></div>
<div class="veil" aria-hidden="true">
  <div class="veil-num"><span>0</span><sup>+</sup></div>
  {t("Anos de noites em Lisboa", "Years of nights in Lisbon", "div", 'class="veil-cap mono"')}
</div>

<header class="nav">
  <a href="{root}index.html" class="logo" aria-label="Sakim Lab"><span>Sakim</span><i></i><small>Lab</small></a>
  <nav class="nav-links" aria-label="Menu">
    {links()}
  </nav>
  <div class="nav-right">
    <span class="clock-nav mono">{t("Lisboa", "Lisbon")} <span class="js-clock">--:--</span></span>
    <div class="lang" role="group" aria-label="Idioma / Language">
      <button type="button" data-lang="pt" class="on">PT</button><button type="button" data-lang="en">EN</button>
    </div>
    {t("Menu", "Menu", "button", 'type="button" class="menu-btn" aria-expanded="false" aria-controls="menu"')}
  </div>
</header>
<div class="menu" id="menu">
  {t("Início", "Home", "a", f'href="{root}index.html"' + (' aria-current="page"' if page == "home" else ""))}
  {links()}
</div>

<main id="main">
{body}
</main>

<footer>
  {t("Até <em>já.</em>", "See you <em>soon.</em>", "a", f'class="bye" href="{root}contacto.html"')}
  <div class="foot mono">
    <span><span class="js-greet">Boa noite</span> — {t("em Lisboa são", "in Lisbon it's")} <span class="js-clock">--:--</span></span>
    <span class="foot-links"><a href="mailto:{EMAIL}">Email</a><a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener">Instagram</a><span>© <span class="js-year">2026</span> Sakim Lab</span></span>
  </div>
</footer>
</body>
</html>
"""


def hero_lines(*pairs):
    return "\n".join(f'<span class="line">{t(pt, en)}</span>' for pt, en in pairs)


# ---------------------------------------------------------------- HOME
def build_home():
    root = ""
    slides = [cover_path(BY_SLUG[s]) for s in ("a-tabacaria", "so-what", "social-b", "sakim")]
    slide_html = "\n      ".join(
        f'<img class="photo on" src="{s}" alt="">' if i == 0 else f'<img class="photo" src="{s}" alt="" loading="lazy">'
        for i, s in enumerate(slides))

    featured = ["sakim", "so-what", "a-tabacaria"]
    nights = []
    for slug in featured:
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

    manifesto_pt = ("Um lugar não é paredes e um balcão. É a luz às onze da noite, a música um pouco mais alta do que devia, "
                    "o copo que chega antes de o pedir, o estranho que à saída já é amigo. Passei a vida a afinar estes "
                    "detalhes invisíveis — são eles que as pessoas levam para casa.")
    manifesto_en = ("A place isn't walls and a counter. It's the light at eleven at night, the music a little louder than it "
                    "should be, the glass that arrives before you ask, the stranger who leaves as a friend. I've spent my life "
                    "tuning those invisible details — they're what people take home.")

    body = f"""
  <section class="hero">
    <div class="hero-media slides" aria-hidden="true">
      {slide_html}
    </div>
    <div class="hero-content">
      <div class="hero-eyebrow mono">{t("Lisboa — há mais de 30 anos", "Lisbon — for 30+ years")}<span>38°42′N 9°08′W</span></div>
      <h1>
{hero_lines(("Não desenho bares.", "I don't design bars."), ("Desenho <em>experiências.</em>", "I design <em>experiences.</em>"))}
      </h1>
      <div class="hero-foot">
        {t("Há mais de trinta anos que crio bares, restaurantes e lugares em Lisboa — do primeiro esboço à última ronda.",
           "For more than thirty years I've been creating bars, restaurants and places in Lisbon — from the first sketch to the last round.",
           "p", 'class="hero-sub"')}
        <div class="scroll-cue mono"><b></b>{t("A noite começa aqui", "The night starts here")}</div>
      </div>
    </div>
  </section>

  <section class="manifesto">
    {t("Manifesto", "Manifesto", "div", 'class="label mono"')}
    <p class="manifesto-text" id="manifesto-text" data-pt="{esc(manifesto_pt)}" data-en="{esc(manifesto_en)}">{manifesto_pt}</p>
    <div class="manifesto-sign mono" data-reveal>
      <img src="{SITE_PHOTOS[2]}" alt="Sakim">
      {t("Sakim — Lisboa", "Sakim — Lisbon")}
    </div>
  </section>

  <section class="nights" aria-label="Três noites">
    <div class="nights-head">
      <div>{t("Três noites", "Three nights", "div", 'class="label mono"')}
      {t("Cada lugar,<br>uma <em>pergunta.</em>", "Every place,<br>a <em>question.</em>", "h2")}</div>
    </div>
    {"".join(nights)}
  </section>

  <section class="window">
    <div class="window-sticky">
      <div class="window-img"><img class="photo" src="{SITE_PHOTOS[3]}" alt="" loading="lazy"></div>
      <div class="window-text">
        {t("Cada lugar começa com uma pergunta — e só acaba quando alguém <em>não quer ir para casa.</em>",
           "Every place begins with a question — and only ends when someone <em>doesn't want to go home.</em>", "p")}
        <a class="link-arrow" href="lugares.html">{t("Os catorze lugares", "All fourteen places")} <b>→</b></a>
        <a class="link-arrow" href="metodo.html">{t("Como trabalho", "How I work")} <b>→</b></a>
        <a class="link-arrow" href="contacto.html">{t("Marcar consulta", "Book a consultation")} <b>→</b></a>
      </div>
    </div>
  </section>
"""
    return shell("home", root, "Sakim Lab — Lugares para a noite, Lisboa",
                 "Há mais de trinta anos a criar bares, restaurantes e lugares em Lisboa — do primeiro esboço à última ronda.", body)


# ---------------------------------------------------------------- PLACES INDEX
def build_index():
    rows = []
    for i, p in enumerate(PLACES):
        rows.append(f"""
      <li class="row"><a href="lugares/{p["slug"]}.html" data-peek="{cover_path(p)}" data-cursor="Entrar">
        <span class="row-n mono">{i + 1:02d}</span>
        <img class="row-thumb photo" src="{cover_path(p)}" alt="" loading="lazy">
        <span class="row-name">{p["name"]}</span>
        <span class="row-line">{t(p["line"]["pt"], p["line"]["en"])}{t(p["where"]["pt"], p["where"]["en"], "span", 'class="mono"')}</span>
      </a></li>""")
    body = f"""
  <section class="page-head">
    <div>{t("Lugares", "Places", "div", 'class="label mono"')}
    {t("Catorze <em>noites.</em>", "Fourteen <em>nights.</em>", "h1", 'class="page-title"')}</div>
    {t("Cada um destes lugares começou com uma pergunta diferente. Espreite; entre para ficar.",
       "Each of these places began with a different question. Take a look; step inside to stay.", "p")}
  </section>
  <ol class="list">{"".join(rows)}
  </ol>
  <div class="peek" aria-hidden="true"><img alt=""></div>
"""
    return shell("lugares", "", "Lugares — Sakim Lab",
                 "Bares, restaurantes e lugares criados em Lisboa e além: A Tabacaria, So What, Social B, O Bar da Velha Senhora e outros.", body)


# ---------------------------------------------------------------- PLACE PAGE
LAYOUT = ["f-full", "f-narrow-l", "f-narrow-r", "f-center", "f-left", "f-right", "f-narrow-l", "f-narrow-r"]


def build_place(i):
    p = PLACES[i]
    nxt = PLACES[(i + 1) % len(PLACES)]
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
  <section class="hero place-hero">
    <div class="hero-media" aria-hidden="true"><img class="photo" src="{root}{cover_path(p)}" alt=""></div>
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

  <section class="frames" aria-label="Fotografias">{"".join(frames)}
  </section>

  <a class="next" href="{nxt["slug"]}.html" data-cursor="Entrar">
    <img class="photo" src="{root}{cover_path(nxt)}" alt="" loading="lazy">
    <div class="next-body">
      {t("Próximo lugar", "Next place", "span", 'class="mono"')}
      <span class="next-name">{nxt["name"]}</span>
    </div>
  </a>
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
def build_contact():
    data = {
        "whatsapp": WHATSAPP,
        "email": EMAIL,
        "services": [{"id": k, "pt": n[0], "en": n[1]} for k, n, _ in SERVICES],
    }
    body = f"""
  <section class="booking">
    <div class="booking-intro">
      {t("Consulta", "Consultation", "div", 'class="label mono"')}
      <h1><span class="line">{t("Pronto para construir", "Ready to build")}</span><span class="line">{t("algo real?", "something real?")}</span><span class="line">{t("<em>Marque a sua consulta.</em>", "<em>Book your consultation.</em>")}</span></h1>
      {t("Três perguntas, nada mais. O resto conversamos à mesa — de preferência com um copo à frente.",
         "Three questions, nothing more. We'll talk about the rest at the table — ideally with a glass in front of us.", "p", 'class="booking-sub"')}
      <div class="links">
        <a href="mailto:{EMAIL}" data-cursor="Email"><span class="mono">Email</span><span>{EMAIL}</span></a>
        <a href="https://instagram.com/{INSTAGRAM}" target="_blank" rel="noopener" data-cursor="Insta"><span class="mono">Instagram</span><span>@{INSTAGRAM}</span></a>
      </div>
    </div>
    <div class="chat" id="booking" aria-live="polite">
      <div class="chat-head">
        <img src="{SITE_PHOTOS[2]}" alt="">
        <div><strong>Sakim</strong>{t("Responde em pessoa", "Replies in person", "span", 'class="mono"')}</div>
        {t("Recomeçar", "Start again", "button", 'type="button" class="chat-restart mono" hidden')}
      </div>
      <div class="chat-log" id="chat-log"></div>
      <div class="chat-input" id="chat-input"></div>
      <noscript><p class="chat-msg">{t("Escreva-me para", "Write to me at")} <a href="mailto:{EMAIL}">{EMAIL}</a>.</p></noscript>
    </div>
  </section>
  <script type="application/json" id="booking-data">{json.dumps(data, ensure_ascii=False)}</script>
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
        assert os.path.exists(os.path.join(ROOT, cover_path(p))), cover_path(p)
    write("index.html", build_home())
    write("lugares.html", build_index())
    write("metodo.html", build_method())
    write("contacto.html", build_contact())
    for i, p in enumerate(PLACES):
        write(f"lugares/{p['slug']}.html", build_place(i))


if __name__ == "__main__":
    main()
