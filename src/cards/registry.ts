/**
 * The single registry every consumer uses: the Answer screen composes from it, the Card Gallery
 * renders all of it. A card that fails to import fails here — immediately visible.
 */
import type { CardType } from '@/engine/types'
import type { CardModule } from './kit'
import verdict_banner from './verdict_banner'
import plan_header from './plan_header'
import green_light from './green_light'
import consequence_line from './consequence_line'
import post_purchase_footer from './post_purchase_footer'
import category_pulse from './category_pulse'
import pace_projection from './pace_projection'
import discretionary_runway from './discretionary_runway'
import carrying_cost from './carrying_cost'
import cashflow_timeline from './cashflow_timeline'
import payday_proximity from './payday_proximity'
import best_card_row from './best_card_row'
import card_ranking from './card_ranking'
import utilization_watch from './utilization_watch'
import credit_sweep from './credit_sweep'
import credit_expiry from './credit_expiry'
import points_offset from './points_offset'
import benefits_check from './benefits_check'
import merchant_habit from './merchant_habit'
import impulse_frequency from './impulse_frequency'
import cost_per_use from './cost_per_use'
import duplicate_check from './duplicate_check'
import split_check from './split_check'
import hold_24h from './hold_24h'
import annualized from './annualized'
import subscription_stack from './subscription_stack'
import overlap_check from './overlap_check'
import price_creep from './price_creep'
import goal_impact_chip from './goal_impact_chip'
import goal_collision from './goal_collision'
import track_goal_cta from './track_goal_cta'
import payment_fork from './payment_fork'
import total_cost_of_event from './total_cost_of_event'
import guilt_free_balance from './guilt_free_balance'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyCard = CardModule<any>

/** Ordered as numbered in the cards spec (1–34). */
export const CARD_LIST: AnyCard[] = [
  verdict_banner, plan_header, green_light, consequence_line, post_purchase_footer,
  category_pulse, pace_projection, discretionary_runway, carrying_cost, cashflow_timeline, payday_proximity,
  best_card_row, card_ranking, utilization_watch, credit_sweep, credit_expiry, points_offset, benefits_check,
  merchant_habit, impulse_frequency, cost_per_use, duplicate_check, split_check, hold_24h,
  annualized, subscription_stack, overlap_check, price_creep,
  goal_impact_chip, goal_collision, track_goal_cta,
  payment_fork, total_cost_of_event, guilt_free_balance,
]

export const CARDS = Object.fromEntries(CARD_LIST.map((m) => [m.type, m])) as Record<CardType, AnyCard>

if (CARD_LIST.length !== 34) throw new Error(`registry has ${CARD_LIST.length} cards, expected 34`)
