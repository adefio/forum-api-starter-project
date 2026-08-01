import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ThreadDetail from './pages/ThreadDetail'
import CreateThread from './pages/CreateThread'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-youth" />
      <div className="animate-blob absolute -left-24 top-[-8rem] h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl" />
      <div
        className="animate-blob absolute right-[-6rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/25 blur-3xl"
        style={{ animationDelay: '-4s' }}
      />
      <div
        className="animate-blob absolute bottom-[-10rem] left-1/4 h-96 w-96 rounded-full bg-rose-300/25 blur-3xl"
        style={{ animationDelay: '-8s' }}
      />
    </div>
  )
}

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Background />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pb-20 sm:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/threads/:threadId" element={<ThreadDetail />} />
            <Route path="/users/:username" element={<Profile />} />
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
        <footer className="hidden border-t border-white/40 bg-white/40 py-8 text-center text-sm text-slate-500 backdrop-blur sm:block">
          <p className="font-display text-lg font-bold text-slate-700">
            💻 Informatika<span className="gradient-text">Talk</span>
          </p>
          <p className="mt-1">
            Forum diskusi mahasiswa Teknik Informatika — belajar bareng, ngoding bareng. 🚀
          </p>
        </footer>
        <BottomNav />
      </div>
    </div>
  )
}
