import { z } from 'zod'
import { CATEGORIES, type Classification } from './types'
import { fallbackClassify } from './fallbackClassifier'

const ApiSchema = z.object({
  is_purchase: z.boolean(),
  amount: z.number().nullable().optional(),
  currency: z.literal('USD').optional(),
  normalized: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  frequency: z.enum(['routine', 'occasional', 'one_off', 'recurring']).optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  merchant_guess: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).optional(),
  cached: z.boolean().optional(),
  fallback: z.boolean().optional(),
})

/**
 * Classify free text. The Worker/LLM only classifies — every number rendered comes from the engine.
 * Any failure (network, 429, timeout, schema mismatch, {fallback:true}) degrades silently to the
 * keyword classifier, so the demo never breaks.
 */
export async function classify(query: string, opts: { timeoutMs?: number; signal?: AbortSignal; forceFallback?: boolean } = {}): Promise<Classification> {
  const fb = fallbackClassify(query)
  if (opts.forceFallback || query.trim().length === 0 || query.length > 200) return fb
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 3500)
  opts.signal?.addEventListener('abort', () => ctrl.abort())
  try {
    const res = await fetch('/api/classify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }), signal: ctrl.signal })
    if (!res.ok) return fb
    const parsed = ApiSchema.safeParse(await res.json())
    if (!parsed.success || parsed.data.fallback) return fb
    const d = parsed.data
    const source = d.cached ? 'cache' : 'api'
    if (!d.is_purchase) return { is_purchase: false, source }
    // Merge: the LLM's structure, but the amount is re-parsed locally when present so a hallucinated number never renders.
    const amount = fb.is_purchase ? fb.amount : d.amount ?? null
    if (!amount || amount <= 0 || !d.category) return fb
    return {
      is_purchase: true, amount, currency: 'USD', normalized: d.normalized?.slice(0, 120) || query.trim(), category: d.category,
      frequency: d.frequency ?? (fb.is_purchase ? fb.frequency : 'one_off'), size: d.size ?? (fb.is_purchase ? fb.size : 'medium'),
      merchant_guess: d.merchant_guess ?? null, confidence: d.confidence ?? 0.8, source,
    }
  } catch {
    return fb
  } finally {
    clearTimeout(timer)
  }
}
