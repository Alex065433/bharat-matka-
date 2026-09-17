import { Market, HistoricalResult } from '../types';
import { calculateDigitFromPana, getAll220Panas } from '../lib/matkaMath';

export const INITIAL_MARKETS: Market[] = [
  // Morning Sessions
  {
    id: 'm-karnataka-day',
    name: 'Karnataka Day',
    slug: 'karnataka-day',
    open_time: '10:00 AM',
    close_time: '11:00 AM',
    status: 'active',
    display_order: 1,
    session: 'morning'
  },
  {
    id: 'm-rudraksh-morning',
    name: 'Rudraksh Morning',
    slug: 'rudraksh-morning',
    open_time: '10:30 AM',
    close_time: '11:30 AM',
    status: 'active',
    display_order: 2,
    session: 'morning'
  },
  {
    id: 'm-madhur-morning',
    name: 'Madhur Morning',
    slug: 'madhur-morning',
    open_time: '11:30 AM',
    close_time: '12:30 PM',
    status: 'active',
    display_order: 3,
    session: 'morning'
  },
  {
    id: 'm-sridevi',
    name: 'Sridevi',
    slug: 'sridevi',
    open_time: '11:35 AM',
    close_time: '12:35 PM',
    status: 'active',
    display_order: 4,
    session: 'morning'
  },

  // Day Sessions
  {
    id: 'm-time-bazar',
    name: 'Time Bazar',
    slug: 'time-bazar',
    open_time: '01:00 PM',
    close_time: '02:00 PM',
    status: 'active',
    display_order: 5,
    session: 'day'
  },
  {
    id: 'm-tara-mumbai-day',
    name: 'Tara Mumbai Day',
    slug: 'tara-mumbai-day',
    open_time: '01:30 PM',
    close_time: '02:30 PM',
    status: 'active',
    display_order: 6,
    session: 'day'
  },
  {
    id: 'm-madhur-day',
    name: 'Madhur Day',
    slug: 'madhur-day',
    open_time: '01:30 PM',
    close_time: '02:30 PM',
    status: 'active',
    display_order: 7,
    session: 'day'
  },
  {
    id: 'm-milan-day',
    name: 'Milan Day',
    slug: 'milan-day',
    open_time: '03:00 PM',
    close_time: '05:00 PM',
    status: 'active',
    display_order: 8,
    session: 'day'
  },
  {
    id: 'm-rajdhani-day',
    name: 'Rajdhani Day',
    slug: 'rajdhani-day',
    open_time: '03:15 PM',
    close_time: '05:15 PM',
    status: 'active',
    display_order: 9,
    session: 'day'
  },
  {
    id: 'm-supreme-day',
    name: 'Supreme Day',
    slug: 'supreme-day',
    open_time: '03:35 PM',
    close_time: '05:35 PM',
    status: 'active',
    display_order: 10,
    session: 'day'
  },
  {
    id: 'm-kalyan',
    name: 'Kalyan (Day)',
    slug: 'kalyan',
    open_time: '04:15 PM',
    close_time: '06:15 PM',
    status: 'active',
    display_order: 11,
    session: 'day'
  },

  // Night / Evening Sessions
  {
    id: 'm-sridevi-night',
    name: 'Sridevi Night',
    slug: 'sridevi-night',
    open_time: '07:00 PM',
    close_time: '08:00 PM',
    status: 'active',
    display_order: 12,
    session: 'night'
  },
  {
    id: 'm-madhur-night',
    name: 'Madhur Night',
    slug: 'madhur-night',
    open_time: '08:30 PM',
    close_time: '10:30 PM',
    status: 'active',
    display_order: 13,
    session: 'night'
  },
  {
    id: 'm-tara-mumbai-night',
    name: 'Tara Mumbai Night',
    slug: 'tara-mumbai-night',
    open_time: '08:30 PM',
    close_time: '09:30 PM',
    status: 'active',
    display_order: 14,
    session: 'night'
  },
  {
    id: 'm-supreme-night',
    name: 'Supreme Night',
    slug: 'supreme-night',
    open_time: '08:45 PM',
    close_time: '10:45 PM',
    status: 'active',
    display_order: 15,
    session: 'night'
  },
  {
    id: 'm-milan-night',
    name: 'Milan Night',
    slug: 'milan-night',
    open_time: '09:00 PM',
    close_time: '11:00 PM',
    status: 'active',
    display_order: 16,
    session: 'night'
  },
  {
    id: 'm-rajdhani-night',
    name: 'Rajdhani Night',
    slug: 'rajdhani-night',
    open_time: '09:15 PM',
    close_time: '11:45 PM',
    status: 'active',
    display_order: 17,
    session: 'night'
  },
  {
    id: 'm-kalyan-night',
    name: 'Kalyan Night',
    slug: 'kalyan-night',
    open_time: '09:25 PM',
    close_time: '11:25 PM',
    status: 'active',
    display_order: 18,
    session: 'night'
  },
  {
    id: 'm-rudraksh-night',
    name: 'Rudraksh Night',
    slug: 'rudraksh-night',
    open_time: '09:30 PM',
    close_time: '10:30 PM',
    status: 'active',
    display_order: 19,
    session: 'night'
  },
  {
    id: 'm-mumbai-main',
    name: 'Main Bazar (Mumbai)',
    slug: 'main-bazar',
    open_time: '09:35 PM',
    close_time: '12:05 AM',
    status: 'active',
    display_order: 20,
    session: 'night'
  },

  // Delhi King / Regional Markets
  {
    id: 'm-desawar',
    name: 'Desawar',
    slug: 'desawar',
    open_time: '05:00 AM',
    close_time: '05:15 AM',
    status: 'active',
    display_order: 21,
    session: 'delhi'
  },
  {
    id: 'm-faridabad',
    name: 'Faridabad',
    slug: 'faridabad',
    open_time: '06:00 PM',
    close_time: '06:15 PM',
    status: 'active',
    display_order: 22,
    session: 'delhi'
  },
  {
    id: 'm-ghaziabad',
    name: 'Ghaziabad',
    slug: 'ghaziabad',
    open_time: '08:15 PM',
    close_time: '08:30 PM',
    status: 'active',
    display_order: 23,
    session: 'delhi'
  },
  {
    id: 'm-gali',
    name: 'Gali',
    slug: 'gali',
    open_time: '11:05 PM',
    close_time: '11:20 PM',
    status: 'active',
    display_order: 24,
    session: 'delhi'
  }
];

