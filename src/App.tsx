import { Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/screens/Shell'
import { Home } from '@/screens/Home'
import { Answer } from '@/screens/Answer'
import { Goals } from '@/screens/Goals'
import { CardGallery } from '@/screens/CardGallery'
import { Toaster } from '@/components/ui/sonner'

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
