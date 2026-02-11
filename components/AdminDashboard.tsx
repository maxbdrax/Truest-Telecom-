
import React, { useState } from 'react';
import { User, ServiceStatus, Transaction, ChatMessage, AppSettings, Offer } from '../types';
import { Users, CheckCircle, XCircle, Clock, Smartphone, LogOut, Settings, Edit3, Image, CreditCard, Plus, Trash2, Tag, ChevronRight, Send, Lock, User as UserIcon, Database, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ExtendedChatMessage } from '../App';

interface Props {
  user: User;
  users: User[];
  services: ServiceStatus[];
  settings: AppSettings;
  offers: Offer[];
  onManageOffers: (action: 'ADD' | 'DELETE', offer?: Offer) => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onToggleService: (id: string) => void;
  onLogout: () => void;
  transactions: Transaction[];
  onUpdateTransaction: (txId: string, status: 'SUCCESS' | 'FAILED') => void;
  chatMessages: ExtendedChatMessage[];
  onAdminReply: (text: string, isAdmin: boolean, recipientId?: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ user, users, services, settings, offers, onManageOffers, onUpdateSettings, onUpdateUser, onToggleService, onLogout, transactions, onUpdateTransaction, chatMessages, onAdminReply }) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'REQUESTS' | 'USERS' | 'OFFERS' | 'CHAT' | 'DATABASE' | 'SETTINGS'>('STATS');
  
  const permissionFixSql = `-- ১. পাবলিক স্কিমার পারমিশন এক্সেস প্রদান করা
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ২. সুপাবেজ স্কিমা রিফ্রেশ
NOTIFY pgrst, 'reload schema';`;

  const fullResetSql = `-- সতর্কবার্তা: এটি সব ডাটা মুছে ফেলবে!
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "payPassword" TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  balance NUMERIC DEFAULT 0,
  "driveBalance" NUMERIC DEFAULT 0,
  "isBlocked" BOOLEAN DEFAULT false
);

INSERT INTO users (id, name, phone, "password", "payPassword", role, balance)
VALUES ('admin_master', 'Master Admin', '01987624041', '225588', '225588', 'ADMIN', 999999);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("কোড কপি হয়েছে! সুপাবেজে রান করুন।");
  };

  const pendingTransactions = transactions.filter(t => t.status === 'PENDING');

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden h-full">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white">
            <Settings size={18} />
          </div>
          <h1 className="text-lg font-black text-gray-800 tracking-tight">অ্যাডমিন প্যানেল</h1>
        </div>
        <button onClick={onLogout} className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all">
          <LogOut size={20} />
        </button>
      </header>

      <div className="bg-white flex border-b overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'STATS', label: 'Stats', icon: <Smartphone size={14}/> },
          { id: 'REQUESTS', label: `Req (${pendingTransactions.length})`, icon: <Clock size={14}/> },
          { id: 'USERS', label: 'Users', icon: <Users size={14}/> },
          { id: 'OFFERS', label: 'Offers', icon: <Tag size={14}/> },
          { id: 'DATABASE', label: 'Fix Access', icon: <ShieldCheck size={14}/> },
          { id: 'SETTINGS', label: 'Settings', icon: <Settings size={14}/> },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 whitespace-nowrap px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-blue-900 border-b-4 border-blue-900 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 bg-gray-50/50">
        {activeTab === 'DATABASE' && (
          <div className="p-6 space-y-6">
             <div className="bg-white p-6 rounded-[32px] shadow-lg border border-green-100">
                <h3 className="text-lg font-black text-green-700 mb-2">১. পারমিশন ফিক্স (Permission Fix)</h3>
                <p className="text-xs font-bold text-gray-500 mb-4">যদি 'Permission Denied for schema public' এরর আসে তবে এটি রান করুন।</p>
                <div className="bg-gray-900 p-4 rounded-2xl mb-4 overflow-hidden">
                   <pre className="text-[9px] text-green-400 overflow-x-auto no-scrollbar">{permissionFixSql}</pre>
                </div>
                <button onClick={() => copyToClipboard(permissionFixSql)} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                   <Copy size={16}/> পারমিশন কোড কপি করুন
                </button>
             </div>

             <div className="bg-white p-6 rounded-[32px] shadow-lg border border-red-100">
                <h3 className="text-lg font-black text-red-700 mb-2">২. সম্পূর্ণ রিসেট (Full Reset)</h3>
                <p className="text-xs font-bold text-gray-500 mb-4">যদি ডাটাবেস একদমই কাজ না করে তবে এটি রান করুন (সব ডাটা মুছে যাবে)।</p>
                <button onClick={() => copyToClipboard(fullResetSql)} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                   <AlertTriangle size={16}/> ফুল রিসেট কোড কপি করুন
                </button>
             </div>
          </div>
        )}

        {activeTab === 'STATS' && (
          <div className="p-6 grid grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[32px] text-white shadow-xl">
                <p className="text-[10px] font-bold opacity-70 uppercase mb-1">মোট ইউজার</p>
                <p className="text-3xl font-black">{users.length}</p>
             </div>
             <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[32px] text-white shadow-xl">
                <p className="text-[10px] font-bold opacity-70 uppercase mb-1">পেন্ডিং অনুরোধ</p>
                <p className="text-3xl font-black">{pendingTransactions.length}</p>
             </div>
          </div>
        )}
        
        {/* Remaining Tab Contents (REQUESTS, USERS, etc.) */}
      </div>
    </div>
  );
};

export default AdminDashboard;
