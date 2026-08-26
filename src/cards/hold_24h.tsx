import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { EngineContext } from '@/engine/types'
import { defineCard, Money, Num, Button, type CardActions } from './kit'
import { Stamp } from './green_light'
import { fmtMoney } from '@/engine/format'
import { ProgressCircle } from '@/vendor/tremor/ProgressCircle'

interface Props { thing: string; amount: number; cardShort: string; goalName: string | null; hours: number; verdictWord: string }
type Phase = 'front' | 'held' | 'reask'

/** #24 — flip card: outlined hold button → 3D y-flip (600ms) to a sealed navy face with a 24h clock ring → skip → re-ask. */
function Hold24h({ thing, amount, cardShort, goalName, hours, verdictWord, actions }: Props & { actions: CardActions }) {
  const [phase, setPhase] = useState<Phase>('front')
  const flip = { initial: { rotateY: -90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: 90, opacity: 0 }, transition: { duration: 0.3, ease: 'easeInOut' } } as const
  return (
    <div style={{ perspective: 900 }}>
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'front' ? (
          <motion.div key="front" {...flip} className="pc-card px-5 py-[18px]" style={{ transformStyle: 'preserve-3d' }}>
            <Button variant="outline" className="w-full whitespace-normal py-[13px] text-[14.5px] h-auto" onClick={() => setPhase('held')}><span>Hold it for <Num value={hours} animated={false} /> hours — I'll re-ask you tomorrow.</span></Button>
          </motion.div>
        ) : phase === 'held' ? (
          <motion.div key="held" {...flip} className="relative overflow-hidden rounded-card bg-navy px-5 py-[22px] text-center text-white" style={{ transformStyle: 'preserve-3d' }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0))', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} aria-hidden />
            <div className="mx-auto mb-[10px] w-11">
              <ProgressCircle value={1 / 12} size={44} strokeWidth={3} color="var(--teal-soft)" track="rgba(255,255,255,.2)" delay="0ms"><span className="text-[11px] font-bold"><Num value={hours} animated={false} />h</span></ProgressCircle>
            </div>
            <div className="text-[15px] font-bold">Held. Ask me tomorrow.</div>
            <div className="mx-auto mt-3 h-[3px] w-11 rounded-[2px] bg-white/15" />
          </motion.div>
        ) : (
          <motion.div key="reask" {...flip} className="pc-card flex items-center gap-4 px-5 py-[18px]" style={{ transformStyle: 'preserve-3d' }}>
            <Stamp delay="0ms" size={64} />
            <div className="flex-1">
              <div className="text-[14.5px] font-bold">Still want the <Money value={amount} size="inline" cents="never" animated={false} /> {thing}?</div>
              <div className="mt-1 text-[13px] text-slate">Nothing about the answer changed — still {verdictWord.toLowerCase().replace('.', '')}, {cardShort} still the card.</div>
              <div className="mt-3 flex gap-[10px]">
                <Button className="flex-1" size="sm" onClick={() => { actions.toast(`Logged. ${cardShort} is ready when you are.`); actions.goHome() }}>Buy it</Button>
                <Button className="flex-1" size="sm" variant="ghost" onClick={() => { actions.toast(goalName ? `Saved ${fmtMoney(amount, 'never')}. ${goalName} says thanks.` : `Saved ${fmtMoney(amount, 'never')}.`); actions.goHome() }}>Let it go</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === 'held' ? (
        <button onClick={() => setPhase('reask')} className="mt-[10px] w-full cursor-pointer rounded-sm2 border-[1.5px] border-dashed border-slate-hair p-2 text-center text-[12.5px] text-slate-muted hover:text-slate">⏭ demo: skip to tomorrow</button>
      ) : null}
    </div>
  )
}

const NEVER = ['groceries', 'transport', 'housing_moving', 'subscription']
export const condition = (ctx: EngineContext) => ctx.q.size === 'medium' && ctx.q.isDiscretionary && ctx.q.frequency !== 'recurring' && !NEVER.includes(ctx.q.category)
export const select = (ctx: EngineContext): Props => ({ thing: ctx.q.thing, amount: ctx.q.amount, cardShort: ctx.ranking.winner.card.name.replace('SoFi Unlimited 2%', 'SoFi 2%').replace('Chase ', ''), goalName: ctx.goal ? ctx.goal.name.split(' ')[0] : null, hours: 24, verdictWord: ctx.verdict.word.split(',')[0] })

export default defineCard<Props>({ type: 'hold_24h', section: 'Behavior lens', label: 'interactive', condition, select, Component: Hold24h, samples: [{ query: '$140 running shoes' }] })
