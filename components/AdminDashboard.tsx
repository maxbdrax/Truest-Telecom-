
import React, { useState } from 'react';
import { User, ServiceStatus, Transaction, ChatMessage, AppSettings, Offer } from '../types';
import { Users, CheckCircle, XCircle, Clock, Smartphone, LogOut, Settings, Edit3, Image, CreditCard, Plus, Trash2, Tag, ChevronRight, Send, Lock, User as UserIcon, Database, Copy, AlertTriangle, ShieldCheck, Phone } from 'lucide-react';
import { ExtendedChatMessage } from '../App';
import { OPERATORS } from '../constants';

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
  const [activeTab, setActiveTab] = useState<'STATS' | 'REQUESTS' | 'USERS' | 'OFFERS' | 'DATABASE' | 'SETTINGS'>('STATS');
  
  // Settings State
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  
  // Offer Add State
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    type: 'DRIVE',
    operator: 'gp',
    title: '',
    price: 0,
    regularPrice: 0,
    validity: '৩০ দিন'
  });

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.price) return;
    onManageOffers('ADD', {
      ...newOffer,
      id: Math.random().toString(36).substr(2, 9)
    } as Offer);
    setNewOffer({ ...newOffer, title: '', price: 0, regularPrice: 0 });
    alert("অফার যোগ করা হয়েছে!");
  };

  const handleSaveSettings = () => {
    onUpdateSettings(tempSettings);
    alert("সেটিংস আপডেট করা হয়েছে!");
  };

  const permissionFixSql = `-- ১. পাবলিক স্কিমার পারমিশন তালা খুলে দেওয়া
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("কোড কপি হয়েছে!");
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
          { id: 'SETTINGS', label: 'Settings', icon: <Settings size={14}/> },
          { id: 'DATABASE', label: 'DB Fix', icon: <ShieldCheck size={14}/> },
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

      <div className="flex-1 overflow-y-auto pb-24 bg-gray-50/50">
        
        {/* Settings Tab */}
        {activeTab === 'SETTINGS' && (
          <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-900" size={20} /> পেমেন্ট নাম্বার পরিবর্তন
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">বিকাশ নাম্বার (Bkash)</label>
                  <input 
                    type="text" 
                    value={tempSettings.bkashNumber} 
                    onChange={e => setTempSettings({...tempSettings, bkashNumber: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border outline-none font-bold text-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">নগদ নাম্বার (Nagad)</label>
                  <input 
                    type="text" 
                    value={tempSettings.nagadNumber} 
                    onChange={e => setTempSettings({...tempSettings, nagadNumber: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border outline-none font-bold text-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">রকেট নাম্বার (Rocket)</label>
                  <input 
                    type="text" 
                    value={tempSettings.rocketNumber} 
                    onChange={e => setTempSettings({...tempSettings, rocketNumber: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 border outline-none font-bold text-gray-700" 
                  />
                </div>
                
                <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4"
                >
                  আপডেট সেভ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'OFFERS' && (
          <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6">নতুন অফার এড করুন</h3>
              <form onSubmit={handleAddOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">টাইপ</label>
                    <select 
                      value={newOffer.type} 
                      onChange={e => setNewOffer({...newOffer, type: e.target.value as any})}
                      className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-xs"
                    >
                      <option value="DRIVE">ড্রাইভ প্যাক</option>
                      <option value="REGULAR">রেগুলার প্যাক</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">অপারেটর</label>
                    <select 
                      value={newOffer.operator} 
                      onChange={e => setNewOffer({...newOffer, operator: e.target.value})}
                      className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-xs"
                    >
                      {OPERATORS.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">অফার নাম (যেমন: ৩০ জিবি + ৭০০ মিনিট)</label>
                  <input 
                    type="text" 
                    value={newOffer.title} 
                    onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                    className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">অফার মূল্য</label>
                    <input 
                      type="number" 
                      value={newOffer.price || ''} 
                      onChange={e => setNewOffer({...newOffer, price: parseFloat(e.target.value)})}
                      className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">রেগুলার মূল্য</label>
                    <input 
                      type="number" 
                      value={newOffer.regularPrice || ''} 
                      onChange={e => setNewOffer({...newOffer, regularPrice: parseFloat(e.target.value)})}
                      className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">মেয়াদ</label>
                    <input 
                      type="text" 
                      value={newOffer.validity} 
                      onChange={e => setNewOffer({...newOffer, validity: e.target.value})}
                      className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-xs"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Plus size={16}/> এড করুন
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-800 px-2 uppercase tracking-widest">বর্তমান অফারসমূহ ({offers.length})</h3>
              {offers.map(offer => (
                <div key={offer.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[10px] ${OPERATORS.find(o => o.id === offer.operator)?.color || 'bg-gray-400'}`}>
                         {offer.operator.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-800">{offer.title}</p>
                        <p className="text-[9px] text-gray-400 font-bold">{offer.type} | {offer.validity}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black text-blue-900">৳{offer.price}</p>
                        <p className="text-[9px] text-gray-300 font-bold line-through">৳{offer.regularPrice}</p>
                      </div>
                      <button onClick={() => onManageOffers('DELETE', offer)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DATABASE' && (
          <div className="p-6 space-y-6">
             <div className="bg-white p-6 rounded-[32px] shadow-lg border border-green-100">
                <div className="flex items-center space-x-3 mb-4">
                  <ShieldCheck className="text-green-600" size={24} />
                  <h3 className="text-lg font-black text-green-700">পারমিশন ঠিক করুন (GRANT SQL)</h3>
                </div>
                <p className="text-[11px] font-bold text-gray-500 mb-4 leading-relaxed">আপনার যদি 'Permission Denied' এরর আসে তবে এই কোডটি কপি করে সুপাবেজে রান করুন। এটি ডাটা মুছে দিবে না।</p>
                <div className="bg-gray-900 p-4 rounded-2xl mb-4 overflow-hidden border-2 border-gray-800 shadow-inner">
                   <pre className="text-[9px] text-green-400 overflow-x-auto no-scrollbar font-mono leading-relaxed">{permissionFixSql}</pre>
                </div>
                <button onClick={() => copyToClipboard(permissionFixSql)} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                   <Copy size={16}/> GRANT SQL কপি করুন
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

        {activeTab === 'REQUESTS' && (
          <div className="p-4 space-y-4">
            {pendingTransactions.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-bold uppercase text-[10px]">কোনো নতুন অনুরোধ নেই</div>
            ) : (
              pendingTransactions.map(tx => (
                <div key={tx.id} className="bg-white p-6 rounded-[32px] border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-black text-blue-900 uppercase">{tx.type}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-2xl font-black text-gray-800">৳ {tx.amount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">{tx.details}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => onUpdateTransaction(tx.id, 'SUCCESS')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Approve</button>
                    <button onClick={() => onUpdateTransaction(tx.id, 'FAILED')} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'USERS' && (
          <div className="p-4 space-y-3">
             {users.map(u => (
               <div key={u.id} className="bg-white p-5 rounded-[24px] border border-gray-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 font-black uppercase text-xs">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{u.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{u.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-900">৳{u.balance}</p>
                    <p className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{u.role}</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
