import { createContext, useContext } from 'react'

/**
 * Opt-in count-up, switched on for the duration of the answer reveal.
 *
 * Beat 3 asks for hero numerals to roll rather than appear at their final value. Those numerals
 * live inside the 34 cards, and the cards are not ours to edit — so the switch lives here and
 * <Money> reads it. Off everywhere by default: Home, the gallery, the share card and the profile
 * screens keep rendering their figures instantly, exactly as they do today.
 */
const CountUpCtx = createContext(false)
export const CountUpProvider = CountUpCtx.Provider
export const useCountUpReveal = () => useContext(CountUpCtx)
