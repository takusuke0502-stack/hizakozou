import { japanDate } from './site-notice-model.js';

const DAY_MS = 86400000;

// Calculate calendar days in JST; UTC arithmetic avoids the browser's local zone.
export function firstVisitWeek(now = new Date()) {
  const monday = new Date(`${japanDate(now)}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  return {
    startsOn: monday.toISOString().slice(0, 10),
    endsOn: sunday.toISOString().slice(0, 10)
  };
}

export function firstVisitAvailability(data, now = new Date()) {
  const { startsOn } = firstVisitWeek(now);
  const capacity = data?.version === 1 && Number.isInteger(data.weeklyCapacity) && data.weeklyCapacity > 0
    ? data.weeklyCapacity : null;
  const value = data?.weeks?.[startsOn]?.remaining;
  const remaining = capacity !== null && Number.isInteger(value) && value >= 0 && value <= capacity
    ? value : null;
  return { capacity, remaining, state: remaining === null ? 'unknown' : remaining === 0 ? 'closed' : 'available' };
}

export function updateFirstVisitWeek(root, now = new Date(), data = null) {
  const { endsOn } = firstVisitWeek(now);
  const offer = firstVisitAvailability(data, now);
  const [, month, day] = endsOn.split('-').map(Number);
  for (const item of root.querySelectorAll('[data-first-visit-week]')) {
    const period = item.querySelector('[data-first-visit-week-period]');
    const availability = item.querySelector('[data-first-visit-week-availability]');
    const limit = item.querySelector('[data-first-visit-week-limit]');
    const capacity = item.querySelector('[data-first-visit-week-capacity]');
    if (!period || !availability || !limit || !capacity) continue;
    const doc = item.ownerDocument;
    const end = doc.createElement('time');
    end.dateTime = endsOn;
    end.textContent = `${month}月${day}日（日）`;
    period.replaceChildren(end);
    limit.hidden = offer.capacity === null;
    capacity.textContent = offer.capacity === null ? '' : String(offer.capacity);
    item.dataset.availability = offer.state;
    if (offer.state === 'available') {
      const number = doc.createElement('strong');
      number.textContent = String(offer.remaining);
      availability.replaceChildren(doc.createTextNode('残り'), number, doc.createTextNode('名様'));
    } else {
      availability.textContent = offer.state === 'closed' ? '今週の割引受付は終了しました' : '残枠はLINEでご確認ください';
    }
    item.hidden = false;
  }
}

if (typeof document !== 'undefined') {
  let timer;
  const refresh = async () => {
    clearTimeout(timer);
    let data = null;
    try {
      const response = await fetch('/data/first-visit-discount.json', { cache: 'no-store' });
      if (response.ok) data = await response.json();
    } catch {
      // Keep date information, but never invent availability when data cannot load.
    }
    const now = new Date();
    updateFirstVisitWeek(document, now, data);
    const nextMidnight = Date.parse(`${japanDate(now)}T00:00:00+09:00`) + DAY_MS;
    timer = setTimeout(refresh, Math.max(1000, nextMidnight - now.getTime() + 100));
  };
  refresh();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });
}
