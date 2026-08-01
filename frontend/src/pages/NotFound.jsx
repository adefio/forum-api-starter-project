import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <p className="animate-float text-7xl">🧭</p>
      <p className="font-display mt-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-6xl font-extrabold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-slate-500">
        Kayaknya kamu nyasar, bro! Halaman yang kamu cari mungkin sudah dipindah atau tidak tersedia.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Kembali ke beranda
      </Link>
    </div>
  )
}
