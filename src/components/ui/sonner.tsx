import { Toaster as Sonner, toast } from 'sonner'

/** Quiet navy toast, bottom-center, matching the export's toast (no confetti, ever). */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      duration={3800}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'bg-navy text-white text-[14px] font-medium px-5 py-3 rounded-ctl shadow-[0_8px_24px_rgba(32,23,71,.3)] max-w-[88vw] w-max flex items-center',
        },
      }}
    />
  )
}
export { toast }
