/**
 * Bound `n` to `[lo, hi]`. NaN stays NaN, so callers that accept missing
 * data check `Number.isFinite` first and pick their own empty value.
 */
export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}
