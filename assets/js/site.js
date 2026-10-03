(function () {
  'use strict';
  document.body.classList.remove('no-js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var page = document.body.dataset.page;
  var lenis = null;

  /* ---------- LANGUAGE ---------- */
  var lang = 'pt';
  try {
    var saved = localStorage.getItem('sakim-lang');
    if (saved === 'pt' || saved === 'en') lang = saved;
    else if (!/^pt/i.test(navigator.language || 'pt')) lang = 'en';
  } catch (e) {}

  function splitManifesto() {
    var el = $('#manifesto-text');
    if (!el) return;
    el.innerHTML = el.getAttribute('data-' + lang).split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem('sakim-lang', l); } catch (e) {}
    document.documentElement.lang = l;
    $$('[data-' + l + ']').forEach(function (el) {
      if (el.id === 'manifesto-text') return;
      el.innerHTML = el.getAttribute('data-' + l);
    });
    $$('[data-alt-' + l + ']').forEach(function (el) { el.alt = el.getAttribute('data-alt-' + l); });
    $$('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === l); });
    splitManifesto();
    if (renderBooking) renderBooking();
    tick();
    if (window.ScrollTrigger && document.body.classList.contains('anim')) { setupManifesto(); ScrollTrigger.refresh(); }
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  /* ---------- BOOKING CONVERSATION ---------- */
  /* A few questions, one at a time; the answers become a WhatsApp message or an email. */
  var renderBooking = null;
  var openPlace = null;   /* set by the place sheet below */
  (function booking() {
    var box = $('#booking'), dataEl = $('#booking-data');
    if (!box || !dataEl) return;
    var data = JSON.parse(dataEl.textContent);
    var log = $('#chat-log'), input = $('#chat-input'), restart = $('.chat-restart', box);
    var T = {
      pt: {
        hello: ['Bom dia! Que bom ter passado por cá.', 'Boa tarde! Que bom ter passado por cá.', 'Boa noite! Que bom ter passado por cá.'],
        intro: 'Antes de nos sentarmos à mesa, conte-me só um bocadinho.',
        need: 'Então, o que é que tem entre mãos?',
        needs: {
          tudo: 'Um lugar que ainda não existe — quero começar do zero',
          partes: 'Já está a andar — mas faltam algumas peças',
          melhorar: 'A casa já está aberta — quero que fique melhor'
        },
        partsQ: { partes: 'Boa. Que peças faltam? Pode escolher várias.', melhorar: 'Gosto disso. Onde sente que pode ficar melhor? Se não souber bem, descobrimos juntos.' },
        unsure: 'Ainda não sei bem',
        go: 'Continuar',
        story: 'Conte-me um pouco do projecto — o que imagina, o que já existe, o que o preocupa. Pode ser curto.',
        storyPh: 'Escreva à vontade…', storySkip: 'Prefiro contar à mesa',
        where: 'E onde é que isto acontece — ou vai acontecer?',
        places: ['Lisboa', 'Porto', 'Algarve', 'Fora de Portugal'],
        wherePh: 'Outro sítio…',
        when: 'Já tem uma altura em mente para nos sentarmos? Se não, não há pressa — eu proponho.',
        whenModes: { dia: 'Sim, já sei o dia', altura: 'Mais ou menos', livre: 'Proponha você' },
        pick: { dia: 'Óptimo. Que dia? E, se tiver preferência, a que parte do dia.', altura: 'Combinado. Mais ou menos quando?' },
        periods: ['Esta semana', 'Na próxima semana', 'Nas próximas duas semanas', 'Ainda este mês', 'No próximo mês'],
        dayparts: ['De manhã', 'Ao almoço', 'À tarde', 'Ao fim do dia'], daypartLabel: 'Parte do dia (opcional)',
        week: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], prev: 'Mês anterior', next: 'Mês seguinte',
        name: 'Para terminar: como se chama? E, se já tiver nome, o projecto ou a casa.',
        namePh: 'O seu nome', companyPh: 'Nome do projecto ou da casa (opcional)',
        send: 'Enviar',
        done: function (n) { return 'Prazer, ' + n + '. Já tenho tudo o que preciso. Por onde prefere que continuemos a conversa?'; },
        viaWa: 'Continuamos no WhatsApp', viaEmail: 'Prefiro por email',
        msg: {
          header: 'SAKIM LAB · Pedido de conversa pelo site',
          footer: 'Enviado a partir do site Sakim Lab.',
          intro: 'Olá Sakim! Vim pelo site e gostava que nos sentássemos a conversar.',
          need: 'O que tenho entre mãos', partes: 'Peças que faltam', melhorar: 'O que quero melhorar', story: 'Sobre o projecto', where: 'Onde', when: 'Quando',
          whenever: 'quando lhe der jeito — proponha você', name: 'Nome', company: 'Projecto / casa',
          subject: 'Pedido de conversa pelo site — Sakim Lab'
        }
      },
      en: {
        hello: ['Good morning! Glad you stopped by.', 'Good afternoon! Glad you stopped by.', 'Good evening! Glad you stopped by.'],
        intro: 'Before we sit down at the table, tell me a little.',
        need: 'So, what are you working on?',
        needs: {
          tudo: "A place that doesn't exist yet — I'd like to start from zero",
          partes: "It's already under way — but some pieces are missing",
          melhorar: 'My place is already open — I want it to be better'
        },
        partsQ: { partes: 'Good. Which pieces are missing? Pick as many as you like.', melhorar: "I like that. Where do you feel it could be better? If you're not sure, we'll find out together." },
        unsure: "I'm not quite sure",
        go: 'Continue',
        story: 'Tell me a little about the project — what you imagine, what already exists, what worries you. Short is fine.',
        storyPh: 'Write freely…', storySkip: "I'd rather tell you at the table",
        where: 'And where does this happen — or where will it?',
        places: ['Lisbon', 'Porto', 'Algarve', 'Outside Portugal'],
        wherePh: 'Somewhere else…',
        when: "Do you already have a time in mind to sit down together? If not, no rush — I'll suggest one.",
        whenModes: { dia: 'Yes, I know the day', altura: 'Roughly', livre: 'You tell me' },
        pick: { dia: 'Great. Which day? And, if you have a preference, what part of the day.', altura: 'Fine by me. Roughly when?' },
        periods: ['This week', 'Next week', 'In the next couple of weeks', 'Later this month', 'Next month'],
        dayparts: ['In the morning', 'Over lunch', 'In the afternoon', 'In the evening'], daypartLabel: 'Part of the day (optional)',
        week: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], prev: 'Previous month', next: 'Next month',
        name: "Last thing: what's your name? And the project or the place, if it already has one.",
        namePh: 'Your name', companyPh: 'Project or place name (optional)',
        send: 'Send',
        done: function (n) { return 'Nice to meet you, ' + n + '. I have everything I need. Where would you like to carry on the conversation?'; },
        viaWa: "Let's continue on WhatsApp", viaEmail: "I'd rather email",
        msg: {
          header: 'SAKIM LAB · Conversation request from the website',
          footer: 'Sent from the Sakim Lab website.',
          intro: 'Hello Sakim! I found you through the website and would love to sit down and talk.',
          need: 'What I have', partes: 'Pieces missing', melhorar: 'What I want to improve', story: 'About the project', where: 'Where', when: 'When',
          whenever: 'whenever suits you — you suggest', name: 'Name', company: 'Project / place',
          subject: 'Conversation request from the website — Sakim Lab'
        }
      }
    };

    var today = new Date(); today.setHours(0, 0, 0, 0);
    function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    var minDay = addDays(today, 1), maxDay = addDays(today, 120), calMonth;
    var st, shown = 0, touched = false, lastStep = null;
    function reset() {
      st = { step: 'need', need: null, parts: [], unsure: false, story: null, where: '', when: null, date: null, period: -1, daypart: -1, picked: false, name: '', company: '' };
      calMonth = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
      shown = 0;
    }
    reset();

    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
    function fmt(d) { return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); }
    function partsAnswer() {
      var names = st.parts.map(function (id) { return data.services.find(function (x) { return x.id === id; })[lang]; });
      if (st.unsure) names.push(T[lang].unsure);
      return names.join(', ');
    }
    function whenAnswer() {
      var L = T[lang];
      var base = st.when === 'dia' ? fmt(st.date) : L.periods[st.period];
      var answer = st.daypart > -1 ? base + ', ' + lower(L.dayparts[st.daypart]) : base;
      return answer.charAt(0).toUpperCase() + answer.slice(1);
    }
    function whoAnswer() { return st.company ? st.name + ' · ' + st.company : st.name; }
    /* The same message for WhatsApp (with its *bold* and _italic_) and for email (plain text). */
    function message(wa) {
      var L = T[lang], m = L.msg, b = wa ? '*' : '', i = wa ? '_' : '', rule = '──────────────';
      var row = function (label, value) { return b + label + ':' + b + ' ' + value; };
      var lines = [b + m.header + b, rule, '', m.intro, ''];
      lines.push(row(m.need, L.needs[st.need]));
      if (st.need !== 'tudo') lines.push(row(m[st.need], partsAnswer()));
      if (st.story) lines.push(row(m.story, st.story));
      lines.push(row(m.where, st.where));
      lines.push(row(m.when, st.when === 'livre' ? m.whenever : whenAnswer()));
      lines.push(row(m.name, st.name));
      if (st.company) lines.push(row(m.company, st.company));
      lines.push('', rule, i + m.footer + i);
      return lines.join('\n');
    }
    function conversation() {
      var L = T[lang], h = new Date().getHours();
      var c = [['bot', L.hello[h >= 5 && h < 13 ? 0 : h >= 13 && h < 20 ? 1 : 2]], ['bot', L.intro], ['bot', L.need]];
      if (!st.need) return c;
      c.push(['me', L.needs[st.need]]);
      if (st.need !== 'tudo') {
        c.push(['bot', L.partsQ[st.need]]);
        if (st.step === 'parts') return c;
        c.push(['me', partsAnswer()]);
      }
      c.push(['bot', L.story]);
      if (st.story === null) return c;
      c.push(['me', st.story || L.storySkip]);
      c.push(['bot', L.where]);
      if (!st.where) return c;
      c.push(['me', st.where]);
      c.push(['bot', L.when]);
      if (!st.when) return c;
      c.push(['me', L.whenModes[st.when]]);
      if (st.when !== 'livre') {
        c.push(['bot', L.pick[st.when]]);
        if (!st.picked) return c;
        c.push(['me', whenAnswer()]);
      }
      c.push(['bot', L.name]);
      if (!st.name) return c;
      c.push(['me', whoAnswer()]);
      c.push(['bot', L.done(st.name)]);
      return c;
    }
    function go(next) { touched = true; st.step = next; render(); }
    function focusLater(i) { if (touched) setTimeout(function () { i.focus({ preventScroll: true }); }, 400); }
    function textField(ph, onSend) {
      var f = el('form', 'chat-field'), i = el('input'), b = el('button', null, T[lang].send);
      i.type = 'text'; i.placeholder = ph; i.maxLength = 80; i.autocomplete = 'off'; i.setAttribute('aria-label', ph);
      b.type = 'submit';
      f.appendChild(i); f.appendChild(b);
      f.addEventListener('submit', function (e) { e.preventDefault(); var v = i.value.trim(); if (v) onSend(v); });
      focusLater(i);
      return f;
    }
    function chips(labels, isOn, onTap) {
      var row = el('div', 'chat-chips');
      labels.forEach(function (label, i) {
        var on = isOn(i);
        var b = el('button', 'chat-chip' + (on ? ' on' : ''), label); b.type = 'button'; b.setAttribute('aria-pressed', on);
        b.addEventListener('click', function () {
          onTap(i);
          $$('.chat-chip', row).forEach(function (x, j) { var now = isOn(j); x.classList.toggle('on', now); x.setAttribute('aria-pressed', now); });
        });
        row.appendChild(b);
      });
      return row;
    }
    function calendar(onChange) {
      var cal = el('div', 'cal');
      function draw() {
        var L = T[lang];
        cal.innerHTML = '';
        var head = el('div', 'cal-head');
        var prev = el('button', 'cal-nav', '‹'), next = el('button', 'cal-nav', '›');
        prev.type = next.type = 'button';
        prev.setAttribute('aria-label', L.prev); next.setAttribute('aria-label', L.next);
        prev.disabled = calMonth <= new Date(minDay.getFullYear(), minDay.getMonth(), 1);
        next.disabled = calMonth >= new Date(maxDay.getFullYear(), maxDay.getMonth(), 1);
        prev.addEventListener('click', function () { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); draw(); });
        next.addEventListener('click', function () { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); draw(); });
        var month = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', { month: 'long', year: 'numeric' }).format(calMonth);
        head.appendChild(prev); head.appendChild(el('span', 'cal-title', month.charAt(0).toUpperCase() + month.slice(1))); head.appendChild(next);
        cal.appendChild(head);
        var grid = el('div', 'cal-grid');
        L.week.forEach(function (w) { grid.appendChild(el('span', 'cal-wd', w)); });
        for (var i = 0; i < (calMonth.getDay() + 6) % 7; i++) grid.appendChild(el('span'));
        var days = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= days; d++) {
          (function (day) {
            var b = el('button', 'cal-day', String(day.getDate())); b.type = 'button';
            var on = !!st.date && st.date.getTime() === day.getTime();
            b.setAttribute('aria-label', fmt(day)); b.setAttribute('aria-pressed', on);
            b.disabled = day < minDay || day > maxDay;
            if (on) b.classList.add('on');
            b.addEventListener('click', function () { st.date = day; draw(); onChange(); });
            grid.appendChild(b);
          })(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
        }
        cal.appendChild(grid);
      }
      draw();
      return cal;
    }
    function nameForm() {
      var L = T[lang], f = el('form', 'chat-form');
      var n = el('input'), c = el('input'), b = el('button', 'chat-go', L.send + ' →');
      n.type = c.type = 'text'; n.maxLength = c.maxLength = 80; n.autocomplete = 'name'; c.autocomplete = 'organization';
      n.placeholder = L.namePh; c.placeholder = L.companyPh;
      n.setAttribute('aria-label', L.namePh); c.setAttribute('aria-label', L.companyPh);
      n.required = true; b.type = 'submit';
      [n, c].forEach(function (i) { var w = el('div', 'chat-field'); w.appendChild(i); f.appendChild(w); });
      f.appendChild(b);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = n.value.trim(); if (!v) { n.focus(); return; }
        st.name = v; st.company = c.value.trim(); go('done');
      });
      focusLater(n);
      return f;
    }
    function controls() {
      var L = T[lang], wrap = el('div', 'chat-controls');
      if (st.step === 'need') {
        ['tudo', 'partes', 'melhorar'].forEach(function (k) {
          var b = el('button', 'chat-option', L.needs[k]); b.type = 'button';
          b.addEventListener('click', function () { st.need = k; go(k === 'tudo' ? 'story' : 'parts'); });
          wrap.appendChild(b);
        });
      } else if (st.step === 'parts') {
        var ids = data.services.map(function (x) { return x.id; });
        var labels = data.services.map(function (x) { return x[lang]; });
        if (st.need === 'melhorar') { ids.push('?'); labels.push(L.unsure); }
        var next = el('button', 'chat-go', L.go + ' →'); next.type = 'button';
        var sync = function () { next.disabled = !st.parts.length && !st.unsure; };
        wrap.appendChild(chips(labels,
          function (i) { return ids[i] === '?' ? st.unsure : st.parts.indexOf(ids[i]) > -1; },
          function (i) {
            if (ids[i] === '?') st.unsure = !st.unsure;
            else { var k = st.parts.indexOf(ids[i]); if (k > -1) st.parts.splice(k, 1); else st.parts.push(ids[i]); }
            sync();
          }));
        next.addEventListener('click', function () { go('story'); });
        sync();
        wrap.appendChild(next);
      } else if (st.step === 'story') {
        var f = el('form', 'chat-form'), ta = el('textarea'), row = el('div', 'chat-row');
        var send = el('button', 'chat-go', L.go + ' →'), skip = el('button', 'chat-skip', L.storySkip);
        ta.rows = 4; ta.maxLength = 800; ta.placeholder = L.storyPh; ta.setAttribute('aria-label', L.story);
        send.type = 'submit'; skip.type = 'button'; send.disabled = true;
        ta.addEventListener('input', function () { send.disabled = !ta.value.trim(); });
        f.addEventListener('submit', function (e) { e.preventDefault(); if (ta.value.trim()) { st.story = ta.value.trim(); go('where'); } });
        skip.addEventListener('click', function () { st.story = ''; go('where'); });
        var box = el('div', 'chat-field chat-area'); box.appendChild(ta);
        f.appendChild(box); row.appendChild(send); row.appendChild(skip); f.appendChild(row);
        focusLater(ta);
        wrap.appendChild(f);
      } else if (st.step === 'where') {
        wrap.appendChild(chips(L.places, function () { return false; }, function (i) { st.where = L.places[i]; go('when'); }));
        wrap.appendChild(textField(L.wherePh, function (v) { st.where = v; go('when'); }));
      } else if (st.step === 'when') {
        ['dia', 'altura', 'livre'].forEach(function (k) {
          var b = el('button', 'chat-option', L.whenModes[k]); b.type = 'button';
          b.addEventListener('click', function () { st.when = k; go(k === 'livre' ? 'name' : 'pick'); });
          wrap.appendChild(b);
        });
      } else if (st.step === 'pick') {
        var day = st.when === 'dia';
        var cont = el('button', 'chat-go', L.go + ' →'); cont.type = 'button';
        var ready = function () { cont.disabled = day ? !st.date : st.period < 0; };
        if (day) wrap.appendChild(calendar(ready));
        else wrap.appendChild(chips(L.periods, function (i) { return st.period === i; }, function (i) { st.period = i; ready(); }));
        wrap.appendChild(el('span', 'chat-hint mono', L.daypartLabel));
        wrap.appendChild(chips(L.dayparts, function (i) { return st.daypart === i; }, function (i) { st.daypart = st.daypart === i ? -1 : i; }));
        cont.addEventListener('click', function () { st.picked = true; go('name'); });
        ready();
        wrap.appendChild(cont);
      } else if (st.step === 'name') {
        wrap.appendChild(nameForm());
      } else if (st.step === 'done') {
        var row = el('div', 'chat-sends');
        if (data.whatsapp) {
          var wa = el('a', 'chat-send', L.viaWa + ' →');
          wa.href = 'https://wa.me/' + data.whatsapp + '?text=' + encodeURIComponent(message(true));
          wa.target = '_blank'; wa.rel = 'noopener';
          row.appendChild(wa);
        }
        var mail = el('a', 'chat-send alt', L.viaEmail + ' →');
        mail.href = 'mailto:' + data.email + '?subject=' + encodeURIComponent(L.msg.subject) + '&body=' + encodeURIComponent(message(false));
        row.appendChild(mail);
        wrap.appendChild(row);
      }
      return wrap;
    }
    function render() {
      var c = conversation();
      log.innerHTML = '';
      c.forEach(function (m, i) {
        var b = el('p', 'chat-msg ' + m[0] + (i >= shown ? ' new' : ''), m[1]);
        if (i >= shown) b.style.animationDelay = ((i - shown) * .35 + (m[0] === 'bot' ? .25 : 0)) + 's';
        log.appendChild(b);
      });
      shown = c.length;
      input.innerHTML = '';
      var ctl = controls();
      if (st.step === lastStep) ctl.classList.add('still');
      lastStep = st.step;
      input.appendChild(ctl);
      restart.hidden = st.step === 'need';
      log.scrollTop = log.scrollHeight;
      setTimeout(function () { log.scrollTop = log.scrollHeight; }, 800);
    }
    restart.addEventListener('click', function () { reset(); touched = true; render(); });
    renderBooking = function () { shown = log.children.length; render(); };
    render();
  })();

  /* ---------- PLACES: the map of Lisbon and the years ---------- */
  (function places() {
    var dataEl = $('#places-data');
    if (!dataEl) return;
    var data = JSON.parse(dataEl.textContent), cards = data.places;
    var wrap = $('.map-wrap'), card = $('.map-card'), current = null;
    var range = $('#years-range'), openedEl = $('#map-opened'), play = $('.years-play');
    var markers = [];   /* { i, el, year } for both the SVG dots and the street-map markers */

    /* ----- the card ----- */
    function open(anchor, i) {
      var c = cards[i];
      card.innerHTML = '';
      var body = document.createElement('div');
      var where = document.createElement('span'); where.className = 'mono';
      where.textContent = (c.addr || c.where[lang]) + (c.year ? ' · ' + c.year : '');
      var name = document.createElement('strong'); name.textContent = c.name;
      var line = document.createElement('p'); line.textContent = c.line[lang];
      var go = document.createElement('a'); go.className = 'link-arrow'; go.href = c.href;
      go.innerHTML = (lang === 'pt' ? 'Entrar' : 'Step inside') + ' <b>→</b>';
      [where, name, line, go].forEach(function (x) { body.appendChild(x); });
      if (c.cover) { var img = new Image(); img.className = 'photo'; img.src = c.cover; img.alt = ''; card.appendChild(img); }
      card.classList.toggle('no-img', !c.cover);
      card.appendChild(body);
      var w = wrap.getBoundingClientRect(), r = anchor.getBoundingClientRect();
      var half = Math.min(190, w.width / 2 - 8);
      var x = Math.max(half + 8, Math.min(w.width - half - 8, r.left + r.width / 2 - w.left));
      var below = r.top - w.top < 190;
      card.classList.toggle('below', below);
      card.style.left = x + 'px';
      card.style.top = (below ? r.bottom - w.top : r.top - w.top) + 'px';
      card.hidden = false;
      markers.forEach(function (m) { m.el.classList.toggle('on', m.i === i && m.el === anchor.closest('.dot, .pin')); });
      current = { anchor: anchor, i: i };
    }
    function close() {
      card.hidden = true; current = null;
      markers.forEach(function (m) { m.el.classList.remove('on'); });
    }
    var leaveTimer = null;
    function leaveSoon() { clearTimeout(leaveTimer); leaveTimer = setTimeout(close, 220); }
    function stay() { clearTimeout(leaveTimer); }
    if (finePointer) { card.addEventListener('mouseenter', stay); card.addEventListener('mouseleave', leaveSoon); }
    function bind(el, anchor, i) {
      if (finePointer) {
        el.addEventListener('mouseenter', function () { stay(); open(anchor(), i); });
        el.addEventListener('mouseleave', leaveSoon);
      }
      el.addEventListener('focus', function () { open(anchor(), i); });
      /* on touch screens the first tap shows the card, the second goes in */
      var wasOpen = false;
      el.addEventListener('pointerdown', function () { wasOpen = !!current && current.i === i; });
      el.addEventListener('click', function (e) {
        if (finePointer) return;
        e.preventDefault();
        if (!wasOpen) open(anchor(), i); else if (openPlace) openPlace(cards[i].href); else location.href = cards[i].href;
        wasOpen = false;
      });
    }
    if (finePointer) wrap.addEventListener('mouseleave', close);
    document.addEventListener('click', function (e) { if (current && !e.target.closest('.dot, .pin, .map-card')) close(); });
    $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { if (current) open(current.anchor, current.i); }); });

    /* ----- the drawn map (shown until the street map has loaded, and if it never does) ----- */
    var svg = $('.map-svg'), full = svg.getAttribute('viewBox'), mq = matchMedia('(max-width: 760px)');
    function fit() {
      var hero = !!wrap.closest('.map-hero');
      svg.setAttribute('viewBox', mq.matches ? svg.dataset.mobileBox : hero ? svg.dataset.heroBox : full);
      svg.setAttribute('preserveAspectRatio', hero && !mq.matches ? 'xMidYMid slice' : 'xMidYMid meet');
      close();
    }
    fit();
    if (mq.addEventListener) mq.addEventListener('change', fit);
    $$('.far').forEach(function (a) { markers.push({ i: null, el: a, year: +a.dataset.year || null }); });
    $$('.dot').forEach(function (a) {
      var i = a.dataset.i;
      markers.push({ i: i, el: a, year: cards[i].year });
      bind(a, function () { return $('.dot-core', a); }, i);
    });

    /* ----- the years: time runs smoothly, each place lights up the year it opened ----- */
    var t = data.first, playing = null, lastWhole = null;
    var strips = $$('.odo-strip'), yearSr = $('#map-year');
    function odometer(v) {
      /* the units roll continuously; the other digits roll when they change */
      var whole = Math.floor(v), frac = v - whole;
      var digits = String(whole).padStart(4, '0').split('').map(Number);
      var rolling = true;   /* a digit rolls along while every digit to its right is rolling over from 9 */
      for (var k = 3; k >= 0; k--) {
        strips[k].style.transform = 'translateY(' + (-(digits[k] + (rolling ? frac : 0)) * 100 / 11) + '%)';
        rolling = rolling && digits[k] === 9;
      }
    }
    function setTime(v) {
      t = Math.max(data.first, Math.min(data.last, v));
      var whole = Math.floor(t);
      range.value = t;
      range.style.setProperty('--p', (t - data.first) / (data.last - data.first));
      odometer(t);
      if (whole === lastWhole) return;
      lastWhole = whole;
      yearSr.textContent = whole;
      markers.forEach(function (m) {
        var later = (m.year || data.last) > whole;   /* no year yet: comes on with today */
        var wasLater = m.el.classList.contains('later');
        m.el.classList.toggle('later', later);
        if (wasLater && !later) {
          /* a new light comes on */
          m.el.classList.remove('flash'); void m.el.getBoundingClientRect(); m.el.classList.add('flash');
        }
      });
      var opened = Object.keys(cards).filter(function (i) { return cards[i].year === whole; }).map(function (i) { return cards[i].name; });
      if (opened.length) openedEl.textContent = whole + ' · ' + opened.join(', ');
      else if (!playing) openedEl.textContent = '';
      openedEl.style.left = ((t - data.first) / (data.last - data.first) * 100) + '%';
      if (current && cards[current.i].year > whole) close();
    }
    function stop() {
      if (playing) cancelAnimationFrame(playing);
      playing = null; play.classList.remove('playing'); play.setAttribute('aria-label', 'Play');
    }
    function run() {
      if (t >= data.last) { lastWhole = null; setTime(data.first); }
      var from = t, start = performance.now(), duration = 4200 * (data.last - from) / (data.last - data.first);
      play.classList.add('playing'); play.setAttribute('aria-label', 'Pause');
      (function frame(now) {
        var k = Math.min(1, (now - start) / duration);
        setTime(from + (data.last - from) * k);
        if (k < 1) playing = requestAnimationFrame(frame); else { stop(); openedEl.textContent = ''; }
      })(start);
    }
    play.addEventListener('click', function () { if (playing) stop(); else run(); });
    range.addEventListener('input', function () { stop(); setTime(+range.value); });
    range.addEventListener('change', function () { setTime(Math.round(+range.value)); });
    lastWhole = null;
    setTime(reduce ? data.last : data.first);
    /* time starts running the first time the map comes into view */
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        /* wait for the opening curtain to lift, so the years start where people can see them */
        (function whenUncovered() {
          var v = $('.veil');
          if (!v || getComputedStyle(v).display === 'none') setTimeout(run, 400); else setTimeout(whenUncovered, 100);
        })();
      }, { threshold: .35 });
      io.observe(wrap);
    }

    /* ----- the street map: OpenStreetMap data from OpenFreeMap, styled for the night ----- */
    /* STYLE START: OpenStreetMap data (OpenMapTiles schema) drawn in the site's night palette */
    function nightStyle() {
      var cream = 'rgba(239,231,218,', src = 'openmaptiles';
      return {
        version: 8,
        glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
        sources: { openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#120e0c' } },
          { id: 'park', type: 'fill', source: src, 'source-layer': 'park', paint: { 'fill-color': 'rgba(120,140,90,.10)' } },
          { id: 'green', type: 'fill', source: src, 'source-layer': 'landcover', filter: ['in', 'class', 'grass', 'wood'], paint: { 'fill-color': 'rgba(120,140,90,.08)' } },
          { id: 'water', type: 'fill', source: src, 'source-layer': 'water', paint: { 'fill-color': '#3a2414' } },
          { id: 'water-edge', type: 'line', source: src, 'source-layer': 'water', paint: { 'line-color': 'rgba(240,163,94,.6)', 'line-width': 1.2 } },
          { id: 'buildings', type: 'fill', source: src, 'source-layer': 'building', minzoom: 13, paint: { 'fill-color': cream + '.07)', 'fill-outline-color': cream + '.12)' } },
          { id: 'rail', type: 'line', source: src, 'source-layer': 'transportation', filter: ['==', 'class', 'rail'],
            paint: { 'line-color': cream + '.25)', 'line-width': 1, 'line-dasharray': [2, 2] } },
          { id: 'streets-minor', type: 'line', source: src, 'source-layer': 'transportation',
            filter: ['in', 'class', 'minor', 'service', 'path', 'pedestrian', 'track'],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': cream + '.3)', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, .5, 15, 1.4, 18, 5] } },
          { id: 'streets', type: 'line', source: src, 'source-layer': 'transportation',
            filter: ['in', 'class', 'tertiary', 'secondary', 'primary', 'trunk', 'motorway'],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': cream + '.5)', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 15, 2.6, 18, 9] } },
          { id: 'street-names', type: 'symbol', source: src, 'source-layer': 'transportation_name', minzoom: 15,
            layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 10 },
            paint: { 'text-color': cream + '.6)', 'text-halo-color': '#120e0c', 'text-halo-width': 1.4 } },
          { id: 'river-name', type: 'symbol', source: src, 'source-layer': 'water_name',
            layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Italic'], 'text-size': 18, 'text-letter-spacing': .1 },
            paint: { 'text-color': 'rgba(240,163,94,.6)' } },
          { id: 'hoods', type: 'symbol', source: src, 'source-layer': 'place', filter: ['in', 'class', 'neighbourhood', 'suburb', 'quarter'],
            layout: { 'text-field': ['upcase', ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 10, 'text-letter-spacing': .25 },
            paint: { 'text-color': 'rgba(240,163,94,.65)', 'text-halo-color': '#120e0c', 'text-halo-width': 1.2 } }
        ]
      };
    }
    /* STYLE END */
    function streetMap() {
      if (!window.maplibregl) return;
      var src = 'openmaptiles', style = nightStyle();
      var placed = Object.keys(cards).filter(function (i) { return cards[i].geo; });
      var bounds = new maplibregl.LngLatBounds();
      placed.forEach(function (i) { bounds.extend([cards[i].geo[1], cards[i].geo[0]]); });
      var map;
      try {
        map = new maplibregl.Map({
          container: 'map-gl', style: style, bounds: bounds,
          fitBoundsOptions: { maxZoom: 15.2, padding: mq.matches ? { top: 40, bottom: 110, left: 40, right: 40 }
                                              : { top: 120, bottom: 140, left: Math.round(wrap.clientWidth * .45), right: 90 } },
          /* only Lisbon, and the page keeps scrolling with the wheel; drag to move, buttons to zoom */
          maxBounds: [[-9.30, 38.66], [-9.02, 38.82]], minZoom: 12.5, maxZoom: 18,
          dragRotate: false, pitchWithRotate: false, touchPitch: false, scrollZoom: false,
          attributionControl: { compact: true }
        });
      } catch (e) { return; }
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      placed.forEach(function (i) {
        var el = document.createElement('a');
        el.className = 'pin' + (cards[i].left ? ' pin-left' : ''); el.href = cards[i].href; el.setAttribute('aria-label', cards[i].name); el.dataset.cursor = 'Entrar';
        el.innerHTML = '<span class="pin-ring"></span><span class="pin-core"></span><span class="pin-label">' + cards[i].name.replace(/</g, '&lt;') + '</span>';
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([cards[i].geo[1], cards[i].geo[0]]).addTo(map);
        el.setAttribute('aria-label', cards[i].name);   /* MapLibre replaces it with 'Map marker' */
        markers.push({ i: i, el: el, year: cards[i].year });
        bind(el, function () { return $('.pin-core', el); }, i);
      });
      lastWhole = null; setTime(t);
      map.on('movestart', close);
      /* swap the drawn map for the street map once its streets have actually arrived */
      map.on('idle', function () {
        if (wrap.classList.contains('has-streets')) return;
        try {
          if (map.getCanvas().clientHeight > 0 && map.querySourceFeatures(src, { sourceLayer: 'transportation' }).length) wrap.classList.add('has-streets');
        } catch (e) {}
      });
    }
    document.addEventListener('DOMContentLoaded', streetMap);
  })();

  /* ---------- BOOKING SIDE PANEL: every "Marcar consulta" opens it instead of leaving the page ---------- */
  (function drawer() {
    var d = $('#drawer');
    if (!d) return;
    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      if (menu) { menu.classList.remove('open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); }
      setTimeout(function () { var f = $('.chat-option, .chat-field input, .drawer-close', d); if (f) f.focus({ preventScroll: true }); }, 450);
    }
    function close() {
      d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
    /* captured before the page-transition handler, so the link never navigates */
    document.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var a = e.target.closest('a[href$="contacto.html"]');
      if (!a) return;
      e.preventDefault(); e.stopPropagation(); open();
    }, true);
    $$('[data-close]', d).forEach(function (x) { x.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('open')) close(); });
    /* keep Tab inside the panel while it is open */
    d.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button:not([hidden]):not([disabled]), a[href], input', d).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  })();

  /* ---------- PLACE SHEET: a place opens over the page, with only a way back ---------- */
  (function sheet() {
    var sh = $('#sheet');
    if (!sh) return;
    var body = $('.sheet-body', sh), back = $('.back', sh), lastFocus = null;
    var placeLink = /(^|\/)lugares\/([a-z0-9-]+)\.html$/;

    function translate(root) {
      $$('[data-' + lang + ']', root).forEach(function (el) { el.innerHTML = el.getAttribute('data-' + lang); });
      $$('[data-alt-' + lang + ']', root).forEach(function (el) { el.alt = el.getAttribute('data-alt-' + lang); });
    }
    function show(url, remember) {
      var abs = new URL(url, location.href);
      fetch(abs.href).then(function (r) { if (!r.ok) throw r; return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.querySelector('.place-content');
        if (!content) throw new Error('no content');
        /* paths in the place page are relative to lugares/ */
        $$('[src]', content).forEach(function (el) { el.setAttribute('src', new URL(el.getAttribute('src'), abs).href); });
        $$('[data-reveal]', content).forEach(function (el) { el.removeAttribute('data-reveal'); });
        body.innerHTML = '';
        body.appendChild(document.importNode(content, true));
        translate(body);
        body.scrollTop = 0;
        lastFocus = document.activeElement;
        sh.classList.add('open'); sh.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        if (lenis) lenis.stop();
        if (remember) history.pushState({ place: abs.pathname }, '', '#/' + content.dataset.place);
        setTimeout(function () { back.focus({ preventScroll: true }); }, 300);
      }).catch(function () { location.href = abs.href; });
    }
    function hide(fromHistory) {
      if (!sh.classList.contains('open')) return;
      sh.classList.remove('open'); sh.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
      if (!fromHistory && history.state && history.state.place) history.back();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
    openPlace = function (url) { show(url, true); };

    /* captured before the page transitions: place links open here instead of leaving the page */
    document.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var a = e.target.closest('a[href]');
      if (!a || !placeLink.test(a.getAttribute('href'))) return;
      if (!finePointer && e.target.closest('.dot, .pin')) return;   /* the map handles its own taps */
      e.preventDefault(); e.stopPropagation();
      show(a.getAttribute('href'), true);
    }, true);
    back.addEventListener('click', function () { hide(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(false); });
    window.addEventListener('popstate', function () { if (!(history.state && history.state.place)) hide(true); });
    $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { translate(body); }); });
    /* a shared link like index.html#/so-what opens that place straight away */
    function fromHash() {
      var m = /^#\/([a-z0-9-]+)$/.exec(location.hash);
      if (m && !sh.classList.contains('open')) show('lugares/' + m[1] + '.html', false);
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
  })();

  /* ---------- LISBON CLOCK ---------- */
  function tick() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var h = +p.find(function (x) { return x.type === 'hour'; }).value % 24;
    var m = p.find(function (x) { return x.type === 'minute'; }).value;
    $$('.js-clock').forEach(function (el) { el.textContent = String(h).padStart(2, '0') + ':' + m; });
    var g = h >= 6 && h < 13 ? ['Bom dia', 'Good morning'] : h >= 13 && h < 20 ? ['Boa tarde', 'Good afternoon'] : ['Boa noite', 'Good evening'];
    $$('.js-greet').forEach(function (el) { el.textContent = lang === 'pt' ? g[0] : g[1]; });
  }
  setInterval(tick, 20000);
  $$('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- MOBILE MENU ---------- */
  var menu = $('#menu'), menuBtn = $('.menu-btn');
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  /* ---------- HERO SLIDESHOW ---------- */
  var slides = $$('.hero-media.slides img');
  if (slides.length > 1) {
    var si = 0;
    setInterval(function () {
      slides[si].classList.remove('on');
      si = (si + 1) % slides.length;
      slides[si].classList.add('on');
    }, 6000);
  }

  /* ---------- CURSOR + PEEK ---------- */
  var cursor = $('.cursor'), peek = $('.peek'), peekImg = peek && $('img', peek);
  if (finePointer && cursor) {
    var mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, px = mx, py = my;
    window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor]');
      cursor.classList.toggle('is-label', !!t);
      if (t) $('span', cursor).textContent = t.dataset.cursor;
    });
    var list = $('.list');
    if (list && peek) {
      list.addEventListener('pointerover', function (e) {
        var a = e.target.closest('a[data-peek]');
        if (!a) return;
        if (peekImg.getAttribute('src') !== a.dataset.peek) peekImg.src = a.dataset.peek;
        peek.classList.add('on');
      });
      list.addEventListener('pointerleave', function () { peek.classList.remove('on'); });
    }
    (function loop() {
      cx += (mx - cx) * .22; cy += (my - cy) * .22;
      px += (mx - px) * .1; py += (my - py) * .1;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (peek) {
        var rot = Math.max(-8, Math.min(8, (mx - px) * .08));
        peek.style.transform = 'translate(' + (px + 32) + 'px,' + (py - 200) + 'px) rotate(' + rot + 'deg)';
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- DIAL TICKS (method) ---------- */
  var ticksEl = $('#dial-ticks');
  if (ticksEl) {
    var ticks = '';
    for (var t = 0; t < 12; t++) ticks += '<line x1="0" y1="-48" x2="0" y2="' + (t % 3 ? -45 : -42) + '" stroke="rgba(239,231,218,.5)" stroke-width=".6" transform="rotate(' + t * 30 + ')"/>';
    ticksEl.innerHTML = ticks;
  }

  setLang(lang);

  /* ---------- PAGE TRANSITIONS ---------- */
  var veil = $('.veil');
  function isInternal(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href)) return false;
    return true;
  }
  function leaveTo(href) {
    if (!window.gsap || reduce) { location.href = href; return; }
    veil.classList.remove('is-intro');
    gsap.set(veil, { display: 'flex' });
    gsap.fromTo(veil, { yPercent: 100 }, { yPercent: 0, duration: .75, ease: 'expo.inOut', onComplete: function () { location.href = href; } });
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var a = e.target.closest('a');
    if (!isInternal(a)) return;
    e.preventDefault();
    if (menu) menu.classList.remove('open');
    leaveTo(a.getAttribute('href'));
  });
  /* coming back with the browser's back button restores the page as it was left */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && veil) { if (window.gsap) gsap.set(veil, { display: 'none' }); else veil.style.display = 'none'; }
  });

  /* ---------- MOTION ---------- */
  var manifestoTrigger = null;
  function setupManifesto() {
    if (!window.gsap || reduce || !$('#manifesto-text')) return;
    if (manifestoTrigger) manifestoTrigger.kill();
    manifestoTrigger = gsap.to($$('#manifesto-text .w'), {
      opacity: 1, stagger: .05, ease: 'none',
      scrollTrigger: { trigger: '#manifesto-text', start: 'top 80%', end: 'bottom 45%', scrub: true }
    }).scrollTrigger;
  }

  function hideVeil() { if (veil) veil.style.display = 'none'; }

  function start() {
    if (!window.gsap || !window.ScrollTrigger || reduce) {
      document.body.classList.add('no-anim');
      hideVeil();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('anim');

    if (window.Lenis) {
      lenis = new Lenis({ lerp: .09 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var target = $(a.getAttribute('href'));
          if (target) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.6 }); }
        });
      });
    }

    /* entrance: a count to 30 on the first visit, otherwise the veil just lifts */
    var heroLines = $$('.hero h1 .line > span, .map-hero h1 .line > span');
    var heroRest = $$('.hero-eyebrow, .hero-foot, .map-hero-text .hero-sub, .map-hero-text .btn');
    gsap.set(heroLines, { yPercent: 110 });
    gsap.set(heroRest, { opacity: 0, y: 20 });
    var intro = gsap.timeline();
    var firstVisit = false;
    try { firstVisit = page === 'home' && !sessionStorage.getItem('sakim-seen'); sessionStorage.setItem('sakim-seen', '1'); } catch (e) {}
    if (firstVisit) {
      var n = { v: 0 }, num = $('.veil-num span');
      veil.classList.add('is-intro');
      intro.to(n, { v: 30, duration: 1.5, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(n.v); } })
        .to(veil, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '+=.2');
    } else {
      intro.to(veil, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, .05);
    }
    intro.add(hideVeil)
      .to(heroLines, { yPercent: 0, duration: 1.3, stagger: .12, ease: 'expo.out' }, '-=.55')
      .to(heroRest, { opacity: 1, y: 0, duration: 1, stagger: .1, ease: 'power3.out' }, '-=1');

    /* the page slides from dusk into deep night as you scroll */
    gsap.timeline({ scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: true } })
      .fromTo(document.body, { backgroundColor: '#1a110c' }, { backgroundColor: '#120d0a', ease: 'none' })
      .to(document.body, { backgroundColor: '#0d0a0b', ease: 'none' })
      .to(document.body, { backgroundColor: '#07070a', ease: 'none' });

    if ($('.hero-content')) {
      gsap.to('.hero-content', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    setupManifesto();

    $$('[data-reveal]').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    /* index rows */
    $$('.row').forEach(function (row, i) {
      gsap.from(row, { opacity: 0, y: 30, duration: 1, ease: 'expo.out', delay: (i % 4) * .04, scrollTrigger: { trigger: row, start: 'top 94%' } });
    });

    /* stacked nights: each one settles back as the next slides over it */
    var nights = $$('.night');
    nights.forEach(function (night, i) {
      if (i === nights.length - 1) return;
      gsap.to(night.querySelector('img'), { scale: .9, opacity: .35, ease: 'none', scrollTrigger: { trigger: nights[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
    });

    /* the round window opens into the whole screen */
    if ($('.window')) {
      gsap.fromTo('.window-img', { clipPath: 'circle(18vmin at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: '.window', start: 'top top', end: 'bottom bottom', scrub: true } });
      gsap.fromTo('.window-img img', { scale: 1.25, opacity: 1 }, { scale: 1, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.window', start: 'top top', end: 'bottom bottom', scrub: true } });
      gsap.from('.window-text', { opacity: 0, y: 60, ease: 'none', scrollTrigger: { trigger: '.window', start: '35% top', end: '70% top', scrub: true } });
    }

    /* place pages: photos ease in and drift */
    $$('.frame img').forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.frame').forEach(function (fr) {
      gsap.from(fr, { opacity: 0, y: 80, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: fr, start: 'top 90%' } });
    });

    /* five acts: horizontal on desktop, the dial runs 18:00 → 02:00 */
    var acts = $$('.act');
    if (acts.length) {
      var glow = $('.acts-glow'), hand = $('#dial-hand'), dialTime = $('#dial-time');
      var setClock = function (progress) {
        var mins = 18 * 60 + progress * 8 * 60;
        var h = Math.floor(mins / 60) % 24, m = Math.floor(mins % 60 / 15) * 15;
        dialTime.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        hand.setAttribute('transform', 'rotate(' + (180 + progress * 240) + ')');
        var idx = Math.min(acts.length - 1, Math.round(progress * (acts.length - 1)));
        glow.style.setProperty('--glow', acts[idx].dataset.glow);
      };
      var mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', function () {
        var track = $('.acts-track');
        var dist = function () { return track.scrollWidth - innerWidth; };
        var tween = gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: '.acts', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: function (s) { setClock(s.progress); } }
        });
        acts.forEach(function (act) {
          gsap.fromTo($('.act-img img', act), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: act, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        });
      });
      mm.add('(max-width: 900px)', function () {
        acts.forEach(function (act) {
          var set = function () { glow.style.setProperty('--glow', act.dataset.glow); };
          ScrollTrigger.create({ trigger: act, start: 'top 60%', onEnter: set, onEnterBack: set });
          gsap.from(act, { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: act, start: 'top 85%' } });
        });
      });
    }

    if ($('.bye')) gsap.from('.bye', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: 'footer', start: 'top 85%' } });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* GSAP and Lenis are deferred, so they are ready by DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', start);
})();
