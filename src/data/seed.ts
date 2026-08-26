/** Deterministic PRNG (mulberry32) so the noise transactions are identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function rand() {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const SEED = 42
export function makeRng(seed = SEED) {
  const r = mulberry32(seed)
  return {
    next: r,
    int: (min: number, max: number) => Math.floor(r() * (max - min + 1)) + min,
    range: (min: number, max: number) => r() * (max - min) + min,
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)],
    /** Split `total` into `n` positive parts with mild variance. */
    split: (total: number, n: number) => {
      const w = Array.from({ length: n }, () => 0.6 + r() * 0.8)
      const s = w.reduce((a, b) => a + b, 0)
      return w.map((x) => Math.round((total * x) / s * 100) / 100)
    },
  }
}
