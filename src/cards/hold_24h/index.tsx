import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { EngineContext } from '@/engine/types'
import { Money, Num, Button, T, cn, type CardActions } from '../kit'
import { Stamp } from '../green_light'
import { fmtMoney } from '@/engine/format'
import { ProgressCircle } from '@/vendor/tremor/ProgressCircle'

interface Props { thing: string; amount: number; cardShort: string; goalName: string | null; hours: number; verdictWord: string }
type Phase = 'front' | 'held' | 'reask'

const Clock = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 1.8" strokeLinecap="round" /></svg>
)

/** #24 — flip card: outlined hold button → 3D y-flip (600ms) to a sealed navy face with a 24h clock ring → skip → re-ask. */
function Hold24h({ thing, amount, cardShort, goalName, hours, verdictWord, actions }: Props & { actions: CardActions }) {
  const [phase, setPhase] = useState<Phase>('front')
  const flip = { initial: { rotateY: -90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: 90, opacity: 0 }, transition: { duration: 0.3, ease: 'easeInOut' } } as const
  return (
    <div className="flex h-full flex-col" style={{ perspective: 900 }}>
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'front' ? (
          <motion.div key="front" {...flip} className="pc-card flex flex-1 flex-col justify-center px-5 py-4.5" style={{ transformStyle: 'preserve-3d' }}>
            {/* One wrapping row: the button sits under the copy in a column and beside it once
                there is room, so it never becomes a full-bleed bar across a wide span. */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5">
              <div className="grow-[2] basis-[176px]">
                <div className={cn(T.title, 'text-navy')}>Sleep on it?</div>
                <div className={cn(T.body, 'mt-1 text-slate')}>Nothing expires tonight. I'll re-ask in the morning — same price, same card.</div>
              </div>
              <Button variant="outline" className="max-w-[300px] grow basis-[204px] active:scale-[.98] active:bg-teal-tint2" onClick={() => setPhase('held')}>
                <Clock />
                <span>Hold it for <Num value={hours} animated={false} /> hours</span>
              </Button>
            </div>
          </motion.div>
        ) : phase === 'held' ? (
          <motion.div key="held" {...flip} role="status" aria-live="polite" className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-card bg-navy px-5 py-5.5 text-center text-white" style={{ transformStyle: 'preserve-3d' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0))', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} aria-hidden />
            <ProgressCircle value={1 / 12} size={44} strokeWidth={3} color="var(--teal-soft)" track="rgba(255,255,255,.2)" delay="0ms"><span className="text-caption font-bold"><Num value={hours} animated={false} />h</span></ProgressCircle>
            <div className={cn(T.title, 'mt-2.5')}>Held.</div>
            <div className={cn(T.body, 'mt-1 max-w-[380px] text-white/70')}>I'll re-ask you about the <Money value={amount} size="inline" cents="never" animated={false} /> {thing} tomorrow.</div>
          </motion.div>
        ) : (
          <motion.div key="reask" {...flip} className="pc-card flex flex-1 items-center justify-center px-5 py-4.5" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex w-full max-w-[520px] items-center gap-4">
            <Stamp delay="0ms" size={64} />
            <div className="flex-1">
              <div className={cn(T.lede, 'font-bold text-navy')}>Still want the <Money value={amount} size="inline" cents="never" animated={false} /> {thing}?</div>
              <div className={cn(T.body, 'mt-1 text-slate')}>Nothing about the answer changed — still {verdictWord.toLowerCase().replace('.', '')}, {cardShort} still the card.</div>
              <div className="mt-3 flex max-w-[320px] gap-2.5">
                <Button className="flex-1 px-3 active:scale-[.98]" size="sm" onClick={() => { actions.toast(`Logged. ${cardShort} is ready when you are.`); actions.goHome() }}>Buy it</Button>
                <Button className="flex-1 px-3 active:scale-[.98]" size="sm" variant="ghost" onClick={() => { actions.toast(goalName ? `Saved ${fmtMoney(amount, 'never')}. ${goalName} says thanks.` : `Saved ${fmtMoney(amount, 'never')}.`); actions.goHome() }}>Let it go</Button>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === 'held' ? (
        <button type="button" onClick={() => setPhase('reask')} className="mt-2.5 w-full cursor-pointer rounded-sm2 border-[1.5px] border-dashed border-slate-hair p-2 text-center text-meta text-slate-muted transition-colors hover:border-slate hover:text-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">⏭ demo: skip to tomorrow</button>
      ) : null}
    </div>
  )
}

export const select = (ctx: EngineContext): Props => ({ thing: ctx.q.thing, amount: ctx.q.amount, cardShort: ctx.ranking.winner.card.name.replace('SoFi Unlimited 2%', 'SoFi 2%').replace('Chase ', ''), goalName: ctx.goal ? ctx.goal.name.split(' ')[0] : null, hours: 24, verdictWord: ctx.verdict.word.split(',')[0] })

export { meta, condition } from './meta'
export default Hold24h
