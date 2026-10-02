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
  /* A few questions, one at a time; the answers become a WhatsApp message (or an email). */
  var renderBooking = null;
  (function booking() {
    var box = $('#booking'), dataEl = $('#booking-data');
    if (!box || !dataEl) return;
    var data = JSON.parse(dataEl.textContent);
    var log = $('#chat-log'), input = $('#chat-input'), restart = $('.chat-restart', box);
    var T = {
      pt: {
        hello: 'Olá. Antes de nos sentarmos, só preciso de saber quatro coisas.',
        need: 'O que tem em mãos?',
        needs: {
          tudo: 'Um lugar novo — quero tudo, do zero à porta aberta',
          partes: 'Um projecto a andar — preciso de algumas partes',
          melhorar: 'Um negócio que já existe — quero melhorar algo'
        },
        partsQ: { partes: 'Que partes? Escolha as que quiser.', melhorar: 'O que gostaria de melhorar? Se ainda não souber, vemos juntos.' },
        unsure: 'Ainda não sei',
        go: 'Continuar',
        where: 'Onde fica — ou vai ficar?',
        places: ['Lisboa', 'Porto', 'Algarve', 'Fora de Portugal'],
        wherePh: 'Outro sítio…',
        when: 'Quando nos sentamos?',
        whenModes: { dia: 'Num dia e hora certos', intervalo: 'Entre duas datas', livre: 'Quando lhe der mais jeito' },
        pick: { dia: 'Escolha o dia e a hora. Eu confirmo.', intervalo: 'Escolha o primeiro e o último dia — e, se quiser, a partir de que horas.' },
        after: ['Qualquer hora', 'Depois das 10h', 'Depois das 15h', 'Depois das 18h'],
        at: ', às ', between: function (a, b) { return 'Entre ' + a + ' e ' + b; }, from: function (a) { return 'A partir de ' + a; },
        week: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'], prev: 'Mês anterior', next: 'Mês seguinte',
        name: 'E como se chama?',
        namePh: 'O seu nome',
        send: 'Enviar',
        done: function (n) { return 'Obrigado, ' + n + '. Envie-me isto por WhatsApp ou por email, como preferir, e eu confirmo o dia — de preferência à mesa.'; },
        viaWa: 'WhatsApp', viaEmail: 'Email',
        msg: {
          intro: 'Olá Sakim! Vim pelo site e gostava de marcar uma consulta.',
          need: 'Tenho em mãos', partes: 'Partes', melhorar: 'Quero melhorar', where: 'Onde', when: 'Quando', name: 'Nome',
          subject: 'Consulta — Sakim Lab'
        }
      },
      en: {
        hello: 'Hello. Before we sit down, I only need to know four things.',
        need: 'What do you have in mind?',
        needs: {
          tudo: 'A new place — I want everything, from zero to opening night',
          partes: 'A project under way — I need some parts',
          melhorar: 'An existing business — I want to improve something'
        },
        partsQ: { partes: 'Which parts? Pick as many as you like.', melhorar: 'What would you like to improve? If you are not sure yet, we will look at it together.' },
        unsure: 'Not sure yet',
        go: 'Continue',
        where: 'Where is it — or where will it be?',
        places: ['Lisbon', 'Porto', 'Algarve', 'Outside Portugal'],
        wherePh: 'Somewhere else…',
        when: 'When shall we sit down?',
        whenModes: { dia: 'On a set day and time', intervalo: 'Between two dates', livre: 'Whenever suits you' },
        pick: { dia: 'Pick the day and time. I will confirm.', intervalo: 'Pick the first and last day — and, if you like, from what time.' },
        after: ['Any time', 'After 10am', 'After 3pm', 'After 6pm'],
        at: ', at ', between: function (a, b) { return 'Between ' + a + ' and ' + b; }, from: function (a) { return 'From ' + a; },
        week: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], prev: 'Previous month', next: 'Next month',
        name: 'And what is your name?',
        namePh: 'Your name',
        send: 'Send',
        done: function (n) { return 'Thank you, ' + n + '. Send me this on WhatsApp or by email, whichever you prefer, and I will confirm the day — ideally at a table.'; },
        viaWa: 'WhatsApp', viaEmail: 'Email',
        msg: {
          intro: 'Hello Sakim! I found you through the website and would like to book a consultation.',
          need: 'What I have in mind', partes: 'Parts', melhorar: 'I want to improve', where: 'Where', when: 'When', name: 'Name',
          subject: 'Consultation — Sakim Lab'
        }
      }
    };
    var st, shown = 0, touched = false;
    var HOURS = ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    var minDay = addDays(today, 1), maxDay = addDays(today, 120), calMonth;
    function reset() {
      st = { step: 'need', need: null, parts: [], unsure: false, where: '', name: '',
             when: null, date: null, hour: '', start: null, end: null, after: 0, picked: false };
      calMonth = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
      shown = 0;
    }
    reset();

    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function partNames() {
      return st.parts.map(function (id) { return data.services.find(function (x) { return x.id === id; })[lang]; });
    }
    function partsAnswer() {
      var names = partNames();
      if (st.unsure) names.push(T[lang].unsure);
      return names.join(', ');
    }
    function fmt(d, long) {
      return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long' }).format(d);
    }
    function whenAnswer() {
      var L = T[lang];
      if (st.when === 'livre') return L.whenModes.livre;
      if (st.when === 'dia') return fmt(st.date, true) + L.at + st.hour;
      var txt = st.end ? L.between(fmt(st.start), fmt(st.end)) : L.from(fmt(st.start));
      return txt + (st.after ? ', ' + L.after[st.after].charAt(0).toLowerCase() + L.after[st.after].slice(1) : '');
    }
    function message() {
      var m = T[lang].msg, lines = [m.intro, ''];
      lines.push('• ' + m.need + ': ' + T[lang].needs[st.need]);
      if (st.need !== 'tudo') lines.push('• ' + m[st.need] + ': ' + partsAnswer());
      lines.push('• ' + m.where + ': ' + st.where);
      lines.push('• ' + m.when + ': ' + whenAnswer());
      lines.push('• ' + m.name + ': ' + st.name);
      return lines.join('\n');
    }
    function conversation() {
      var L = T[lang], c = [['bot', L.hello], ['bot', L.need]];
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
      c.push(['me', st.name]);
      c.push(['bot', L.done(st.name)]);
      return c;
    }
    function go(next) { touched = true; st.step = next; render(); }
    function textField(ph, onSend) {
      var f = el('form', 'chat-field'), i = el('input'), b = el('button', null, T[lang].send);
      i.type = 'text'; i.placeholder = ph; i.maxLength = 80; i.autocomplete = 'off'; i.setAttribute('aria-label', ph);
      b.type = 'submit';
      f.appendChild(i); f.appendChild(b);
      f.addEventListener('submit', function (e) { e.preventDefault(); var v = i.value.trim(); if (v) onSend(v); });
      if (touched) setTimeout(function () { i.focus({ preventScroll: true }); }, 400);
      return f;
    }
    function calendar(single, onChange) {
      var box = el('div', 'cal');
      function draw() {
        var L = T[lang];
        box.innerHTML = '';
        var head = el('div', 'cal-head');
        var prev = el('button', 'cal-nav', '‹'), next = el('button', 'cal-nav', '›');
        prev.type = next.type = 'button';
        prev.setAttribute('aria-label', L.prev); next.setAttribute('aria-label', L.next);
        var first = new Date(minDay.getFullYear(), minDay.getMonth(), 1), last = new Date(maxDay.getFullYear(), maxDay.getMonth(), 1);
        prev.disabled = calMonth <= first; next.disabled = calMonth >= last;
        prev.addEventListener('click', function () { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); draw(); });
        next.addEventListener('click', function () { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); draw(); });
        var month = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-GB', { month: 'long', year: 'numeric' }).format(calMonth);
        var title = el('span', 'cal-title', month.charAt(0).toUpperCase() + month.slice(1));
        head.appendChild(prev); head.appendChild(title); head.appendChild(next);
        box.appendChild(head);
        var grid = el('div', 'cal-grid');
        L.week.forEach(function (w) { grid.appendChild(el('span', 'cal-wd', w)); });
        var offset = (calMonth.getDay() + 6) % 7;
        for (var i = 0; i < offset; i++) grid.appendChild(el('span'));
        var days = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= days; d++) {
          (function (day) {
            var t = day.getTime();
            var b = el('button', 'cal-day', String(day.getDate())); b.type = 'button';
            b.setAttribute('aria-label', fmt(day, true));
            b.disabled = day < minDay || day > maxDay;
            var on = single ? st.date && st.date.getTime() === t : (st.start && st.start.getTime() === t) || (st.end && st.end.getTime() === t);
            var inside = !single && st.start && st.end && day > st.start && day < st.end;
            if (on) b.classList.add('on');
            if (inside) b.classList.add('in');
            b.setAttribute('aria-pressed', !!on);
            b.addEventListener('click', function () {
              if (single) st.date = day;
              else if (!st.start || st.end || day < st.start) { st.start = day; st.end = null; }
              else if (day.getTime() === st.start.getTime()) st.end = null;
              else st.end = day;
              draw(); onChange();
            });
            grid.appendChild(b);
          })(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
        }
        box.appendChild(grid);
      }
      draw();
      return box;
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
        var chips = el('div', 'chat-chips');
        var opts = data.services.map(function (x) { return { id: x.id, label: x[lang] }; });
        if (st.need === 'melhorar') opts.push({ id: '?', label: L.unsure });
        var next = el('button', 'chat-go', L.go + ' →'); next.type = 'button';
        var sync = function () { next.disabled = !st.parts.length && !st.unsure; };
        opts.forEach(function (o) {
          var on = o.id === '?' ? st.unsure : st.parts.indexOf(o.id) > -1;
          var b = el('button', 'chat-chip' + (on ? ' on' : ''), o.label); b.type = 'button'; b.setAttribute('aria-pressed', on);
          b.addEventListener('click', function () {
            if (o.id === '?') st.unsure = !st.unsure;
            else { var i = st.parts.indexOf(o.id); if (i > -1) st.parts.splice(i, 1); else st.parts.push(o.id); }
            var now = o.id === '?' ? st.unsure : st.parts.indexOf(o.id) > -1;
            b.classList.toggle('on', now); b.setAttribute('aria-pressed', now); sync();
          });
          chips.appendChild(b);
        });
        next.addEventListener('click', function () { go('where'); });
        sync();
        wrap.appendChild(chips); wrap.appendChild(next);
      } else if (st.step === 'where') {
        var places = el('div', 'chat-chips');
        L.places.forEach(function (p) {
          var b = el('button', 'chat-chip', p); b.type = 'button';
          b.addEventListener('click', function () { st.where = p; go('when'); });
          places.appendChild(b);
        });
        wrap.appendChild(places);
        wrap.appendChild(textField(L.wherePh, function (v) { st.where = v; go('when'); }));
      } else if (st.step === 'when') {
        ['dia', 'intervalo', 'livre'].forEach(function (k) {
          var b = el('button', 'chat-option', L.whenModes[k]); b.type = 'button';
          b.addEventListener('click', function () { st.when = k; go(k === 'livre' ? 'name' : 'pick'); });
          wrap.appendChild(b);
        });
      } else if (st.step === 'pick') {
        var single = st.when === 'dia';
        var next = el('button', 'chat-go', L.go + ' →'); next.type = 'button';
        var sync = function () { next.disabled = single ? !(st.date && st.hour) : !st.start; };
        wrap.appendChild(calendar(single, sync));
        var row = el('div', 'chat-chips');
        (single ? HOURS : L.after).forEach(function (label, i) {
          var on = single ? st.hour === label : st.after === i;
          var b = el('button', 'chat-chip' + (on ? ' on' : ''), label); b.type = 'button'; b.setAttribute('aria-pressed', on);
          b.addEventListener('click', function () {
            if (single) st.hour = label; else st.after = i;
            $$('.chat-chip', row).forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', false); });
            b.classList.add('on'); b.setAttribute('aria-pressed', true); sync();
          });
          row.appendChild(b);
        });
        wrap.appendChild(row);
        next.addEventListener('click', function () { st.picked = true; go('name'); });
        sync();
        wrap.appendChild(next);
      } else if (st.step === 'name') {
        wrap.appendChild(textField(L.namePh, function (v) { st.name = v; go('done'); }));
      } else if (st.step === 'done') {
        var text = message(), row = el('div', 'chat-sends');
        var wa = el('a', 'chat-send', L.viaWa + ' →');
        wa.href = 'https://wa.me/' + data.whatsapp + '?text=' + encodeURIComponent(text);
        wa.target = '_blank'; wa.rel = 'noopener';
        var mail = el('a', 'chat-send', L.viaEmail + ' →');
        mail.href = 'mailto:' + data.email + '?subject=' + encodeURIComponent(L.msg.subject) + '&body=' + encodeURIComponent(text);
        if (data.whatsapp) row.appendChild(wa);
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
      input.appendChild(controls());
      restart.hidden = st.step === 'need';
      log.scrollTop = log.scrollHeight;
      setTimeout(function () { log.scrollTop = log.scrollHeight; }, 800);
    }
    restart.addEventListener('click', function () { reset(); touched = true; render(); });
    renderBooking = function () { shown = log.children.length; render(); };
    render();
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
