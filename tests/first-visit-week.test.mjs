import test from 'node:test';
import assert from 'node:assert/strict';
import { firstVisitWeek, firstVisitAvailability } from '../scripts/first-visit-week.js';

const cases = [
  ['Saturday', '2026-10-31T03:00:00Z', '2026-10-26', '2026-11-01'],
  ['Sunday before JST midnight', '2026-11-01T14:59:59.999Z', '2026-10-26', '2026-11-01'],
  ['Monday at JST midnight', '2026-11-01T15:00:00Z', '2026-11-02', '2026-11-08'],
  ['Wednesday', '2026-11-04T03:00:00Z', '2026-11-02', '2026-11-08'],
  ['New Year', '2026-12-31T15:00:00Z', '2026-12-28', '2027-01-03'],
  ['First Monday of the year', '2027-01-03T15:00:00Z', '2027-01-04', '2027-01-10'],
  ['Leap day', '2024-02-29T00:00:00Z', '2024-02-26', '2024-03-03']
];
for (const [name, timestamp, startsOn, endsOn] of cases) {
  test(`first-visit reception week: ${name}`, () => {
    assert.deepEqual(firstVisitWeek(new Date(timestamp)), { startsOn, endsOn });
  });
}
test('invalid dates fail instead of showing an invented reception period', () => {
  assert.throws(() => firstVisitWeek(new Date(NaN)), RangeError);
});

test('remaining discount places stay at the entered value throughout the same week', () => {
  const data = { version: 1, weeklyCapacity: 5, weeks: { '2026-10-26': { remaining: 3 } } };
  for (const timestamp of ['2026-10-26T00:00:00Z', '2026-10-28T00:00:00Z', '2026-10-30T00:00:00Z']) {
    assert.deepEqual(firstVisitAvailability(data, new Date(timestamp)), { capacity: 5, remaining: 3, state: 'available' });
  }
});
test('unconfigured new weeks never carry forward the previous remaining count', () => {
  const data = { version: 1, weeklyCapacity: 5, weeks: { '2026-10-26': { remaining: 3 } } };
  assert.deepEqual(firstVisitAvailability(data, new Date('2026-11-01T15:00:00Z')), { capacity: 5, remaining: null, state: 'unknown' });
});
test('zero remaining ends discount reception, while the full capacity is valid', () => {
  const now = new Date('2026-10-31T00:00:00Z');
  for (const remaining of [0, 5]) {
    const data = { version: 1, weeklyCapacity: 5, weeks: { '2026-10-26': { remaining } } };
    assert.equal(firstVisitAvailability(data, now).state, remaining === 0 ? 'closed' : 'available');
  }
});
test('invalid or missing capacity data is not shown as a remaining count', () => {
  const now = new Date('2026-10-31T00:00:00Z');
  for (const remaining of [-1, 6, 2.5, '3', null, undefined]) {
    const data = { version: 1, weeklyCapacity: 5, weeks: { '2026-10-26': { remaining } } };
    assert.equal(firstVisitAvailability(data, now).remaining, null);
  }
  for (const data of [null, {}, { version: 2, weeklyCapacity: 5 }, { version: 1, weeklyCapacity: -1 }]) {
    assert.deepEqual(firstVisitAvailability(data, now), { capacity: null, remaining: null, state: 'unknown' });
  }
});
test('availability uses only the matching Japanese calendar week', () => {
  const data = { version: 1, weeklyCapacity: 5, weeks: { '2026-10-26': { remaining: 3 }, '2026-11-02': { remaining: 4 } } };
  assert.equal(firstVisitAvailability(data, new Date('2026-11-01T14:59:59Z')).remaining, 3);
  assert.equal(firstVisitAvailability(data, new Date('2026-11-01T15:00:00Z')).remaining, 4);
});
