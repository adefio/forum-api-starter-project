import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import DOMPurify from 'dompurify';

export default function ThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, username: authUsername } = useAuth();
  
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get(`/threads/${threadId}`);
        setThread(data.data.detailThread);
        setError('');
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [threadId]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post(`/threads/${threadId}/comments`, { content: commentContent });
      setCommentContent('');
      // Reload thread
      const { data } = await api.get(`/threads/${threadId}`);
      setThread(data.data.detailThread);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-momentum-purple border-t-transparent"></div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-red-500">{error || 'Diskusi tidak ditemukan'}</p>
        <button onClick={() => navigate(-1)} className="rounded-lg bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-700">Kembali</button>
      </div>
    );
  }

  const { title, body, category, createdAt, owner, comments = [], upVotesBy = [] } = thread;
  const timeAgo = new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const [localUpvotes, setLocalUpvotes] = useState(upVotesBy);
  const isUpVoted = isAuthenticated && localUpvotes.includes(authUsername);

  const toggleUpvote = async () => {
    if (!isAuthenticated) {
      alert("Fitur interaktif membutuhkan login.");
      return;
    }
    
    if (isUpVoted) {
      setLocalUpvotes(localUpvotes.filter(u => u !== authUsername));
      api.post(`/threads/${threadId}/neutral-vote`).catch(() => setLocalUpvotes(localUpvotes));
    } else {
      setLocalUpvotes([...localUpvotes, authUsername]);
      api.post(`/threads/${threadId}/up-vote`).catch(() => setLocalUpvotes(localUpvotes.filter(u => u !== authUsername)));
    }
  };

  // Sanitasi konten HTML dari API (penting untuk keamanan)
  const cleanBody = DOMPurify.sanitize(body);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Tombol Kembali */}
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Kembali ke Diskusi
      </button>

      {/* Konten Utama Diskusi */}
      <article className="mb-8 rounded-2xl border border-slate-800 bg-momentum-panel p-6 shadow-xl lg:p-10">
        
        {/* Header Diskusi */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-momentum-purple/10 px-3 py-1 text-sm font-semibold text-momentum-purple border border-momentum-purple/20">
              #{category}
            </span>
            <span className="text-sm text-slate-500">{timeAgo}</span>
          </div>
          
          <h1 className="mb-6 font-display text-3xl font-bold text-slate-100 lg:text-4xl leading-tight">
            {title}
          </h1>

          <Link to={`/users/${owner.name}`} className="flex items-center gap-4 group w-fit">
            <img src={owner.avatar} alt={owner.name} className="h-12 w-12 rounded-full ring-2 ring-transparent group-hover:ring-momentum-purple transition-all" />
            <div>
              <p className="text-base font-bold text-slate-200 group-hover:text-momentum-purple transition-colors">{owner.name}</p>
              <p className="text-sm text-slate-500">Penulis</p>
            </div>
          </Link>
        </header>

        {/* Isi Diskusi (Body HTML) */}
        <div 
          className="prose prose-invert prose-lg max-w-none text-slate-300
                     prose-headings:text-slate-100 prose-a:text-momentum-purple hover:prose-a:text-momentum-pink
                     prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-slate-800
                     prose-code:text-momentum-pink prose-code:bg-slate-800/50 prose-code:px-1 prose-code:rounded
                     mb-10"
          dangerouslySetInnerHTML={{ __html: cleanBody }} 
        />

        {/* Bar Interaksi Bawah */}
        <div className="flex items-center gap-6 border-t border-slate-800/80 pt-6">
          <button onClick={toggleUpvote} className={`group flex items-center gap-2 transition-colors ${isUpVoted ? 'text-momentum-pink' : 'text-slate-400 hover:text-slate-200'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 transition-colors ${isUpVoted ? 'bg-momentum-pink/10' : 'group-hover:bg-slate-700'}`}>
              <svg className={`h-5 w-5 transition-transform group-active:scale-90 ${isUpVoted ? 'fill-momentum-pink' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isUpVoted ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold">{localUpvotes.length} Dukungan</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="font-bold">{comments.length} Jawaban</span>
          </div>
        </div>
      </article>

      {/* Bagian Komentar */}
      <section className="rounded-2xl border border-slate-800 bg-momentum-panel p-6 shadow-xl lg:p-10">
        <h3 className="mb-8 font-display text-xl font-bold text-slate-100">Jawaban & Diskusi ({comments.length})</h3>
        
        {/* Form Komentar Baru */}
        {isAuthenticated ? (
          <div className="mb-10 flex gap-4">
            <img src={`https://ui-avatars.com/api/?name=${authUsername}&background=334155&color=fff`} alt={authUsername} className="h-10 w-10 rounded-full" />
            <form onSubmit={handleComment} className="flex-1">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Tuliskan jawaban atau pandangan Anda..."
                className="mb-3 w-full resize-y rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-slate-200 placeholder:text-slate-500 focus:border-momentum-purple focus:outline-none focus:ring-1 focus:ring-momentum-purple min-h-[100px]"
              />
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitting || !commentContent.trim()}
                  className="rounded-lg bg-momentum-purple px-6 py-2.5 font-bold text-white shadow-lg shadow-momentum-purple/20 transition-all hover:bg-purple-600 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-10 rounded-xl border border-slate-700 border-dashed bg-slate-800/20 p-6 text-center">
            <p className="text-slate-400">
              Silakan <Link to="/login" className="font-bold text-momentum-purple hover:underline">Masuk</Link> untuk bergabung dalam diskusi ini.
            </p>
          </div>
        )}

        {/* Daftar Komentar */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 rounded-xl bg-slate-800/30 p-4">
              <Link to={`/users/${comment.owner.name}`}>
                <img src={comment.owner.avatar} alt={comment.owner.name} className="h-10 w-10 rounded-full" />
              </Link>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <Link to={`/users/${comment.owner.name}`} className="font-bold text-slate-200 hover:text-momentum-purple transition-colors">
                    {comment.owner.name}
                  </Link>
                  <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div 
                  className="prose prose-invert prose-sm max-w-none text-slate-300
                             prose-p:leading-relaxed prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-slate-800
                             prose-code:text-momentum-pink prose-code:bg-slate-800/50 prose-code:px-1 prose-code:rounded"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }} 
                />
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-slate-500 italic">Belum ada jawaban. Jadilah yang pertama memberikan solusi!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
