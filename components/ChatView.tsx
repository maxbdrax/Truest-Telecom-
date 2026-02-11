
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Headphones } from 'lucide-react';
import { ChatMessage, User } from '../types';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  user: User;
}

const ChatView: React.FC<Props> = ({ messages, onSendMessage, user }) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleBack = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full">
      <header className="p-4 bg-blue-900 text-white flex items-center shadow-lg sticky top-0 z-10">
        <button onClick={handleBack} className="mr-4 hover:bg-white/10 p-2 rounded-full transition-colors">
          <ChevronLeft />
        </button>
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Headphones size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold">হেল্পলাইন (Admin)</h1>
            <p className="text-[10px] text-blue-200">সকাল ১০টা - রাত ১০টা</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
             <div className="mb-2 text-blue-900 opacity-20 flex justify-center"><Headphones size={48} /></div>
             <p className="text-sm font-medium">আমরা আপনার মেসেজের অপেক্ষায় আছি।<br/>কিভাবে আপনাকে সাহায্য করতে পারি?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                msg.isAdmin 
                ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                : 'bg-blue-900 text-white rounded-tr-none shadow-blue-900/20'
              }`}>
                {msg.text}
                <div className={`text-[8px] mt-1 opacity-60 ${msg.isAdmin ? 'text-gray-400' : 'text-blue-100'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t flex items-center space-x-2 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="আপনার মেসেজ লিখুন..."
          className="flex-1 p-4 rounded-full bg-gray-100 border-none outline-none focus:ring-2 focus:ring-blue-900 transition-all text-sm text-blue-900 font-bold"
        />
        <button 
          onClick={handleSend}
          className="bg-blue-900 text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
