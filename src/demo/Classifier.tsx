import { useEffect, useState } from 'react'
import { useDemoStore } from '@/store/demo'
import { useSession } from '@/store'
import type { ClassificationSource } from '@/engine/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Caption, Switch } from './ui'

type Health = { state: 'loading' } | { state: 'live'; model: string } | { state: 'nokey' } | { state: 'down' }

const SOURCE: Record<ClassificationSource, { label: string; meaning: string; tone: 'teal' | 'gray' | 'salmon' | 'purple' }> = {
  api: { label: 'api', meaning: 'Claude parsed this query live via the Worker.', tone: 'teal' },
  cache: { label: 'cache', meaning: 'The Worker served a parse it had already cached.', tone: 'teal' },
  fallback: { label: 'fallback', meaning: 'Keyword classifier — no API call was made.', tone: 'gray' },
  chip: { label: 'chip', meaning: 'Preset chip — the parse is known, no call needed.', tone: 'gray' },
}

/** Worker health (fetched each time the panel opens), the force-fallback switch, and the last answer's source. */
export function Classifier({ open }: { open: boolean }) {
  const [health, setHealth] = useState<Health>({ state: 'loading' })
  const forceFallback = useDemoStore((s) => s.forceFallback)
  const setForceFallback = useDemoStore((s) => s.setForceFallback)
  const source = useSession((s) => s.classification?.source ?? null)

  useEffect(() => {
    if (!open) return
    let alive = true
    setHealth({ state: 'loading' })
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { hasKey?: boolean; model?: string }) => { if (alive) setHealth(j.hasKey ? { state: 'live', model: j.model ?? '' } : { state: 'nokey' }) })
      .catch(() => { if (alive) setHealth({ state: 'down' }) })
    return () => { alive = false }
  }, [open])

  const status =
    health.state === 'loading' ? { text: 'checking the Worker…', dot: 'bg-lavender-deep' }
    : health.state === 'live' ? { text: 'Claude Haiku 4.5 live', dot: 'bg-green' }
    : health.state === 'nokey' ? { text: 'no key → keyword fallback', dot: 'bg-gold' }
    : { text: 'Worker unreachable → keyword fallback', dot: 'bg-salmon' }
  const effective = forceFallback ? 'forced keyword fallback' : status.text

  return (
    <div className="space-y-3">
      <div data-demo="health" className="flex items-center gap-2 text-body text-ink" title={health.state === 'live' ? health.model : undefined}>
        <span aria-hidden className={cn('h-2 w-2 shrink-0 rounded-full', forceFallback ? 'bg-gold' : status.dot)} />
        <span className={cn(forceFallback && 'text-slate line-through')}>{status.text}</span>
        {forceFallback ? <span className="font-semibold">{effective}</span> : null}
      </div>
      <Switch id="demo-force-fallback" label="Force keyword fallback (no API)" checked={forceFallback} onChange={setForceFallback} />
      <div className="rounded-sm2 bg-lavender-soft px-3 py-2">
        <div className="flex items-center gap-2 text-meta text-slate">
          <span>Last answer</span>
          {source ? <Badge tone={SOURCE[source].tone} size="xs" data-demo="source">{SOURCE[source].label}</Badge> : <span className="text-slate-muted">— none yet</span>}
        </div>
        {source ? <Caption className="mt-1">{SOURCE[source].meaning}</Caption> : null}
      </div>
    </div>
  )
}
