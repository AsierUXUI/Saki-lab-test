"""The site's words, taken from the original Sakim Lab site (PT and EN).

Only typos and missing accents were fixed; missing English versions were translated
from the Portuguese. Each text is a (pt, en) pair.
"""

NAV = [
    ("estudio", ("Estúdio", "Studio")),
    ("servicos", ("Serviços", "Services")),
    ("projectos", ("Projectos", "Projects")),
    ("processo", ("Processo", "Process")),
    ("sobre", ("Sobre", "About")),
    ("contacto", ("Contacto", "Contact")),
]
START = ("Iniciar Projecto", "Start Your Project")

HERO = {
    "eyebrow": ("Estúdio de Conceito de Hospitalidade", "Hospitality Concept Studio"),
    "title": ("Onde o <em>Conceito</em><br>se Torna<br>Experiência.", "Where <em>Concept</em><br>Becomes<br>Experience."),
    "sub": ("A Sakim Lab define restaurantes, bares e espaços de hospitalidade — do posicionamento inicial até ao dia de abertura.",
            "Sakim Lab shapes restaurants, bars, and hospitality spaces — from initial positioning through to opening day."),
    "services": ("Os Nossos Serviços", "Our Services"),
}

STUDIO = {
    "label": ("O Estúdio", "The Studio"),
    "quote": ("“Um conceito sem estratégia é teatro. Estratégia sem conceito é mecanismo.”",
              "“A concept without strategy is theatre. Strategy without concept is machinery.”"),
    "body": ("A Sakim Lab é um estúdio criativo de hospitalidade que trabalha com fundadores, investidores e operadores que pretendem construir espaços com significado.",
             "Sakim Lab is a creative hospitality studio working with restaurant founders, investors, and operators who want to build spaces with meaning."),
    "stats": [("11+", ("Conceitos Lançados", "Concepts Launched")),
              ("3", ("Países", "Countries")),
              ("End-to-end", ("Abordagem", "Studio Approach"))],
}

