(() => {
  const button = document.querySelector('.clinic-menu-toggle');
  const menu = document.getElementById('clinic-mobile-menu');
  if (!button || !menu) return;
  const setOpen = (open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  };
  button.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', event => {if (event.target.closest('a')) setOpen(false);});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {setOpen(false); button.focus();}
  });
  document.addEventListener('click', event => {if (!event.target.closest('.clinic-header')) setOpen(false);});
  window.matchMedia('(min-width: 1161px)').addEventListener('change', event => {if (event.matches) setOpen(false);});
})();
