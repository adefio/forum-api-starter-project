export default function FloatingMessage() {
  const quickContacts = ['zhan_cbf', 'rafinur_z', 'nadyaputri_id'];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Quick Contacts */}
      <div className="hidden items-center gap-2 rounded-full border border-slate-700/50 bg-momentum-panel/80 p-2 pr-4 shadow-lg backdrop-blur lg:flex">
        <div className="flex -space-x-2">
          {quickContacts.map((contact, idx) => (
            <img
              key={idx}
              className="h-8 w-8 rounded-full border-2 border-momentum-panel"
              src={`https://ui-avatars.com/api/?name=${contact}&background=random`}
              alt={contact}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-slate-300">Cepat Hubungi</span>
      </div>

      {/* Floating Button */}
      <button className="flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-momentum-purple to-momentum-blue px-6 text-white shadow-xl shadow-momentum-purple/20 transition-transform hover:scale-105">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span className="font-bold">Pesan</span>
        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
