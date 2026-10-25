/* =====================================================================
   Переключатель языка: русский / қазақша / English
   - Страницы написаны по-русски (это основной язык и он виден поисковикам)
   - Переводы лежат в файле translations.js
   - Выбранный язык запоминается в браузере
   - Тексты, которые создают другие скрипты (корзина, заявка, окошко «Извините»),
     переводятся автоматически
   - Сообщения, которые уходят в WhatsApp, остаются на русском, чтобы сотрудники магазина
     всегда их понимали
   ===================================================================== */
(function () {
  'use strict';

  const TR = window.OLZHA_TR || { phrases: {}, words: {}, rules: [], html: {} };
  const LANGS = ['ru', 'kk', 'en'];
  const IDX = { kk: 0, en: 1 };
  const KEY = 'olzha_lang';
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  const RU = /[А-Яа-яЁё]/;

  let lang = 'ru';
  try { const s = localStorage.getItem(KEY); if (LANGS.indexOf(s) !== -1) lang = s; } catch (e) { /* ничего */ }

  /* Пока страница переводится, прячем её, чтобы не мигал русский текст */
  let veil = null;
  function unveil() { if (veil) { veil.remove(); veil = null; } }
  if (lang !== 'ru') {
    veil = document.createElement('style');
    veil.textContent = 'html{visibility:hidden}';
    document.head.appendChild(veil);
    setTimeout(unveil, 1500);
  }

  /* ---------- Перевод одной строки ---------- */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordKeys = Object.keys(TR.words || {}).sort((a, b) => b.length - a.length);
  const WORD_RE = wordKeys.length ? new RegExp(wordKeys.map(esc).join('|'), 'g') : null;

  function tr(ru, l) {
    if (l === 'ru' || !ru) return ru;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(ru);
    const lead = m[1], core = m[2], trail = m[3];
    if (!core) return ru;
    const i = IDX[l];
    const hit = TR.phrases[core];
    if (hit && hit[i]) return lead + hit[i] + trail;
    for (let k = 0; k < TR.rules.length; k++) {
      const mm = TR.rules[k][0].exec(core);
      if (mm) return lead + TR.rules[k][1][i].replace(/\{(\d)\}/g, (_, n) => tr(mm[n], l)) + trail;
    }
    if (WORD_RE) {
      let changed = false;
      const out = core.replace(WORD_RE, w => { changed = true; return TR.words[w][i]; });
      if (changed) return lead + out + trail;
    }
    return ru;
  }

  /* ---------- Применение к тексту и атрибутам ---------- */
  const textRec = new WeakMap();   // текстовый узел -> { ru, shown }
  const attrRec = new WeakMap();   // элемент -> { атрибут: { ru, shown } }

  function processText(node) {
    const v = node.nodeValue;
    let rec = textRec.get(node);
    if (!rec) {
      if (!RU.test(v)) return;
      rec = { ru: v, shown: v };
      textRec.set(node, rec);
    } else if (v !== rec.shown) {
      rec.ru = v;                    // текст изменил другой скрипт: это новый оригинал
    }
    const t = tr(rec.ru, lang);
    if (t !== v) node.nodeValue = t;
    rec.shown = t;
  }

  function processAttrs(el) {
    if (!el.getAttribute) return;
    ATTRS.forEach(a => {
      const v = el.getAttribute(a);
      if (v === null) return;
      let map = attrRec.get(el);
      if (!map) { map = {}; attrRec.set(el, map); }
      let rec = map[a];
      if (!rec) {
        if (!RU.test(v)) return;
        rec = map[a] = { ru: v, shown: v };
      } else if (v !== rec.shown) {
        rec.ru = v;
      }
      const t = tr(rec.ru, lang);
      if (t !== v) el.setAttribute(a, t);
      rec.shown = t;
    });
  }

  function skipped(node) {
    const p = node.parentNode;
    if (!p) return true;
    const tag = p.nodeName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return true;
    return !!(p.closest && p.closest('[data-i18n-html],[data-no-i18n]'));
  }

  function applyTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (!skipped(root)) processText(root); return; }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest('[data-i18n-html],[data-no-i18n]') && !root.hasAttribute('data-i18n-html')) return;
    processAttrs(root);
    root.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(processAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => skipped(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let n;
    while ((n = w.nextNode())) processText(n);
  }

  /* Заголовки с выделенным словом (с разметкой) */
  function applyHtml() {
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const d = TR.html && TR.html[el.getAttribute('data-i18n-html')];
      if (!d || !d[lang]) return;
      if (el.getAttribute('data-i18n-now') === lang) return;
      el.innerHTML = d[lang];
      el.setAttribute('data-i18n-now', lang);
      if (window.OLZHA_FX && window.OLZHA_FX.splitHeadline) window.OLZHA_FX.splitHeadline();
    });
  }

  /* ---------- Следим за новым текстом, который создают другие скрипты ---------- */
  let applying = false;
  let mo = null;
  function startObserver() {
    mo = new MutationObserver(records => {
      if (applying || lang === 'ru') return;
      applying = true;
      records.forEach(r => {
        if (r.type === 'childList') r.addedNodes.forEach(applyTree);
        else if (r.type === 'characterData') { if (!skipped(r.target)) processText(r.target); }
        else if (r.type === 'attributes') processAttrs(r.target);
      });
      mo.takeRecords();
      applying = false;
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  /* ---------- Переключение ---------- */
  const titleRu = document.title;

  function updateButtons() {
    document.querySelectorAll('[data-lang]').forEach(b => {
      const on = b.getAttribute('data-lang') === lang;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setLang(l) {
    if (LANGS.indexOf(l) === -1) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ничего */ }
    document.documentElement.lang = l;
    applying = true;
    applyTree(document.body);
    applyHtml();
    document.title = tr(titleRu, l);
    if (mo) mo.takeRecords();
    applying = false;
    updateButtons();
    document.dispatchEvent(new CustomEvent('olzha:lang', { detail: { lang: l } }));
  }

  /* ---------- Стили переключателя ---------- */
  const css = `
  .lang { display: inline-flex; gap: 2px; padding: 3px; border-radius: 999px; background: rgba(22,24,29,.06); }
  .lang button { border: 0; cursor: pointer; background: transparent; color: var(--ink, #16181d); border-radius: 999px;
         padding: 8px 12px; font: 700 12px var(--body, sans-serif); letter-spacing: .02em; transition: background .2s, color .2s; }
  .lang button:hover { background: rgba(22,24,29,.08); }
  .lang button[aria-pressed="true"] { background: var(--accent, #f26a1b); color: var(--ink, #141414); }
  .lang button:focus-visible { outline: 3px solid var(--accent, #f26a1b); outline-offset: 2px; }
  @media (max-width: 520px) { .lang button { padding: 7px 8px; font-size: 11px; } }
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-lang]');
    if (b) setLang(b.getAttribute('data-lang'));
  });

  /* Сообщения в WhatsApp:
       русский   -> только по-русски
       казахский -> только по-казахски
       английский -> русский текст (для магазина) и перевод в скобках (для клиента) + строка «Язык клиента» */
  function pair(ru, sep) {
    if (lang === 'ru') return ru;
    const t = tr(ru, lang);
    if (lang === 'kk') return t || ru;
    return t && t !== ru ? ru + sep + '(' + t + ')' : ru;
  }
  // подпись поля: казахский «Түсініктеме:», английский «Комментарий / Comment:»
  function label(ru) {
    if (lang === 'ru') return ru;
    const t = tr(ru, lang);
    if (!t || t === ru) return ru;
    if (lang === 'kk') return t;
    return ru.replace(/:\s*$/, '') + ' / ' + t;
  }
  const clientLangRu = () => (lang === 'en' ? 'английский' : '');
  function message(ru) {
    const cl = clientLangRu();
    return pair(ru, '\n') + (cl ? '\n\nЯзык клиента: ' + cl : '');
  }

  window.OLZHA_I18N = {
    t: ru => tr(ru, lang), lang: () => lang, set: setLang,
    label: label,                     // «Комментарий / Comment:» (en) или «Түсініктеме:» (kk)
    line: ru => pair(ru, ' '),        // название в одну строку
    block: ru => pair(ru, '\n'),      // предложение (en: русский + перевод в скобках)
    message: message,                 // готовое сообщение (+ «Язык клиента: английский» только для en)
    clientLangRu: clientLangRu
  };

  function init() {
    document.documentElement.lang = lang;
    startObserver();
    if (lang !== 'ru') {
      applying = true;
      applyTree(document.body);
      applyHtml();
      document.title = tr(titleRu, lang);
      mo.takeRecords();
      applying = false;
    }
    updateButtons();
    unveil();
    document.dispatchEvent(new CustomEvent('olzha:lang', { detail: { lang: lang } }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
