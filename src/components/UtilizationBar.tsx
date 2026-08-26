import { cn } from '@/lib/utils'

/**
 * The credit-utilization bar used on Home's account rows and the financial profile's credit posture.
 * One implementation, one rule: teal under the line, salmon over it. The line moves with the profile
 * (30% normally, 20% while a credit application is close), so the caller passes it in.
 */
export function UtilizationBar({ used, threshold = 0.3, height = 4, className }: { used: number; threshold?: number; height?: number; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-pill bg-lavender', className)} style={{ height }} aria-hidden>
      <div className="h-full rounded-pill transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, used * 100))}%`, background: used > threshold ? 'var(--salmon)' : 'var(--teal)' }} />
    </div>
  )
}
