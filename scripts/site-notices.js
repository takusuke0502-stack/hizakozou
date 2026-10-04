import { isNoticeVisible, japanDate } from './site-notice-model.js';

export function updateNotices(root, now = new Date()) {
  const today = japanDate(now);
  for (const group of root.querySelectorAll('[data-site-notices]')) {
    const archive = group.dataset.siteNotices === 'archive';
    const limit = archive ? Infinity : Number(group.dataset.noticeLimit || 3);
    let count = 0;
    for (const item of group.querySelectorAll('[data-site-notice-item]')) {
      const visible = isNoticeVisible({
        enabled: true, publishedOn: item.dataset.publishedOn, endsOn: item.dataset.endsOn
      }, today, archive) && count < limit;
      item.hidden = !visible;
      if (visible) count += 1;
    }
    group.hidden = !archive && count === 0;
    const empty = group.querySelector('[data-notice-empty]');
    if (empty) empty.hidden = count !== 0;
  }
}

// No network requests or polling. Update only on load, return to tab, and JST midnight.
if (typeof document !== 'undefined') {
  let midnightTimer;
  const refresh = () => {
    clearTimeout(midnightTimer);
    const now = new Date();
    updateNotices(document, now);
    const nextMidnight = Date.parse(`${japanDate(now)}T00:00:00+09:00`) + 86400000;
    midnightTimer = setTimeout(refresh, Math.max(1000, nextMidnight - now.getTime() + 100));
  };
  refresh();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });
}
