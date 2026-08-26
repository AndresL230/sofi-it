import type { Profile } from '@/types'
import { maya } from './maya'
import { devon } from './devon'
import { priya } from './priya'

/** Orchestrator-owned. Three demo personas, one shape (see ../spec.ts). */
export const PROFILES: Profile[] = [maya, devon, priya]
export const DEFAULT_PROFILE_ID = maya.id
export const profileById = (id: string): Profile => PROFILES.find((p) => p.id === id) ?? maya
