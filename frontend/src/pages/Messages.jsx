import { useState } from 'react';

export default function Messages() {
  const [activeChat, setActiveChat] = useState(1);
  const [inputValue, setInputValue] = useState('');
  
  // State obrolan
  const [dummyChats, setDummyChats] = useState([
    { id: 1, name: 'cherrieama', lastMsg: 'Mantap banget bro!', time: '12m', unread: true },
    { id: 2, name: 'geniii_4', lastMsg: 'Gimana progress project kemarin?', time: '1j', unread: false },
    { id: 3, name: 'lisan_29', lastMsg: 'Sent an attachment', time: '5j', unread: false },
  ]);

  // State untuk detail riwayat pesan per user
  const [messagesData, setMessagesData] = useState({
    1: [
      { id: 101, sender: 'cherrieama', text: 'Halo! Kapan kita mulai ngerjain tugasnya?', isMe: false, time: '10:00' },
      { id: 102, sender: 'me', text: 'Mungkin nanti malam aja, nunggu si Budi online.', isMe: true, time: '10:05' },
      { id: 103, sender: 'cherrieama', text: 'Oke deh. Mantap banget bro!', isMe: false, time: '10:12' },
    ],
    2: [
      { id: 201, sender: 'geniii_4', text: 'Gimana progress project kemarin?', isMe: false, time: 'Kemarin' },
    ],
    3: [
      { id: 301, sender: 'lisan_29', text: 'Tolong review pr ini ya', isMe: false, time: 'Selasa' },
      { id: 302, sender: 'lisan_29', text: 'Sent an attachment', isMe: false, time: 'Selasa' },
    ]
  });

  const activeChatDetails = dummyChats.find(c => c.id === activeChat);
  const currentMessages = messagesData[activeChat] || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputValue,
      isMe: true,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    // Tambah ke riwayat
    setMessagesData({
      ...messagesData,
      [activeChat]: [...currentMessages, newMessage]
    });

    // Update lastMsg di sidebar
    setDummyChats(dummyChats.map(chat => 
      chat.id === activeChat 
        ? { ...chat, lastMsg: inputValue, time: 'Baru saja', unread: false } 
        : chat
    ));

    setInputValue('');
  };

  const handleSelectChat = (id) => {
    setActiveChat(id);
    // Hilangkan unread badge
    setDummyChats(dummyChats.map(chat => 
      chat.id === id ? { ...chat, unread: false } : chat
    ));
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col md:flex-row bg-momentum-dark text-slate-200">
      {/* Sidebar Chat List */}
      <div className="w-full md:w-80 border-r border-slate-800/50 bg-momentum-darker/50 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Pesan</h2>
          <button className="text-slate-300 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        
        <div className="p-4">
          <input 
            type="search" 
            placeholder="Cari pesan..." 
            className="w-full rounded-xl border border-slate-700 bg-momentum-darker py-2 px-4 text-sm focus:border-momentum-purple focus:outline-none focus:ring-1 focus:ring-momentum-purple transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {dummyChats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => handleSelectChat(chat.id)}
              className={`flex cursor-pointer items-center gap-3 p-4 transition-colors ${activeChat === chat.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
            >
              <div className="relative">
                <img src={`https://ui-avatars.com/api/?name=${chat.name}&background=random`} alt={chat.name} className="h-12 w-12 rounded-full" />
                {chat.unread && <div className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-momentum-darker bg-momentum-pink"></div>}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className={`text-sm truncate ${chat.unread || activeChat === chat.id ? 'font-bold text-slate-100' : 'text-slate-300'}`}>{chat.name}</p>
                <p className={`text-xs truncate ${chat.unread ? 'font-semibold text-slate-300' : 'text-slate-500'}`}>{chat.lastMsg}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-500">{chat.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-momentum-dark relative">
        {/* Chat Header */}
        {activeChatDetails ? (
          <>
            <div className="border-b border-slate-800/50 bg-momentum-darker/80 p-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${activeChatDetails.name}&background=random`} alt={activeChatDetails.name} className="h-10 w-10 rounded-full" />
                <div>
                  <h3 className="font-bold text-slate-100">{activeChatDetails.name}</h3>
                  <p className="text-xs text-momentum-purple font-medium">Online</p>
                </div>
              </div>
              <div className="flex gap-4 text-slate-400">
                <button className="hover:text-slate-200 transition-colors"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></button>
                <button className="hover:text-slate-200 transition-colors"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                <button className="hover:text-slate-200 transition-colors"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isMe ? 'bg-momentum-purple text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-purple-200' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-momentum-darker/50 border-t border-slate-800/50">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <button type="button" className="absolute left-3 text-slate-400 hover:text-momentum-purple transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="w-full rounded-full border border-slate-700 bg-slate-800 py-3 pl-12 pr-16 text-sm text-slate-200 focus:border-momentum-purple focus:outline-none focus:ring-1 focus:ring-momentum-purple"
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim()}
                  className="absolute right-2 p-2 text-momentum-purple disabled:opacity-50 hover:text-momentum-pink transition-colors"
                >
                  <svg className="h-6 w-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
             <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-700">
              <svg className="h-12 w-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-100">Pesan Anda</h2>
            <p className="mt-2 text-sm text-slate-500">Kirim pesan privat dan tautan ke teman atau grup.</p>
          </div>
        )}
      </div>
    </div>
  );
}
