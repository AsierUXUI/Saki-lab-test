"""Content for every place on the site.

Each place has its story (PT and EN) and its curated photos, in the order they
appear on the page. A photo is (original upload number, file name, alt PT, alt EN).
Curated photos live in assets/img/lugares/<slug>/<name>.jpg; everything else
that was uploaded for a place is kept in assets/img/lugares/<slug>/arquivo/.
"""

PLACES = [
    {
        "slug": "sakim",
        "name": "Sakim",
        "where": {"pt": "Lisboa", "en": "Lisbon"},
        "kind": {"pt": "Gastro bar", "en": "Gastro bar"},
        "range": (506, 535),
        "cover": "sala-comprida",
        "line": {
            "pt": "A minha própria casa. Uma sala comprida, um chão aos quadrados e uma mesa onde estranhos acabam a partilhar o jantar.",
            "en": "My own house. A long room, a chequered floor and a table where strangers end up sharing dinner.",
        },
        "question": {
            "pt": "O que acontece quando quem desenha lugares para os outros abre um para si? Fiz o que sempre defendi: poucos elementos, todos com intenção — as garrafas na parede, a luz baixa, pratos que chegam como pequenas surpresas.",
            "en": "What happens when someone who designs places for others opens one of his own? I did what I've always preached: few elements, all of them deliberate — bottles on the wall, low light, plates that arrive like small surprises.",
        },
        "did": {
            "pt": "Conceito, espaço, carta — e a casa a funcionar todas as noites.",
            "en": "Concept, space, menu — and running the house every night.",
        },
        "photos": [
            (535, "rua-a-noite", "A porta do Sakim numa rua de Lisboa à noite", "Sakim's door on a Lisbon street at night"),
            (508, "fachada", "A fachada do Sakim com a esplanada", "Sakim's façade and terrace"),
            (509, "pela-porta", "A sala vista da porta, com o chão aos quadrados", "The room seen from the door, chequered floor"),
            (513, "candeeiros", "Candeeiros de papel sobre as mesas", "Paper lamps over the tables"),
            (521, "lustre", "Um lustre de vidro cor de âmbar", "An amber glass chandelier"),
            (517, "sala-comprida", "A sala comprida, pronta para a noite", "The long room, set for the night"),
            (520, "garrafas", "Garrafas de vinho presas à parede", "Wine bottles mounted on the wall"),
            (526, "prato-vermelho", "Um prato vermelho com flores", "A red dish with flowers"),
            (529, "tartaro", "Tártaro sobre pão, molho laranja", "Tartare on bread with an orange sauce"),
            (530, "sobremesa", "Sobremesa com figo e amor-perfeito", "Dessert with fig and a pansy"),
            (519, "mesa-longa", "Uma mesa longa cheia de gente a sorrir", "A long table full of smiling people"),
            (525, "noite-cheia", "A sala cheia ao fim da noite", "The room full late at night"),
        ],
    },
    {
        "slug": "so-what",
        "name": "So What",
        "where": {"pt": "Santos", "en": "Santos"},
        "kind": {"pt": "Clube de jazz & restaurante", "en": "Jazz club & restaurant"},
        "range": (458, 505),
        "logo": 458,
        "cover": "abobada-acesa",
        "line": {
            "pt": "Uma abóbada vazia que hoje tem fila à porta e um contrabaixo ao fundo.",
            "en": "An empty vault that now has a queue at the door and a double bass at the back.",
        },
        "question": {
            "pt": "Como se faz uma cave parecer que sempre teve jazz? Recuperámos móveis antigos, pintámos de vermelho o túnel de entrada e deixámos a música decidir o resto: o palco, a luz, a distância entre as mesas.",
            "en": "How do you make a cellar feel as if it has always had jazz? We rescued old cabinets, painted the entrance tunnel red and let the music decide the rest: the stage, the light, the distance between tables.",
        },
        "did": {
            "pt": "Conceito, transformação do espaço, mobiliário recuperado, bar, cozinha e música ao vivo.",
            "en": "Concept, transformation of the space, rescued furniture, bar, kitchen and live music.",
        },
        "photos": [
            (483, "fila-a-porta", "Fila à porta do So What", "A queue outside So What"),
            (466, "antes", "A abóbada vazia, antes das obras", "The empty vault, before the works"),
            (492, "movel-recuperado", "Um móvel antigo recuperado para o bar", "An old cabinet rescued for the bar"),
            (497, "abobada-acesa", "A abóbada pronta, com o bar aceso", "The finished vault with the bar lit"),
            (481, "tunel-vermelho", "O túnel de entrada pintado de vermelho", "The entrance tunnel painted red"),
            (480, "telefone-vermelho", "Bar com telefone vermelho e candeeiro amarelo", "The bar with a red phone and a yellow lamp"),
            (463, "mesa-posta", "Copos e uma vela na mesa", "Glasses and a candle on the table"),
            (472, "prato", "Um prato da cozinha", "A dish from the kitchen"),
            (476, "contrabaixo", "Contrabaixo e guitarra em palco", "Double bass and guitar on stage"),
            (474, "voz", "Uma cantora sob luz violeta", "A singer under violet light"),
            (489, "bateria", "O baterista em luz azul", "The drummer in blue light"),
            (485, "sala-cheia", "A sala cheia a ouvir", "A full room, listening"),
            (486, "piano", "O piano depois do último tema", "The piano after the last tune"),
            (465, "esplanada", "A esplanada à noite", "The terrace at night"),
        ],
    },
    {
        "slug": "social-b",
        "name": "Social B",
        "where": {"pt": "Cais do Sodré", "en": "Cais do Sodré"},
        "kind": {"pt": "Bar & clube", "en": "Bar & club"},
        "range": (131, 174),
        "extra": [1],
        "cover": "bar-violeta",
        "line": {
            "pt": "Uma cave abobadada no centro de Lisboa, feita para quando a noite já vai longa.",
            "en": "A vaulted cellar in central Lisbon, made for when the night is already long.",
        },
        "question": {
            "pt": "Como dar a uma cave antiga a energia de um clube sem lhe roubar a memória? Luz violeta nas abóbadas, cinema projectado na parede, um canto de biblioteca — e um balcão onde o chá também se serve em bule.",
            "en": "How do you give an old cellar the energy of a club without stealing its memory? Violet light on the vaults, films projected on the wall, a library corner — and a bar where tea also comes in a teapot.",
        },
        "did": {
            "pt": "Conceito e design de atmosfera.",
            "en": "Concept and atmosphere design.",
        },
        "photos": [
            (1, "letreiro", "O letreiro do Social B na rua, à noite", "The Social B sign on the street at night"),
            (131, "entrada", "A entrada abobadada", "The vaulted entrance"),
            (133, "bar-violeta", "O bar sob luz violeta", "The bar under violet light"),
            (152, "sofa-redondo", "Um sofá redondo debaixo da abóbada", "A round sofa under the vault"),
            (144, "balcao-rosas", "Rosas vermelhas num balcão aos quadrados", "Red roses on a chequered bar"),
            (164, "bules", "Bules e torneiras de cerveja", "Teapots and beer taps"),
            (143, "bartenders", "Bartenders a trabalhar", "Bartenders at work"),
            (146, "petiscos", "Croquetes com molho", "Croquettes with sauce"),
            (160, "copo-canela", "Uma bebida com canela e anis", "A drink with cinnamon and star anise"),
            (139, "cinema", "Um filme projectado sobre a sala", "A film projected over the room"),
            (150, "biblioteca", "O canto da biblioteca", "The library corner"),
            (147, "dj", "DJ e pista cheia", "A DJ and a full floor"),
            (141, "musica", "Música ao vivo entre as mesas", "Live music among the tables"),
            (156, "logo-azul", "O logo projectado em azul no tecto", "The logo projected in blue on the ceiling"),
        ],
    },
    {
        "slug": "a-tabacaria",
        "name": "A Tabacaria",
        "where": {"pt": "Cais do Sodré", "en": "Cais do Sodré"},
        "kind": {"pt": "Bar de rum", "en": "Rum bar"},
        "range": (4, 81),
        "cover": "balcao",
        "line": {
            "pt": "Uma tabacaria de 1885 que nunca deixou de vender pequenos prazeres. Só mudou de horário.",
            "en": "An 1885 tobacconist that never stopped selling small pleasures. It just changed its hours.",
        },
        "question": {
            "pt": "Como abrir um bar sem apagar mais de um século de história? Não escondendo nada: o balcão de madeira, os letreiros da lotaria, o Totobola, os frascos de boticário. O rum e os cocktails entraram como mais um produto da casa.",
            "en": "How do you open a bar without erasing more than a century of history? By hiding nothing: the wooden counter, the lottery signs, the football-pools sign, the apothecary jars. Rum and cocktails simply became one more thing the shop sells.",
        },
        "did": {
            "pt": "Conceito completo, programa de bar, direção de cocktails e estratégia de lançamento.",
            "en": "Full concept, bar programme, cocktail direction and launch strategy.",
        },
        "photos": [
            (30, "fachada", "A fachada de azulejo verde", "The green-tiled façade"),
            (12, "porta-a-noite", "A porta d'A Tabacaria à noite", "A Tabacaria's door at night"),
            (5, "balcao", "O balcão de madeira de 1885", "The 1885 wooden counter"),
            (45, "janela-electrico", "Um eléctrico visto da janela", "A tram seen through the window"),
            (27, "candeeiro", "Candeeiro esmaltado sobre as garrafas", "An enamel lamp over the bottles"),
            (16, "totobola", "O letreiro antigo do Totobola", "The old football-pools sign"),
            (29, "gramofone", "Um gramofone entre a fruta", "A gramophone among the fruit"),
            (35, "boticario", "Frascos de boticário na penumbra", "Apothecary jars in the half-light"),
            (48, "frasco", "Um frasco com o rótulo da casa", "A jar with the house label"),
            (34, "torneiras", "Torneiras antigas de cerveja", "Old beer taps"),
            (55, "tabua", "Uma tábua de petiscos e um cocktail", "A board of snacks and a cocktail"),
            (58, "macarico", "Carne a ser maçaricada", "Meat being torched"),
            (72, "espuma", "Um cocktail com espuma", "A cocktail with foam"),
            (74, "petalas", "Um cocktail com pétalas", "A cocktail with petals"),
            (76, "vermelho", "Um cocktail vermelho com lima", "A red cocktail with lime"),
            (78, "janela-gramofone", "O gramofone à janela, com o eléctrico lá fora", "The gramophone at the window, a tram outside"),
            (44, "sala-a-noite", "A sala à noite", "The room at night"),
            (15, "ultima-luz", "O bar com a última luz acesa", "The bar with the last light on"),
        ],
    },
    {
        "slug": "velha-senhora",
        "name": "O Bar da Velha Senhora",
        "where": {"pt": "Cais do Sodré", "en": "Cais do Sodré"},
        "kind": {"pt": "Restaurante, bar & clube", "en": "Restaurant, bar & club"},
        "range": (386, 457),
        "logo": 386,
        "cover": "porta",
        "line": {
            "pt": "Burlesco, música de câmara e jantar na mesma noite — às vezes na mesma mesa.",
            "en": "Burlesque, chamber music and dinner on the same night — sometimes at the same table.",
        },
        "question": {
            "pt": "Como se cria um palco onde tudo pode acontecer? Uma sala de candeeiros antigos e corações na parede, mesas feitas à medida, e uma programação que vai do quarteto de cordas ao cabaré.",
            "en": "How do you build a stage where anything can happen? A room of old lamps and hearts on the wall, tables made to measure, and a programme that runs from string quartet to cabaret.",
        },
        "did": {
            "pt": "Conceito, construção do espaço, restaurante, bar e música ao vivo.",
            "en": "Concept, building the space, restaurant, bar and live music.",
        },
        "photos": [
            (392, "porta", "A porta à noite, com gente cá fora", "The door at night, people outside"),
            (457, "rua-rosa", "A rua cor-de-rosa", "The pink street"),
            (416, "mesas-em-obra", "Mesas de ferro a ser feitas", "Iron tables being made"),
            (450, "arco-verde", "O arco verde em construção", "The green arch being built"),
            (433, "candeeiros", "Candeeiros antigos e luzes", "Old lamps and string lights"),
            (410, "coracoes", "O bar com a parede de corações", "The bar with its wall of hearts"),
            (455, "candeeiros-velhos", "Uma colecção de candeeiros antigos", "A collection of old lamps"),
            (434, "jantar", "Jantar visto de cima", "Dinner from above"),
            (414, "quarteto", "Quarteto de cordas sob o mural", "A string quartet under the mural"),
            (393, "danca", "Uma bailarina em palco", "A dancer on stage"),
            (396, "leque", "Uma artista com um leque", "A performer with a fan"),
            (399, "cantora", "Uma cantora ao microfone", "A singer at the microphone"),
            (412, "mascaras", "Convidados mascarados", "Masked guests"),
            (445, "festa", "A festa no fim da noite", "The party at the end of the night"),
        ],
    },
    {
        "slug": "clube-ferroviario",
        "name": "Clube Ferroviário",
        "where": {"pt": "Santa Apolónia", "en": "Santa Apolónia"},
        "kind": {"pt": "Terraço", "en": "Rooftop"},
        "range": (271, 322),
        "logo": 271,
        "cover": "navio",
        "line": {
            "pt": "Um terraço sobre o Tejo onde os navios de cruzeiro passam a fazer parte da decoração.",
            "en": "A terrace over the Tagus where cruise ships become part of the décor.",
        },
        "question": {
            "pt": "Como se devolve a vida a um clube histórico dos ferroviários? De dia, relva, espreguiçadeiras e o rio à frente. À noite, concertos, bailes e cinema ao ar livre.",
            "en": "How do you bring a historic railway workers' club back to life? By day, grass, deckchairs and the river in front. By night, concerts, dances and open-air cinema.",
        },
        "did": {
            "pt": "Conceito, programa de bar, agenda cultural e lançamento.",
            "en": "Concept, bar programme, cultural programme and launch.",
        },
        "photos": [
            (276, "navio", "Um navio de cruzeiro atrás das sombras", "A cruise ship behind the shades"),
            (279, "relva", "Relva e espreguiçadeiras junto à ponte", "Grass and deckchairs by the bridge"),
            (283, "mesas-e-navio", "Mesas com o navio ao fundo", "Tables with the ship behind"),
            (281, "bar", "O bar ao ar livre", "The open-air bar"),
            (295, "baile", "Cartaz de um baile", "A dance night poster"),
            (318, "cinema-mudo", "Cartaz de cinema mudo com música ao vivo", "A silent film poster with live music"),
            (285, "concerto", "Multidão num concerto", "A crowd at a concert"),
            (304, "ecra", "O ecrã de cinema ao ar livre", "The open-air cinema screen"),
            (289, "contrabaixo", "Contrabaixo ao anoitecer", "A double bass at dusk"),
            (287, "candeeiro", "Um candeeiro aceso ao fim da tarde", "A lamp lit at the end of the day"),
            (303, "anoitecer", "O terraço ao anoitecer, com um navio iluminado", "The terrace at dusk with a lit ship"),
        ],
    },
    {
        "slug": "o-terraco",
        "name": "O Terraço",
        "where": {"pt": "Lisboa", "en": "Lisbon"},
        "kind": {"pt": "Bar de terraço", "en": "Rooftop bar"},
        "range": (82, 101),
        "cover": "por-do-sol",
        "line": {
            "pt": "Um telhado no centro histórico, uma rede de sombra e Lisboa inteira a mudar de cor.",
            "en": "A rooftop in the old centre, a canopy of shade and the whole of Lisbon changing colour.",
        },
        "question": {
            "pt": "Como fazer as pessoas ficarem do pôr do sol até à noite? Sofás em vez de cadeiras, lanternas que se acendem devagar, música ao vivo quando o céu escurece.",
            "en": "How do you get people to stay from sunset into the night? Sofas instead of chairs, lanterns that come on slowly, live music as the sky goes dark.",
        },
        "did": {
            "pt": "Direção de conceito e design de atmosfera.",
            "en": "Concept direction and atmosphere design.",
        },
        "photos": [
            (90, "tarde", "Amigas num sofá ao fim da tarde", "Friends on a sofa in the late afternoon"),
            (85, "gente", "O terraço cheio ao sol", "The terrace full in the sun"),
            (93, "sesta", "Alguém a dormir num sofá sobre Lisboa", "Someone asleep on a sofa above Lisbon"),
            (88, "guitarra", "Guitarra sob a sombra colorida", "A guitar under the coloured canopy"),
            (100, "por-do-sol", "O pôr do sol debaixo da rede", "Sunset under the canopy"),
            (95, "lanternas", "Lanternas acesas ao anoitecer", "Lanterns lit at dusk"),
            (101, "hora-azul", "A hora azul sobre o rio", "Blue hour over the river"),
        ],
    },
    {
        "slug": "o-larguinho",
        "name": "O Larguinho",
        "where": {"pt": "Alfama", "en": "Alfama"},
        "kind": {"pt": "Bar de tapas", "en": "Tapas bar"},
        "range": (175, 196),
        "cover": "largo-ao-anoitecer",
        "line": {
            "pt": "“A alegria é a coisa mais séria da vida” — está escrito na parede, e o resto do bar leva isso a sério.",
            "en": "“Joy is the most serious thing in life” — it's written on the wall, and the rest of the bar takes it seriously.",
        },
        "question": {
            "pt": "Como se faz um bar de bairro onde o bairro se sente em casa? Uma esplanada no largo, o eléctrico a passar, tapas para partilhar e a porta sempre aberta.",
            "en": "How do you make a neighbourhood bar where the neighbourhood feels at home? A terrace on the little square, the tram going by, tapas to share and the door always open.",
        },
        "did": {
            "pt": "Conceito, carta de tapas e estratégia de abertura.",
            "en": "Concept, tapas menu and opening strategy.",
        },
        "photos": [
            (179, "electrico", "O eléctrico a passar pela esplanada", "The tram passing the terrace"),
            (188, "largo-ao-anoitecer", "O largo ao anoitecer", "The little square at dusk"),
            (175, "mural", "O mural: a alegria é a coisa mais séria da vida", "The mural: joy is the most serious thing in life"),
            (181, "porta-aberta", "A porta aberta para o largo", "The door open onto the square"),
            (183, "parede-amarela", "Uma parede amarela com grafitti", "A yellow wall with graffiti"),
            (178, "lata", "Um candeeiro feito de lata de sopa", "A lamp made from a soup can"),
            (190, "chapeus", "Dois amigos de chapéu à mesa", "Two friends in hats at a table"),
            (189, "noite", "A esplanada cheia à noite", "The terrace full at night"),
        ],
    },
    {
        "slug": "bica-me",
        "name": "Bica-me",
        "where": {"pt": "Bica", "en": "Bica"},
        "kind": {"pt": "Mercearia & bar", "en": "Grocery & bar"},
        "range": (102, 121),
        "logo": 102,
        "cover": "velas",
        "line": {
            "pt": "Uma mercearia de dia, um bar à luz das velas à noite.",
            "en": "A grocery by day, a candlelit bar by night.",
        },
        "question": {
            "pt": "Como fazer uma loja de produtos artesanais onde apetece ficar? Prateleiras que se lêem como uma despensa, enchidos e queijos ao balcão, vinhos naturais e velas nas mesas quando a rua escurece.",
            "en": "How do you make a shop of artisan products where people want to stay? Shelves that read like a pantry, charcuterie and cheese at the counter, natural wines, and candles on the tables when the street gets dark.",
        },
        "did": {
            "pt": "Conceito, identidade e programa de comida.",
            "en": "Concept, identity and food programme.",
        },
        "photos": [
            (103, "entrada", "A entrada da Bica-me", "The Bica-me entrance"),
            (110, "prateleiras", "Prateleiras e luzes suspensas", "Shelves and hanging lights"),
            (107, "despensa", "Frascos e garrafas na despensa", "Jars and bottles in the pantry"),
            (114, "vitrine", "A vitrine de queijos e doces", "The cheese and pastry counter"),
            (105, "tabua", "Enchidos, queijo e um copo de vinho", "Charcuterie, cheese and a glass of wine"),
            (120, "vinhos", "Paredes de vinho", "Walls of wine"),
            (119, "velas", "Velas acesas nas mesas", "Candles lit on the tables"),
        ],
    },
    {
        "slug": "bicaense",
        "name": "Bicaense",
        "where": {"pt": "Bica", "en": "Bica"},
        "kind": {"pt": "Bar & clube", "en": "Bar & club"},
        "range": (122, 130),
        "cover": "jardim-de-luz",
        "line": {
            "pt": "Luz de cor, um balcão curvo e um jardim a crescer pelas paredes.",
            "en": "Coloured light, a curved bar and a garden growing up the walls.",
        },
        "question": {
            "pt": "Como fazer um bar mudar de humor ao longo da noite? Com luz cromática que pinta as paredes, um balcão que convida a dar a volta e uma instalação botânica que suaviza tudo.",
            "en": "How do you make a bar change mood through the night? With chromatic light that paints the walls, a bar you want to walk around, and a botanical installation that softens everything.",
        },
        "did": {
            "pt": "Conceito, programa de bar e design de atmosfera.",
            "en": "Concept, bar programme and atmosphere design.",
        },
        "photos": [
            (122, "jardim-de-luz", "Ramos e luz colorida na parede", "Branches and coloured light on the wall"),
            (123, "ramos", "A instalação botânica sob luz rosa", "The botanical installation under pink light"),
            (124, "balcao-curvo", "O balcão curvo", "The curved bar"),
        ],
    },
    {
        "slug": "ricucu",
        "name": "Ricucu",
        "where": {"pt": "Praia Verde, Algarve", "en": "Praia Verde, Algarve"},
        "kind": {"pt": "Bar de praia", "en": "Beach bar"},
        "range": (323, 385),
        "cover": "porta-roxa",
        "line": {
            "pt": "Um deck branco nas dunas, redes ao vento e uma porta roxa aberta para a lua.",
            "en": "A white deck in the dunes, hammocks in the wind and a purple door open to the moon.",
        },
        "question": {
            "pt": "Como se desenha um bar de praia que não compete com a paisagem? Madeira branca, colmo, redes para ficar — e uma única cor forte, para lembrar que aqui também é noite.",
            "en": "How do you design a beach bar that doesn't compete with the landscape? White wood, thatch, hammocks to linger in — and a single strong colour, to remind you that night happens here too.",
        },
        "did": {
            "pt": "Conceito completo, identidade, programa de bar e estratégia de abertura.",
            "en": "Full concept, identity, bar programme and opening strategy.",
        },
        "photos": [
            (384, "porta-roxa", "Uma porta roxa aberta para as dunas e a lua", "A purple door open to the dunes and the moon"),
            (347, "deck", "O deck com a parede rosa e o mar", "The deck with the pink wall and the sea"),
            (323, "rede", "Uma rede debaixo do colmo", "A hammock under the thatch"),
            (340, "rede-e-mar", "Rede com o mar ao fundo", "A hammock with the sea behind"),
            (343, "espreguicadeiras", "Espreguiçadeiras no deck", "Loungers on the deck"),
            (349, "bar-a-noite", "O bar aceso à noite", "The bar lit at night"),
            (348, "lanterna", "Uma lanterna sobre as mesas", "A lantern over the tables"),
            (383, "dunas", "As dunas ao anoitecer", "The dunes at dusk"),
            (385, "fim-do-dia", "A estrutura de madeira ao fim do dia", "The wooden structure at the end of the day"),
        ],
    },
    {
        "slug": "monte-da-lua",
        "name": "Monte da Lua",
        "where": {"pt": "Moçambique", "en": "Mozambique"},
        "kind": {"pt": "Retiro", "en": "Retreat"},
        "range": (261, 270),
        "cover": "cabana-a-noite",
        "line": {
            "pt": "Cabanas de colmo na costa de Moçambique, sem rede eléctrica e sem pressa.",
            "en": "Thatched huts on the coast of Mozambique, off the grid and in no hurry.",
        },
        "question": {
            "pt": "Como se recebe alguém onde não há nada — quando é exactamente isso que procura? Luz de lanterna, camas viradas para o pôr do sol, caminhos de areia e só o indispensável.",
            "en": "How do you welcome someone where there is nothing — when that's exactly what they came for? Lantern light, beds facing the sunset, sand paths and only what's essential.",
        },
        "did": {
            "pt": "Conceito de hospitalidade, experiência de hóspede e estratégia de F&B.",
            "en": "Hospitality concept, guest experience and F&B strategy.",
        },
        "photos": [
            (263, "cabana-a-noite", "Uma cabana iluminada à noite", "A hut lit up at night"),
            (261, "cabana", "Uma cabana de colmo", "A thatched hut"),
            (264, "caminho", "Um caminho de areia entre a vegetação", "A sand path through the bush"),
            (265, "interior", "O interior de madeira", "The wooden interior"),
            (262, "por-do-sol", "Uma cama virada para o pôr do sol", "A bed facing the sunset"),
            (266, "varanda", "A varanda ao fim da tarde", "The veranda at the end of the day"),
        ],
    },
    {
        "slug": "house-4",
        "name": "House 4",
        "where": {"pt": "Bairro Alto", "en": "Bairro Alto"},
        "kind": {"pt": "Alojamento local", "en": "Guesthouse"},
        "range": (202, 260),
        "logo": 202,
        "cover": "corredor-rosa",
        "line": {
            "pt": "Uma casa de hóspedes onde cada corredor tem a sua cor.",
            "en": "A guesthouse where every corridor has its own colour.",
        },
        "question": {
            "pt": "Como se faz um alojamento de que alguém se lembra depois de fazer a mala? Corredores rosa e violeta, uma parede de cobre, peças mid-century e pequenos detalhes com humor.",
            "en": "How do you make a guesthouse someone remembers after packing their bag? Pink and violet corridors, a copper wall, mid-century pieces and small details with a sense of humour.",
        },
        "did": {
            "pt": "Conceito de interior e experiência de hóspede.",
            "en": "Interior concept and guest experience.",
        },
        "photos": [
            (203, "fachada", "A fachada ao fim da tarde", "The façade in the late afternoon"),
            (212, "corredor-rosa", "Um corredor rosa com tecto estrelado", "A pink corridor with a starry ceiling"),
            (207, "porta-rosa", "Uma porta aberta no corredor rosa", "A door open off the pink corridor"),
            (229, "luz-violeta", "Um quarto em luz violeta", "A room in violet light"),
            (224, "parede-de-cobre", "Uma cama com parede de cobre", "A bed against a copper wall"),
            (214, "cadeira", "Uma cadeira mid-century à janela", "A mid-century chair by the window"),
            (226, "algemas", "Algemas na maçaneta", "Handcuffs on the door handle"),
            (237, "lavatorio", "Lavatório de aço", "A steel washbasin"),
            (225, "sofa", "Um sofá branco e um candeeiro aceso", "A white sofa and a lit lamp"),
        ],
    },
    {
        "slug": "afro-taska",
        "name": "Afro Taska",
        "where": {"pt": "Lisboa", "en": "Lisbon"},
        "kind": {"pt": "Tasca africana", "en": "African tasca"},
        "range": (197, 201),
        "cover": "mesas",
        "line": {
            "pt": "Uma tasca onde a cozinha da África Ocidental se senta à mesa portuguesa.",
            "en": "A tasca where West African cooking sits down at a Portuguese table.",
        },
        "question": {
            "pt": "Como se juntam duas tradições de mesa sem as transformar em decoração? Murais geométricos, tecido wax — e a comida como ponto de partida.",
            "en": "How do you bring two table traditions together without turning them into decoration? Geometric murals, wax fabric — and the food as the starting point.",
        },
        "did": {
            "pt": "Conceito completo e montagem do restaurante.",
            "en": "Full concept and restaurant setup.",
        },
        "photos": [
            (197, "sala", "A sala com murais geométricos", "The room with geometric murals"),
            (198, "mesas", "Gente à mesa ao fim do dia", "People at the table in the evening"),
            (199, "bolo", "Um bolo com velas sob o mural", "A cake with candles under the mural"),
        ],
    },
]

