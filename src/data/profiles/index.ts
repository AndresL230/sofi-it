import type { Profile } from '@/types'
import { maya } from './maya'

/** Orchestrator-owned. Add profiles here as their data files land (devon, priya per the addendum). */
export const PROFILES: Profile[] = [maya]
export const DEFAULT_PROFILE_ID = maya.id
export const profileById = (id: string): Profile => PROFILES.find((p) => p.id === id) ?? maya
