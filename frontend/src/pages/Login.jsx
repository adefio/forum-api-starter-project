import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/api'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'
  const justRegistered = Boolean(location.state?.registered)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal masuk, silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-indigo-200/50 backdrop-blur">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-10 text-center text-white">
          <span className="animate-float mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-sm backdrop-blur">
            💻
          </span>
          <h1 className="font-display mt-4 text-2xl font-extrabold">Selamat datang kembali</h1>
          <p className="mt-1 text-sm text-indigo-100">Masuk untuk mengikuti diskusi InformatikaTalk</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6">
              <Alert>{error}</Alert>
            </div>
          )}

          {justRegistered && (
            <div className="mb-6">
              <Alert type="success">Pendaftaran berhasil! Silakan masuk dengan akun barumu.</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
                className="input"
                placeholder="contoh: budi_informatika"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Spinner size="sm" />}
              {loading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
