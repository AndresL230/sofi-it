import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/screens/Shell'
import { Home } from '@/screens/Home'
import { Answer } from '@/screens/Answer'
import { Goals } from '@/screens/Goals'
import { CardGallery } from '@/screens/CardGallery'
import { Toaster } from '@/components/ui/sonner'

/** Lazy so the `qrcode` library only ships with the /qr chunk, not the main bundle. */
const SharePage = lazy(() => import('@/screens/SharePage'))

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="answer" element={<Answer />} />
          <Route path="goals" element={<Goals />} />
          <Route path="gallery" element={<CardGallery />} />
        </Route>
        <Route path="share" element={<Suspense fallback={null}><SharePage /></Suspense>} />
        <Route path="qr" element={<Navigate to="/share" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
