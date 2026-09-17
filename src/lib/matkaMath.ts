import { PanaType } from '../types';

/**
 * Calculates single digit from 3-digit Pana sum modulo 10
 * Example: '128' -> 1+2+8 = 11 -> '1'
 */
export function calculateDigitFromPana(pana: string): string {
  if (!pana || pana.length !== 3 || !/^\d{3}$/.test(pana)) {
    return '0';
  }
  const sum = pana.split('').reduce((acc, char) => acc + parseInt(char, 10), 0);
  return (sum % 10).toString();
}

/**
 * Determines whether a 3-digit Pana is SP (Single Patti), DP (Double Patti), or TP (Triple Patti)
 */
export function getPanaType(pana: string): PanaType {
  if (!pana || pana.length !== 3) return 'SP';
  const d0 = pana[0];
  const d1 = pana[1];
  const d2 = pana[2];

  if (d0 === d1 && d1 === d2) {
    return 'TP';
  }
  if (d0 === d1 || d1 === d2 || d0 === d2) {
    return 'DP';
  }
  return 'SP';
}

/**
 * Standard Matka ordering for digits inside a Pana:
 * Digits 1-9 are ordered naturally, with 0 considered the highest (value 10).
 */
export function sortPanaDigits(pana: string): string {
  if (!pana || pana.length !== 3) return pana;
  const digits = pana.split('');
  digits.sort((a, b) => {
    const valA = a === '0' ? 10 : parseInt(a, 10);
    const valB = b === '0' ? 10 : parseInt(b, 10);
    return valA - valB;
  });
  return digits.join('');
}

/**
 * Generates the complete 220 official Matka Panas
 * - 10 Triple Patties (TP)
 * - 90 Double Patties (DP)
 * - 120 Single Patties (SP)
 */
export function getAll220Panas(): string[] {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const panas: string[] = [];

  // TP: 10
  for (let i = 0; i < 10; i++) {
    const d = digits[i];
    panas.push(`${d}${d}${d}`);
  }

  // DP: 90
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (i !== j) {
        // Pairs: i, i, j (sorted)
        const d1 = digits[i];
        const d2 = digits[j];
        const sorted = sortPanaDigits(`${d1}${d1}${d2}`);
        if (!panas.includes(sorted)) {
          panas.push(sorted);
        }
      }
    }
  }

  // SP: 120
  for (let i = 0; i < 10; i++) {
    for (let j = i + 1; j < 10; j++) {
      for (let k = j + 1; k < 10; k++) {
        const sorted = sortPanaDigits(`${digits[i]}${digits[j]}${digits[k]}`);
        if (!panas.includes(sorted)) {
          panas.push(sorted);
        }
      }
    }
  }

  return panas.sort();
}

/**
 * Format traditional Matka display: "128 - 19 - 469" or "128 - 1* - ***"
 */
export function formatMatkaResult(
  open_pana?: string | null,
  open_digit?: string | null,
  close_digit?: string | null,
  close_pana?: string | null
): string {
  const op = open_pana && open_pana.trim() ? open_pana : '***';
  const od = open_digit && open_digit.trim() ? open_digit : '*';
  const cd = close_digit && close_digit.trim() ? close_digit : '*';
  const cp = close_pana && close_pana.trim() ? close_pana : '***';
  return `${op}-${od}${cd}-${cp}`;
}

/**
 * Normalizes any value to a bounded range [minScore, maxScore]
 */
export function normalize(val: number, min: number, max: number, targetMin = 40, targetMax = 98): number {
  if (max <= min) return (targetMin + targetMax) / 2;
  const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
  return Math.round((targetMin + ratio * (targetMax - targetMin)) * 10) / 10;
}

/**
 * Validates whether a 3-digit string is an official Matka Pana
 */
export function isValidPana(pana: string): boolean {
  if (!pana || typeof pana !== 'string' || pana.length !== 3 || !/^\d{3}$/.test(pana)) {
    return false;
  }
  return true;
}

export const generate220Panas = getAll220Panas;

/**
 * Cut Digit Calculation (Matka Opposite / Mirror Digit):
 * 0 <-> 5, 1 <-> 6, 2 <-> 7, 3 <-> 8, 4 <-> 9
 */
export function getCutDigit(digit: string): string {
  const d = parseInt(digit, 10);
  if (isNaN(d) || d < 0 || d > 9) return '0';
  return ((d + 5) % 10).toString();
}

/**
 * Returns standard Matka Cut table
 */
export function getCutMap(): Record<string, string> {
  return {
    '0': '5', '1': '6', '2': '7', '3': '8', '4': '9',
    '5': '0', '6': '1', '7': '2', '8': '3', '9': '4'
  };
}

/**
 * Generates all Family / Group Jodis for a given 2-digit Jodi
 * (Using original digits and their corresponding Cut digits)
 */
export function getFamilyJodis(jodi: string): string[] {
  if (!jodi || jodi.length !== 2) return [jodi];
  const d1 = jodi[0];
  const d2 = jodi[1];
  const c1 = getCutDigit(d1);
  const c2 = getCutDigit(d2);

  const rawCombos = [
    `${d1}${d2}`,
    `${d2}${d1}`,
    `${d1}${c2}`,
    `${c2}${d1}`,
    `${c1}${d2}`,
    `${d2}${c1}`,
    `${c1}${c2}`,
    `${c2}${c1}`
  ];

  return Array.from(new Set(rawCombos));
}

/**
 * Returns all 22 Panas corresponding to a specific Single Digit (0-9)
 */
export function getPanasForDigit(digit: string): string[] {
  const allPanas = getAll220Panas();
  return allPanas.filter((p) => calculateDigitFromPana(p) === digit);
}
