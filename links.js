/* =====================================================================
   Ссылки на соцсети и карты + место под иконки у кнопок
   - Адреса берутся из config.js (блок links), на всех страницах обновятся сами
   - Слева у кнопок «Позвонить», WhatsApp, Instagram, TikTok, 2ГИС, Яндекс Карты, Google Карты
     и «Написать отзыв» есть круглое место под вашу иконку.
     Положите картинки в папку images/icons/ под такими именами
     (подойдёт svg, png, webp или jpg):
        phone      иконка телефона (кнопка «Позвонить»)
        instagram  Instagram
        tiktok     TikTok
        2gis       2ГИС
        yandex     Яндекс Карты
        google     Google Карты
     Иконка WhatsApp: встроенная или ваш файл images/whatsapp.svg, выбирается в config.js (whatsappIcon).
     Пока картинок нет, на их месте показывается пустой кружок.
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.OLZHA_CONFIG || {};
  const L = CFG.links || {};
  const useFile = CFG.whatsappIcon === 'file';
  const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><g transform="translate(7.2 7.2) scale(.4)" fill="currentColor" stroke="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></g></svg>';

  /* ---------- Ссылки ---------- */
  document.querySelectorAll('[data-link]').forEach(a => {
    const url = L[a.getAttribute('data-link')];
    if (url) a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  // Отзыв в Яндекс Картах: своя ссылка, а если её нет, ссылка на карточку магазина
  document.querySelectorAll('[data-yandex-review]').forEach(a => {
    const url = CFG.yandexReviewUrl || L.yandex;
    if (url) a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  /* ---------- Иконки ---------- */
  const EXT = ['svg', 'png', 'webp', 'jpg'];
  document.querySelectorAll('[data-icon]').forEach(a => {
    if (a.querySelector('.ico')) return;
    const name = a.getAttribute('data-icon');
    const base = name === 'whatsapp' ? 'images/whatsapp' : 'images/icons/' + name;

    const slot = document.createElement('span');
    slot.className = 'ico';
    slot.setAttribute('aria-hidden', 'true');

    // встроенная иконка WhatsApp (если не выбран ваш файл)
    if (name === 'whatsapp' && !useFile) {
      slot.classList.add('wa-builtin');
      slot.innerHTML = WA_SVG;
      a.insertBefore(slot, a.firstChild);
      a.classList.add('has-ico');
      return;
    }

    const img = new Image();
    img.alt = '';
    let i = 0;
    img.addEventListener('load', () => { if (img.naturalWidth > 0) slot.classList.add('has-img'); });
    img.addEventListener('error', () => {
      i++;
      if (i < EXT.length) img.src = base + '.' + EXT[i];
      else img.remove();
    });
    img.src = base + '.' + EXT[0];

    slot.appendChild(img);
    a.insertBefore(slot, a.firstChild);
    a.classList.add('has-ico');
  });

  /* ---------- Сообщения в WhatsApp на языке клиента (русский текст остаётся для магазина) ---------- */
  function refreshWaLinks() {
    const I = window.OLZHA_I18N;
    if (!I) return;
    document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
      if (a.id === 'cdSend' || a.id === 'rtSend') return;      // эти кнопки собирают текст сами (корзина, заявка)
      let ru = a.getAttribute('data-wa-ru');
      if (ru === null) {
        const href = a.getAttribute('href') || '';
        const m = /[?&]text=([^&]*)/.exec(href);
        ru = m ? decodeURIComponent(m[1]) : '';
        a.setAttribute('data-wa-ru', ru);
        a.setAttribute('data-wa-base', href.split('?')[0]);
      }
      if (!ru) return;
      a.setAttribute('href', a.getAttribute('data-wa-base') + '?text=' + encodeURIComponent(I.message(ru)));
    });
  }
  document.addEventListener('olzha:lang', refreshWaLinks);
})();
