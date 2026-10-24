/* =====================================================================
   Анимации сайта «Олжа» (подключается на всех страницах)
   - В тёмно-синей шапке: башенный кран с грузом, малярный валик, который красит полосу,
     молоток, гаечный ключ и каска (двигаются сами и чуть следуют за мышью и прокруткой)
   - Строительный УРОВЕНЬ между секциями: когда вы доходите до границы, он «выравнивается»,
     а пузырёк в колбе успокаивается посередине
   - На всех светлых блоках плавают инструменты (кисть, мастерок, рулетка, отвёртка, молоток...),
     они сдвигаются при прокрутке с разной скоростью
   - Иконки в карточках «Время работы / Контакты / Адрес» двигаются (часы, телефон, метка)
   - Карточки появляются волной, звёзды отзывов «вспыхивают», подчёркивание заголовков рисуется
   - Заголовок появляется по словам, выделенное слово «закрашивается маркером»
   - Внизу сайта «строится» кирпичная стена
   - На блоке с вопросами рисуется план дома
   - Карточки слегка наклоняются за курсором
   - Если у человека включено «уменьшить движение» в системе, всё стоит на месте
   Фоновые фото (необязательно): положите в папку images/ файлы
   bg-hero.jpg (главный экран) и bg-dark.jpg (светлые блоки). Если файлов нет, ничего не показывается.
   ===================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Стили ---------- */
  const css = `
  /* фон: необязательные фото */
  .band-hero::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .22; mix-blend-mode: soft-light;
         background: url("images/bg-hero.jpg") center / cover no-repeat; }
  .band-dark::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .08;
         background: url("images/bg-dark.jpg") center / cover no-repeat; }
  .band-hero, .band-dark, .band-black, .band-steel, .band-sand { overflow: hidden; overflow: clip; }
  .band > .wrap { position: relative; z-index: 1; }

  /* УРОВЕНЬ-разделитель между секциями */
  .fx-leveldiv { position: relative; height: 0; z-index: 6; pointer-events: none; }
  .fx-lv { position: absolute; left: 50%; top: 0; width: min(440px, 78vw); height: 44px; margin-left: calc(min(440px, 78vw) / -2); margin-top: -22px;
         border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 0 16px;
         background: linear-gradient(#ffa05a, #ff7a1a 55%, #e8650a);
         box-shadow: 0 14px 30px rgba(11, 36, 71, .25), inset 0 1px 0 rgba(255, 255, 255, .5), inset 0 -2px 0 rgba(0, 0, 0, .12);
         transform: rotate(-3.5deg); transition: transform 1.9s cubic-bezier(.3, 1.7, .5, 1); }
  .fx-leveldiv.in .fx-lv { transform: none; }
  .lv-screw { flex: 0 0 9px; height: 9px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #c9ced6 60%, #8a93a3); box-shadow: 0 0 0 1px rgba(11, 36, 71, .3); }
  .lv-vial { position: relative; flex: 1; max-width: 250px; height: 22px; border-radius: 12px;
         background: linear-gradient(#a9bb5e, #eaf8a4 45%, #b9cc6e); box-shadow: inset 0 2px 4px rgba(0, 0, 0, .38), 0 0 0 2px rgba(255, 255, 255, .35); }
  .lv-vial::before, .lv-vial::after { content: ""; position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(11, 36, 71, .55); }
  .lv-vial::before { left: calc(50% - 22px); }
  .lv-vial::after { left: calc(50% + 20px); }
  .lv-bub { position: absolute; top: 2px; bottom: 2px; width: 38px; margin-left: -19px; left: 6%; border-radius: 50%;
         background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.97), rgba(255,255,255,.62) 55%, rgba(255,255,255,.34));
         box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .6); }
  .fx-leveldiv.in .lv-bub { animation: fxSettle 2.8s cubic-bezier(.3, .8, .4, 1) forwards, fxSway 4.2s ease-in-out 2.8s infinite alternate; }
  @keyframes fxSettle { 0% { left: 6%; } 18% { left: 92%; } 38% { left: 20%; } 56% { left: 76%; } 72% { left: 36%; } 86% { left: 58%; } 100% { left: 50%; } }
  @keyframes fxSway { from { transform: translateX(-4px); } to { transform: translateX(4px); } }

  /* инструменты, которые плавают на светлых блоках */
  .fx-deco { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .fx-d { position: absolute; width: 150px; color: var(--navy, #0b2447); opacity: .07; will-change: transform; }
  .fx-d.o { color: var(--accent, #ff7a1a); opacity: .24; }
  .fx-d svg { display: block; width: 100%; height: auto; fill: currentColor; animation: fxFloat 6.5s ease-in-out infinite alternate; }
  .fx-d.tr svg, .fx-d.bl svg { animation-duration: 7.8s; animation-direction: alternate-reverse; }
  .fx-d.tl { left: 2%; top: 9%; } .fx-d.tr { right: 2%; top: 7%; }
  .fx-d.bl { left: 2%; bottom: 7%; } .fx-d.br { right: 2%; bottom: 8%; }
  @keyframes fxFloat { from { transform: translateY(-9px) rotate(-7deg); } to { transform: translateY(9px) rotate(7deg); } }
  @media (max-width: 899px) { .fx-deco { display: none; } }

  /* анимированные значки в карточках контактов */
  .pn-ico { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 15px; margin-bottom: 14px;
         background: var(--accent-soft, #fff0e3); color: var(--accent-text, #c2410c); }
  .pn-ico svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .pn-hours .mn { transform-box: view-box; transform-origin: 12px 12px; animation: fxSpin 6s linear infinite; }
  .pn-hours .hr { transform-box: view-box; transform-origin: 12px 12px; animation: fxSpin 72s linear infinite; }
  .pn-contacts svg { animation: fxRing 3.4s ease-in-out infinite; transform-origin: 50% 50%; }
  .pn-address svg { animation: fxPin 1.9s cubic-bezier(.3, 0, .3, 1) infinite; }
  @keyframes fxSpin { to { transform: rotate(360deg); } }
  @keyframes fxRing { 0%, 55%, 100% { transform: rotate(0); } 8% { transform: rotate(-16deg); } 16% { transform: rotate(16deg); } 24% { transform: rotate(-12deg); } 32% { transform: rotate(12deg); } 40% { transform: rotate(-6deg); } 48% { transform: rotate(5deg); } }
  @keyframes fxPin { 0%, 100% { transform: translateY(0); } 45% { transform: translateY(-6px); } 70% { transform: translateY(0); } 82% { transform: translateY(-2px); } }

  /* появление волной, звёзды, подчёркивание заголовков, мягкое свечение кнопок */
  @keyframes fxReveal { from { opacity: 0; transform: translateY(36px) scale(.96); } to { opacity: 1; transform: none; } }
  .fx-ready .reveal.in { animation: fxReveal .8s cubic-bezier(.2, .7, .2, 1) var(--rd, 0ms) backwards; }
  .fx-ready .reveal h2::after { transform: scaleX(0); transform-origin: 0 50%; transition: transform .9s .35s cubic-bezier(.2, .7, .2, 1); }
  .fx-ready .reveal.in h2::after { transform: none; }
  .stars i { display: inline-block; font-style: normal; }
  .fx-ready .review:not(.pop) .stars i { opacity: 0; transform: scale(0); }
  .review.pop .stars i { animation: fxStar .6s cubic-bezier(.3, 1.9, .5, 1) backwards; animation-delay: calc(var(--n) * 110ms); }
  @keyframes fxStar { from { opacity: 0; transform: scale(0) rotate(-60deg); } to { opacity: 1; transform: none; } }
  .btn-accent { animation: fxGlow 3.2s ease-in-out infinite; }
  @keyframes fxGlow { 0%, 100% { box-shadow: 0 12px 26px rgba(255, 122, 26, .36); } 50% { box-shadow: 0 14px 40px rgba(255, 122, 26, .62); } }

  /* слой с инструментами в шапке */
  .fx-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .fx-tool { position: absolute; will-change: transform; opacity: 0; animation: fxIn 1.3s ease forwards; animation-delay: var(--dl, .2s); }
  .fx-tool svg { display: block; width: 100%; height: auto; fill: currentColor; }
  .fx-crane  { --o: .13; --dl: .2s; right: 1%; top: 70px; width: 340px; color: #fff; }
  .fx-roller { --o: .6;  --dl: .5s; left: 1%; bottom: 7%; width: 340px; color: #fff; }
  .fx-hammer { --o: .5;  --dl: .8s; right: 37%; top: 16%; width: 112px; color: var(--accent, #ff7a1a); }
  .fx-wrench { --o: .14; --dl: 1.1s; right: 29%; bottom: 8%; width: 170px; color: #fff; }
  .fx-hat    { --o: .5;  --dl: 1.4s; left: 38%; bottom: 5%; width: 108px; color: var(--accent, #ff7a1a); }
  @keyframes fxIn { from { opacity: 0; } to { opacity: var(--o, .15); } }

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

  /* малярный валик красит полосу */
  .fx-r-head { animation: fxRoll 7s linear infinite; }
  .fx-r-stripe { transform-box: fill-box; transform-origin: 0 50%; animation: fxPaint 7s linear infinite; }
  @keyframes fxRoll {
    0% { transform: translateX(0); opacity: 0; } 6% { opacity: 1; }
    72% { transform: translateX(250px); opacity: 1; } 92% { transform: translateX(250px); opacity: 1; }
    100% { transform: translateX(250px); opacity: 0; } }
  @keyframes fxPaint {
    0% { transform: scaleX(.11); opacity: 0; } 6% { opacity: 1; }
    72% { transform: scaleX(1); opacity: 1; } 92% { transform: scaleX(1); opacity: 1; }
    100% { transform: scaleX(1); opacity: 0; } }
  .fx-layer.fx-paused * { animation-play-state: paused !important; }

  /* заголовок по словам */
  .fx-split .fx-word { display: inline-block; opacity: 0; transform: translateY(.55em) rotate(3deg);
         animation: fxRise .85s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: calc(120ms + var(--i) * 90ms); }
  @keyframes fxRise { to { opacity: 1; transform: none; } }
  .fx-split .fx-word mark { background: linear-gradient(var(--accent, #ff7a1a), var(--accent, #ff7a1a)) 0 0 / 0% 100% no-repeat;
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
  .fx-blueprint { position: absolute; right: 4%; bottom: 36px; width: 380px; opacity: .5; pointer-events: none; z-index: 0; color: #3d5a80; }
  .fx-blueprint svg { display: block; width: 100%; height: auto; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .fx-blueprint path, .fx-blueprint circle { stroke-dasharray: 1; stroke-dashoffset: 1; }
  .fx-blueprint text { fill: currentColor; stroke: none; font: 600 11px monospace; opacity: 0; transition: opacity 1s 2s; }
  .fx-blueprint.draw path, .fx-blueprint.draw circle { animation: fxDraw 2.6s cubic-bezier(.4,0,.2,1) forwards; animation-delay: calc(var(--k) * 140ms); }
  .fx-blueprint.draw text { opacity: 1; }
  @keyframes fxDraw { to { stroke-dashoffset: 0; } }

  /* бегущая строка (главная) */
  .fx-marquee-wrap { overflow: hidden; padding: 30px 0; position: relative; z-index: 3; margin: -26px 0 -26px; pointer-events: none; }
  .fx-marquee { transform: rotate(-1.2deg); width: 104%; margin-left: -2%; background: var(--accent, #ff7a1a); color: var(--navy, #0b2447);
         box-shadow: 0 10px 30px rgba(11, 36, 71, .25); overflow: hidden; }
  .fx-track { display: flex; align-items: center; gap: 34px; width: max-content; padding: 14px 0; animation: fxMarquee 38s linear infinite; }
  .fx-track span { font: 700 28px/1 var(--head, sans-serif); text-transform: uppercase; white-space: nowrap; letter-spacing: .02em; }
  .fx-track i { flex: 0 0 14px; height: 14px; background: var(--navy, #0b2447); transform: rotate(45deg); }
  @keyframes fxMarquee { to { transform: translateX(-50%); } }

  @media (max-width: 1100px) { .fx-blueprint { display: none; } }
  @media (max-width: 760px) {
    .fx-crane, .fx-wrench { display: none; }
    .fx-roller { width: 230px; left: 2%; bottom: 3%; }
    .fx-hammer { right: 6%; top: 14%; width: 84px; }
    .fx-hat { left: auto; right: 4%; bottom: 3%; width: 84px; }
    .fx-track span { font-size: 22px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .fx-layer *, .fx-tool, .fx-track { animation: none !important; }
    .fx-tool { opacity: var(--o, .15); }
    .fx-r-stripe, .fx-r-head { opacity: 1; }
    .fx-split .fx-word { opacity: 1; transform: none; animation: none; }
    .fx-split .fx-word mark { background-size: 100% 100%; animation: none; }
    .fx-brick { opacity: 1; animation: none !important; }
    .fx-blueprint path, .fx-blueprint circle { stroke-dashoffset: 0; animation: none !important; }
    .fx-blueprint text { opacity: 1; transition: none; }
    .fx-lv { transform: none; transition: none; }
    .lv-bub { left: 50%; animation: none !important; }
    .fx-d svg, .pn-ico svg, .pn-ico .mn, .pn-ico .hr, .btn-accent { animation: none !important; }
    .fx-ready .review:not(.pop) .stars i { opacity: 1; transform: none; }
    .fx-ready .reveal.in { animation: none; }
    .fx-ready .reveal h2::after { transform: none; transition: none; }
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
          '<rect x="-20" y="208" width="40" height="17" rx="2" fill="#ff7a1a"/>' +
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
  const rollerSvg = '<svg viewBox="0 0 360 130" aria-hidden="true">' +
    '<rect class="fx-r-stripe" x="10" y="20" width="280" height="30" rx="15" fill="#ff7a1a"/>' +
    '<g class="fx-r-head"><rect x="10" y="14" width="62" height="42" rx="12"/>' +
      '<path d="M72 35H96V76H50V96" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="42" y="96" width="16" height="32" rx="8"/></g></svg>';

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
      '<div class="fx-tool fx-roller" data-amp="18" data-scroll=".08">' + rollerSvg + '</div>' +
      '<div class="fx-tool fx-hammer" data-amp="30" data-scroll=".16">' + hammerSvg + '</div>' +
      '<div class="fx-tool fx-wrench" data-amp="24" data-scroll=".12">' + wrenchSvg + '</div>' +
      '<div class="fx-tool fx-hat" data-amp="34" data-scroll=".2">' + hatSvg + '</div>';
    hero.insertBefore(layer, hero.firstChild);
    layer.querySelectorAll('.fx-tool').forEach(el => tools.push({ el: el, amp: +el.dataset.amp, k: +el.dataset.scroll }));
    // не тратим силы, когда шапка не видна
    new IntersectionObserver(es => es.forEach(e => layer.classList.toggle('fx-paused', !e.isIntersecting)), { threshold: 0 }).observe(hero);
  }

  /* ---------- Движение за мышью и прокруткой ---------- */
  const decos = [];
  const narrow = matchMedia('(max-width: 899px)');
  let mx = 0, my = 0, tx = 0, ty = 0, sy = 0, raf = 0;
  function frame() {
    raf = 0;
    mx += (tx - mx) * .08;
    my += (ty - my) * .08;
    if (tools.length) {
      const hero = document.querySelector('.band-hero');
      const limit = hero ? hero.offsetHeight : 800;
      const s = Math.min(sy, limit);
      tools.forEach(t => {
        t.el.style.transform = 'translate3d(' + (mx * t.amp).toFixed(1) + 'px,' + (my * t.amp - s * t.k).toFixed(1) + 'px,0)';
      });
    }
    if (!narrow.matches) {
      decos.forEach(d => {
        const r = d.band.getBoundingClientRect();
        if (r.bottom < -300 || r.top > innerHeight + 300) return;
        const c = r.top + r.height / 2 - innerHeight / 2;
        d.items.forEach(i => { i.el.style.transform = 'translate3d(0,' + (c * i.speed).toFixed(1) + 'px,0)'; });
      });
    }
    if (Math.abs(tx - mx) > .002 || Math.abs(ty - my) > .002) schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }

  function setupParallax() {
    if (reduce) return;
    if (fine && tools.length) {
      window.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        tx = (e.clientX / innerWidth - .5) * 2;
        ty = (e.clientY / innerHeight - .5) * 2;
        schedule();
      }, { passive: true });
    }
    window.addEventListener('scroll', () => { sy = window.scrollY; schedule(); }, { passive: true });
    window.addEventListener('resize', schedule);
    sy = window.scrollY; schedule();
  }

  /* ---------- Инструменты на светлых блоках ---------- */
  const wrenchSvg2 = wrenchSvg.replace(/fxWm/g, 'fxWm2');
  const bucketSvg = '<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M44 74h112l-14 100a8 8 0 0 1-8 7H66a8 8 0 0 1-8-7z"/>' +
    '<path d="M36 74h128" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M58 74c0-52 84-52 84 0" fill="none" stroke="currentColor" stroke-width="7"/></svg>';
  const tapeSvg = '<svg viewBox="0 0 200 200" aria-hidden="true"><path fill-rule="evenodd" d="M62 60h76a22 22 0 0 1 22 22v56a22 22 0 0 1-22 22H62a22 22 0 0 1-22-22V82a22 22 0 0 1 22-22zM100 88a26 26 0 1 0 0 52a26 26 0 1 0 0-52z"/>' +
    '<rect x="150" y="124" width="42" height="12" rx="3"/></svg>';
  const screwdriverSvg = '<svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-35 100 100)"><rect x="14" y="82" width="64" height="36" rx="16"/>' +
    '<rect x="78" y="95" width="92" height="10" rx="4"/><path d="M170 92l22 8-22 8z"/></g></svg>';
  const trowelSvg = '<svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-30 100 100)"><rect x="12" y="88" width="62" height="24" rx="12"/>' +
    '<path d="M74 100h34" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/><path d="M106 62l82 38-82 38c-12-24-12-52 0-76z"/></g></svg>';
  const decoSvg = { hammer: hammerSvg, wrench: wrenchSvg2, hat: hatSvg, bucket: bucketSvg, tape: tapeSvg, screwdriver: screwdriverSvg, trowel: trowelSvg };
  const decoMap = {
    'band-dark':   [['bucket', 'tl', 'o', .12], ['trowel', 'br', '', -.10]],
    'band-sand':   [['tape', 'tr', '', .10], ['screwdriver', 'bl', 'o', -.08]],
    'band-steel':  [['hammer', 'tl', '', .09], ['hat', 'br', 'o', -.10]],
    'band-accent': [['wrench', 'tr', '', .10], ['trowel', 'bl', '', -.09]]
  };
  function buildDecos() {
    document.querySelectorAll('.band').forEach(band => {
      const key = Object.keys(decoMap).find(k => band.classList.contains(k));
      if (!key || band.querySelector('.fx-deco')) return;
      const layer = document.createElement('div');
      layer.className = 'fx-deco';
      layer.setAttribute('aria-hidden', 'true');
      const items = [];
      decoMap[key].forEach(def => {
        const d = document.createElement('div');
        d.className = 'fx-d ' + def[1] + (def[2] ? ' ' + def[2] : '');
        d.innerHTML = decoSvg[def[0]];
        layer.appendChild(d);
        items.push({ el: d, speed: def[3] });
      });
      band.insertBefore(layer, band.firstChild);
      decos.push({ band: band, items: items });
    });
  }

  /* ---------- Уровень между секциями ---------- */
  function setupLevels() {
    const io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
    }), { rootMargin: '0px 0px -22% 0px' });
    document.querySelectorAll('main > .band').forEach(band => {
      if (band.classList.contains('band-hero') || band.classList.contains('band-black')) return;
      const prev = band.previousElementSibling;
      if (!prev || prev.classList.contains('fx-marquee-wrap') || prev.classList.contains('fx-leveldiv')) return;
      const div = document.createElement('div');
      div.className = 'fx-leveldiv';
      div.setAttribute('aria-hidden', 'true');
      div.innerHTML = '<div class="fx-lv"><i class="lv-screw"></i><div class="lv-vial"><i class="lv-bub"></i></div><i class="lv-screw"></i></div>';
      band.parentNode.insertBefore(div, band);
      io.observe(div);
    });
  }

  /* ---------- Значки в карточках контактов ---------- */
  const PANEL_ICONS = {
    hours: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path class="hr" d="M12 12V8"/><path class="mn" d="M12 12h5"/></svg>',
    contacts: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    address: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
  };
  function decoratePanels() {
    Object.keys(PANEL_ICONS).forEach(id => {
      const p = document.getElementById(id);
      if (!p || !p.classList.contains('panel') || p.querySelector('.pn-ico')) return;
      const s = document.createElement('span');
      s.className = 'pn-ico pn-' + id;
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = PANEL_ICONS[id];
      p.insertBefore(s, p.firstChild);
    });
  }

  /* ---------- Звёзды отзывов вспыхивают по очереди ---------- */
  function setupStars() {
    document.querySelectorAll('.review .stars').forEach(s => {
      if (s.dataset.fx) return;
      s.dataset.fx = '1';
      const t = s.textContent.trim();
      s.textContent = '';
      Array.from(t).forEach((ch, i) => {
        const e = document.createElement('i');
        e.textContent = ch;
        e.style.setProperty('--n', i);
        s.appendChild(e);
      });
    });
    const io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('pop'); o.unobserve(e.target); }
    }), { threshold: .5 });
    document.querySelectorAll('.review').forEach(r => io.observe(r));
  }

  /* ---------- Карточки в сетках появляются волной ---------- */
  function staggerGrids() {
    ['.cards', '.products', '.steps', '.faq', '.info', '.reviews'].forEach(sel => {
      document.querySelectorAll(sel).forEach(g => {
        Array.from(g.children).forEach((c, i) => {
          if (c.classList.contains('reveal')) c.style.setProperty('--rd', Math.min(i, 8) * 70 + 'ms');
        });
      });
    });
  }

  /* ---------- Заголовок по словам ---------- */
  function splitHeadline(force) {
    const h1 = document.querySelector('.hero h1');
    if (!h1 || (h1.dataset.fx && !force)) return;
    h1.dataset.fx = '1';
    h1.classList.remove('fx-split');
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

  // нужно переводчику: после смены языка заголовок собирается заново
  window.OLZHA_FX = { splitHeadline: function () { if (!reduce) splitHeadline(true); } };

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

  /* ---------- Чертёж на блоке с вопросами ---------- */
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
    buildDecos();
    setupParallax();
    setupLevels();
    buildWall();
    buildBlueprint();
    decoratePanels();
    setupStars();
    staggerGrids();
    setupTilt();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
