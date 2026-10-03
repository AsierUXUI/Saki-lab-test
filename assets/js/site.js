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
          intro: 'Olá Sakim! Vim pelo site e gostava que nos sentássemos a conversar.',
          need: 'O que tenho entre mãos', partes: 'Peças que faltam', melhorar: 'O que quero melhorar', where: 'Onde', when: 'Quando',
          whenever: 'quando lhe der jeito — proponha você', name: 'Nome', company: 'Projecto / casa',
          subject: 'Consulta — Sakim Lab'
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
          intro: 'Hello Sakim! I found you through the website and would love to sit down and talk.',
          need: 'What I have', partes: 'Pieces missing', melhorar: 'What I want to improve', where: 'Where', when: 'When',
          whenever: 'whenever suits you — you suggest', name: 'Name', company: 'Project / place',
          subject: 'Consultation — Sakim Lab'
        }
      }
    };

    var today = new Date(); today.setHours(0, 0, 0, 0);
    function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    var minDay = addDays(today, 1), maxDay = addDays(today, 120), calMonth;
    var st, shown = 0, touched = false, lastStep = null;
    function reset() {
      st = { step: 'need', need: null, parts: [], unsure: false, where: '', when: null, date: null, period: -1, daypart: -1, picked: false, name: '', company: '' };
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
    function message() {
      var L = T[lang], m = L.msg, lines = [m.intro, ''];
      lines.push('• ' + m.need + ': ' + L.needs[st.need]);
      if (st.need !== 'tudo') lines.push('• ' + m[st.need] + ': ' + partsAnswer());
      lines.push('• ' + m.where + ': ' + st.where);
      lines.push('• ' + m.when + ': ' + (st.when === 'livre' ? m.whenever : whenAnswer()));
      lines.push('• ' + m.name + ': ' + st.name);
      if (st.company) lines.push('• ' + m.company + ': ' + st.company);
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
          b.addEventListener('click', function () { st.need = k; go(k === 'tudo' ? 'where' : 'parts'); });
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
        next.addEventListener('click', function () { go('where'); });
        sync();
        wrap.appendChild(next);
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
        var text = message(), row = el('div', 'chat-sends');
        if (data.whatsapp) {
          var wa = el('a', 'chat-send', L.viaWa + ' →');
          wa.href = 'https://wa.me/' + data.whatsapp + '?text=' + encodeURIComponent(text);
          wa.target = '_blank'; wa.rel = 'noopener';
          row.appendChild(wa);
        }
        var mail = el('a', 'chat-send alt', L.viaEmail + ' →');
        mail.href = 'mailto:' + data.email + '?subject=' + encodeURIComponent(L.msg.subject) + '&body=' + encodeURIComponent(text);
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

  /* ---------- PLACES: map, timeline and the switch between them ---------- */
  (function places() {
    var dataEl = $('#places-data');
    if (!dataEl) return;
    var cards = JSON.parse(dataEl.textContent);

    var btns = $$('.view-btn'), panels = $$('[data-view-panel]');
    function show(v) {
      btns.forEach(function (b) { var on = b.dataset.view === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      panels.forEach(function (p) { p.hidden = p.dataset.viewPanel !== v; });
      try { history.replaceState(null, '', v === 'time' ? '#anos' : location.pathname); } catch (e) {}
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.view); close(); }); });
    if (location.hash === '#anos') show('time');

    /* on phones the map zooms in on the centre, where the dots are */
    var svg = $('.map-svg'), full = svg.getAttribute('viewBox'), mq = matchMedia('(max-width: 760px)');
    function fit() { svg.setAttribute('viewBox', mq.matches ? svg.dataset.mobileBox : full); close(); }
    fit();
    if (mq.addEventListener) mq.addEventListener('change', fit);

    var wrap = $('.map-wrap'), card = $('.map-card'), current = null;
    function open(a) {
      var c = cards[a.dataset.i];
      card.innerHTML = '';
      var img = new Image(); img.className = 'photo'; img.src = c.cover; img.alt = '';
      var body = document.createElement('div');
      var where = document.createElement('span'); where.className = 'mono'; where.textContent = c.where[lang];
      var name = document.createElement('strong'); name.textContent = c.name;
      var line = document.createElement('p'); line.textContent = c.line[lang];
      var go = document.createElement('a'); go.className = 'link-arrow'; go.href = c.href;
      go.innerHTML = (lang === 'pt' ? 'Entrar' : 'Step inside') + ' <b>→</b>';
      [where, name, line, go].forEach(function (x) { body.appendChild(x); });
      card.appendChild(img); card.appendChild(body);
      var w = wrap.getBoundingClientRect(), r = $('.dot-core', a).getBoundingClientRect();
      var half = Math.min(190, w.width / 2 - 8);
      var x = Math.max(half + 8, Math.min(w.width - half - 8, r.left + r.width / 2 - w.left));
      var below = r.top - w.top < 190;
      card.classList.toggle('below', below);
      card.style.left = x + 'px';
      card.style.top = (below ? r.bottom - w.top : r.top - w.top) + 'px';
      card.hidden = false;
      $$('.dot').forEach(function (d) { d.classList.toggle('on', d === a); });
      current = a;
    }
    function close() {
      if (!card) return;
      card.hidden = true; current = null;
      $$('.dot').forEach(function (d) { d.classList.remove('on'); });
    }
    $$('.dot').forEach(function (a) {
      if (finePointer) a.addEventListener('mouseenter', function () { open(a); });
      a.addEventListener('focus', function () { open(a); });
      /* on touch screens the first tap shows the card, the second goes in */
      var wasOpen = false;
      a.addEventListener('pointerdown', function () { wasOpen = current === a; });
      a.addEventListener('click', function (e) { if (!finePointer && !wasOpen) { e.preventDefault(); open(a); } wasOpen = false; });
    });
    if (finePointer) wrap.addEventListener('mouseleave', close);
    document.addEventListener('click', function (e) { if (current && !e.target.closest('.dot, .map-card')) close(); });
    $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { if (current) open(current); }); });

    /* the timeline scrolls sideways with the wheel and can be dragged */
    var tl = $('.timeline');
    tl.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        var max = tl.scrollWidth - tl.clientWidth;
        if ((e.deltaY > 0 && tl.scrollLeft < max) || (e.deltaY < 0 && tl.scrollLeft > 0)) { tl.scrollLeft += e.deltaY; e.preventDefault(); }
      }
    }, { passive: false });
    var down = false, x0 = 0, s0 = 0, moved = false;
    tl.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = tl.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; if (Math.abs(e.clientX - x0) > 5) moved = true; tl.scrollLeft = s0 - (e.clientX - x0); });
    window.addEventListener('pointerup', function () { down = false; });
    tl.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    $$('img', tl).forEach(function (i) { i.draggable = false; });
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
    var heroLines = $$('.hero h1 .line > span');
    var heroRest = $$('.hero-eyebrow, .hero-foot');
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
