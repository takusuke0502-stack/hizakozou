// Enhance only this page's six-step mobile flow; desktop keeps the TOP grid.
(() => {
  const flow = document.querySelector('#stenosis-visit-flow');
  const controls = document.querySelector('.stenosis-flow-controls');
  if (!flow || !controls) return;

  const cards = Array.from(flow.children);
  const previous = controls.querySelector('[data-flow-prev]');
  const next = controls.querySelector('[data-flow-next]');
  const progress = controls.querySelector('[data-flow-current]');
  const mobile = window.matchMedia('(max-width: 600px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let frame = 0;

  const cardPosition = (card) => {
    const padding = parseFloat(getComputedStyle(flow).paddingLeft) || 0;
    return card.getBoundingClientRect().left - flow.getBoundingClientRect().left - padding;
  };

  const updateProgress = () => {
    frame = 0;
    if (!mobile.matches) return;
    current = cards.reduce((nearest, card, index) =>
      Math.abs(cardPosition(card)) < Math.abs(cardPosition(cards[nearest])) ? index : nearest, 0);
    const label = String(current + 1);
    if (progress.textContent !== label) progress.textContent = label;
    previous.disabled = current === 0;
    next.disabled = current === cards.length - 1;
  };

  const queueProgress = () => {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  };

  const moveTo = (index) => {
    if (!mobile.matches) return;
    const target = Math.max(0, Math.min(cards.length - 1, index));
    flow.scrollTo({
      left: flow.scrollLeft + cardPosition(cards[target]),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  const syncLayout = () => {
    controls.hidden = !mobile.matches;
    queueProgress();
  };

  previous.addEventListener('click', () => moveTo(current - 1));
  next.addEventListener('click', () => moveTo(current + 1));
  flow.addEventListener('scroll', queueProgress, { passive: true });
  flow.addEventListener('keydown', (event) => {
    if (!mobile.matches || event.target !== flow) return;
    const targets = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: cards.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    moveTo(targets[event.key]);
  });
  mobile.addEventListener('change', syncLayout);
  window.addEventListener('resize', queueProgress, { passive: true });
  syncLayout();
})();
