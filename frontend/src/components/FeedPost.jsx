import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import DOMPurify from 'dompurify';

export default function FeedPost({ thread }) {
  const { isAuthenticated, username: authUsername } = useAuth();
  
  if (!thread) return null;

  const {
    id,
    title,
    body,
    category,
    createdAt,
    upVotesBy = [],
    downVotesBy = [],
    totalComments = 0,
    username,
  } = thread;

  const [localUpvotes, setLocalUpvotes] = useState(upVotesBy);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const isUpVoted = isAuthenticated && localUpvotes.includes(authUsername);
  
  // Calculate relative time like Instagram (e.g. 2j)
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}d`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}j`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}h`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}mgg`;
  };
  
  const timeAgo = getRelativeTime(createdAt);

  const toggleUpvote = async () => {
    if (!isAuthenticated) {
      alert("Fitur interaktif membutuhkan login.");
      return;
    }
    
    // Optimistic Update
    if (isUpVoted) {
      setLocalUpvotes(localUpvotes.filter(u => u !== authUsername));
      api.post(`/threads/${id}/neutral-vote`).catch(() => setLocalUpvotes(localUpvotes));
    } else {
      setLocalUpvotes([...localUpvotes, authUsername]);
      api.post(`/threads/${id}/up-vote`).catch(() => setLocalUpvotes(localUpvotes.filter(u => u !== authUsername)));
    }
  };

  const toggleBookmark = () => setIsBookmarked(!isBookmarked);

  // Snippet body
  const extractTextSnippet = (htmlString) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = DOMPurify.sanitize(htmlString);
    return tmp.textContent || tmp.innerText || '';
  };
  const textSnippet = extractTextSnippet(body);

  return (
    <article className="mx-auto mb-8 w-full max-w-[600px] rounded-xl border border-slate-800/80 bg-momentum-darker/60 backdrop-blur-sm overflow-hidden shadow-2xl transition-all hover:border-slate-700">
      {/* Header Post */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/users/${username}`} className="flex items-center gap-3 group">
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${username}&background=random`} 
              alt={username} 
              className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent transition group-hover:ring-momentum-purple" 
            />
            {/* Story Ring Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-momentum-pink opacity-0 group-hover:opacity-100 transition-opacity scale-110"></div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 group-hover:text-momentum-purple transition-colors">
              {username}
            </p>
            <p className="text-xs text-slate-500">
              <span className="text-momentum-purple/80 hover:text-momentum-purple">#{category}</span> • {timeAgo}
            </p>
          </div>
        </Link>
        <button className="text-slate-500 hover:text-slate-300 transition-colors p-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      {/* Media Gambar (Auto Generated via Picsum berdasarkan ID Post) */}
      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden group">
        <img 
          src={`https://picsum.photos/seed/${id}/800/800`} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay Double Click to Like (Visual Only) */}
        <div onDoubleClick={toggleUpvote} className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 transition-opacity cursor-pointer z-10 bg-black/20">
        </div>
      </div>

      {/* Footer / Interaction Bar */}
      <div className="px-4 pt-4 pb-4">
        {/* Ikon Aksi */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button onClick={toggleUpvote} className={`group transition-transform active:scale-90 ${isUpVoted ? 'text-momentum-pink' : 'text-slate-100 hover:text-slate-300'}`}>
              <svg className={`h-7 w-7 ${isUpVoted ? 'fill-momentum-pink' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isUpVoted ? 0 : 1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {/* Comment */}
            <Link to={`/threads/${id}`} className="group transition-transform active:scale-90 text-slate-100 hover:text-slate-300">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            {/* Share */}
            <button className="group transition-transform active:scale-90 text-slate-100 hover:text-slate-300">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          {/* Bookmark */}
          <button onClick={toggleBookmark} className={`group transition-transform active:scale-90 ${isBookmarked ? 'text-white' : 'text-slate-100 hover:text-slate-300'}`}>
            <svg className={`h-7 w-7 ${isBookmarked ? 'fill-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isBookmarked ? 0 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Likes Count */}
        <p className="mb-2 text-sm font-bold text-slate-100">
          {localUpvotes.length.toLocaleString()} Suka
        </p>

        {/* Caption */}
        <div className="mb-2 text-sm text-slate-200">
          <Link to={`/users/${username}`} className="font-bold hover:underline mr-2">{username}</Link>
          <span className="font-medium">{title}</span>
          <p className="mt-1 line-clamp-2 text-slate-400">{textSnippet}</p>
        </div>

        {/* Comments Link */}
        {totalComments > 0 && (
          <Link to={`/threads/${id}`} className="text-sm font-medium text-slate-500 hover:text-slate-400 transition-colors">
            Lihat semua {totalComments} komentar
          </Link>
        )}
      </div>
    </article>
  );
}
