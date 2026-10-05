(function () {
  'use strict';
  document.body.classList.remove('no-js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var lenis = null;
  var langHooks = [];
  /* where the site lives, so pages in lugares/ can load files from assets/ too */
  var base = ((document.currentScript && document.currentScript.src) || '').replace(/assets\/js\/site\.js.*$/, '');

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
        initMaps(body);
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
    /* the dot replaces the system pointer; text fields keep their own text cursor */
    document.documentElement.classList.add('has-cursor');
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor]');
      var typing = e.target.closest('input, textarea, select, [contenteditable]');
      var link = !t && !typing && e.target.closest('a, button, label, summary, [role="button"]');
      cursor.classList.toggle('is-label', !!t);
      cursor.classList.toggle('is-link', !!link);
      cursor.classList.toggle('on-dark', !!e.target.closest('.projects, .drawer-panel, .menu-panel, .dock, .pill, .pill-round, .btn, .area-icon, .intro, .chat'));
      cursor.classList.toggle('is-text', !!typing);
      if (t) $('span', cursor).textContent = (lang === 'en' && t.dataset.cursorEn) || t.dataset.cursor;
    });
    document.documentElement.addEventListener('pointerleave', function () { cursor.style.opacity = 0; });
    document.documentElement.addEventListener('pointerenter', function () { cursor.style.opacity = ''; });
    (function loop() {
      cx = lerp(cx, mx, .25); cy = lerp(cy, my, .25);
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- BIG LINES: each block is sized so its longest line fills the width ---------- */
  function fitAll(root) {
    /* lines with accented capitals (Ê, Ó, Ã) get a little more room above, in whichever language is showing */
    $$('.mega .row', root).forEach(function (row) {
      row.classList.toggle('row-acc', /[ÁÀÂÃÉÊÈÍÓÔÕÚáàâãéêèíóôõú]/.test(row.textContent));
    });
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
      if (el.classList.contains('hero-mega')) {
        /* measured, not guessed: lines with accents take a little more height */
        var room = innerHeight * .54;
        if (el.offsetHeight > room) el.style.fontSize = Math.floor(size * .995 * room / el.offsetHeight) + 'px';
      }
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
      if (!visible || document.hidden || document.documentElement.classList.contains('intro-on')) return;
      imgs[idx].classList.remove('on');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('on');
      var after = imgs[(idx + 1) % imgs.length];
      if (after.loading === 'lazy') after.loading = 'eager';
      caption();
      pic.dispatchEvent(new CustomEvent('picchange', { detail: imgs[idx] }));
    }, reduce ? 4000 : 2000);
  });

  /* ---------- HERO HOVER: water under the cursor, light enough for any computer and any browser.
     The drifting photos are drawn by the graphics card (WebGL) and ripple there; the headline's letters
     ripple by moving each letter, which every browser does cheaply. ---------- */
  var heroFx = (function () {
    var hero = $('.hero'), h1 = hero && $('.hero-mega', hero), drift = hero && $('.hero-drift', hero);
    if (!hero || !h1 || !finePointer || reduce) return null;
    var px = -9999, py = -9999, inside = false, strength = 0, last = null, speed = 0, t = 0, visible = true;
    var items = [];   /* letters and the photo in the headline, with their resting centres */

    function split() {
      $$('.row > span[data-pt]', h1).forEach(function (sp) {
        if ($('.ch', sp)) return;
        sp.innerHTML = sp.textContent.split('').map(function (c, i, all) {
          if (c === ' ') return ' ';
          return '<span class="ch' + (c === '.' && i === all.length - 1 ? ' acc' : '') + '">' + c + '</span>';
        }).join('');
      });
    }
    function measure() {
      split();
      var hb = hero.getBoundingClientRect();
      items = $$('.ch, .pic', h1).map(function (el) {
        el.style.transform = '';
        var b = el.getBoundingClientRect();
        return { el: el, x: b.left - hb.left + b.width / 2, y: b.top - hb.top + b.height / 2, pic: el.classList.contains('pic') };
      });
    }

    /* ---- the photo grid on the graphics card ---- */
    var gl = null, canvas = null, prog = null, uni = {}, tex = null, geo = null, building = false;
    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var FS = [
      'precision mediump float;',
      'uniform vec2 uRes;uniform vec4 uBox;uniform float uAng;uniform float uColX[6];uniform float uColW;',
      'uniform float uOff[6];uniform float uPer[6];uniform vec2 uAtlas;uniform float uScale;',
      'uniform vec2 uMouse;uniform float uStr;uniform float uRad;uniform float uT;uniform sampler2D uTex;',
      'void main(){',
      '  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);',
      '  vec2 d=p-uMouse;float f=exp(-dot(d,d)/(uRad*uRad));',
      '  p+=f*uStr*vec2(sin(p.y*.022+uT*2.2)+.6*sin(p.x*.017-uT*1.7),cos(p.x*.02-uT*2.)+.6*cos(p.y*.016+uT*1.5));',
      '  vec2 c=uBox.xy+uBox.zw*.5;vec2 q=p-c;float s=sin(uAng),k=cos(uAng);',
      '  q=vec2(k*q.x-s*q.y,s*q.x+k*q.y)+uBox.zw*.5;',
      '  vec4 col=vec4(0.);',
      '  for(int i=0;i<6;i++){',
      '    if(q.x>=uColX[i]&&q.x<uColX[i]+uColW&&uPer[i]>0.){',
      '      float y=mod(q.y+uOff[i],uPer[i]);',
      '      vec2 uv=vec2((float(i)*uColW+q.x-uColX[i])*uScale,y*uScale)/uAtlas;',
      '      col=texture2D(uTex,uv);',
      '    }',
      '  }',
      '  vec3 paper=vec3(.914,.902,.878);',
      '  gl_FragColor=vec4(mix(paper,col.rgb,col.a),1.);',
      '}'].join('\n');

    function initGL() {
      if (!drift) return false;
      canvas = document.createElement('canvas');
      canvas.className = 'hero-gl';
      canvas.setAttribute('aria-hidden', 'true');
      try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false }); } catch (e) { gl = null; }
      if (!gl) return false;
      /* a computer without a usable graphics card draws WebGL in software, which is slow: keep the plain columns there */
      var info = gl.getExtension('WEBGL_debug_renderer_info');
      var renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) { gl = null; return false; }
      function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
      var v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) { gl = null; return false; }
      prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
      gl.useProgram(prog);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uBox', 'uAng', 'uColX', 'uColW', 'uOff', 'uPer', 'uAtlas', 'uScale', 'uMouse', 'uStr', 'uRad', 'uT', 'uTex'].forEach(function (n) { uni[n] = gl.getUniformLocation(prog, n); });
      drift.after(canvas);
      return true;
    }

    /* the columns, measured from the page's own layout, painted once into one picture (the atlas) */
    function buildAtlas() {
      if (!gl || building) return;
      building = true;
      var cols = $$('.drift-col', drift).filter(function (c) { return c.offsetWidth > 0; }).slice(0, 6);
      var colW = cols.length ? cols[0].offsetWidth : 0;
      var g = { box: [drift.offsetLeft, drift.offsetTop, drift.offsetWidth, drift.offsetHeight], colX: [], per: [], dur: [], dir: [], colW: colW, cols: [] };
      cols.forEach(function (c, i) {
        var imgs = $$('img', c), half = imgs.length / 2;
        g.colX.push(c.offsetLeft);
        g.per.push(half >= 1 ? imgs[half].offsetTop - imgs[0].offsetTop : 0);
        g.dur.push((i + 1) % 3 === 0 ? 95 : (i % 2 ? 85 : 70));
        g.dir.push(i % 2 ? -1 : 1);
        g.cols.push(imgs.slice(0, half).map(function (im) { return { src: im.currentSrc || im.src, y: im.offsetTop - imgs[0].offsetTop, h: im.offsetHeight }; }));
      });
      var maxPer = Math.max.apply(null, g.per.concat([1]));
      var scale = Math.min(1.5, 4096 / Math.max(colW * cols.length, maxPer));
      var W = Math.ceil(colW * cols.length * scale), H = Math.ceil(maxPer * scale);
      var c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
      var ctx = c2.getContext('2d');
      var jobs = [];
      g.cols.forEach(function (list, i) {
        list.forEach(function (it) {
          jobs.push(new Promise(function (res) {
            var im = new Image();
            im.onload = function () {
              var x = i * colW * scale, y = it.y * scale, w = colW * scale, h = it.h * scale, r = 12 * scale;
              var ir = im.naturalWidth / im.naturalHeight, br = w / h, sw, sh2, sx, sy;
              if (ir > br) { sh2 = im.naturalHeight; sw = sh2 * br; sx = (im.naturalWidth - sw) / 2; sy = 0; }
              else { sw = im.naturalWidth; sh2 = sw / br; sx = 0; sy = (im.naturalHeight - sh2) / 2; }
              ctx.save(); ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
              ctx.clip(); ctx.drawImage(im, sx, sy, sw, sh2, x, y, w, h); ctx.restore();
              res();
            };
            im.onerror = res;
            im.src = it.src;
          }));
        });
      });
      Promise.all(jobs).then(function () {
        if (!tex) tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        g.atlas = [W, H]; g.scale = scale;
        geo = g;
        building = false;
        /* the page's own moving columns can rest now: the graphics card draws them */
        drift.style.visibility = 'hidden';
        drift.classList.add('paused');
        hero.classList.add('gl-on');
      });
    }

    function resize() {
      if (!gl) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(hero.offsetWidth * dpr); canvas.height = Math.round(hero.offsetHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw(tsec) {
      if (!gl || !geo) return;
      var dpr = canvas.width / hero.offsetWidth;
      gl.uniform2f(uni.uRes, hero.offsetWidth, hero.offsetHeight);
      gl.uniform4f(uni.uBox, geo.box[0], geo.box[1], geo.box[2], geo.box[3]);
      gl.uniform1f(uni.uAng, 7 * Math.PI / 180);
      var colX = [0, 0, 0, 0, 0, 0], per = [0, 0, 0, 0, 0, 0], off = [0, 0, 0, 0, 0, 0];
      geo.colX.forEach(function (x, i) {
        colX[i] = x; per[i] = geo.per[i];
        var prog = (tsec / geo.dur[i]) % 1;
        off[i] = geo.dir[i] > 0 ? prog * geo.per[i] : (1 - prog) * geo.per[i];
      });
      gl.uniform1fv(uni.uColX, colX); gl.uniform1fv(uni.uPer, per); gl.uniform1fv(uni.uOff, off);
      gl.uniform1f(uni.uColW, geo.colW); gl.uniform2f(uni.uAtlas, geo.atlas[0], geo.atlas[1]); gl.uniform1f(uni.uScale, geo.scale);
      gl.uniform2f(uni.uMouse, px, py); gl.uniform1f(uni.uStr, strength * 1.6);
      gl.uniform1f(uni.uRad, Math.min(260, hero.offsetWidth * .18)); gl.uniform1f(uni.uT, t);
      gl.uniform1i(uni.uTex, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      /* the shader works in page pixels; the canvas is drawn at a lower or higher density */
      void dpr;
    }

    if (initGL()) {
      resize();
      if (document.readyState === 'complete') buildAtlas(); else window.addEventListener('load', buildAtlas);
    }

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var hb = hero.getBoundingClientRect();
      px = e.clientX - hb.left; py = e.clientY - hb.top; inside = true;
      if (last) speed = Math.min(90, speed + Math.hypot(e.clientX - last.x, e.clientY - last.y));
      last = { x: e.clientX, y: e.clientY };
    });
    hero.addEventListener('pointerleave', function () { inside = false; last = null; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);

    var prev = performance.now(), start = prev, still = true, frames = [];
    function giveUp() {
      gl = null; geo = null;
      if (canvas) canvas.remove();
      drift.style.visibility = ''; drift.classList.remove('paused');
      hero.classList.remove('gl-on');
    }
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) { prev = now; return; }
      var dt = Math.min(.1, (now - prev) / 1000); prev = now;
      var k = function (rate) { return 1 - Math.pow(1 - rate, dt * 60); };
      speed *= 1 - k(.1);
      strength += ((inside ? 5 + speed * .5 : 0) - strength) * k(.07);
      t += dt;
      if (gl && geo) {
        draw((now - start) / 1000);
        /* if this computer struggles anyway, step back to the plain columns */
        frames.push(dt); if (frames.length > 90) frames.shift();
        if (frames.length === 90 && frames.reduce(function (x, y) { return x + y; }, 0) / 90 > 1 / 35) giveUp();
      }
      /* the letters: a wave spreading from the cursor, fading with distance */
      if (strength < .05) {
        if (!still) { items.forEach(function (it) { it.el.style.transform = ''; }); still = true; }
        return;
      }
      still = false;
      var R = Math.min(260, hero.offsetWidth * .18);
      items.forEach(function (it) {
        var dx = it.x - px, dy = it.y - py, d = Math.sqrt(dx * dx + dy * dy);
        var f = Math.exp(-(d * d) / (R * R));
        if (f < .01) { if (it.on) { it.el.style.transform = ''; it.on = false; } return; }
        it.on = true;
        var a = Math.min(16, strength) * f * (it.pic ? .5 : .85);
        var ox = a * .55 * Math.cos(d * .04 - t * 5), oy = a * Math.sin(d * .045 - t * 6);
        it.el.style.transform = 'translate(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px) skewX(' + (a * .35 * Math.sin(d * .03 - t * 4)).toFixed(2) + 'deg)';
      });
    })(prev);

    return {
      prepare: function () { measure(); if (gl) { resize(); buildAtlas(); } },
      sync: function () {}
    };
  })();

  /* the drifting photos rest while the hero is off screen */
  (function () {
    var drift = $('.hero-drift');
    if (!drift || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (en) {
      $$('.hero-drift').forEach(function (d) { d.classList.toggle('paused', !en[0].isIntersecting); });
      if (heroFx) heroFx.sync();
    }).observe(drift.parentElement);
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
    /* back at the top, no section is marked */
    var top = document.getElementById('top');
    if (top) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) links.forEach(function (a) { a.classList.remove('on'); });
    }, { rootMargin: '-45% 0px -50% 0px' }).observe(top);
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

  /* ---------- SERVICES: each area opens; on hover its name turns orange and its icon moves ---------- */
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
    /* hover marks the area under the cursor (name in orange, the icon moves) and dims the others */
    areas.forEach(function (a) {
      a.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        areas.forEach(function (o) { o.classList.toggle('hover', o === a); });
        ol.classList.add('hovering');
      });
    });
    ol.addEventListener('pointerleave', function () {
      areas.forEach(function (o) { o.classList.remove('hover'); });
      ol.classList.remove('hovering');
    });
  })();

  /* ---------- IN THE PRESS: a carousel of article cards that glides as the pointer moves along the timeline ---------- */
  (function press() {
    var stops = $$('.stop'), cards = $$('.teaser'), box = $('.teasers'), track = $('.track');
    if (!stops.length || !track) return;
    var line = $('.stops');
    var n = cards.length, pos = 0, target = 0, cur = -1, step = 1;
    function measure() { step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1; }
    function mark(i) {
      if (i === cur) return;
      cur = i;
      stops.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      cards.forEach(function (c, j) { c.classList.toggle('on', j === i); });
      /* on a small screen the line scrolls too, so the lit stop stays in view */
      var tl = $('.timeline');
      if (tl && tl.scrollWidth > tl.clientWidth) {
        var sl = stops[i].offsetLeft - tl.clientWidth / 2;
        tl.scrollTo({ left: Math.max(0, sl), behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    function go(i) { target = Math.max(0, Math.min(n - 1, i)); if (!finePointer) scrollToCard(target); }
    function scrollToCard(i) { box.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); mark(i); }
    measure();
    window.addEventListener('resize', measure);
    mark(0);

    if (finePointer) {
      /* the pointer's place along the line becomes a place in the carousel, so it glides with every move */
      line.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var first = stops[0].getBoundingClientRect(), last = stops[n - 1].getBoundingClientRect();
        var a = first.left + 22, z = last.left + 22;
        target = Math.max(0, Math.min(n - 1, (e.clientX - a) / (z - a) * (n - 1)));
      });
      line.addEventListener('pointerleave', function () { target = Math.round(target); });
      var last = performance.now();
      (function loop(now) {
        requestAnimationFrame(loop);
        var dt = Math.min(.1, (now - last) / 1000); last = now;
        var d = target - pos;
        if (Math.abs(d) < .0005) { if (pos !== target) { pos = target; } else return; }
        pos += d * (1 - Math.pow(1 - .12, dt * 60));
        track.style.transform = 'translate3d(' + (-pos * step).toFixed(2) + 'px,0,0)';
        mark(Math.round(pos));
      })(last);
    } else {
      /* on a touch screen the cards are swiped; the line follows the card in view */
      var t;
      box.addEventListener('scroll', function () {
        clearTimeout(t);
        t = setTimeout(function () { mark(Math.round(box.scrollLeft / step)); }, 60);
      }, { passive: true });
    }

    /* the line and the cards only bring an article to the front; 'Ler artigo' is what opens it */
    stops.forEach(function (s, i) {
      var b = $('button', s);
      b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') target = i; });
      b.addEventListener('focus', function () { go(i); });
      b.addEventListener('click', function () { go(i); });
    });
    cards.forEach(function (c, i) {
      c.addEventListener('click', function (e) { if (!e.target.closest('.teaser-read')) go(i); });
    });
  })();

  /* ---------- MAPS: a still map from OpenFreeMap, drawn only when it comes into view ---------- */
  var mapLib = null;
  function loadMapLib(cb) {
    if (window.maplibregl) return cb();
    if (mapLib) { mapLib.push(cb); return; }
    mapLib = [cb];
    var css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = base + 'assets/css/maplibre-gl.css';
    document.head.appendChild(css);
    var js = document.createElement('script');
    js.src = base + 'assets/js/maplibre-gl.js';
    js.onload = function () { mapLib.forEach(function (f) { f(); }); };
    document.head.appendChild(js);
  }
  function drawMap(v) {
    if (v.dataset.done) return;
    v.dataset.done = '1';
    loadMapLib(function () {
      var holder = document.createElement('div');
      holder.className = 'map-gl';
      v.insertBefore(holder, v.firstChild);
      try {
        var map = new maplibregl.Map({
          container: holder, style: 'https://tiles.openfreemap.org/styles/positron',
          center: [+v.dataset.lon, +v.dataset.lat], zoom: +v.dataset.zoom,
          interactive: false, attributionControl: false, fadeDuration: 0
        });
        map.on('load', function () { v.classList.add('drawn'); });
      } catch (e) { holder.remove(); }
    });
  }
  function initMaps(root) {
    var views = $$('.map-view[data-lat]', root).filter(function (v) { return !v.dataset.done; });
    if (!views.length) return;
    if (!('IntersectionObserver' in window)) { views.forEach(drawMap); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { io.unobserve(x.target); drawMap(x.target); } });
    }, { rootMargin: '200px' });
    views.forEach(function (v) { io.observe(v); });
  }
  initMaps();

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
    if (!window.gsap || !window.ScrollTrigger || reduce) {
      document.documentElement.classList.remove('intro-on');
      document.body.classList.add('no-anim');
      $$('.night-step').forEach(function (st) { st.classList.add('lit'); });
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

    var heroAt = playIntro();

    /* big lines rise out of their own baseline */
    $$('.mega .row').forEach(function (row) {
      var inHero = row.closest('.hero');
      /* after the intro the hero lines only fade in, so the photo lands exactly where it will rest */
      gsap.from(row, { yPercent: inHero && heroAt ? 0 : 40, opacity: 0, duration: inHero && heroAt ? .7 : 1.2, ease: 'expo.out',
        delay: inHero ? heroAt + .1 + $$('.row', row.parentElement).indexOf(row) * .1 : 0,
        scrollTrigger: inHero ? null : { trigger: row, start: 'top 92%' } });
    });
    gsap.from('.hero-foot', { opacity: 0, y: 30, duration: 1.2, ease: 'expo.out', delay: heroAt + .45 });
    $$('.ed-title, .ed-meta, .ed-cols, .sec-head, .inline-cta, .pg-head, .night-head, .contact-grid, .value').forEach(function (el) {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    /* projects and process: on wide screens the section stays put while scrolling down moves it sideways */
    var mm = gsap.matchMedia();
    mm.add('(min-width: 761px) and (pointer: fine)', function () {
      function sideways(section, track, onProgress) {
        var dist = function () { return Math.max(0, track.scrollWidth - track.parentElement.clientWidth); };
        return gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: function () { return '+=' + dist(); },
            pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: onProgress }
        });
      }
      var pg = $('.projects'), pgTrack = $('.pg-track'), pgCount = $('.pg-count b'), cards = $$('.pg-card');
      if (pg && pgTrack) sideways(pg, pgTrack, function (st) {
        pg.style.setProperty('--pg', st.progress);
        var i = Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1)));
        if (pgCount) pgCount.textContent = (i < 9 ? '0' : '') + (i + 1);
      });
      /* the evening: the sky goes from paper to dusk to night as the steps go by */
      var night = $('.night'), nTrack = $('.night-track'), nSteps = $$('.night-step');
      var sky = [[233, 230, 224], [236, 196, 160], [168, 96, 70], [44, 30, 28], [20, 18, 18]];
      function mix(p) {
        var x = p * (sky.length - 1), i = Math.min(sky.length - 2, Math.floor(x)), f = x - i;
        return sky[i].map(function (c, k) { return Math.round(c + (sky[i + 1][k] - c) * f); });
      }
      if (night && nTrack) sideways(night, nTrack, function (st) {
        var c = mix(st.progress);
        night.style.setProperty('--sky', 'rgb(' + c.join(',') + ')');
        night.style.color = (c[0] + c[1] + c[2]) / 3 < 120 ? '#f2efe9' : '';
        night.style.setProperty('--np', st.progress);
        nSteps.forEach(function (sp, j) { sp.classList.toggle('lit', st.progress >= j / Math.max(1, nSteps.length - 1) - .02); });
      });
    });
    mm.add('(max-width: 760px), (pointer: coarse)', function () {
      $$('.night-step').forEach(function (sp) {
        ScrollTrigger.create({ trigger: sp, start: 'top 70%', onEnter: function () { sp.classList.add('lit'); }, onLeaveBack: function () { sp.classList.remove('lit'); } });
      });
      /* the gallery's counter follows the swipe */
      var vp = $('.pg-viewport'), cards = $$('.pg-card'), pgCount = $('.pg-count b');
      if (vp && cards.length > 1) vp.addEventListener('scroll', function () {
        var i = Math.round(vp.scrollLeft / (cards[1].offsetLeft - cards[0].offsetLeft));
        if (pgCount) pgCount.textContent = (i < 9 ? '0' : '') + (i + 1);
      }, { passive: true });
    });

    /* project pages: photos rise in */
    $$('.g').forEach(function (fr) {
      gsap.from(fr, { opacity: 0, y: 80, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: fr, start: 'top 92%' } });
    });

    window.addEventListener('load', function () { fitAll(); ScrollTrigger.refresh(); });
  }

  /* ---------- INTRO, first visit only: the logo, the name in a pill, a window onto a bar that
     fills the screen and then lands inside the headline. A click skips it. Returns when the hero starts. ---------- */
  var introTl = null;
  function playIntro() {
    var html = document.documentElement, intro = $('.intro');
    if (!intro || !html.classList.contains('intro-on')) return 0;
    if (lenis) lenis.stop();
    var mark = $('.intro-mark', intro), dot = $('.intro-dot', intro), word = $('.intro-word', intro);
    var win = $('.intro-win', intro), wimg = $('img', win), bg = $('.intro-bg', intro), corners = $$('.c', win);
    /* start from scratch, so it can be played again */
    if (introTl) introTl.kill();
    gsap.set([mark, dot, word, win, bg].concat(corners), { clearProps: 'all' });
    var pic = $('.hero .pic'), shown = pic && $('img.on', pic);
    if (shown) wimg.src = shown.currentSrc || shown.src;
    var W = innerWidth, H = innerHeight, small = W < 760;
    var target = function () { return pic ? pic.getBoundingClientRect() : { left: W / 2, top: H / 2, width: 0, height: 0 }; };
    var wordW = word.scrollWidth;
    gsap.set(word, { width: 0 });
    gsap.set(dot, { scale: 0 });
    function done() {
      html.classList.remove('intro-on');
      if (lenis) lenis.start();
    }
    var tl = introTl = gsap.timeline({ onComplete: done });
    if (!intro.dataset.skip) {
      intro.dataset.skip = '1';
      intro.addEventListener('click', function () { if (introTl) introTl.progress(1); });
    }
    tl.to(dot, { scale: 1, duration: .5, ease: 'back.out(2)' }, .2)
      .to(word, { width: wordW, duration: .7, ease: 'expo.inOut' }, .65)
      .to(mark, { borderColor: 'rgba(242,239,233,.55)', duration: .3 }, 1.15)
      .add(function () {
        var r = mark.getBoundingClientRect();
        gsap.set(win, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 28, opacity: 1 });
      }, 1.55)
      .to(mark, { opacity: 0, duration: .25 }, 1.55)
      .to(win, { left: W * (small ? .12 : .32), top: H * .32, width: W * (small ? .76 : .36), height: H * .36, borderRadius: 6, duration: .75, ease: 'expo.inOut' }, 1.6)
      .fromTo(wimg, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 1.6)
      .to(win, { left: 0, top: 0, width: W, height: H, borderRadius: 0, duration: .85, ease: 'expo.inOut' }, 2.45)
      .to(corners, { opacity: 0, duration: .3 }, 3.35)
      .to(win, {
        left: function () { return target().left; }, top: function () { return target().top; },
        width: function () { return target().width; }, height: function () { return target().height; },
        borderRadius: function () { return pic ? parseFloat(getComputedStyle(pic).borderTopLeftRadius) || 8 : 8; },
        duration: .95, ease: 'expo.inOut'
      }, 3.4)
      .to(bg, { opacity: 0, duration: .7, ease: 'power2.inOut' }, 3.55);
    return 3.6;
  }

  /* the logo plays the intro again (on the home page; elsewhere it opens the home page, which plays it) */
  $$('.pill-logo').forEach(function (logo) {
    logo.addEventListener('click', function (e) {
      if (!$('.intro') || !window.gsap || reduce || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
      document.documentElement.classList.add('intro-on');
      var at = playIntro();
      gsap.fromTo($$('.hero .hero-mega .row, .hero-foot'), { opacity: 0 }, { opacity: 1, duration: .7, stagger: .1, delay: at + .1, ease: 'power2.out' });
    });
  });

  /* GSAP and Lenis are deferred, so they are ready by DOMContentLoaded */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
