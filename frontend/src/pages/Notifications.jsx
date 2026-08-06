import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [filter, setFilter] = useState('Semua');
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'like', user: 'lyshandraa', action: 'menyukai postingan Anda', target: '"Cara belajar React yang efektif"', time: '2j', read: false, icon: '❤️', iconColor: 'text-momentum-pink' },
    { id: 2, type: 'comment', user: 'geniii_4', action: 'mengomentari diskusi Anda', target: '"Error saat setup TailwindCSS"', time: '4j', read: false, icon: '💬', iconColor: 'text-momentum-purple' },
    { id: 3, type: 'follow', user: 'bagasanggri', action: 'mulai mengikuti Anda', target: '', time: 'Kemarin', read: true, icon: '👤', iconColor: 'text-blue-400' },
    { id: 4, type: 'mention', user: 'lisan_29', action: 'menyebut Anda dalam komentar', target: '"Rekomendasi laptop untuk ngoding"', time: 'Kemarin', read: true, icon: '✨', iconColor: 'text-yellow-400' },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifs = filter === 'Semua' 
    ? notifications 
    : notifications.filter(n => {
        if (filter === 'Suka') return n.type === 'like';
        if (filter === 'Komentar') return n.type === 'comment' || n.type === 'mention';
        return true;
      });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:px-8 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-slate-100">Notifikasi</h2>
        <button onClick={markAllAsRead} className="text-sm font-semibold text-momentum-purple hover:text-momentum-pink transition-colors">
          Tandai semua dibaca
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['Semua', 'Suka', 'Komentar'].map(tab => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all ${
              filter === tab 
                ? 'bg-momentum-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-momentum-panel text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-800/80 bg-momentum-panel overflow-hidden shadow-xl">
        {filteredNotifs.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {filteredNotifs.map(notif => (
              <div 
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`flex items-start gap-4 p-5 transition-colors cursor-pointer hover:bg-slate-800/50 ${notif.read ? 'opacity-70' : 'bg-momentum-purple/5'}`}
              >
                <div className="relative">
                  <img src={`https://ui-avatars.com/api/?name=${notif.user}&background=random`} alt={notif.user} className="h-12 w-12 rounded-full" />
                  <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-slate-900 text-[10px] ${notif.iconColor}`}>
                    {notif.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-slate-300">
                    <Link to={`/users/${notif.user}`} className="font-bold text-slate-100 hover:underline mr-1">{notif.user}</Link>
                    {notif.action}
                    {notif.target && <span className="font-semibold text-momentum-purple ml-1">{notif.target}</span>}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{notif.time}</p>
                </div>

                {!notif.read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-momentum-pink mt-2 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-slate-800 p-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-slate-300">Belum ada notifikasi</h3>
            <p className="text-sm text-slate-500">Notifikasi baru akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