# Bars without photos yet: they have a text-only page and a dot on the map.
PLACES += [
    {
        "slug": "wip",
        "name": "W.I.P.",
        "where": {"pt": "Bairro Alto", "en": "Bairro Alto"},
        "kind": {"pt": "Bar, loja & cabeleireiro", "en": "Bar, shop & hairdresser"},
        "range": None,
        "cover": None,
        "line": {
            "pt": "Cabeleireiro, loja de roupa e bar no mesmo sítio — muito antes de isso ter nome.",
            "en": "A hairdresser, a clothes shop and a bar in one place — long before that had a name.",
        },
        "question": {
            "pt": "Porque é que um bar não pode ser também o sítio onde se corta o cabelo e se compra uma camisa? O W.I.P. — work in progress — foi a primeira resposta.",
            "en": "Why can't a bar also be where you get a haircut and buy a shirt? W.I.P. — work in progress — was the first answer.",
        },
        "did": {"pt": "Conceito e abertura.", "en": "Concept and opening."},
        "photos": [],
    },
    {
        "slug": "atira-te-ao-rio",
        "name": "Atira-te ao Rio",
        "where": {"pt": "Cacilhas, Almada", "en": "Cacilhas, Almada"},
        "kind": {"pt": "Restaurante", "en": "Restaurant"},
        "range": None,
        "cover": None,
        "line": {
            "pt": "Uma mesa à beira do Tejo, do outro lado, com Lisboa inteira à frente.",
            "en": "A table on the edge of the Tagus, on the other side, with the whole of Lisbon in front of it.",
        },
        "question": {
            "pt": "Como se faz alguém atravessar o rio para jantar? Dando-lhe a melhor vista da cidade — a própria cidade, vista de fora.",
            "en": "How do you get someone to cross the river for dinner? By giving them the best view of the city — the city itself, seen from outside.",
        },
        "did": {"pt": "Conceito e abertura.", "en": "Concept and opening."},
        "photos": [],
    },
]

