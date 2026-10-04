(function () {
  'use strict';
  document.body.classList.remove('no-js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var lenis = null;
  var langHooks = [];

  /* ---------- LANGUAGE ---------- */
  var lang = 'pt';
  try {
    var saved = localStorage.getItem('sakim-lang');
    if (saved === 'pt' || saved === 'en') lang = saved;
    else if (!/^pt/i.test(navigator.language || 'pt')) lang = 'en';
  } catch (e) {}

  function setLang(l) {
    lang = l;
    try { localStorage.setItem('sakim-lang', l); } catch (e) {}
    document.documentElement.lang = l;
    $$('[data-' + l + ']').forEach(function (el) { el.innerHTML = el.getAttribute('data-' + l); });
    $$('[data-alt-' + l + ']').forEach(function (el) { el.alt = el.getAttribute('data-alt-' + l); });
    $$('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.lang === l); });
    if (renderBooking) renderBooking();
    langHooks.forEach(function (f) { f(); });
    if (window.ScrollTrigger && document.body.classList.contains('anim')) ScrollTrigger.refresh();
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

  /* ---------- SIDE MENU ---------- */
  var menu = $('#menu'), menuBtn = $('.menu-btn');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () {
      menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      setTimeout(function () { var f = $('nav a', menu); if (f) f.focus({ preventScroll: true }); }, 300);
    });
    $$('[data-close-menu]', menu).forEach(function (x) { x.addEventListener('click', closeMenu); });
    $$('nav a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });
  }

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
        fitAll(body);
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

  /* ---------- THE POINTER: everything that follows the mouse reads it from here ---------- */
  var mx = innerWidth / 2, my = innerHeight / 2;
  window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
  var lerp = function (a, b, k) { return a + (b - a) * k; };

  /* custom cursor, with a word on things that open */
  var cursor = $('.cursor');
  if (finePointer && cursor) {
    var cx = mx, cy = my;
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor]');
      cursor.classList.toggle('is-label', !!t);
      if (t) $('span', cursor).textContent = (lang === 'en' && t.dataset.cursorEn) || t.dataset.cursor;
    });
    (function loop() {
      cx = lerp(cx, mx, .25); cy = lerp(cy, my, .25);
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- BIG LINES: each block is sized so its longest line fills the width ---------- */
  function fitAll(root) {
    $$('.mega', root).forEach(function (el) {
      if (el.classList.contains('place-mega')) return;
      var box = el.parentElement, cs = getComputedStyle(box);
      var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = '100px';
      var rowsEl = $$('.row', el);
      rowsEl.forEach(function (r) { r.style.fontSize = ''; });
      if (innerWidth < 760 && (el.classList.contains('hero-mega') || el.classList.contains('contact-mega'))) {
        /* on a phone every line is sized on its own, like a poster */
        rowsEl.forEach(function (r) { r.style.fontSize = Math.floor(100 * avail / r.scrollWidth * .99) + 'px'; });
        return;
      }
      var widest = Math.max.apply(null, $$('.row', el).map(function (r) { return r.scrollWidth; }));
      var size = 100 * avail / widest;
      if (el.classList.contains('hero-mega')) {
        /* the hero also has to leave room for the line under it */
        var rows = $$('.row', el).length;
        size = Math.min(size, (innerHeight * (innerWidth < 760 ? .5 : .6)) / (rows * .94));
      }
      if (el.classList.contains('mega-s')) size = Math.min(size, Math.max(64, innerWidth * .11));
      el.style.fontSize = Math.floor(size * .995) + 'px';
    });
  }
  langHooks.push(function () {
    $$('.mega[data-label-' + lang + ']').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-label-' + lang)); });
    fitAll();
  });
  fitAll();
  if (document.fonts) document.fonts.ready.then(function () { fitAll(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  var rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { fitAll(); }, 120); });

  /* ---------- PHOTOS INSIDE THE BIG LINES: they change on their own; the hero also names the place ---------- */
  $$('.pic').forEach(function (pic) {
    var imgs = $$('img', pic), idx = 0, visible = true;
    if (imgs.length < 2) return;
    var cap = pic.closest('section') && $('.pic-name', pic.closest('section'));
    function caption() {
      if (!cap) return;
      $('b', cap).textContent = imgs[idx].dataset.name;
      $('span', cap).textContent = imgs[idx].getAttribute('data-meta-' + lang) || '';
    }
    langHooks.push(caption);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(pic);
    setInterval(function () {
      if (!visible || document.hidden) return;
      imgs[idx].classList.remove('on');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('on');
      var after = imgs[(idx + 1) % imgs.length];
      if (after.loading === 'lazy') after.loading = 'eager';
      caption();
      pic.dispatchEvent(new CustomEvent('picchange', { detail: imgs[idx] }));
    }, reduce ? 4000 : 2000);
  });

  /* ---------- HERO HOVER: the letters widen under the cursor and fill with the bar photo around it ---------- */
  var heroFx = (function () {
    var hero = $('.hero'), h1 = hero && $('.hero-mega', hero), pic = h1 && $('.pic', h1);
    if (!hero || !h1 || !pic || !finePointer || reduce) return null;
    var photos = $$('img', pic), current = $('img.on', pic) || photos[0];
    var clone = null, letters = [], ghosts = [], lines = [];
    var px = -999, py = -999, inside = false, r = 0;
    function split() {
      /* each letter in its own box, so it can move on its own */
      $$('.row > span[data-pt]', h1).forEach(function (sp) {
        if ($('.ch', sp)) return;
        sp.innerHTML = sp.textContent.split('').map(function (c, i, all) {
          if (c === ' ') return ' ';
          return '<span class="ch' + (c === '.' && i === all.length - 1 ? ' acc' : '') + '">' + c + '</span>';
        }).join('');
      });
    }
    function paint() {
      /* every letter of the copy carries the same photo, positioned as if it were one picture behind the whole headline */
      if (!clone) return;
      var W = clone.offsetWidth, H = clone.offsetHeight;
      var nw = current.naturalWidth || 4, nh = current.naturalHeight || 3;
      var k = Math.max(W / nw, H / nh), bw = nw * k, bh = nh * k, ox = (W - bw) / 2, oy = (H - bh) / 2;
      var url = 'url("' + (current.currentSrc || current.src) + '")';
      /* offsets ignore the stretching, so the picture lines up with the letters at rest */
      ghosts.forEach(function (g) {
        var left = 0, top = 0, el = g;
        while (el && el !== clone) { left += el.offsetLeft; top += el.offsetTop; el = el.offsetParent; }
        g.style.backgroundImage = url;
        g.style.backgroundSize = bw + 'px ' + bh + 'px';
        g.style.backgroundPosition = (ox - left) + 'px ' + (oy - top) + 'px';
      });
    }
    function prepare() {
      split();
      if (clone) clone.remove();
      clone = h1.cloneNode(true);
      clone.className = 'mega hero-mega mega-photo';
      clone.removeAttribute('aria-label');
      clone.setAttribute('aria-hidden', 'true');
      $$('.row', clone).forEach(function (row) { row.removeAttribute('style'); row.style.fontSize = ''; });
      $$('.row', h1).forEach(function (row, i) { if (row.style.fontSize) $$('.row', clone)[i].style.fontSize = row.style.fontSize; });
      clone.style.top = h1.offsetTop + 'px';
      clone.style.left = h1.offsetLeft + 'px';
      clone.style.width = h1.offsetWidth + 'px';
      h1.after(clone);
      letters = $$('.ch', h1);
      ghosts = $$('.ch', clone);
      var hb = hero.getBoundingClientRect();
      /* each line keeps its letters (and the photo) in order, so widening one pushes the others aside */
      var k = 0;
      lines = $$('.row', h1).map(function (row) {
        return $$('.ch, .pic', row).map(function (el) {
          var b = el.getBoundingClientRect();
          var isPic = el.classList.contains('pic');
          return { el: el, ghost: isPic ? null : ghosts[k++], pic: isPic, x: b.left - hb.left + b.width / 2,
                   y: b.top - hb.top + b.height / 2, w: b.width, h: b.height, s: 1 };
        });
      });
      paint();
    }
    pic.addEventListener('picchange', function (e) {
      current = e.detail;
      if (current.complete) paint(); else current.addEventListener('load', paint, { once: true });
    });

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var hb = hero.getBoundingClientRect();
      px = e.clientX - hb.left; py = e.clientY - hb.top; inside = true;
    });
    hero.addEventListener('pointerleave', function () { inside = false; });

    (function loop() {
      requestAnimationFrame(loop);
      if (!clone) return;
      var target = inside ? Math.min(240, hero.offsetWidth * .17) : 0;
      var moving = lines.some(function (line) { return line.some(function (it) { return it.s > 1.002; }); });
      if (!inside && r < .5 && !moving) return;
      r += (target - r) * .12;
      clone.style.setProperty('--rx', (px - clone.offsetLeft) + 'px');
      clone.style.setProperty('--ry', (py - clone.offsetTop) + 'px');
      clone.style.setProperty('--rr', r + 'px');
      /* letters near the cursor grow wider; the rest of the line slides apart to make room */
      lines.forEach(function (line) {
        var h = line.length ? line[0].h : 1, total = 0;
        line.forEach(function (it) {
          var dx = (px - it.x) / (h * .45), dy = (py - it.y) / (h * .6);
          var goal = it.pic || !inside ? 1 : 1 + .6 * Math.exp(-(dx * dx + dy * dy) / 2);
          it.s += (goal - it.s) * .16;
          it.extra = it.w * (it.s - 1);
          total += it.extra;
        });
        var before = 0;
        line.forEach(function (it) {
          var shift = before + it.extra / 2 - total / 2;
          before += it.extra;
          var tf = Math.abs(shift) < .05 && it.s < 1.001 ? '' : 'translateX(' + shift.toFixed(2) + 'px)' + (it.pic ? '' : ' scaleX(' + it.s.toFixed(3) + ')');
          it.el.style.transform = tf;
          if (it.ghost) it.ghost.style.transform = tf;
        });
      });
    })();
    return { prepare: prepare };
  })();
  if (heroFx) {
    heroFx.prepare();
    langHooks.push(heroFx.prepare);
    if (document.fonts) document.fonts.ready.then(heroFx.prepare);
    window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { fitAll(); heroFx.prepare(); }, 140); });
    window.addEventListener('load', function () { heroFx.prepare(); });
  }

  /* ---------- PILL BAR: a mark under the section you are in ---------- */
  (function sections() {
    var links = $$('.pill-links a[data-sec]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.dataset.sec === x.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.getElementById(a.dataset.sec); if (s) io.observe(s); });
  })();

  /* ---------- BOTTOM CARD: steps aside where the page already offers the same thing ---------- */
  (function dock() {
    var d = $('.dock');
    if (!d || !('IntersectionObserver' in window)) return;
    var hide = $$('#contacto, .foot');
    var seen = new Set();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) seen.add(x.target); else seen.delete(x.target); });
      d.classList.toggle('away', seen.size > 0);
    }, { threshold: .15 });
    hide.forEach(function (el) { io.observe(el); });
    /* it tucks away while you read down the page and comes back when you scroll up */
    var lastY = scrollY;
    window.addEventListener('scroll', function () {
      var y = scrollY;
      if (Math.abs(y - lastY) < 6) return;
      d.classList.toggle('tuck', y > lastY && y > innerHeight * .5);
      lastY = y;
    }, { passive: true });
  })();

  /* ---------- SERVICES: each area opens; a round photo and a round colour follow the mouse ---------- */
  (function services() {
    var ol = $('.areas');
    if (!ol) return;
    var areas = $$('.area', ol);
    areas.forEach(function (a) {
      var head = $('.area-head', a);
      head.addEventListener('click', function () {
        var open = !a.classList.contains('open');
        areas.forEach(function (o) { o.classList.remove('open'); $('.area-head', o).setAttribute('aria-expanded', 'false'); });
        a.classList.toggle('open', open);
        head.setAttribute('aria-expanded', open);
        if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 750);
      });
    });
    var f = $('.follow'), pic = f && $('.follow-pic', f), dot = f && $('.follow-dot', f), fimg = f && $('img', f);
    if (!finePointer || !f || reduce) return;
    var px = mx, py = my, dx = mx, dy = my, active = false;
    areas.forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        areas.forEach(function (o) { o.classList.toggle('hover', o === a); });
        ol.classList.add('hovering');
        if (fimg.getAttribute('src') !== a.dataset.photo) fimg.src = a.dataset.photo;
        if (!active) { px = dx = mx; py = dy = my; }
        active = true; f.classList.add('on');
      });
    });
    function off() {
      areas.forEach(function (o) { o.classList.remove('hover'); });
      ol.classList.remove('hovering');
      active = false; f.classList.remove('on');
    }
    ol.addEventListener('pointerleave', off);
    /* scrolling with the wheel moves the list away without a pointer event */
    window.addEventListener('scroll', function () {
      if (!active) return;
      var r = ol.getBoundingClientRect();
      if (mx < r.left || mx > r.right || my < r.top || my > r.bottom) off();
    }, { passive: true });
    (function loop() {
      requestAnimationFrame(loop);
      if (!active) return;
      var w = pic.offsetWidth;
      px = lerp(px, mx, .16); py = lerp(py, my, .16);
      dx = lerp(dx, mx, .07); dy = lerp(dy, my, .07);
      /* the photo sits beside the cursor, the colour trails behind it */
      var side = mx + w + 60 > innerWidth ? -w - 30 : 30;
      pic.style.transform = 'translate(' + (px + side) + 'px,' + (py - w / 2) + 'px)';
      dot.style.transform = 'translate(' + (dx + side + (side > 0 ? w * .55 : -w * .55)) + 'px,' + (dy - w / 2) + 'px)';
    })();
  })();

  /* ---------- PROJECTS: names change the screen; moving across the screen runs through its photos ---------- */
  (function projects() {
    var screen = $('.screen');
    if (!screen) return;
    var shots = $$('.shot', screen), names = $$('.reel a'), open = $('.screen-open', screen);
    var cap = $('.screen-cap', screen), scrub = $('.scrub', screen);
    var cur = 0, total = shots.length, galleries = {};
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function show(i) {
      if (i === cur && shots[i].classList.contains('on')) return;
      shots[cur].classList.remove('on');
      cur = i;
      shots[i].classList.add('on');
      names.forEach(function (a, j) { a.classList.toggle('on', j === i); });
      var a = names[i];
      open.setAttribute('href', a.getAttribute('href'));
      $('.screen-n', cap).textContent = pad(i + 1) + ' / ' + pad(total);
      $('b', cap).textContent = a.lastChild.textContent;
      meta();
    }
    function meta() {
      var m = shots[cur].dataset;
      $('.screen-meta', cap).textContent = lang === 'en' ? m.metaEn : m.metaPt;
    }
    names[0].classList.add('on');
    names.forEach(function (a, i) {
      a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(i); });
      a.addEventListener('focus', function () { show(i); });
    });
    /* the screen opens the project it shows */
    screen.addEventListener('click', function (e) {
      if (e.target.closest('.screen-open')) return;
      open.click();
    });
    screen.setAttribute('data-cursor', 'Ver'); screen.setAttribute('data-cursor-en', 'View');
    if (finePointer && !reduce) {
      screen.addEventListener('pointermove', function (e) {
        var r = screen.getBoundingClientRect(), shot = shots[cur];
        var g = galleries[cur] || (galleries[cur] = JSON.parse(shot.dataset.gallery));
        var k = Math.min(g.length - 1, Math.floor((e.clientX - r.left) / r.width * g.length));
        var im = $('img', shot);
        if (im.dataset.k !== String(k)) { im.dataset.k = k; im.src = g[k]; }
        screen.classList.add('scrubbing');
        scrub.textContent = (k + 1) + ' / ' + g.length;
      });
      screen.addEventListener('pointerleave', function () { screen.classList.remove('scrubbing'); });
    } else {
      /* on a phone the screen moves on by itself */
      var visible = false;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(screen);
      setInterval(function () { if (visible && !document.hidden) show((cur + 1) % total); }, 2600);
    }
    langHooks.push(meta);
  })();

  /* ---------- IN THE PRESS: a photo of the place follows the cursor along the list ---------- */
  (function press() {
    var list = $('.press-list'), peek = $('.press-peek'), im = peek && $('img', peek);
    if (!list || !peek || !finePointer || reduce) return;
    var x = mx, y = my, on = false;
    $$('a', list).forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        if (im.getAttribute('src') !== a.dataset.photo) im.src = a.dataset.photo;
        if (!on) { x = mx; y = my; }
        on = true; peek.classList.add('on');
      });
    });
    list.addEventListener('pointerleave', function () { on = false; peek.classList.remove('on'); });
    window.addEventListener('scroll', function () {
      var r = list.getBoundingClientRect();
      if (on && (my < r.top || my > r.bottom)) { on = false; peek.classList.remove('on'); }
    }, { passive: true });
    (function loop() {
      requestAnimationFrame(loop);
      if (!on) return;
      x += (mx - x) * .14; y += (my - y) * .14;
      var w = peek.offsetWidth;
      peek.style.transform = 'translate(' + (x + 28) + 'px,' + (y - w * .62) + 'px) rotate(' + Math.max(-6, Math.min(6, (mx - x) * .05)) + 'deg)';
    })();
  })();

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * .25, dy = (e.clientY - (r.top + r.height / 2)) * .35;
        b.style.transition = 'transform .2s ease-out';
        b.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      b.addEventListener('pointerleave', function () {
        b.style.transition = 'transform .8s cubic-bezier(.16, 1, .3, 1)';
        b.style.transform = '';
      });
    });
  }

  setLang(lang);

  /* ---------- MOTION ---------- */
  function start() {
    var steps = $('.steps'), frames = $$('.process-frame img');
    function lightStep(i) {
      $$('.step', steps).forEach(function (s, j) { s.classList.toggle('lit', j <= i); });
      frames.forEach(function (f, j) { f.classList.toggle('on', j === i); });
    }
    if (!window.gsap || !window.ScrollTrigger || reduce) {
      document.body.classList.add('no-anim');
      if (steps) lightStep(0);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('anim');

    if (window.Lenis) {
      lenis = new Lenis({ lerp: .1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    $$('a[href^="#"]').forEach(function (a) {
      var target = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
      if (!target) return;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.4 }); else target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    /* big lines rise out of their own baseline */
    $$('.mega .row').forEach(function (row) {
      var inHero = row.closest('.hero');
      gsap.from(row, { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', delay: inHero ? .1 + $$('.row', row.parentElement).indexOf(row) * .1 : 0,
        scrollTrigger: inHero ? null : { trigger: row, start: 'top 92%' } });
    });
    gsap.from('.hero-foot', { opacity: 0, y: 30, duration: 1.2, ease: 'expo.out', delay: .45 });
    $$('.ed-title, .ed-meta, .ed-cols, .sec-head, .inline-cta, .screen, .reel, .contact-grid, .value').forEach(function (el) {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    /* process: each step lights up at the middle of the screen, and the photo beside it follows */
    if (steps) {
      lightStep(0);
      $$('.step', steps).forEach(function (s, i) {
        ScrollTrigger.create({ trigger: s, start: 'top 60%', onEnter: function () { lightStep(i); }, onLeaveBack: function () { lightStep(Math.max(0, i - 1)); } });
      });
    }

    /* project pages: photos rise in */
    $$('.g').forEach(function (fr) {
      gsap.from(fr, { opacity: 0, y: 80, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: fr, start: 'top 92%' } });
    });

    window.addEventListener('load', function () { fitAll(); ScrollTrigger.refresh(); });
  }

  /* GSAP and Lenis are deferred, so they are ready by DOMContentLoaded */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