SERVICES = {
    "label": ("O Que Fazemos", "What We Do"),
    "title": ("Da Primeira Ideia à <em>Noite de Abertura</em>", "From First Idea to <em>Opening Night</em>"),
    "body": ("A Sakim Lab trabalha em quatro áreas interligadas de desenvolvimento de hospitalidade.",
             "Sakim Lab works across four interconnected areas of hospitality development."),
    "areas": [
        {
            "letter": "A",
            "name": ("Conceito & Posicionamento", "Concept & Positioning"),
            "summary": ("Definir o que é um espaço, para quem existe e por que razão terá relevância.",
                        "Defining what a space is, who it's for, and why it will matter."),
            "photo": ("a-tabacaria", "porta-a-noite"),
            "items": [
                (("Desenvolvimento de Conceito", "Concept Development"),
                 ("Definir a ideia fundamental — o seu ponto de vista, público e razão de existir.",
                  "Defining the foundational idea — its point of view, audience, and reason for existing.")),
                (("Direção de Marca", "Brand Direction"),
                 ("Direção estratégica e criativa para uma marca de hospitalidade — linguagem visual e tom de voz.",
                  "Strategic and creative direction for a hospitality brand — visual language and tone of voice.")),
                (("Identidade de Hospitalidade", "Hospitality Identity"),
                 ("Traduzir um conceito numa identidade sensorial e espacial coerente.",
                  "Translating a concept into a coherent sensory and spatial identity.")),
                (("Nome & Enquadramento", "Naming & Concept Framing"),
                 ("Encontrar o nome certo e a linguagem para enquadrar o que um espaço representa.",
                  "Finding the right name and language to frame what a space is about.")),
            ],
        },
        {
            "letter": "B",
            "name": ("Comida, Bebida & Experiência", "Food, Beverage & Experience"),
            "summary": ("Desenvolvimento de menu, estratégia de vinho e bar, e o design completo da experiência do cliente.",
                        "Menu development, wine and bar strategy, and the full design of the guest journey."),
            "photo": ("a-tabacaria", "vermelho"),
            "items": [
                (("Desenvolvimento de Menu", "Menu Development"),
                 ("Desenvolvimento de menu enraizado na coerência do conceito, viabilidade operacional e experiência do cliente.",
                  "Menu development rooted in concept coherence, operational viability, and guest experience.")),
                (("Estratégia de Bebidas & Vinho", "Beverage & Wine Strategy"),
                 ("Construção de carta de vinhos, programa de bebidas e seleção de fornecedores.",
                  "Wine list construction, beverage programme, and supplier sourcing.")),
                (("Desenvolvimento de Bar", "Bar Concept Development"),
                 ("Desenvolvimento criativo e operacional completo de conceitos de bar — direção de cocktails, arquitetura de lista, estilo de serviço.",
                  "Full creative and operational development of bar concepts — cocktail direction, list architecture, service style.")),
                (("Design da Jornada do Cliente", "Guest Journey Design"),
                 ("Desenhar a experiência completa do cliente desde a reserva até à saída.",
                  "Designing the full guest experience from reservation to departure.")),
            ],
        },
        {
            "letter": "C",
            "name": ("Espaço, Configuração & Operações", "Space, Setup & Operations"),
            "summary": ("Direção de atmosfera interior, seleção de fornecedores e design do fluxo de serviço.",
                        "Interior atmosphere direction, supplier sourcing, and service flow design."),
            "photo": ("so-what", "abobada-acesa"),
            "items": [
                (("Direção de Interior & Atmosfera", "Interior & Atmosphere Direction"),
                 ("Direção criativa para o espaço físico — garantindo que o conceito está presente em cada decisão.",
                  "Creative direction for the physical space — ensuring the concept is present in every decision.")),
                (("Seleção de Fornecedores", "Supplier Sourcing"),
                 ("Identificar os fornecedores certos cuja qualidade e valores estejam alinhados com o projeto.",
                  "Identifying the right suppliers whose quality and values align with the project.")),
                (("Configuração Operacional", "Operational Setup"),
                 ("Construir a infraestrutura operacional — sistemas, processos e lógica de trabalho.",
                  "Building the operational infrastructure — systems, processes, and working logic.")),
                (("Fluxo de Serviço & Abertura", "Service Flow & Opening Readiness"),
                 ("Desenhar e testar o fluxo de serviço antes da abertura.",
                  "Designing and testing the service flow before opening.")),
            ],
        },
        {
            "letter": "D",
            "name": ("Equipa, Lançamento & Consultoria", "Team, Launch & Advisory"),
            "summary": ("Staffing, formação, estratégia de lançamento e apoio consultivo contínuo.",
                        "Staffing, training, launch strategy, and ongoing advisory support."),
            "photo": ("so-what", "sala-cheia"),
            "items": [
                (("Staffing & Formação", "Staffing & Training"),
                 ("Apoio ao recrutamento e formação para funções de sala e gestão.",
                  "Recruitment support and training for front-of-house and management roles.")),
                (("Estratégia de Lançamento", "Launch Strategy"),
                 ("Planear a fase de abertura — comunicação, relações com imprensa, programação de soft launch.",
                  "Planning the opening phase — communication, press outreach, soft launch programming.")),
                (("Apoio à Abertura", "Opening Support"),
                 ("Presença no local durante o período de abertura — observando o serviço e gerindo ajustes.",
                  "On-site presence during the opening period — observing service and managing adjustments.")),
                (("Consultoria Contínua", "Ongoing Advisory"),
                 ("Uma relação consultiva de retenção para fundadores que pretendem um parceiro de longo prazo.",
                  "A retained advisory relationship for founders who want a long-term thinking partner.")),
            ],
        },
    ],
    "cta": ("A maioria dos projetos começa com uma breve consulta.", "Most projects begin with a brief consultation."),
}

PROJECTS = {
    "label": ("Trabalho Selecionado", "Selected Work"),
    "title": ("Espaços que <em>Ajudámos a Criar</em>", "Spaces We've <em>Helped Shape</em>"),
    "body": ("Bares, restaurantes, conceitos de hospitalidade e espaços de experiência moldados pela Sakim Lab em Lisboa e além.",
             "Bars, restaurants, hospitality concepts, and guest spaces shaped by Sakim Lab across Lisbon and beyond."),
    "open": ("Ver", "View"),
}

