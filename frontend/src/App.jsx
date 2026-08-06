import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'
import FloatingMessage from './components/FloatingMessage'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ThreadDetail from './pages/ThreadDetail'
import CreateThread from './pages/CreateThread'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Video from './pages/Video'
import NotFound from './pages/NotFound'
export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-momentum-darker text-slate-200">
      {/* Kiri: Sidebar Navigasi Utama */}
      <Sidebar />

      {/* Tengah: Umpan Konten Utama (Scrollable) */}
      <main className="flex-1 overflow-y-auto border-x border-slate-800/50 bg-momentum-dark relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/threads/:threadId" element={<ThreadDetail />} />
          <Route path="/users/:username" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/video" element={<Video />} />
          <Route
            path="/threads/new"
            element={
              <ProtectedRoute>
                <CreateThread />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Kanan: Sidebar Jelajahi & Profil (Desktop only) */}
      <RightSidebar />

      {/* Pesan Mengambang di Kanan Bawah */}
      <FloatingMessage />
    </div>
  )
}
