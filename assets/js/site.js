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
    tick();
    if (window.ScrollTrigger && document.body.classList.contains('anim')) { setupManifesto(); ScrollTrigger.refresh(); }
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

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
