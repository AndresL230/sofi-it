import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toString as qrToString } from 'qrcode'
import { BRAND } from '@/brand'

/**
 * /qr — a clean, projectable page (outside the Shell's nav/input) with a QR code that points at
 * BRAND.publicUrl. Meant for a slide or a printout. `qrcode` is imported statically here so it
 * lands in this route's lazy chunk rather than the main bundle.
 */
export default function SharePage() {
  const [svg, setSvg] = useState('')
  const host = new URL(BRAND.publicUrl).host

  useEffect(() => {
    const prev = document.title
    document.title = `${BRAND.product} — QR`
    return () => { document.title = prev }
  }, [])

  useEffect(() => {
    let alive = true
    qrToString(BRAND.publicUrl, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 0,
      color: { dark: '#201747', light: '#00000000' },
    }).then((s) => { if (alive) setSvg(s) })
    return () => { alive = false }
  }, [])

  return (
    <div data-screen="qr" className="flex min-h-screen items-center justify-center bg-page px-5 py-8">
      <section className="pc-card relative w-full max-w-[480px] px-8 pb-10 pt-12 text-center sm:px-10">
        <Link to="/" className="absolute left-5 top-4 text-meta text-slate-muted hover:text-slate">← Insights</Link>
        <div className="text-title font-extrabold tracking-[-0.03em] text-navy">
          {BRAND.wordmark}<span className="text-teal">.</span>
        </div>
        <h1 className="mt-1 text-h1 font-bold text-navy">{BRAND.product}</h1>
        <div
          data-qr
          className="mx-auto mt-7 aspect-square w-[min(72vw,280px)] rounded-card border border-lavender bg-white p-4 [&>svg]:h-full [&>svg]:w-full"
          role="img"
          aria-label={`QR code for ${host}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <a href={BRAND.publicUrl} className="mt-6 inline-block text-title font-semibold text-navy hover:text-teal-ink">{host}</a>
        <p className="mt-2 text-body text-slate">{'Scan to try it — type a thing and a price, like "$60 dinner".'}</p>
      </section>
    </div>
  )
}
