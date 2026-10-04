// Shared by the static browser module and the notice builder.
// Public clinic notices only. Do not put patient or private scheduling data here.
export function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function japanDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function normalizeNotices(manifest) {
  if (manifest?.version !== 1 || !Array.isArray(manifest.notices)) {
    throw new Error('お知らせの version は1、notices は配列にしてください。');
  }
  const ids = new Set();
  return manifest.notices.map((item, index) => {
    const fail = message => { throw new Error(`お知らせ${index + 1}: ${message}`); };
    if (!item || typeof item !== 'object') fail('入力形式が正しくありません。');
    if (typeof item.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(item.id)) fail('id は半角英数字とハイフンで指定してください。');
    if (ids.has(item.id)) fail('id が重複しています。');
    ids.add(item.id);
    if (typeof item.enabled !== 'boolean') fail('enabled は true または false にしてください。');
    for (const field of ['publishedOn', 'startsOn', 'endsOn']) {
      if (!isDate(item[field])) fail(`${field} は実在する日付を YYYY-MM-DD で指定してください。`);
    }
    if (item.endsOn < item.startsOn) fail('終了日は開始日以降にしてください。');
    for (const [field, max] of [['title', 100], ['message', 1500]]) {
      if (typeof item[field] !== 'string' || !item[field].trim() || item[field].length > max) fail(`${field} は1〜${max}文字で指定してください。`);
    }
    return {
      id: item.id, enabled: item.enabled,
      publishedOn: item.publishedOn, startsOn: item.startsOn, endsOn: item.endsOn,
      title: item.title.trim(), message: item.message.trim()
    };
  }).sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.id.localeCompare(b.id));
}

export function isNoticeVisible(item, today, archive = false) {
  return item.enabled && item.publishedOn <= today && (archive || today <= item.endsOn);
}

export function displayDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}
