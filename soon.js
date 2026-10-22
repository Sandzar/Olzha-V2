/* =====================================================================
   Разделы ассортимента: у каких есть страница, у каких пока нет
   - Раздел, у которого есть страница (см. config.js → pages), открывается как обычная ссылка
     и в меню и на карточках стоит НАВЕРХУ списка
   - Раздел без страницы не ведёт на другой сайт: открывается окошко
     «Извините, раздел временно не работает» с кнопками готовых разделов
   Все ссылки на разделы на страницах помечены атрибутом data-section="Название"
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.OLZHA_CONFIG || {};
  const PAGES = CFG.pages || {
    'Еврокубы и разные емкости': 'eurocubes.html',
    'Прокат инструментов': 'arenda.html',
    'Металлы': 'metal.html',
    'Сухие смеси': 'sukhie-smesi.html'
  };
  const WA = CFG.whatsapp || '77754479913';
  const isReady = name => Object.prototype.hasOwnProperty.call(PAGES, name);

  /* ---------- 1. Расставляем ссылки: готовые ведут на страницы, остальные открывают окошко ---------- */
  function applyState() {
    document.querySelectorAll('[data-section]').forEach(a => {
      const name = a.dataset.section;
      const ready = isReady(name);
      if (ready) {
        a.setAttribute('href', PAGES[name]);
        a.removeAttribute('data-soon');
        a.classList.remove('is-soon');
      } else {
        a.setAttribute('href', '#');
        a.dataset.soon = name;
        a.classList.add('is-soon');
      }
      if (a.classList.contains('card')) {
        const thumb = a.querySelector('.thumb');
        if (thumb) {
          const old = thumb.querySelector('.tag');
          if (old) old.remove();
          const tag = document.createElement('b');
          tag.className = 'tag ' + (ready ? 'ready' : 'soon');
          tag.textContent = ready ? 'Открыть' : 'Скоро';
          thumb.appendChild(tag);
        }
      }
    });
  }

  /* ---------- 2. Готовые разделы всегда первыми ---------- */
  function reorder() {
    document.querySelectorAll('[data-sections]').forEach(box => {
      const ready = [], later = [], pinned = [];
      [...box.children].forEach(k => {
        const a = k.matches('[data-section]') ? k : k.querySelector('[data-section]');
        if (!a) pinned.push(k);                       // например «Весь ассортимент» остаётся в конце
        else if (isReady(a.dataset.section)) ready.push(k);
        else later.push(k);
      });
      ready.concat(later, pinned).forEach(k => box.appendChild(k));
    });
  }

  /* ---------- 3. Окошко «Извините» ---------- */
  const css = `
  .soon-overlay { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; padding: 16px;
         background: rgba(10,12,14,.6); opacity: 0; visibility: hidden; transition: opacity .25s, visibility .25s; }
  .soon-overlay.open { opacity: 1; visibility: visible; }
  .soon-box { position: relative; width: min(520px, 100%); max-height: 92vh; overflow-y: auto;
         background: var(--paper, #f7f6f2); color: var(--ink, #141414); border-radius: 28px;
         border-top: 10px solid var(--accent, #f26a1b); padding: 30px 28px 26px;
         box-shadow: 0 30px 80px rgba(0,0,0,.45);
         transform: translateY(16px) scale(.98); transition: transform .3s cubic-bezier(.2,.7,.2,1); }
  .soon-overlay.open .soon-box { transform: none; }
  .soon-x { position: absolute; top: 14px; right: 14px; width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer;
         background: rgba(20,20,20,.08); color: inherit; font-size: 26px; line-height: 1; }
  .soon-x:hover { background: var(--accent, #f26a1b); }
  .soon-box h2 { font: 700 34px/1 var(--head, sans-serif); text-transform: uppercase; margin: 0 40px 12px 0; }
  .soon-box p { font: 500 15px/1.6 var(--body, sans-serif); margin-bottom: 8px; }
  .soon-box p.soon-sub { opacity: .75; margin-bottom: 14px; }
  .soon-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
  .soon-btn { display: block; padding: 14px 20px; border-radius: 999px; background: var(--ink, #141414); color: #fff;
         text-decoration: none; font: 700 14px var(--body, sans-serif); transition: background .2s, color .2s, transform .15s; }
  .soon-btn:hover { background: var(--accent, #f26a1b); color: var(--ink, #141414); transform: translateX(4px); }
  .soon-wa { display: block; text-align: center; padding: 14px 20px; border-radius: 999px; text-decoration: none;
         background: var(--accent, #f26a1b); color: var(--ink, #141414); font: 700 14px var(--body, sans-serif); }
  .soon-x:focus-visible, .soon-btn:focus-visible, .soon-wa:focus-visible { outline: 3px solid var(--accent, #f26a1b); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .soon-overlay, .soon-box { transition: none !important; } }
  `;

  let overlay, box, titleName, listEl, waEl, closeBtn, lastFocus = null, lockedScroll = false;

  function build() {
    if (overlay) return;
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    overlay = document.createElement('div');
    overlay.className = 'soon-overlay';
    overlay.innerHTML =
      '<div class="soon-box" role="dialog" aria-modal="true" aria-labelledby="soonTitle">' +
        '<button type="button" class="soon-x" aria-label="Закрыть">×</button>' +
        '<h2 id="soonTitle">Извините!</h2>' +
        '<p>Раздел «<b class="soon-name"></b>» пока временно не работает.</p>' +
        '<p class="soon-sub">Но у нас есть и другие разделы. Посмотрите:</p>' +
        '<div class="soon-list"></div>' +
        '<a class="soon-wa" target="_blank" rel="noopener" href="#"></a>' +
      '</div>';
    document.body.appendChild(overlay);

    box = overlay.querySelector('.soon-box');
    titleName = overlay.querySelector('.soon-name');
    listEl = overlay.querySelector('.soon-list');
    waEl = overlay.querySelector('.soon-wa');
    closeBtn = overlay.querySelector('.soon-x');

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {                                   // не даём фокусу уйти за окошко
        const f = [...box.querySelectorAll('a[href], button')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function open(name) {
    build();
    lastFocus = document.activeElement;
    titleName.textContent = name;
    waEl.textContent = 'Спросить про «' + name + '» в WhatsApp';
    waEl.href = 'https://wa.me/' + WA + '?text=' +
      encodeURIComponent('Здравствуйте! Интересует раздел «' + name + '». Подскажите, пожалуйста, что есть в наличии.');
    listEl.textContent = '';
    Object.keys(PAGES).forEach(n => {
      const a = document.createElement('a');
      a.className = 'soon-btn';
      a.href = PAGES[n];
      a.textContent = n;
      listEl.appendChild(a);
    });
    overlay.classList.add('open');
    if (document.documentElement.style.overflow !== 'hidden') {
      document.documentElement.style.overflow = 'hidden';
      lockedScroll = true;
    }
    setTimeout(() => closeBtn.focus(), 50);
  }

  function close() {
    overlay.classList.remove('open');
    if (lockedScroll) { document.documentElement.style.overflow = ''; lockedScroll = false; }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-soon]');
    if (!a) return;
    e.preventDefault();
    open(a.dataset.soon);
  });

  function init() { applyState(); reorder(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
