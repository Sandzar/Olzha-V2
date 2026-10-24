/* =====================================================================
   Закреплённая кнопка WhatsApp (слева внизу на всех страницах)
   Иконка: либо встроенная (по умолчанию), либо ваш файл images/whatsapp.svg (или .png).
   Что использовать, задаётся в config.js: whatsappIcon: 'builtin' или 'file'.
   Номер берётся из config.js. На странице проката (arenda.html) используется
   номер проката (rentalWhatsapp), если он указан.
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.OLZHA_CONFIG || {};
  const rental = document.body.getAttribute('data-wa') === 'rental';
  const number = (rental && CFG.rentalWhatsapp) || CFG.whatsapp || '77754479913';
  const useFile = CFG.whatsappIcon === 'file';
  const greeting = rental
    ? 'Здравствуйте! Пишу с сайта, хочу узнать про прокат инструментов.'
    : 'Здравствуйте! Пишу с сайта.';

  const css = `
  .wa-fab { position: fixed; left: 18px; bottom: 18px; z-index: 80; display: inline-flex; align-items: center; justify-content: center;
         min-width: 60px; height: 60px; padding: 0 22px; border-radius: 999px; text-decoration: none;
         background: #25d366; color: #fff; font: 700 14px var(--body, sans-serif);
         box-shadow: 0 12px 30px rgba(0,0,0,.3); transition: transform .2s; }
  .wa-fab:hover { transform: translateY(-3px) scale(1.04); }
  .wa-fab::before { content: ""; position: absolute; inset: 0; border-radius: inherit; border: 3px solid #25d366;
         animation: waPulse 2.6s ease-out infinite; pointer-events: none; }
  @keyframes waPulse { 0% { transform: scale(1); opacity: .75; } 70%, 100% { transform: scale(1.45); opacity: 0; } }
  .wa-fab img { display: none; width: 34px; height: 34px; }
  .wa-fab svg { display: block; width: 36px; height: 36px; color: #fff; }
  .wa-fab.has-icon { width: 60px; padding: 0; }
  .wa-fab.has-icon img { display: block; }
  .wa-fab.has-icon .wa-fab-text { display: none; }
  .wa-fab:focus-visible { outline: 3px solid var(--ink, #141414); outline-offset: 3px; }
  @media (max-width: 600px) { .wa-fab { left: 12px; bottom: 12px; min-width: 56px; height: 56px; } .wa-fab.has-icon { width: 56px; } }
  @media (prefers-reduced-motion: reduce) { .wa-fab::before { animation: none; opacity: 0; } .wa-fab { transition: none; } }
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const a = document.createElement('a');
  a.className = 'wa-fab';
  a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(greeting);
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Написать в WhatsApp');

  if (useFile) {
    // ваш файл: images/whatsapp.svg, а если его нет, images/whatsapp.png
    const txt = document.createElement('span');
    txt.className = 'wa-fab-text';
    txt.textContent = 'WhatsApp';
    const img = document.createElement('img');
    img.alt = '';
    img.width = 34;
    img.height = 34;
    img.addEventListener('load', () => { a.classList.add('has-icon'); });
    img.addEventListener('error', () => {
      if (/\.svg$/.test(img.getAttribute('src'))) img.src = 'images/whatsapp.png';
      else img.remove();
    });
    img.src = 'images/whatsapp.svg';
    a.appendChild(img);
    a.appendChild(txt);
  } else {
    a.classList.add('has-icon');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><g transform="translate(7.2 7.2) scale(.4)" fill="currentColor" stroke="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></g></svg>';
  }
  document.body.appendChild(a);
})();
