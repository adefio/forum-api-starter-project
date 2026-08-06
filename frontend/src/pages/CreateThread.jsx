import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';

export default function CreateThread() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        title,
        body,
        category: category || 'general',
      };
      
      await api.post('/threads', payload);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div className="rounded-2xl border border-slate-800 bg-momentum-panel shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-100">Buat Diskusi Baru</h1>
            <p className="text-sm text-slate-500 mt-1">Tanyakan sesuatu atau bagikan pengetahuan Anda dengan komunitas.</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-8">
          {error && <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">{error}</div>}

          <div className="mb-6">
            <label className="label">Judul Diskusi</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bagaimana cara mengatasi React useEffect infinite loop?"
              className="input text-lg font-bold"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Kategori (Tag)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Misal: react, javascript, debugging"
              className="input font-mono text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">Gunakan tag spesifik agar diskusi mudah ditemukan.</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-slate-300">Isi Diskusi</label>
              <span className="text-xs text-momentum-purple font-medium bg-momentum-purple/10 px-2 py-0.5 rounded">Mendukung HTML & Markdown</span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Jelaskan secara detail... (Bisa menggunakan tag HTML seperti <pre><code>...</code></pre> untuk blok kode)"
              rows={12}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-slate-200 placeholder:text-slate-500 focus:border-momentum-purple focus:outline-none focus:ring-1 focus:ring-momentum-purple font-mono text-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-800/50 pt-6">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Batal</button>
            <button type="submit" disabled={loading || !title.trim() || !body.trim()} className="btn-primary px-8">
              {loading ? 'Mempublikasikan...' : 'Publikasikan Diskusi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