// Complete 220 official Matka Panas pool
const ALL_220_PANAS = getAll220Panas();

/**
 * Generates historical chart records for specific markets over past 45-55 trading days
 * ensuring strict Matka mathematical integrity (valid pana, modulo-10 digit, and jodi).
 */
export function generateInitialHistoricalResultsForMarkets(markets: Market[]): HistoricalResult[] {
  const results: HistoricalResult[] = [];
  const baseDate = new Date('2026-09-17'); // current anchor date

  markets.forEach((m, marketIdx) => {
    let daysBack = 55;
    let recordsCreated = 0;

    while (daysBack >= 1 && recordsCreated < 42) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - daysBack);
      daysBack--;

      // Skip Sunday (0) for traditional financial week
      if (d.getDay() === 0) continue;

      const dateStr = d.toISOString().split('T')[0];

      // Deterministic authentic Pana index calculation
      const openIdx = (marketIdx * 41 + recordsCreated * 17 + d.getDate() * 7) % ALL_220_PANAS.length;
      const closeIdx = (marketIdx * 31 + recordsCreated * 23 + (d.getDate() + 3) * 11) % ALL_220_PANAS.length;

      const openPana = ALL_220_PANAS[openIdx];
      const closePana = ALL_220_PANAS[closeIdx];

      const openDigit = calculateDigitFromPana(openPana);
      const closeDigit = calculateDigitFromPana(closePana);
      const jodi = `${openDigit}${closeDigit}`;

      results.push({
        id: `res-${m.id}-${dateStr}`,
        market_id: m.id,
        result_date: dateStr,
        open_pana: openPana,
        open_digit: openDigit,
        jodi: jodi,
        close_digit: closeDigit,
        close_pana: closePana,
        created_at: new Date(d.getTime() + 18 * 3600 * 1000).toISOString(),
        updated_at: new Date(d.getTime() + 18 * 3600 * 1000).toISOString()
      });

      recordsCreated++;
    }
  });

  return results;
}

/**
 * Generates historical chart records for all initial markets
 */
export function generateInitialHistoricalResults(): HistoricalResult[] {
  return generateInitialHistoricalResultsForMarkets(INITIAL_MARKETS);
}

