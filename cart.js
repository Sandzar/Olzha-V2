/* =====================================================================
   Корзина магазина «Олжа»
   - Одна корзина на все страницы сайта, хранится в браузере (localStorage)
   - Количество: штуки, метры или килограммы (задаётся на карточке: data-unit)
   - «Отправить» открывает WhatsApp с готовым списком
   - Кнопки «Написать отзыв» ведут в 2ГИС (ссылка настраивается ниже)
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------- НАСТРОЙКИ ---------------------------- */
  // Номер WhatsApp и ссылка на отзывы в 2ГИС берутся из файла config.js
  const CFG = window.OLZHA_CONFIG || {};
  const WHATSAPP = CFG.whatsapp || '77754479913';
  const TWOGIS_REVIEW_URL = CFG.twogisReviewUrl || '';
  const TWOGIS_SEARCH = 'https://2gis.kz/search/' + encodeURIComponent('Олжа Косшы Кобыланды батыра 81');

  const STORAGE_KEY = 'olzha_cart_v1';
  const MAX_QTY = 9999;
  /* ------------------------------------------------------------------- */

  const page = (location.pathname.split('/').pop() || 'index.html');

  /* ---------- Хранилище (с запасным вариантом, если localStorage закрыт) ---------- */
  let state = { items: [], note: '' };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const items = Array.isArray(data.items) ? data.items : [];
      state = {
        items: items
          .filter(i => i && typeof i.id === 'string' && typeof i.name === 'string' && isFinite(i.qty))
          .map(i => ({ id: i.id, name: i.name, unit: String(i.unit || 'шт'), qty: clamp(i.qty),
                       price: (i.price === null || i.price === undefined || !isFinite(i.price)) ? null : +i.price })),
        note: typeof data.note === 'string' ? data.note : ''
      };
    } catch (e) { /* хранилище недоступно: работаем только в памяти */ }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ничего */ }
  }

  function clamp(v) {
    v = parseInt(v, 10);
    if (!isFinite(v) || v < 1) return 1;
    return v > MAX_QTY ? MAX_QTY : v;
  }
  const find = id => state.items.find(i => i.id === id);
  const money = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0₸';

  /* ---------- Стили ---------- */
  const css = `
  .qty { display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px;
         box-shadow: inset 0 0 0 2px var(--qb, rgba(22,24,29,.2)); flex-shrink: 0; }
  .qty button { width: 30px; height: 30px; border-radius: 50%; border: 0; cursor: pointer;
         background: var(--qbg, rgba(22,24,29,.07)); color: inherit; font: 700 18px/1 var(--body, sans-serif); padding: 0; }
  .qty button:hover { background: var(--accent, #f26a1b); color: var(--ink, #141414); }
  .qty input { width: 46px; text-align: center; background: transparent; border: 0; color: inherit; padding: 0;
         font: 700 14px var(--body, sans-serif); -moz-appearance: textfield; appearance: textfield; }
  .qty input::-webkit-outer-spin-button, .qty input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .qty input:focus { outline: none; }
  .qty .q-unit { font: 600 11px var(--body, sans-serif); opacity: .7; margin: 0 8px 0 2px; }

  .cart-row { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 8px; }
  .cart-row + .wa-btn { margin-top: 8px !important; }
  .cart-add { flex: 1; min-width: 0; cursor: pointer; padding: 11px 10px; border-radius: 999px; background: transparent; color: var(--ink, #16181d);
         border: 2px solid rgba(22,24,29,.22); font: 700 12px/1.2 var(--body, sans-serif);
         transition: background .2s, color .2s, border-color .2s; }
  .cart-add:hover { border-color: var(--accent, #f26a1b); color: var(--accent-text, #cf4f06); }
  .cart-add.in-cart { background: var(--ink, #16181d); color: #fff; border-color: var(--ink, #16181d); }

  .cart-fab { position: fixed; right: 18px; bottom: 18px; z-index: 80; display: none; align-items: center; gap: 10px;
         padding: 12px 18px 12px 16px; border-radius: 999px; cursor: pointer;
         background: var(--ink, #141414); color: #fff; border: 2px solid var(--accent, #f26a1b);
         font: 700 14px var(--body, sans-serif); box-shadow: 0 12px 36px rgba(0,0,0,.35);
         transition: transform .2s; }
  .cart-fab.visible { display: inline-flex; }
  .cart-fab:hover { transform: translateY(-3px); }
  .cart-fab.bump { animation: cartBump .45s; }
  @keyframes cartBump { 30% { transform: scale(1.12); } 100% { transform: scale(1); } }
  .cart-fab svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .cart-badge { min-width: 24px; height: 24px; padding: 0 7px; border-radius: 999px; display: grid; place-items: center;
         background: var(--accent, #f26a1b); color: var(--ink, #141414); font-size: 13px; }
  .cart-badge[hidden] { display: none; }

  .cart-toast { position: fixed; left: 50%; bottom: 84px; z-index: 120; transform: translate(-50%, 20px); opacity: 0;
         background: var(--ink, #141414); color: #fff; padding: 12px 20px; border-radius: 999px; font: 600 13px var(--body, sans-serif);
         pointer-events: none; transition: opacity .25s, transform .25s; box-shadow: 0 10px 30px rgba(0,0,0,.3); white-space: nowrap; }
  .cart-toast.show { opacity: 1; transform: translate(-50%, 0); }

  .cart-overlay { position: fixed; inset: 0; z-index: 90; background: rgba(10,12,14,.55); opacity: 0; visibility: hidden;
         transition: opacity .3s, visibility .3s; }
  .cart-overlay.open { opacity: 1; visibility: visible; }
  .cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 100; width: min(440px, 100%);
         display: flex; flex-direction: column; background: var(--paper, #f7f6f2); color: var(--ink, #141414);
         border-radius: 28px 0 0 28px; box-shadow: -20px 0 60px rgba(0,0,0,.3);
         transform: translateX(105%); visibility: hidden; transition: transform .38s cubic-bezier(.2,.7,.2,1), visibility .38s; }
  .cart-drawer.open { transform: none; visibility: visible; }
  .cd-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 8px; }
  .cd-head h2 { font: 700 32px/1 var(--head, sans-serif); text-transform: uppercase; margin: 0; }
  .cd-close { width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer; background: rgba(20,20,20,.08);
         color: inherit; font-size: 24px; line-height: 1; }
  .cd-close:hover { background: var(--accent, #f26a1b); }
  .cd-hint { padding: 0 24px 14px; font-size: 13px; line-height: 1.5; opacity: .7; }
  .cd-list { flex: 1; overflow-y: auto; padding: 0 24px; border-top: 1px solid rgba(20,20,20,.12); }
  .cd-item { padding: 16px 0; border-bottom: 1px solid rgba(20,20,20,.12); }
  .cd-name { font: 600 15px/1.35 var(--body, sans-serif); margin-bottom: 10px; }
  .cd-ctl { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cd-item .qty { --qb: rgba(20,20,20,.25); --qbg: rgba(20,20,20,.08); }
  .cd-rm { background: none; border: 0; cursor: pointer; font: 600 12px var(--body, sans-serif); color: inherit; opacity: .6; text-decoration: underline; }
  .cd-rm:hover { opacity: 1; color: #b3361b; }
  .cd-empty { padding: 36px 24px; font-size: 15px; line-height: 1.6; opacity: .7; }
  .cd-foot { padding: 16px 24px 22px; border-top: 1px solid rgba(20,20,20,.12); background: #fff; border-radius: 0 0 0 28px; }
  .cd-foot label { display: block; font: 600 12px var(--body, sans-serif); opacity: .7; margin-bottom: 6px; }
  .cd-foot textarea { width: 100%; resize: vertical; min-height: 54px; max-height: 140px; padding: 10px 14px; border-radius: 16px;
         border: 2px solid rgba(20,20,20,.15); background: var(--paper, #f7f6f2); color: inherit; font: 500 13px/1.4 var(--body, sans-serif); }
  .cd-foot textarea:focus { outline: none; border-color: var(--accent, #f26a1b); }
  .cd-total { margin: 12px 0; font: 600 13px var(--body, sans-serif); }
  .cd-priceline { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin: 0 0 10px; font: 600 13px var(--body, sans-serif); }
  .cd-up small { opacity: .65; font-weight: 600; }
  .cd-sum { font: 700 18px var(--head, sans-serif); }
  .cd-est { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; margin: 12px 0 2px; font: 600 13px var(--body, sans-serif); }
  .cd-est b { font: 700 26px var(--head, sans-serif); }
  .cd-est small, .cd-noprice { flex-basis: 100%; font-size: 11px; opacity: .65; font-weight: 500; line-height: 1.4; }
  .cd-noprice { margin-bottom: 6px; }
  .cd-send { display: block; text-align: center; padding: 15px 20px; border-radius: 999px; text-decoration: none;
         background: var(--accent, #f26a1b); color: var(--ink, #141414); font: 700 14px var(--body, sans-serif); transition: transform .15s; }
  .cd-send:hover { transform: translateY(-2px); }
  .cd-send.disabled { opacity: .4; pointer-events: none; }
  .cd-clear { display: block; margin: 12px auto 0; background: none; border: 0; cursor: pointer; font: 600 12px var(--body, sans-serif);
         color: inherit; opacity: .6; text-decoration: underline; }
  .cd-clear:hover { opacity: 1; }

  .cart-fab:focus-visible, .cart-add:focus-visible, .qty button:focus-visible, .qty input:focus-visible,
  .cd-close:focus-visible, .cd-send:focus-visible, .cd-rm:focus-visible, .cd-clear:focus-visible { outline: 3px solid var(--accent, #f26a1b); outline-offset: 2px; }

  @media (max-width: 600px) {
    .cart-drawer { top: auto; width: 100%; max-height: 92vh; border-radius: 28px 28px 0 0; transform: translateY(105%); }
    .cart-drawer.open { transform: none; }
    .cd-foot { border-radius: 0; }
    .cart-fab { right: 12px; bottom: 12px; padding: 11px 15px 11px 13px; }
    .cart-toast { bottom: 76px; }
  }
  @media (max-width: 520px) {
    .cart-row { flex-direction: column; align-items: stretch; gap: 6px; }
    .cart-row .qty { justify-content: space-between; }
    .cart-row .qty input { flex: 1; }
    .cart-add { font-size: 12px; padding: 10px 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cart-drawer, .cart-overlay, .cart-toast, .cart-fab { transition: none !important; animation: none !important; }
  }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- Счётчик количества (используется на карточке и в корзине) ---------- */
  function makeQty(unit, value, onChange) {
    const box = document.createElement('div');
    box.className = 'qty';
    box.innerHTML =
      '<button type="button" class="q-minus" aria-label="Меньше">−</button>' +
      '<input class="q-input" type="number" inputmode="numeric" min="1" max="' + MAX_QTY + '" step="1" aria-label="Количество">' +
      '<span class="q-unit"></span>' +
      '<button type="button" class="q-plus" aria-label="Больше">+</button>';
    const input = box.querySelector('input');
    box.querySelector('.q-unit').textContent = unit;
    input.value = value;
    const api = {
      el: box,
      get value() { return clamp(input.value); },
      set(v) { input.value = clamp(v); }
    };
    box.querySelector('.q-minus').addEventListener('click', () => { input.value = clamp(clamp(input.value) - 1); onChange(api.value); });
    box.querySelector('.q-plus').addEventListener('click', () => { input.value = clamp(clamp(input.value) + 1); onChange(api.value); });
    input.addEventListener('input', () => { const v = parseInt(input.value, 10); if (v >= 1) onChange(clamp(v)); });
    input.addEventListener('change', () => { input.value = clamp(input.value); onChange(api.value); });
    input.addEventListener('focus', () => input.select());
    return api;
  }

  /* ---------- Подсказка-уведомление ---------- */
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  let toastTimer;
  function say(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  /* ---------- Кнопка корзины и окно корзины ---------- */
  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'cart-fab';
  fab.setAttribute('aria-label', 'Открыть корзину');
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6"/></svg>' +
    '<span>Корзина</span><span class="cart-badge" hidden>0</span>';
  const badge = fab.querySelector('.cart-badge');

  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'cartTitle');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML =
    '<div class="cd-head"><h2 id="cartTitle">Корзина</h2><button type="button" class="cd-close" aria-label="Закрыть корзину">×</button></div>' +
    '<p class="cd-hint">Выберите количество и отправьте список в WhatsApp. Мы ответим, что есть в наличии, и назовём цену.</p>' +
    '<div class="cd-list" id="cdList"></div>' +
    '<div class="cd-foot">' +
      '<label for="cdNote">Комментарий или адрес доставки (необязательно)</label>' +
      '<textarea id="cdNote" maxlength="300" placeholder="Например: нужна доставка, улица и дом"></textarea>' +
      '<div class="cd-est" id="cdEstBox" hidden><span>Ориентировочно:</span><b id="cdEst">0&nbsp;₸</b><small>Считаем по прайсу сайта. Точную сумму и условия подтвердим в WhatsApp.</small></div>' +
      '<p class="cd-noprice" id="cdNoPrice" hidden>Позиции без цены в сумму не входят: цену по ним подтвердим в WhatsApp.</p>' +
      '<div class="cd-total">Позиций в корзине: <b id="cdCount">0</b></div>' +
      '<a class="cd-send disabled" id="cdSend" href="#" target="_blank" rel="noopener">Отправить корзину в WhatsApp</a>' +
      '<button type="button" class="cd-clear">Очистить корзину</button>' +
    '</div>';

  const list = drawer.querySelector('#cdList');
  const note = drawer.querySelector('#cdNote');
  const countEl = drawer.querySelector('#cdCount');
  const estBox = drawer.querySelector('#cdEstBox');
  const estEl = drawer.querySelector('#cdEst');
  const noPriceEl = drawer.querySelector('#cdNoPrice');
  const sendBtn = drawer.querySelector('#cdSend');
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => drawer.querySelector('.cd-close').focus(), 50);
  }
  function closeCart() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  fab.addEventListener('click', openCart);
  overlay.addEventListener('click', closeCart);
  drawer.querySelector('.cd-close').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });

  /* ---------- Текст сообщения для WhatsApp ---------- */
  function buildMessage() {
    const I = window.OLZHA_I18N;
    const line = s => (I ? I.line(s) : s);
    const block = s => (I ? I.block(s) : s);
    const label = s => (I ? I.label(s) : s);
    const lines = state.items.map((it, n) => (n + 1) + '. ' + line(it.name) + ' — ' + it.qty + ' ' + line(it.unit));
    let text = block('Здравствуйте! Хочу уточнить наличие и цену на товары из корзины:') + '\n\n' + lines.join('\n') + '\n';
    const n = state.note.trim();
    if (n) text += '\n' + label('Комментарий:') + ' ' + n + '\n';
    text += '\n' + block('Подскажите, пожалуйста, что есть в наличии, итоговую цену и условия доставки. Спасибо!');
    const cl = I ? I.clientLangRu() : '';
    if (cl) text += '\n\nЯзык клиента: ' + cl;
    return text;
  }

  /* ---------- Отрисовка корзины ---------- */
  const cards = [];   // карточки товаров на странице

  function renderDrawer() {
    list.textContent = '';
    if (!state.items.length) {
      const e = document.createElement('p');
      e.className = 'cd-empty';
      e.textContent = 'В корзине пока пусто. Нажмите «В корзину» на нужном товаре, выберите количество, а потом отправьте весь список одним сообщением.';
      list.appendChild(e);
    }
    state.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'cd-item';
      const name = document.createElement('div');
      name.className = 'cd-name';
      name.textContent = it.name;
      const ctl = document.createElement('div');
      ctl.className = 'cd-ctl';
      const priceLine = document.createElement('div');
      priceLine.className = 'cd-priceline';
      const up = document.createElement('span');
      up.className = 'cd-up';
      const sum = document.createElement('b');
      sum.className = 'cd-sum';
      if (it.price !== null && it.price !== undefined) {
        up.appendChild(document.createTextNode(money(it.price) + ' '));
        const u = document.createElement('small');
        u.textContent = '/ ' + it.unit;
        up.appendChild(u);
        sum.textContent = money(it.price * it.qty);
      } else {
        const u = document.createElement('small');
        u.textContent = 'Цена по запросу';
        up.appendChild(u);
      }
      priceLine.appendChild(up);
      priceLine.appendChild(sum);
      const q = makeQty(it.unit, it.qty, v => {
        it.qty = v; save();
        if (it.price !== null && it.price !== undefined) sum.textContent = money(it.price * it.qty);
        syncCards(); updateSend();
      });
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'cd-rm';
      rm.textContent = 'Удалить';
      rm.addEventListener('click', () => removeItem(it.id));
      ctl.appendChild(q.el);
      ctl.appendChild(rm);
      row.appendChild(name);
      row.appendChild(priceLine);
      row.appendChild(ctl);
      list.appendChild(row);
    });
    note.value = state.note;
    updateSend();
  }

  function updateSend() {
    const n = state.items.length;
    countEl.textContent = n;
    badge.textContent = n;
    badge.hidden = n === 0;
    let est = 0, priced = 0;
    state.items.forEach(it => { if (it.price !== null && it.price !== undefined) { est += it.price * it.qty; priced++; } });
    estBox.hidden = priced === 0;
    estEl.textContent = money(est);
    noPriceEl.hidden = !(n > 0 && priced < n);
    const showFab = n > 0 || cards.length > 0;
    fab.classList.toggle('visible', showFab);
    if (n) {
      sendBtn.classList.remove('disabled');
      sendBtn.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(buildMessage());
    } else {
      sendBtn.classList.add('disabled');
      sendBtn.href = '#';
    }
  }

  function syncCards() {
    cards.forEach(c => {
      const it = find(c.info.id);
      c.btn.classList.toggle('in-cart', !!it);
      c.btn.textContent = it ? '✓ В корзине' : 'В корзину';
      c.btn.setAttribute('aria-pressed', it ? 'true' : 'false');
      if (it) c.qty.set(it.qty);
    });
  }

  function renderAll() { renderDrawer(); syncCards(); }

  /* ---------- Действия ---------- */
  function addItem(info, qty) {
    state.items.push({ id: info.id, name: info.name, unit: info.unit, qty: clamp(qty), price: info.price });
    save(); renderAll();
    fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    say('Добавлено в корзину');
  }
  function removeItem(id) {
    state.items = state.items.filter(i => i.id !== id);
    save(); renderAll();
    say('Убрано из корзины');
  }
  drawer.querySelector('.cd-clear').addEventListener('click', () => {
    if (!state.items.length) return;
    if (confirm(window.OLZHA_I18N ? window.OLZHA_I18N.t('Очистить всю корзину?') : 'Очистить всю корзину?')) { state.items = []; save(); renderAll(); }
  });
  note.addEventListener('input', () => { state.note = note.value; save(); updateSend(); });

  /* ---------- Подключаем карточки товаров ---------- */
  function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  function productInfo(el) {
    const h3 = el.querySelector('h3');
    let name = (el.dataset.title || (h3 ? h3.textContent : '')).trim();
    if (!el.dataset.title) {
      const spec = el.querySelector('.spec');
      const t = spec ? spec.textContent.replace(/\u00a0/g, ' ').trim() : '';
      if (t && !/^цена/i.test(t)) name += ', ' + lowerFirst(t);
    }
    let price = null;
    const pe = el.querySelector('.price');
    if (pe) {
      const small = pe.querySelector('small');
      const digits = pe.textContent.replace(/\D/g, '');
      if (digits && !(small && /т\.л\./.test(small.textContent))) price = parseInt(digits, 10);
    }
    return { id: page + '|' + name, name: name, unit: el.dataset.unit || 'шт', price: price };
  }

  function setupCards() {
    document.querySelectorAll('.product').forEach(el => {
      const body = el.querySelector('.p-body');
      if (!body || el.querySelector('.cart-row')) return;
      const info = productInfo(el);
      const row = document.createElement('div');
      row.className = 'cart-row';
      const card = { info: info };
      card.qty = makeQty(info.unit, 1, v => {
        const it = find(info.id);
        if (it) { it.qty = v; save(); renderDrawer(); }
      });
      card.btn = document.createElement('button');
      card.btn.type = 'button';
      card.btn.className = 'cart-add';
      card.btn.textContent = 'В корзину';
      card.btn.addEventListener('click', () => {
        if (find(info.id)) removeItem(info.id); else addItem(info, card.qty.value);
      });
      row.appendChild(card.qty.el);
      row.appendChild(card.btn);
      const wa = body.querySelector('.wa-btn');
      body.insertBefore(row, wa || null);
      cards.push(card);
      const saved = find(info.id);
      if (saved && saved.price !== info.price) { saved.price = info.price; save(); }
    });
  }

  /* ---------- Ссылки «Написать отзыв» → 2ГИС ---------- */
  function setupReviewLinks() {
    document.querySelectorAll('[data-2gis-review]').forEach(a => {
      a.href = TWOGIS_REVIEW_URL || TWOGIS_SEARCH;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- Запуск ---------- */
  function init() {
    load();
    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(toast);
    setupCards();
    setupReviewLinks();
    renderAll();
    // Если корзину изменили в другой вкладке, обновляем здесь
    window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) { load(); renderAll(); } });
    document.addEventListener('olzha:lang', updateSend);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
