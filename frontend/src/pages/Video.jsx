export default function Video() {
  const dummyReels = [
    { id: 1, author: 'cherrieama', desc: 'Desain UI terbaru nih guys! #uiux #design', likes: '12k', comments: '342' },
    { id: 2, author: 'geniii_4', desc: 'Coding di kafe emang paling bener ☕', likes: '4.5k', comments: '120' },
    { id: 3, author: 'bagasanggri', desc: 'Momentum Dark Mode is here! 🚀', likes: '21k', comments: '1.2k' },
  ];

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center bg-momentum-dark py-10">
      <div className="w-full max-w-sm h-[80vh] flex snap-y snap-mandatory flex-col gap-10 overflow-y-auto no-scrollbar pb-20">
        {dummyReels.map((reel) => (
          <div key={reel.id} className="relative h-full min-h-[80vh] w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-slate-800 shadow-2xl">
            {/* Mock Video Container */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-slate-900">
              <svg className="h-20 w-20 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            
            {/* UI Overlay */}
            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src={`https://ui-avatars.com/api/?name=${reel.author}&background=random`} alt={reel.author} className="h-10 w-10 rounded-full border-2 border-white" />
                <span className="font-bold text-white shadow-sm">{reel.author}</span>
                <button className="ml-2 rounded-full border border-white/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">Ikuti</button>
              </div>
              <p className="text-sm text-white/90">{reel.desc}</p>
            </div>

            {/* Floating Actions */}
            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6">
              <button className="flex flex-col items-center gap-1 group focus:outline-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition group-active:scale-90">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <span className="text-xs font-bold text-white shadow-sm">{reel.likes}</span>
              </button>
              
              <button className="flex flex-col items-center gap-1 group focus:outline-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition group-active:scale-90">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <span className="text-xs font-bold text-white shadow-sm">{reel.comments}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group focus:outline-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition group-active:scale-90">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
