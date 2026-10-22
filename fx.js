/* =====================================================================
   Анимации сайта «Олжа» (подключается на всех страницах)
   - В шапке страницы: башенный кран с грузом, шестерёнки, молоток, гаечный ключ, каска
     (они двигаются сами и чуть следуют за мышью и прокруткой)
   - Линейка-рулетка сверху показывает, сколько страницы прокручено
   - Заголовок появляется по словам, слово-выделение «закрашивается маркером»
   - Внизу сайта «строится» кирпичная стена
   - На синем «чертёжном» блоке рисуется план дома
   - Карточки слегка наклоняются за курсором
   - Если у человека включено «уменьшить движение» в системе, всё стоит на месте
   Фоновые фото (необязательно): положите в папку images/ файлы
   bg-hero.jpg (главный экран) и bg-dark.jpg (тёмные блоки). Если файлов нет, ничего не показывается.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Шестерёнка (рисуем зубцы расчётом) ---------- */
  function gearPath(cx, cy, rIn, rOut, teeth, hole) {
    const step = Math.PI * 2 / teeth;
    let d = '';
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      [[a - step * .28, rIn], [a - step * .16, rOut], [a + step * .16, rOut], [a + step * .28, rIn]].forEach((p, k) => {
        const x = cx + Math.cos(p[0]) * p[1], y = cy + Math.sin(p[0]) * p[1];
        d += (i === 0 && k === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      });
    }
    d += 'Z';
    d += 'M' + (cx - hole) + ' ' + cy + 'a' + hole + ' ' + hole + ' 0 1 0 ' + (hole * 2) + ' 0a' + hole + ' ' + hole + ' 0 1 0 ' + (-hole * 2) + ' 0Z';
    return d;
  }
  const bigGear = gearPath(100, 100, 70, 90, 16, 22);
  const smallGear = gearPath(100, 100, 70, 90, 10, 22);
  const bgGearUri = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="#fff" fill-rule="evenodd" d="' + gearPath(100, 100, 74, 94, 14, 26) + '"/></svg>');

  /* ---------- Стили ---------- */
  const css = `
  /* фон: необязательные фото */
  .band-hero::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .18; mix-blend-mode: multiply;
         background: url("images/bg-hero.jpg") center / cover no-repeat; }
  .band-dark::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .16;
         background: url("images/bg-dark.jpg") center / cover no-repeat; }
  .band-hero, .band-dark, .band-black, .band-steel, .band-sand { overflow: hidden; overflow: clip; }
  .band > .wrap { position: relative; z-index: 1; }

  /* огромные шестерёнки в углах тёмных блоков */
  .band-dark::after, .band-black::after { content: ""; position: absolute; width: 460px; height: 460px; pointer-events: none; opacity: .06;
         background: url("${bgGearUri}") center / contain no-repeat; animation: fxSpin 90s linear infinite; }
  .band-dark::after { right: -150px; top: -150px; }
  .band-black::after { left: -170px; bottom: -190px; animation-direction: reverse; }

  /* рулетка вместо полосы прокрутки */
  .fx-ruler { position: fixed; top: 0; left: 0; right: 0; height: 9px; z-index: 60; pointer-events: none;
         background: #141414 repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0 1px, transparent 1px 10px); }
  .fx-ruler i { position: absolute; inset: 0; transform-origin: 0 50%; transform: scaleX(0);
         background: var(--accent, #f26a1b); mix-blend-mode: normal; }
  .fx-ruler::after { content: ""; position: absolute; inset: 0;
         background: repeating-linear-gradient(90deg, rgba(20,20,20,.6) 0 1px, transparent 1px 10px); }

  /* слой с инструментами в шапке */
  .fx-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .fx-tool { position: absolute; will-change: transform; opacity: 0; animation: fxIn 1.3s ease forwards; animation-delay: var(--dl, .2s); }
  .fx-tool svg { display: block; width: 100%; height: auto; fill: currentColor; }
  .fx-crane  { --o: .15; --dl: .2s; right: 1%; top: -14px; width: 360px; color: var(--ink, #141414); }
  .fx-gears  { --o: .13; --dl: .5s; left: -46px; bottom: -36px; width: 340px; aspect-ratio: 340 / 270; color: var(--ink, #141414); }
  .fx-hammer { --o: .42; --dl: .8s; right: 37%; top: 6%; width: 118px; color: var(--accent, #f26a1b); }
  .fx-wrench { --o: .15; --dl: 1.1s; right: 29%; bottom: 7%; width: 170px; color: var(--ink, #141414); }
  .fx-hat    { --o: .42; --dl: 1.4s; left: 38%; bottom: 4%; width: 112px; color: var(--accent, #f26a1b); }
  @keyframes fxIn { from { opacity: 0; } to { opacity: var(--o, .15); } }

  .fx-gears svg { position: absolute; }
  .fx-gears .g1 { left: 0; top: 11%; width: 70.6%; animation: fxSpin 28s linear infinite; }
  .fx-gears .g2 { left: 55.6%; top: 5.5%; width: 44.1%; animation: fxSpin 17.5s linear infinite reverse; }
  @keyframes fxSpin { to { transform: rotate(360deg); } }

  .fx-hammer svg { transform-origin: 50% 94%; animation: fxSwing 2.4s ease-in-out infinite alternate; }
  @keyframes fxSwing { from { transform: rotate(-20deg); } to { transform: rotate(24deg); } }
  .fx-wrench svg { animation: fxWrench 5s ease-in-out infinite alternate; }
  @keyframes fxWrench { from { transform: rotate(-32deg) translateY(0); } to { transform: rotate(-20deg) translateY(-10px); } }
  .fx-hat svg { transform-origin: 50% 100%; animation: fxHat 3.2s ease-in-out infinite alternate; }
  @keyframes fxHat { from { transform: rotate(-7deg) translateY(0); } to { transform: rotate(7deg) translateY(-8px); } }
  .fx-trolley { animation: fxTrolley 9s ease-in-out infinite alternate; }
  @keyframes fxTrolley { from { transform: translateX(-70px); } to { transform: translateX(70px); } }
  .fx-hoist { animation: fxHoist 3.6s ease-in-out infinite alternate; }
  @keyframes fxHoist { from { transform: translateY(-8px); } to { transform: translateY(72px); } }
  .fx-layer.fx-paused * { animation-play-state: paused !important; }

  /* заголовок по словам */
  .fx-split .fx-word { display: inline-block; opacity: 0; transform: translateY(.55em) rotate(3deg);
         animation: fxRise .85s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: calc(120ms + var(--i) * 90ms); }
  @keyframes fxRise { to { opacity: 1; transform: none; } }
  .fx-split .fx-word mark { background: linear-gradient(var(--accent, #f26a1b), var(--accent, #f26a1b)) 0 0 / 0% 100% no-repeat;
         animation: fxMark .8s cubic-bezier(.6,0,.2,1) forwards; animation-delay: calc(120ms + var(--i) * 90ms + 380ms); }
  @keyframes fxMark { to { background-size: 100% 100%; } }

  /* стена, которая строится */
  .fx-wall { position: absolute; left: 0; right: 0; top: 0; height: 69px; overflow: hidden; pointer-events: none; z-index: 0; }
  .fx-row { display: flex; height: 23px; }
  .fx-row:nth-child(even) { margin-left: -32px; }
  .fx-brick { flex: 0 0 64px; height: 23px; background: hsl(14 62% var(--l, 42%)); box-shadow: inset 0 0 0 1.5px rgba(0,0,0,.3);
         border-radius: 2px; opacity: 0; }
  .fx-wall.built .fx-brick { animation: fxDrop .6s cubic-bezier(.2,.8,.3,1.25) forwards; animation-delay: calc(var(--d) * 1ms); }
  @keyframes fxDrop { from { opacity: 0; transform: translateY(-70px) rotate(var(--r, 8deg)); } to { opacity: 1; transform: none; } }

  /* чертёж */
  .fx-blueprint { position: absolute; right: 4%; bottom: 36px; width: 380px; opacity: .3; pointer-events: none; z-index: 0; color: #fff; }
  .fx-blueprint svg { display: block; width: 100%; height: auto; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .fx-blueprint path, .fx-blueprint circle { stroke-dasharray: 1; stroke-dashoffset: 1; }
  .fx-blueprint text { fill: currentColor; stroke: none; font: 600 11px monospace; opacity: 0; transition: opacity 1s 2s; }
  .fx-blueprint.draw path, .fx-blueprint.draw circle { animation: fxDraw 2.6s cubic-bezier(.4,0,.2,1) forwards; animation-delay: calc(var(--k) * 140ms); }
  .fx-blueprint.draw text { opacity: 1; }
  @keyframes fxDraw { to { stroke-dashoffset: 0; } }

  /* рулетка-лента на песочном блоке */
  .band-sand::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 24px; pointer-events: none;
         background:
           repeating-linear-gradient(90deg, #141414 0 2px, transparent 2px 50px) 0 100% / 100% 16px no-repeat,
           repeating-linear-gradient(90deg, #141414 0 2px, transparent 2px 10px) 0 100% / 100% 8px no-repeat,
           #f2c230;
         animation: fxTape 10s linear infinite; }
  @keyframes fxTape { to { background-position: 100px 100%, 100px 100%, 0 0; } }

  /* бегущая строка (главная) */
  .fx-marquee-wrap { overflow: hidden; padding: 30px 0; position: relative; z-index: 3; margin: -26px 0 -26px; pointer-events: none; }
  .fx-marquee { transform: rotate(-1.2deg); width: 104%; margin-left: -2%; background: var(--accent, #f26a1b); color: var(--ink, #141414);
         box-shadow: 0 10px 30px rgba(0,0,0,.25); overflow: hidden; }
  .fx-track { display: flex; align-items: center; gap: 34px; width: max-content; padding: 14px 0; animation: fxMarquee 38s linear infinite; }
  .fx-track span { font: 700 28px/1 var(--head, sans-serif); text-transform: uppercase; white-space: nowrap; letter-spacing: .02em; }
  .fx-track i { flex: 0 0 14px; height: 14px; background: var(--ink, #141414); transform: rotate(45deg); }
  @keyframes fxMarquee { to { transform: translateX(-50%); } }

  @media (max-width: 1100px) { .fx-blueprint { display: none; } }
  @media (max-width: 760px) {
    .fx-crane, .fx-wrench { display: none; }
    .fx-gears { width: 230px; left: -40px; bottom: -30px; }
    .fx-hammer { right: 6%; top: 3%; width: 84px; }
    .fx-hat { left: auto; right: 4%; bottom: 3%; width: 84px; }
    .fx-track span { font-size: 22px; }
    .band-dark::after, .band-black::after { width: 300px; height: 300px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .fx-layer *, .fx-tool, .band-dark::after, .band-black::after, .band-sand::before, .fx-track { animation: none !important; }
    .fx-tool { opacity: var(--o, .15); }
    .fx-split .fx-word { opacity: 1; transform: none; animation: none; }
    .fx-split .fx-word mark { background-size: 100% 100%; animation: none; }
    .fx-brick { opacity: 1; animation: none !important; }
    .fx-blueprint path, .fx-blueprint circle { stroke-dashoffset: 0; animation: none !important; }
    .fx-blueprint text { opacity: 1; transition: none; }
  }
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- Картинки инструментов (SVG) ---------- */
  function craneSvg() {
    let lat = '';
    for (let y = 500; y > 90; y -= 36) lat += 'M165 ' + y + 'L195 ' + (y - 36) + 'M195 ' + y + 'L165 ' + (y - 36) + 'M165 ' + y + 'H195';
    let jib = '';
    for (let x = 36; x < 330; x += 30) jib += 'M' + x + ' 76L' + (x + 30) + ' 60M' + (x + 30) + ' 76L' + x + ' 60';
    return '<svg viewBox="0 0 360 520" aria-hidden="true"><defs><clipPath id="fxClip"><rect x="-40" y="86" width="80" height="600"/></clipPath></defs>' +
      '<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M165 500V76M195 500V76"/><path stroke-width="2" d="' + lat + '"/>' +
        '<path d="M30 60H350M30 76H350M350 60V76M30 60V76"/><path stroke-width="2" d="' + jib + '"/>' +
        '<path d="M165 60L180 18L195 60"/><path stroke-width="2" d="M180 18L350 60M180 18L30 60"/>' +
        '<path d="M130 516H230"/>' +
      '</g>' +
      '<rect x="22" y="78" width="46" height="36" rx="3"/><rect x="198" y="78" width="32" height="26" rx="3" opacity=".7"/>' +
      '<g transform="translate(250 0)"><g class="fx-trolley"><rect x="-13" y="76" width="26" height="9" rx="2"/>' +
        '<g clip-path="url(#fxClip)"><g class="fx-hoist">' +
          '<path d="M0 -300V190" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
          '<path d="M0 196L-15 208M0 196L15 208" fill="none" stroke="currentColor" stroke-width="2"/>' +
          '<rect x="-20" y="208" width="40" height="17" rx="2" fill="#f26a1b"/>' +
        '</g></g>' +
      '</g></g></svg>';
  }
  const hammerSvg = '<svg viewBox="0 0 200 200" aria-hidden="true"><rect x="91" y="62" width="18" height="134" rx="9"/>' +
    '<path d="M46 30h92a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z"/>' +
    '<path d="M42 34C22 34 8 46 2 68c16-8 28-10 40-8z"/></svg>';
  const wrenchSvg = '<svg viewBox="0 0 220 90" aria-hidden="true"><defs><mask id="fxWm"><rect width="220" height="90" fill="#fff"/><rect x="0" y="34" width="50" height="22" fill="#000"/></mask></defs>' +
    '<circle cx="52" cy="45" r="38" mask="url(#fxWm)"/><rect x="80" y="35" width="130" height="20" rx="10"/><circle cx="200" cy="45" r="14"/></svg>';
  const hatSvg = '<svg viewBox="0 0 200 140" aria-hidden="true"><path d="M24 104a76 76 0 0 1 152 0z"/><rect x="8" y="102" width="184" height="18" rx="9"/>' +
    '<rect x="88" y="26" width="24" height="78" rx="8" fill="#fff" opacity=".5"/></svg>';

  /* ---------- Слой инструментов в шапке ---------- */
  const tools = [];
  function buildHeroLayer() {
    const hero = document.querySelector('.band-hero');
    if (!hero || hero.querySelector('.fx-layer')) return;
    const layer = document.createElement('div');
    layer.className = 'fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      '<div class="fx-tool fx-crane" data-amp="10" data-scroll=".05">' + craneSvg() + '</div>' +
      '<div class="fx-tool fx-gears" data-amp="18" data-scroll=".08"><svg class="g1" viewBox="0 0 200 200"><path fill-rule="evenodd" d="' + bigGear + '"/></svg>' +
        '<svg class="g2" viewBox="0 0 200 200"><g transform="rotate(18 100 100)"><path fill-rule="evenodd" d="' + smallGear + '"/></g></svg></div>' +
      '<div class="fx-tool fx-hammer" data-amp="30" data-scroll=".16">' + hammerSvg + '</div>' +
      '<div class="fx-tool fx-wrench" data-amp="24" data-scroll=".12">' + wrenchSvg + '</div>' +
      '<div class="fx-tool fx-hat" data-amp="34" data-scroll=".2">' + hatSvg + '</div>';
    hero.insertBefore(layer, hero.firstChild);
    layer.querySelectorAll('.fx-tool').forEach(el => tools.push({ el: el, amp: +el.dataset.amp, k: +el.dataset.scroll }));
    // не тратим силы, когда шапка не видна
    new IntersectionObserver(es => es.forEach(e => layer.classList.toggle('fx-paused', !e.isIntersecting)), { threshold: 0 }).observe(hero);
  }

  /* ---------- Движение за мышью и прокруткой ---------- */
  let mx = 0, my = 0, tx = 0, ty = 0, sy = 0, raf = 0;
  function frame() {
    raf = 0;
    mx += (tx - mx) * .08;
    my += (ty - my) * .08;
    const hero = document.querySelector('.band-hero');
    const limit = hero ? hero.offsetHeight : 800;
    const s = Math.min(sy, limit);
    tools.forEach(t => {
      t.el.style.transform = 'translate3d(' + (mx * t.amp).toFixed(1) + 'px,' + (my * t.amp - s * t.k).toFixed(1) + 'px,0)';
    });
    if (Math.abs(tx - mx) > .002 || Math.abs(ty - my) > .002) schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }

  function setupParallax() {
    if (reduce || !tools.length) return;
    if (fine) {
      window.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        tx = (e.clientX / innerWidth - .5) * 2;
        ty = (e.clientY / innerHeight - .5) * 2;
        schedule();
      }, { passive: true });
    }
    window.addEventListener('scroll', () => { sy = window.scrollY; schedule(); }, { passive: true });
    sy = window.scrollY; schedule();
  }

  /* ---------- Рулетка прокрутки ---------- */
  function setupRuler() {
    const bar = document.createElement('div');
    bar.className = 'fx-ruler';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    const fill = bar.firstChild;
    let pending = false;
    function update() {
      pending = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
    }
    const req = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  }

  /* ---------- Заголовок по словам ---------- */
  function splitHeadline() {
    const h1 = document.querySelector('.hero h1');
    if (!h1 || h1.dataset.fx) return;
    h1.dataset.fx = '1';
    const frag = document.createDocumentFragment();
    let i = 0;
    const word = node => {
      const s = document.createElement('span');
      s.className = 'fx-word';
      s.style.setProperty('--i', i++);
      s.appendChild(node);
      frag.appendChild(s);
    };
    [...h1.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else word(document.createTextNode(part));
        });
      } else word(n.cloneNode(true));
    });
    h1.textContent = '';
    h1.appendChild(frag);
    h1.classList.add('fx-split');
  }

  /* ---------- Кирпичная стена внизу ---------- */
  function buildWall() {
    const band = document.querySelector('.band-black');
    if (!band || band.querySelector('.fx-wall')) return;
    const wall = document.createElement('div');
    wall.className = 'fx-wall';
    wall.setAttribute('aria-hidden', 'true');
    const cols = Math.ceil(Math.max(innerWidth, 400) / 64) + 2;
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let r = 0; r < 3; r++) {
      const row = document.createElement('div');
      row.className = 'fx-row';
      for (let c = 0; c < cols; c++) {
        const b = document.createElement('i');
        b.className = 'fx-brick';
        b.style.setProperty('--l', (36 + rnd() * 12).toFixed(0) + '%');
        b.style.setProperty('--r', (rnd() * 24 - 12).toFixed(0) + 'deg');
        b.style.setProperty('--d', ((2 - r) * 160 + c * 18 + rnd() * 60).toFixed(0));
        row.appendChild(b);
      }
      wall.appendChild(row);
    }
    band.insertBefore(wall, band.firstChild);
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { wall.classList.add('built'); o.disconnect(); } }), { threshold: .3 }).observe(wall);
  }

  /* ---------- Чертёж на синем блоке ---------- */
  function buildBlueprint() {
    const band = document.querySelector('.band-steel');
    if (!band || band.querySelector('.fx-blueprint')) return;
    const paths = [
      'M30 40H350V260H30Z', 'M190 40V150', 'M30 150H110M140 150H350', 'M250 150V260',
      'M110 150V120M110 120A30 30 0 0 1 140 150', 'M70 36H130M70 44H130', 'M260 36H320M260 44H320', 'M346 190V232M354 190V232',
      'M30 18H350M30 12V24M350 12V24', 'M10 40V260M4 40H16M4 260H16', 'M50 60H130V120H50Z', 'M215 190H235V230H215Z'
    ];
    const wrap = document.createElement('div');
    wrap.className = 'fx-blueprint';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<svg viewBox="0 0 380 300">' +
      paths.map((d, k) => '<path pathLength="1" style="--k:' + k + '" d="' + d + '"/>').join('') +
      '<circle pathLength="1" style="--k:12" cx="270" cy="100" r="22"/><circle pathLength="1" style="--k:13" cx="290" cy="215" r="14"/>' +
      '<text x="170" y="10">12 000</text><text x="14" y="154" transform="rotate(-90 14 154)">8 000</text></svg>';
    band.insertBefore(wrap, band.firstChild);
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { wrap.classList.add('draw'); o.disconnect(); } }), { threshold: .25 }).observe(band);
  }

  /* ---------- Лёгкий наклон карточек за курсором ---------- */
  function setupTilt() {
    if (reduce || !fine) return;
    document.querySelectorAll('.card, .panel').forEach(el => {
      el.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'transform .12s ease-out, background .25s, color .25s';
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1), background .25s, color .25s';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 520);
      });
    });
  }

  /* ---------- Запуск ---------- */
  function init() {
    document.documentElement.classList.add('fx-ready');
    buildHeroLayer();
    if (!reduce) splitHeadline();
    setupParallax();
    setupRuler();
    buildWall();
    buildBlueprint();
    setupTilt();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
