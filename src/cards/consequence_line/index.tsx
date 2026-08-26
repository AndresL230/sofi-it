import type { EngineContext, RichText } from '@/engine/types'
import { Rich } from '../kit'

interface Props { text: RichText }

/** #4 — the only chrome-free element: one plain factual sentence, no card, no icon. */
function ConsequenceLine({ text }: Props) {
  return <p className="my-5 mx-1 text-[14px] text-slate"><Rich text={text} /></p>
}

export const select = (ctx: EngineContext): Props => ({ text: ctx.consequence })

export { meta, condition } from './meta'
export default ConsequenceLine
