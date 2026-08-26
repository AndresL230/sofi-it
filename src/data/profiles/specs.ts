import { mayaSpec } from './maya.spec.ts'
import { devonSpec } from './devon.spec.ts'
import { priyaSpec } from './priya.spec.ts'

/**
 * The three persona specs as plain data — the single list both the app (via ./maya.ts etc.) and
 * scripts/gen-data.mjs read. Keep this file free of `@/` aliases and app imports: the generator loads it
 * with Node's native TypeScript support (Node ≥ 22.18), which only strips types.
 */
export const SPECS = [mayaSpec, devonSpec, priyaSpec]