# Photos used outside a single place
SITE_PHOTOS = {
    2: "assets/img/marca/sakim-logo.jpg",
    3: "assets/img/lisboa/janela-sobre-o-rio.jpg",
}


def photo_path(place, i):
    """Path of a curated photo, relative to the site root."""
    _, name, _, _ = place["photos"][i]
    return f"assets/img/lugares/{place['slug']}/{name}.jpg"


def cover_path(place):
    """The place's main photo, or None while it has no photos."""
    if not place.get("cover"):
        return None
    return f"assets/img/lugares/{place['slug']}/{place['cover']}.jpg"


# Where and when each place happened, for the map and the year slider on the Places page.
# geo:   (latitude, longitude). None while the location is unknown: listed as "not on the map yet".
# addr:  street address shown on the map card, when known.
# far:   outside Lisbon; shown as an arrow at the edge of the map instead of a dot.
# year:  the year it opened (or he took it over); None while unknown ("year to confirm").
# label: "left" puts the name on the left of the dot, where places sit close together.
# Sources found online (Time Out Lisboa, Observador, The Infatuation, hotel listings), October 2026.
MAP = {
    # Confirmed online: address and year. PLACEHOLDER: made up for now, to be confirmed by him.
    "wip":               {"geo": (38.7128, -9.1440), "addr": "Bairro Alto", "year": 1997},                          # PLACEHOLDER location; year ~1997-98 per press
    "bicaense":          {"geo": (38.7097, -9.1465), "addr": "Rua da Bica de Duarte Belo", "year": 2002},
    "bica-me":           {"geo": (38.7103, -9.1472), "addr": "Bica", "label": "left", "year": 2004},                # PLACEHOLDER year
    "atira-te-ao-rio":   {"geo": (38.6857, -9.1505), "addr": "Cais do Ginjal, Cacilhas", "year": 2006},            # PLACEHOLDER year
    "house-4":           {"geo": (38.7146, -9.1449), "addr": "Travessa de São Pedro, 9", "year": 2009},            # PLACEHOLDER year
    "clube-ferroviario": {"geo": (38.7140, -9.1228), "addr": "Rua de Santa Apolónia, 59", "year": 2010},
    "velha-senhora":     {"geo": (38.7069, -9.1440), "addr": "Rua Nova do Carvalho, 40", "year": 2011},            # PLACEHOLDER year
    "o-terraco":         {"geo": (38.7136, -9.1388), "addr": "Baixa", "year": 2012},                               # PLACEHOLDER location and year
    "o-larguinho":       {"geo": (38.7115, -9.1305), "addr": "Alfama", "year": 2013},                              # PLACEHOLDER year
    "a-tabacaria":       {"geo": (38.7078, -9.1468), "addr": "Rua de São Paulo, 75", "year": 2015},
    "ricucu":            {"far": True, "year": 2016},                                                              # PLACEHOLDER year; Praia Verde, Algarve
    "monte-da-lua":      {"far": True, "year": 2017},                                                              # PLACEHOLDER year; Mozambique
    "social-b":          {"geo": (38.7084, -9.1497), "addr": "Rua da Boavista, 116", "label": "left", "year": 2018},
    "afro-taska":        {"geo": (38.7208, -9.1352), "addr": "Intendente", "year": 2019},                          # PLACEHOLDER location and year
    "sakim":             {"geo": (38.7158, -9.1352), "addr": "Mouraria", "year": 2022},                            # PLACEHOLDER location and year
    "so-what":           {"geo": (38.7076, -9.1552), "addr": "Santos — onde era o Porão de Santos", "label": "left", "year": 2024},
}