# Each project: (meta, description) from the original site, keyed by the photo folder in assets/img/lugares/.
PROJECT_TEXT = {
    "a-tabacaria": {
        "name": "A Tabacaria",
        "meta": ("Bar · Lisboa", "Bar · Lisbon"),
        "desc": ("Conceito completo, programa de bar, direção de cocktails e estratégia de lançamento para um bar de rum numa tabacaria histórica de 1885.",
                 "Full concept, bar programme, cocktail direction, and launch strategy for a rum bar in a historic 1885 tabacaria."),
    },
    "o-terraco": {
        "name": "O Terraço Bar",
        "meta": ("Rooftop Bar · Lisboa", "Rooftop Bar · Lisbon"),
        "desc": ("Direção de conceito e design de atmosfera para um bar de terraço no coração histórico de Lisboa, com vista para o Castelo de São Jorge.",
                 "Concept direction and atmosphere design for a rooftop bar in the historic heart of Lisbon, overlooking São Jorge Castle."),
    },
    "bica-me": {
        "name": "Bica-me",
        "meta": ("Mercearia Bar · Lisboa", "Mercearia Bar · Lisbon"),
        "desc": ("Conceito, identidade e programa de comida para uma mercearia e bar na Bica — produtos artesanais, vinhos naturais, enchidos e queijos.",
                 "Concept, identity, and food programme for a mercearia and bar in Bica — artisan products, natural wines, charcuterie and cheese."),
    },
    "bicaense": {
        "name": "Bicaense",
        "meta": ("Bar Club · Lisboa", "Bar Club · Lisbon"),
        "desc": ("Direção de conceito, programa de bar e design de atmosfera — iluminação cromática, balcão curvo, instalação botânica.",
                 "Concept, bar programme, and atmosphere design — chromatic lighting, curved bar, botanical installation."),
    },
    "social-b": {
        "name": "Social B",
        "meta": ("Bar Club · Lisboa", "Bar Club · Lisbon"),
        "desc": ("Direção de conceito e design de atmosfera para um bar e clube numa cave abobadada histórica no centro de Lisboa.",
                 "Concept and atmosphere design for a bar and club in a historic vaulted space in central Lisbon."),
    },
    "o-larguinho": {
        "name": "O Larguinho",
        "meta": ("Bar de Tapas · Lisboa", "Tapas Bar · Lisbon"),
        "desc": ("Conceito, menu de tapas e estratégia de abertura para um bar de bairro com esplanada na Alfama.",
                 "Concept, tapas menu, and opening strategy for a neighbourhood bar with terrace in Alfama."),
    },
    "afro-taska": {
        "name": "Afro Taska",
        "meta": ("Tasca Africana · Lisboa", "African Tasca · Lisbon"),
        "desc": ("Conceito completo e montagem de restaurante para uma tasca africana — murais geométricos, tecido wax e cozinha de raiz africana.",
                 "Full concept and restaurant setup for an African tasca — geometric murals, wax fabric, West African culinary roots."),
    },
    "house-4": {
        "name": "House 4",
        "meta": ("Alojamento Local · Lisboa", "Alojamento Local · Lisbon"),
        "desc": ("Conceito de interior e design de experiência de hóspede para um alojamento local boutique — corredores cromáticos, mobiliário mid-century.",
                 "Interior concept and guest experience design for a boutique Alojamento Local — chromatic corridors, mid-century furnishings."),
    },
    "monte-da-lua": {
        "name": "Monte da Lua",
        "meta": ("Retiro Rural · Moçambique", "Rural Retreat · Mozambique"),
        "desc": ("Conceito de hospitalidade, design de experiência e estratégia de F&B para um retiro boutique off-grid na costa de Moçambique.",
                 "Hospitality concept, guest experience, and F&B strategy for a boutique off-grid retreat on the Mozambican coast."),
    },
    "clube-ferroviario": {
        "name": "Clube Ferroviário",
        "meta": ("Rooftop Bar · Lisboa", "Rooftop Bar · Lisbon"),
        "desc": ("Conceito, programa de bar e lançamento para o rooftop do Clube Ferroviário de Sta. Apolónia — vista sobre o Tejo.",
                 "Concept, bar programme, and launch for a rooftop bar at the historic railway club in Santa Apolónia — views over the Tagus."),
    },
    "ricucu": {
        "name": "Ricucu",
        "meta": ("Bar de Praia · Praia Verde, Algarve", "Beach Bar · Praia Verde, Algarve"),
        "desc": ("Conceito completo, identidade, programa de bar e estratégia de abertura para um bar de praia — deck branco, palapa e uma identidade cromática distinta num ambiente natural.",
                 "Full concept, identity, bar programme, and opening strategy for a beach bar — deck, palapa, and a distinct chromatic identity in a natural setting."),
    },
    "velha-senhora": {
        "name": "O Bar da Velha Senhora",
        "meta": ("Restaurante · Bar · Clube · Lisboa", "Restaurant · Bar · Club · Lisbon"),
        "desc": ("Restaurante, bar e clube com música ao vivo.", "Restaurant, bar and club with live music."),
    },
    "so-what": {
        "name": "So What",
        "meta": ("Bar · Restaurante · Jazz Clube", "Bar · Restaurant · Jazz Club"),
        "desc": ("Música ao vivo, comida, jazz.", "Live music, food, jazz."),
    },
    "sakim": {
        "name": "Sakim",
        "meta": ("Gastro Bar", "Gastro Bar"),
        "desc": ("Espaço de experiências gastronómicas.", "A space for gastronomic experiences."),
    },
}
PROJECT_ORDER = ["a-tabacaria", "o-terraco", "bica-me", "bicaense", "social-b", "o-larguinho", "afro-taska",
                 "house-4", "monte-da-lua", "clube-ferroviario", "ricucu", "velha-senhora", "so-what", "sakim"]

