import type { EngineContext, RichText } from '@/engine/types'
import { Rich } from '../kit'

interface Props { text: RichText }

/** Bind the em dash to the word before it so a wrap never leaves "— nothing else moves." orphaned. */
const tieDashes = (text: RichText): RichText => text.map((p) => (typeof p === 'string' ? p.replace(/ —/g, ' —') : p)) as RichText

/** #4 — the only chrome-free element: one plain factual sentence, no card, no icon. */
function ConsequenceLine({ text }: Props) {
  return (
    <p className="mx-1 my-4 max-w-[62ch] text-balance text-lede text-slate [&_.money]:font-semibold [&_.money]:text-ink">
      <Rich text={tieDashes(text)} />
    </p>
  )
}

export const select = (ctx: EngineContext): Props => ({ text: ctx.consequence })

export { meta, condition } from './meta'
export default ConsequenceLine
