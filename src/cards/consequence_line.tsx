import type { EngineContext, RichText } from '@/engine/types'
import { defineCard, Rich } from './kit'

interface Props { text: RichText }

/** #4 — the only chrome-free element: one plain factual sentence, no card, no icon. */
function ConsequenceLine({ text }: Props) {
  return <p className="my-5 mx-1 text-[14px] text-slate"><Rich text={text} /></p>
}

export const condition = (ctx: EngineContext) => ctx.consequence.length > 0
export const select = (ctx: EngineContext): Props => ({ text: ctx.consequence })

export default defineCard<Props>({ type: 'consequence_line', section: 'Verdict & framing', label: '', condition, select, Component: ConsequenceLine, bare: true, span: 'full', samples: [{ query: '$60 dinner' }] })