PROCESS = {
    "label": ("Como Trabalhamos", "How We Work"),
    "title": ("O <em>Processo</em>", "The <em>Process</em>"),
    "body": ("Cada projecto segue a mesma lógica subjacente — uma progressão estruturada desde a descoberta até ao lançamento.",
             "Every project follows the same underlying logic — a structured progression from discovery through to launch."),
    "steps": [
        (("Descoberta", "Discovery"),
         ("Compreender o contexto, a ambição e as condicionantes de cada projecto antes de qualquer outra coisa.",
          "Understanding the context, ambition, and constraints of each project before anything else.")),
        (("Definição de Conceito", "Concept Definition"),
         ("Transformar a ideia num conceito claro e coerente com identidade definida e direção estratégica.",
          "Shaping the idea into a clear, coherent concept with a defined identity and strategic direction.")),
        (("Desenvolvimento", "Development"),
         ("Construir as camadas operacionais e criativas — menus, fornecedores, atmosfera, equipa.",
          "Building out the operational and creative layers — menus, suppliers, atmosphere, team.")),
        (("Refinamento", "Refinement"),
         ("Testar menus, formar a equipa, realizar soft launches e fazer ajustes.",
          "Testing menus, training the team, running soft launches, and making adjustments.")),
        (("Abertura & Lançamento", "Opening & Launch"),
         ("Estamos presentes na abertura — observando o serviço, apoiando a equipa e gerindo decisões em tempo real.",
          "We are present for the opening — observing service, supporting the team, managing real-time decisions.")),
    ],
}

ABOUT = {
    "label": ("Sobre o Estúdio", "About the Studio"),
    "title": ("Direção criativa<br>e pensamento<br><em>operacional, juntos.</em>", "Creative direction<br>and operational<br><em>thinking, together.</em>"),
    "side": ("Estúdio<br><br>Est. Lisboa", "Studio<br><br>Est. Lisbon"),
    "lead": ("A Sakim Lab é um estúdio de conceito de hospitalidade.", "Sakim Lab is a hospitality concept studio."),
    "paras": [
        ("Trabalhamos com fundadores de restaurantes, operadores hoteleiros e investidores que estão a construir espaços de hospitalidade e pretendem que isso seja feito com precisão — e não apenas com entusiasmo.",
         "We work with restaurant founders, hotel operators, and investors who are building hospitality spaces and want them done with precision — not just enthusiasm."),
        ("A nossa abordagem assenta na convicção de que <strong>direção criativa e pensamento operacional</strong> nunca devem ser separados.",
         "Our approach is built on the belief that <strong>creative direction and operational thinking</strong> should never be separated."),
        ("Somos seletivos quanto aos clientes com quem trabalhamos. Trabalhamos melhor com clientes que têm uma perspetiva própria e que confiam em nós para a questionar.",
         "We are selective about who we work with. We work best with clients who have a point of view, and who trust us to challenge it."),
    ],
    "values": [
        (("Conceito em Primeiro", "Concept First"),
         ("Cada decisão nasce de um conceito claro e bem definido.", "Every decision flows from a clear, well-defined concept."),
         ("bicaense", "jardim-de-luz")),
        (("Paciência Estratégica", "Strategic Patience"),
         ("Os melhores espaços de hospitalidade são construídos de forma lenta e deliberada.",
          "The best hospitality spaces are built slowly and deliberately."),
         ("so-what", "antes")),
        (("Gosto Acima de Tendência", "Taste Over Trend"),
         ("Interessam-nos os espaços e conceitos que resistem ao tempo.", "We are interested in what holds up — spaces and concepts that age well."),
         ("a-tabacaria", "balcao")),
    ],
}

CONTACT = {
    "label": ("Contacto", "Contact"),
    "title": ("Vamos Falar Sobre<br>o Seu <em>Projecto</em>", "Let's Talk About<br>Your <em>Project</em>"),
    "body": ("Recebemos um número limitado de projetos por ano. O primeiro passo é sempre uma breve conversa.",
             "We take on a limited number of projects each year. The first step is always a short conversation."),
    "based": ("Baseados Em", "Based In"),
    "city": ("Lisboa, Portugal", "Lisbon, Portugal"),
    "rights": ("Todos os direitos reservados.", "All rights reserved."),
}
