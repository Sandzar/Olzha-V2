/* =====================================================================
   Прокат инструментов: заявка (корзина) для страницы arenda.html
   - Для каждого инструмента: сколько штук и на сколько суток
   - Имя, дата начала, самовывоз или доставка, комментарий
   - Заявка хранится в браузере и отправляется в WhatsApp ПРОКАТА
     (номер задаётся в config.js: rentalWhatsapp)
   - Поиск, фильтр по цене и сортировка списка
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.OLZHA_CONFIG || {};
  const NUMBER = CFG.rentalWhatsapp || CFG.whatsapp || '77754479913';
  if (!CFG.rentalWhatsapp && window.console) {
    console.warn('Олжа: в config.js не указан rentalWhatsapp. Заявки проката уходят на основной номер.');
  }
  const REVIEW_URL = CFG.twogisReviewUrl ||
    ('https://2gis.kz/search/' + encodeURIComponent('Олжа Косшы Кобыланды батыра 81'));

  const KEY = 'olzha_rental_v1';
  const MAX_QTY = 99;
  const MAX_DAYS = 365;

  let state = { items: [], form: { name: '', date: '', receive: 'pickup', address: '', note: '' } };

  /* ---------- Вспомогательное ---------- */
  const str = v => (typeof v === 'string' ? v : '');
  function clamp(v, max) {
    v = parseInt(v, 10);
    if (!isFinite(v) || v < 1) return 1;
    return v > max ? max : v;
  }
  function money(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0₸';
  }
  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function niceDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }
  const find = id => state.items.find(i => i.id === id);

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      const items = Array.isArray(d.items) ? d.items : [];
      state.items = items
        .filter(i => i && typeof i.id === 'string' && isFinite(i.price))
        .map(i => ({ id: i.id, name: str(i.name) || i.id, price: +i.price, qty: clamp(i.qty, MAX_QTY), days: clamp(i.days, MAX_DAYS) }));
      const f = d.form || {};
      state.form = {
        name: str(f.name), date: str(f.date),
        receive: f.receive === 'delivery' ? 'delivery' : 'pickup',
        address: str(f.address), note: str(f.note)
      };
      if (state.form.date && state.form.date < todayISO()) state.form.date = '';
    } catch (e) { /* хранилище недоступно: работаем только в памяти */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ничего */ }
  }

  /* ---------- Стили (всё, что рисует скрипт) ---------- */
  const css = `
  [hidden] { display: none !important; }
  .qty { display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px;
         box-shadow: inset 0 0 0 2px var(--qb, rgba(255,255,255,.3)); flex-shrink: 0; }
  .qty button { width: 30px; height: 30px; border-radius: 50%; border: 0; cursor: pointer;
         background: var(--qbg, rgba(255,255,255,.14)); color: inherit; font: 700 18px/1 var(--body, sans-serif); padding: 0; }
  .qty button:hover { background: var(--accent, #f26a1b); color: var(--ink, #141414); }
  .qty input { width: 44px; text-align: center; background: transparent; border: 0; color: inherit; padding: 0;
         font: 700 14px var(--body, sans-serif); -moz-appearance: textfield; appearance: textfield; }
  .qty input::-webkit-outer-spin-button, .qty input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .qty input:focus { outline: none; }
  .qty .q-unit { font: 600 11px var(--body, sans-serif); opacity: .7; margin: 0 8px 0 2px; }

  .rent-add { flex: 1; min-width: 0; cursor: pointer; padding: 11px 10px; border-radius: 999px; background: transparent; color: #fff;
         border: 2px solid rgba(255,255,255,.35); font: 700 13px/1.2 var(--body, sans-serif);
         transition: background .2s, color .2s, border-color .2s; }
  .rent-add:hover { border-color: var(--accent, #f26a1b); color: var(--accent, #f26a1b); }
  .rent-add.in-cart { background: #fff; color: var(--ink, #141414); border-color: #fff; }

  .cart-fab { position: fixed; right: 18px; bottom: 18px; z-index: 80; display: inline-flex; align-items: center; gap: 10px;
         padding: 12px 18px 12px 16px; border-radius: 999px; cursor: pointer;
         background: var(--ink, #141414); color: #fff; border: 2px solid var(--accent, #f26a1b);
         font: 700 14px var(--body, sans-serif); box-shadow: 0 12px 36px rgba(0,0,0,.35); transition: transform .2s; }
  .cart-fab:hover { transform: translateY(-3px); }
  .cart-fab.bump { animation: cartBump .45s; }
  @keyframes cartBump { 30% { transform: scale(1.12); } 100% { transform: scale(1); } }
  .cart-fab svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .cart-badge { min-width: 24px; height: 24px; padding: 0 7px; border-radius: 999px; display: grid; place-items: center;
         background: var(--accent, #f26a1b); color: var(--ink, #141414); font-size: 13px; }

  .cart-toast { position: fixed; left: 50%; bottom: 84px; z-index: 120; transform: translate(-50%, 20px); opacity: 0;
         background: var(--ink, #141414); color: #fff; padding: 12px 20px; border-radius: 999px; font: 600 13px var(--body, sans-serif);
         pointer-events: none; transition: opacity .25s, transform .25s; box-shadow: 0 10px 30px rgba(0,0,0,.3); white-space: nowrap; }
  .cart-toast.show { opacity: 1; transform: translate(-50%, 0); }

  .cart-overlay { position: fixed; inset: 0; z-index: 90; background: rgba(10,12,14,.55); opacity: 0; visibility: hidden;
         transition: opacity .3s, visibility .3s; }
  .cart-overlay.open { opacity: 1; visibility: visible; }
  .cart-drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 100; width: min(460px, 100%);
         display: flex; flex-direction: column; background: var(--paper, #f7f6f2); color: var(--ink, #141414);
         border-radius: 28px 0 0 28px; box-shadow: -20px 0 60px rgba(0,0,0,.3);
         transform: translateX(105%); visibility: hidden; transition: transform .38s cubic-bezier(.2,.7,.2,1), visibility .38s; }
  .cart-drawer.open { transform: none; visibility: visible; }
  .cd-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 8px; }
  .cd-head h2 { font: 700 30px/1 var(--head, sans-serif); text-transform: uppercase; margin: 0; }
  .cd-close { width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer; background: rgba(20,20,20,.08);
         color: inherit; font-size: 24px; line-height: 1; }
  .cd-close:hover { background: var(--accent, #f26a1b); }
  .cd-hint { padding: 0 24px 14px; font-size: 13px; line-height: 1.5; opacity: .7; }
  .cd-scroll { flex: 1; overflow-y: auto; padding: 0 24px 18px; border-top: 1px solid rgba(20,20,20,.12); }
  .cd-empty { padding: 28px 0; font-size: 15px; line-height: 1.6; opacity: .7; }

  .cd-item { padding: 16px 0; border-bottom: 1px solid rgba(20,20,20,.12); }
  .cd-name { font: 700 15px/1.35 var(--body, sans-serif); }
  .cd-name small { display: block; font-weight: 600; font-size: 12px; opacity: .6; margin-top: 2px; }
  .cd-ctl2 { display: flex; flex-wrap: wrap; gap: 12px 18px; margin: 12px 0 10px; }
  .cd-field span { display: block; font: 600 11px var(--body, sans-serif); opacity: .6; margin-bottom: 4px; }
  .cd-item .qty { --qb: rgba(20,20,20,.25); --qbg: rgba(20,20,20,.08); }
  .cd-line { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cd-sum { font: 700 18px var(--head, sans-serif); }
  .cd-rm { background: none; border: 0; cursor: pointer; font: 600 12px var(--body, sans-serif); color: inherit; opacity: .6; text-decoration: underline; }
  .cd-rm:hover { opacity: 1; color: #b3361b; }

  .rt-form { padding-top: 20px; }
  .rt-form h3 { font: 700 22px var(--head, sans-serif); text-transform: uppercase; margin-bottom: 8px; }
  .rt-label { display: block; font: 600 12px var(--body, sans-serif); opacity: .75; margin: 14px 0 6px; }
  .rt-input { width: 100%; padding: 12px 16px; border-radius: 16px; border: 2px solid rgba(20,20,20,.15); background: #fff; color: inherit;
         font: 500 14px/1.4 var(--body, sans-serif); }
  textarea.rt-input { resize: vertical; min-height: 56px; max-height: 140px; }
  .rt-input:focus { outline: none; border-color: var(--accent, #f26a1b); }
  .rt-opts { display: flex; flex-wrap: wrap; gap: 8px; }
  .rt-opt { position: relative; }
  .rt-opt input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
  .rt-opt span { display: block; padding: 11px 16px; border-radius: 999px; background: #fff; box-shadow: inset 0 0 0 2px rgba(20,20,20,.15);
         font: 700 13px var(--body, sans-serif); transition: background .2s, color .2s; }
  .rt-opt input:checked + span { background: var(--ink, #141414); color: #fff; box-shadow: none; }
  .rt-opt input:focus-visible + span { outline: 3px solid var(--accent, #f26a1b); outline-offset: 2px; }
  .rt-hint { font-size: 12px; opacity: .6; margin-top: 6px; line-height: 1.4; }

  .cd-foot { padding: 14px 24px 22px; border-top: 1px solid rgba(20,20,20,.12); background: #fff; border-radius: 0 0 0 28px; }
  .cd-total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; font: 600 13px var(--body, sans-serif); }
  .cd-total b { font: 700 26px var(--head, sans-serif); }
  .cd-total small { flex-basis: 100%; font-size: 11px; opacity: .6; font-weight: 500; }
  .cd-send { display: block; text-align: center; padding: 15px 20px; border-radius: 999px; text-decoration: none;
         background: var(--accent, #f26a1b); color: var(--ink, #141414); font: 700 14px var(--body, sans-serif); transition: transform .15s; }
  .cd-send:hover { transform: translateY(-2px); }
  .cd-send.disabled { opacity: .4; pointer-events: none; }
  .cd-clear { display: block; margin: 12px auto 0; background: none; border: 0; cursor: pointer; font: 600 12px var(--body, sans-serif);
         color: inherit; opacity: .6; text-decoration: underline; }
  .cd-clear:hover { opacity: 1; }

  .cart-fab:focus-visible, .rent-add:focus-visible, .qty button:focus-visible, .qty input:focus-visible,
  .cd-close:focus-visible, .cd-send:focus-visible, .cd-rm:focus-visible, .cd-clear:focus-visible { outline: 3px solid var(--accent, #f26a1b); outline-offset: 2px; }

  @media (max-width: 600px) {
    .cart-drawer { top: auto; width: 100%; max-height: 92vh; border-radius: 28px 28px 0 0; transform: translateY(105%); }
    .cart-drawer.open { transform: none; }
    .cd-foot { border-radius: 0; }
    .cart-fab { right: 12px; bottom: 12px; padding: 11px 15px 11px 13px; }
    .cart-toast { bottom: 76px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cart-drawer, .cart-overlay, .cart-toast, .cart-fab { transition: none !important; animation: none !important; }
  }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- Счётчик (− число +) ---------- */
  function makeStep(unit, value, max, onChange, label) {
    const box = document.createElement('div');
    box.className = 'qty';
    box.innerHTML =
      '<button type="button" class="q-minus" aria-label="Меньше">−</button>' +
      '<input type="number" inputmode="numeric" min="1" max="' + max + '" step="1">' +
      '<span class="q-unit"></span>' +
      '<button type="button" class="q-plus" aria-label="Больше">+</button>';
    const input = box.querySelector('input');
    input.setAttribute('aria-label', label);
    box.querySelector('.q-unit').textContent = unit;
    input.value = value;
    const api = {
      el: box,
      get value() { return clamp(input.value, max); },
      set(v) { input.value = clamp(v, max); }
    };
    box.querySelector('.q-minus').addEventListener('click', () => { input.value = clamp(clamp(input.value, max) - 1, max); onChange(api.value); });
    box.querySelector('.q-plus').addEventListener('click', () => { input.value = clamp(clamp(input.value, max) + 1, max); onChange(api.value); });
    input.addEventListener('input', () => { const v = parseInt(input.value, 10); if (v >= 1) onChange(clamp(v, max)); });
    input.addEventListener('change', () => { input.value = clamp(input.value, max); onChange(api.value); });
    input.addEventListener('focus', () => input.select());
    return api;
  }

  /* ---------- Уведомление ---------- */
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

  /* ---------- Кнопка и окно заявки ---------- */
  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'cart-fab';
  fab.setAttribute('aria-label', 'Открыть заявку на прокат');
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M12 3v3M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z"/></svg>' +
    '<span>Моя заявка</span><span class="cart-badge" hidden>0</span>';
  const badge = fab.querySelector('.cart-badge');

  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'rtTitle');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML =
    '<div class="cd-head"><h2 id="rtTitle">Заявка на прокат</h2><button type="button" class="cd-close" aria-label="Закрыть">×</button></div>' +
    '<p class="cd-hint">Выберите, сколько штук и на сколько суток. Мы проверим, свободен ли инструмент, и подтвердим условия проката.</p>' +
    '<div class="cd-scroll">' +
      '<div id="rtList"></div>' +
      '<div class="rt-form">' +
        '<h3>Ваши данные</h3>' +
        '<label class="rt-label" for="rtName">Ваше имя</label>' +
        '<input class="rt-input" id="rtName" type="text" maxlength="60" autocomplete="name" placeholder="Как к вам обращаться">' +
        '<label class="rt-label" for="rtDate">Когда нужен инструмент</label>' +
        '<input class="rt-input" id="rtDate" type="date">' +
        '<div class="rt-label" id="rtRecvLbl">Как получите</div>' +
        '<div class="rt-opts" role="radiogroup" aria-labelledby="rtRecvLbl">' +
          '<label class="rt-opt"><input type="radio" name="rtRecv" value="pickup"><span>Заберу в магазине</span></label>' +
          '<label class="rt-opt"><input type="radio" name="rtRecv" value="delivery"><span>Нужна доставка</span></label>' +
        '</div>' +
        '<div id="rtAddrBox" hidden>' +
          '<label class="rt-label" for="rtAddr">Адрес доставки</label>' +
          '<input class="rt-input" id="rtAddr" type="text" maxlength="160" autocomplete="street-address" placeholder="Улица, дом">' +
          '<p class="rt-hint">Стоимость и условия доставки уточним в WhatsApp.</p>' +
        '</div>' +
        '<label class="rt-label" for="rtNote">Комментарий (необязательно)</label>' +
        '<textarea class="rt-input" id="rtNote" maxlength="300" placeholder="Например: нужен к 9 утра"></textarea>' +
      '</div>' +
    '</div>' +
    '<div class="cd-foot">' +
      '<div class="cd-total"><span>Ориентировочно:</span><b id="rtTotal">0&nbsp;₸</b><small>Считаем по прайсу сайта. Точную сумму и условия подтвердим в WhatsApp.</small></div>' +
      '<a class="cd-send disabled" id="rtSend" href="#" target="_blank" rel="noopener">Отправить заявку в WhatsApp</a>' +
      '<button type="button" class="cd-clear">Очистить заявку</button>' +
    '</div>';

  const $ = sel => drawer.querySelector(sel);
  const listBox = $('#rtList');
  const totalEl = $('#rtTotal');
  const sendBtn = $('#rtSend');
  const nameIn = $('#rtName'), dateIn = $('#rtDate'), addrIn = $('#rtAddr'), noteIn = $('#rtNote'), addrBox = $('#rtAddrBox');
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => $('.cd-close').focus(), 50);
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
  $('.cd-close').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });

  /* ---------- Расчёт и сообщение ---------- */
  const lineSum = it => it.price * it.qty * it.days;
  const total = () => state.items.reduce((s, it) => s + lineSum(it), 0);

  function buildMessage() {
    const f = state.form;
    const out = ['Здравствуйте! Хочу арендовать инструмент.', ''];
    if (f.name.trim()) out.push('Имя: ' + f.name.trim());
    if (f.date) out.push('Когда нужен: ' + niceDate(f.date));
    if (f.receive === 'delivery') {
      out.push('Получение: нужна доставка' + (f.address.trim() ? ', адрес: ' + f.address.trim() : ''));
    } else {
      out.push('Получение: заберу в магазине');
    }
    out.push('', 'Список:');
    state.items.forEach((it, n) => {
      out.push((n + 1) + '. ' + it.name + ' — ' + it.qty + ' шт, ' + it.days + ' сут.');
    });
    if (f.note.trim()) out.push('', 'Комментарий: ' + f.note.trim());
    out.push('', 'Подскажите, пожалуйста, свободен ли инструмент на эти даты и какие условия проката. Спасибо!');
    return out.join('\n');
  }

  /* ---------- Отрисовка ---------- */
  const rows = [];

  function updateTotals() {
    const n = state.items.length;
    badge.textContent = n;
    badge.hidden = n === 0;
    totalEl.textContent = money(total());
    if (n) {
      sendBtn.classList.remove('disabled');
      sendBtn.href = 'https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(buildMessage());
    } else {
      sendBtn.classList.add('disabled');
      sendBtn.href = '#';
    }
  }

  function syncRows() {
    rows.forEach(r => {
      const it = find(r.id);
      r.btn.classList.toggle('in-cart', !!it);
      r.btn.textContent = it ? '✓ В заявке' : 'Добавить';
      r.btn.setAttribute('aria-pressed', it ? 'true' : 'false');
      if (it) r.days.set(it.days);
    });
  }

  function renderList() {
    listBox.textContent = '';
    if (!state.items.length) {
      const e = document.createElement('p');
      e.className = 'cd-empty';
      e.textContent = 'Заявка пока пустая. Нажмите «Добавить» у нужного инструмента, укажите количество суток, а потом отправьте заявку одним сообщением.';
      listBox.appendChild(e);
    }
    state.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'cd-item';
      const name = document.createElement('div');
      name.className = 'cd-name';
      name.textContent = it.name;
      const price = document.createElement('small');
      price.textContent = money(it.price) + ' / сутки';
      name.appendChild(price);

      const sum = document.createElement('b');
      sum.className = 'cd-sum';
      sum.textContent = money(lineSum(it));
      const refresh = () => { sum.textContent = money(lineSum(it)); save(); updateTotals(); syncRows(); };

      const ctl = document.createElement('div');
      ctl.className = 'cd-ctl2';
      const f1 = document.createElement('div'); f1.className = 'cd-field';
      f1.innerHTML = '<span>Количество</span>';
      f1.appendChild(makeStep('шт', it.qty, MAX_QTY, v => { it.qty = v; refresh(); }, 'Количество штук').el);
      const f2 = document.createElement('div'); f2.className = 'cd-field';
      f2.innerHTML = '<span>На сколько суток</span>';
      f2.appendChild(makeStep('сут.', it.days, MAX_DAYS, v => { it.days = v; refresh(); }, 'Количество суток').el);
      ctl.appendChild(f1); ctl.appendChild(f2);

      const line = document.createElement('div');
      line.className = 'cd-line';
      const rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'cd-rm'; rm.textContent = 'Удалить';
      rm.addEventListener('click', () => removeItem(it.id));
      line.appendChild(sum); line.appendChild(rm);

      row.appendChild(name); row.appendChild(ctl); row.appendChild(line);
      listBox.appendChild(row);
    });
    updateTotals();
  }

  function renderForm() {
    const f = state.form;
    nameIn.value = f.name; dateIn.value = f.date; addrIn.value = f.address; noteIn.value = f.note;
    drawer.querySelectorAll('input[name="rtRecv"]').forEach(r => { r.checked = r.value === f.receive; });
    addrBox.hidden = f.receive !== 'delivery';
  }

  function renderAll() { renderList(); syncRows(); }

  function addItem(r, days) {
    state.items.push({ id: r.id, name: r.name, price: r.price, qty: 1, days: clamp(days, MAX_DAYS) });
    save(); renderAll();
    fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    say('Добавлено в заявку');
  }
  function removeItem(id) {
    state.items = state.items.filter(i => i.id !== id);
    save(); renderAll();
    say('Убрано из заявки');
  }
  $('.cd-clear').addEventListener('click', () => {
    if (!state.items.length) return;
    if (confirm('Очистить всю заявку?')) { state.items = []; save(); renderAll(); }
  });

  // Поля формы
  const bind = (el, key) => el.addEventListener('input', () => { state.form[key] = el.value; save(); updateTotals(); });
  bind(nameIn, 'name'); bind(dateIn, 'date'); bind(addrIn, 'address'); bind(noteIn, 'note');
  drawer.querySelectorAll('input[name="rtRecv"]').forEach(r => r.addEventListener('change', () => {
    state.form.receive = r.value;
    addrBox.hidden = r.value !== 'delivery';
    save(); updateTotals();
  }));

  /* ---------- Список инструментов на странице ---------- */
  function setupRows() {
    document.querySelectorAll('.rent').forEach(el => {
      const ctl = el.querySelector('.rent-ctl');
      if (!ctl) return;
      const r = { el: el, id: el.dataset.name, name: el.dataset.name, price: +el.dataset.price };
      r.days = makeStep('сут.', 1, MAX_DAYS, v => {
        const it = find(r.id);
        if (it) { it.days = v; save(); renderList(); }
      }, 'На сколько суток: ' + r.name);
      r.btn = document.createElement('button');
      r.btn.type = 'button';
      r.btn.className = 'rent-add';
      r.btn.textContent = 'Добавить';
      r.btn.addEventListener('click', () => { find(r.id) ? removeItem(r.id) : addItem(r, r.days.value); });
      ctl.appendChild(r.days.el);
      ctl.appendChild(r.btn);
      rows.push(r);
    });
    // Актуализируем сохранённые позиции по текущему прайсу, убираем исчезнувшие
    const byId = {};
    rows.forEach(r => { byId[r.id] = r; });
    state.items = state.items.filter(i => byId[i.id]).map(i => { i.price = byId[i.id].price; i.name = byId[i.id].name; return i; });
  }

  /* ---------- Поиск, фильтр по цене, сортировка ---------- */
  function setupFilters() {
    const list = document.getElementById('rentList');
    if (!list) return;
    const input = document.getElementById('search');
    const sortSel = document.getElementById('sort');
    const chips = [...document.querySelectorAll('.chip')];
    const empty = document.getElementById('empty');
    const count = document.getElementById('rentCount');
    const all = [...list.children];
    let min = 0, max = Infinity;

    function apply() {
      const q = input.value.trim().toLowerCase();
      const mode = sortSel.value;
      const sorted = all.slice().sort((a, b) => {
        const pa = +a.dataset.price, pb = +b.dataset.price;
        const na = a.dataset.name, nb = b.dataset.name;
        if (mode === 'cheap') return pa - pb || na.localeCompare(nb, 'ru');
        if (mode === 'pricey') return pb - pa || na.localeCompare(nb, 'ru');
        return na.localeCompare(nb, 'ru');
      });
      let shown = 0;
      sorted.forEach(el => {
        const p = +el.dataset.price;
        const ok = p >= min && p <= max && (!q || el.dataset.name.toLowerCase().includes(q));
        el.style.display = ok ? '' : 'none';
        if (ok) shown++;
        list.appendChild(el);
      });
      count.textContent = 'Показано: ' + shown + ' из ' + all.length;
      empty.hidden = shown !== 0;
    }
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(c => c.classList.toggle('active', c === ch));
      min = +(ch.dataset.min || 0);
      max = ch.dataset.max ? +ch.dataset.max : Infinity;
      apply();
    }));
    input.addEventListener('input', apply);
    sortSel.addEventListener('change', apply);
    apply();
  }

  /* ---------- Ссылки WhatsApp проката и отзыв в 2ГИС ---------- */
  function setupLinks() {
    document.querySelectorAll('a[data-wa]').forEach(a => {
      const t = a.dataset.waText;
      a.href = 'https://wa.me/' + NUMBER + (t ? '?text=' + encodeURIComponent(t) : '');
      a.target = '_blank';
      a.rel = 'noopener';
    });
    document.querySelectorAll('[data-2gis-review]').forEach(a => {
      a.href = REVIEW_URL; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* ---------- Запуск ---------- */
  function init() {
    load();
    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(toast);
    dateIn.min = todayISO();
    setupRows();
    setupFilters();
    setupLinks();
    renderForm();
    renderAll();
    window.addEventListener('storage', e => { if (e.key === KEY) { load(); renderForm(); renderAll(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
