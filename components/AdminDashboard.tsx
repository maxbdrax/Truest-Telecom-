
import React, { useState } from 'react';
import { User, UserRole, ServiceStatus, Transaction, ChatMessage, AppSettings, Offer, Tutorial } from '../types';
import { Users, CheckCircle, XCircle, Clock, Smartphone, LogOut, Settings, Edit3, Image, CreditCard, Plus, Trash2, Tag, ChevronRight, Send, Lock, User as UserIcon, Database, Copy, AlertTriangle, ShieldCheck, Phone, MessageSquare, PlayCircle, ToggleLeft, ToggleRight, UserPlus, ShieldCheck as Shield, Banknote, Video, History, Save } from 'lucide-react';
import { OPERATORS, SERVICES } from '../constants';

interface Props {
  user: User;
  users: User[];
  services: ServiceStatus[];
  settings: AppSettings;
  offers: Offer[];
  tutorials: Tutorial[];
  onManageOffers: (action: 'ADD' | 'DELETE', offer?: Offer) => void;
  onManageTutorials: (action: 'ADD' | 'DELETE', tutorial?: Tutorial) => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onToggleService: (id: string, isActive: boolean) => void;
  onLogout: () => void;
  transactions: Transaction[];
  onUpdateTransaction: (txId: string, status: 'SUCCESS' | 'FAILED') => void;
  chatMessages: ChatMessage[];
  onAdminReply: (text: string, recipientId: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ user, users, services, settings, offers, tutorials, onManageOffers, onManageTutorials, onUpdateSettings, onUpdateUser, onToggleService, onLogout, transactions, onUpdateTransaction, chatMessages, onAdminReply }) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'REQUESTS' | 'USERS' | 'OFFERS' | 'DATABASE' | 'SETTINGS' | 'MESSAGES' | 'SERVICES' | 'TUTORIALS' | 'HISTORY'>('STATS');
  
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    type: 'DRIVE',
    operator: 'gp',
    title: '',
    price: 0,
    regularPrice: 0,
    validity: '৩০ দিন'
  });

  const [newTutorial, setNewTutorial] = useState({ title: '', videoUrl: '' });
  
  // Settings State
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.price) return;
    onManageOffers('ADD', {
      ...newOffer,
      id: 'OFF' + Math.floor(Math.random() * 1000000)
    } as Offer);
    setNewOffer({ ...newOffer, title: '', price: 0, regularPrice: 0 });
    alert("অফার সফলভাবে যোগ করা হয়েছে!");
  };

  const handleAddTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorial.title || !newTutorial.videoUrl) return;
    onManageTutorials('ADD', {
      ...newTutorial,
      id: 'TUT' + Math.floor(Math.random() * 1000000)
    });
    setNewTutorial({ title: '', videoUrl: '' });
    alert("টিউটোরিয়াল সফলভাবে যোগ করা হয়েছে!");
  };

  const handleSaveSettings = () => {
    onUpdateSettings(tempSettings);
    alert("সেটিংস সফলভাবে আপডেট করা হয়েছে!");
  };

  const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
  const otherTransactions = transactions.filter(t => t.status !== 'PENDING');

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden h-full">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black">TM</div>
          <h1 className="text-lg font-black text-gray-800 tracking-tight">Admin Portal</h1>
        </div>
        <button onClick={onLogout} className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all">
          <LogOut size={20} />
        </button>
      </header>

      <div className="bg-white flex border-b overflow-x-auto no-scrollbar">
        {[
          { id: 'STATS', label: 'Stats', icon: <Smartphone size={14}/> },
          { id: 'REQUESTS', label: `Pending (${pendingTransactions.length})`, icon: <Clock size={14}/> },
          { id: 'HISTORY', label: 'History', icon: <History size={14}/> },
          { id: 'SETTINGS', label: 'Settings', icon: <Settings size={14}/> },
          { id: 'SERVICES', label: 'Services', icon: <ToggleRight size={14}/> },
          { id: 'OFFERS', label: 'Offers', icon: <Tag size={14}/> },
          { id: 'TUTORIALS', label: 'Videos', icon: <Video size={14}/> },
          { id: 'USERS', label: 'Users', icon: <Users size={14}/> },
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

      <div className="flex-1 overflow-y-auto pb-24">
        
        {activeTab === 'STATS' && (
          <div className="p-6 grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-[32px] shadow-sm border">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-3xl font-black text-blue-900">{users.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[32px] shadow-sm border">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Req</p>
                <p className="text-3xl font-black text-orange-500">{pendingTransactions.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[32px] shadow-sm border">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Offers</p>
                <p className="text-3xl font-black text-pink-600">{offers.length}</p>
             </div>
             <div className="bg-white p-6 rounded-[32px] shadow-sm border">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Services</p>
                <p className="text-3xl font-black text-emerald-600">{services.length}</p>
             </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="p-6 space-y-6">
            <div className="bg-white p-8 rounded-[45px] shadow-sm border space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-900 text-white">
                  <Settings size={20} />
                </div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">পেমেন্ট নাম্বার সেটিংস</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                    <Smartphone size={12} /> bKash Number (Personal/Agent)
                  </label>
                  <input 
                    type="tel" 
                    value={tempSettings.bkashNumber} 
                    onChange={e => setTempSettings({...tempSettings, bkashNumber: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-pink-50 border-2 border-pink-100 focus:border-pink-500 font-bold text-black outline-none transition-all" 
                    placeholder="বিকাশ নাম্বার দিন"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                    <Smartphone size={12} /> Nagad Number (Personal/Agent)
                  </label>
                  <input 
                    type="tel" 
                    value={tempSettings.nagadNumber} 
                    onChange={e => setTempSettings({...tempSettings, nagadNumber: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-orange-50 border-2 border-orange-100 focus:border-orange-500 font-bold text-black outline-none transition-all" 
                    placeholder="নগদ নাম্বার দিন"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest ml-2 flex items-center gap-1">
                    <Smartphone size={12} /> Rocket Number (Personal/Agent)
                  </label>
                  <input 
                    type="tel" 
                    value={tempSettings.rocketNumber} 
                    onChange={e => setTempSettings({...tempSettings, rocketNumber: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-purple-50 border-2 border-purple-100 focus:border-purple-500 font-bold text-black outline-none transition-all" 
                    placeholder="রকেট নাম্বার দিন"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                className="w-full bg-blue-900 text-white py-5 rounded-[30px] font-black text-lg shadow-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
              >
                <Save size={20} /> সেটিংস সেভ করুন
              </button>
            </div>

            <div className="p-6 bg-blue-50 rounded-[35px] border border-blue-100">
               <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-blue-600" size={20} />
                  <p className="text-[11px] font-black text-blue-900 uppercase">গুরুত্বপূর্ণ নোট</p>
               </div>
               <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                  এখানে দেওয়া নাম্বারগুলো ইউজাররা "Add Money" করার সময় দেখতে পাবে। নাম্বার পরিবর্তন করার পর একবার চেক করে নিন সব ঠিক আছে কিনা।
               </p>
            </div>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="p-4 space-y-3">
            {otherTransactions.length === 0 ? (
              <p className="text-center py-20 text-gray-400 font-black text-[10px] uppercase">কোন হিস্ট্রি নেই।</p>
            ) : (
              otherTransactions.map(tx => (
                <div key={tx.id} className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-blue-900 uppercase">{tx.type}</p>
                    <p className="text-xs font-bold text-gray-500">{tx.details}</p>
                    <p className="text-[9px] text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-800">৳{tx.amount}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'REQUESTS' && (
          <div className="p-6 space-y-4">
            {pendingTransactions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed">
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">বর্তমানে কোন রিকোয়েস্ট নেই।</p>
              </div>
            ) : (
              pendingTransactions.map(tx => (
                <div key={tx.id} className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase mb-1 tracking-widest">{tx.type}</p>
                      <p className="text-xl font-black text-gray-800">৳{tx.amount}</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">{tx.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onUpdateTransaction(tx.id, 'SUCCESS')} className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-green-500/20 active:scale-95 transition-all">Accept</button>
                    <button onClick={() => onUpdateTransaction(tx.id, 'FAILED')} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'OFFERS' && (
          <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border shadow-sm">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">অফার যোগ করুন</h4>
              <form onSubmit={handleAddOffer} className="space-y-4">
                <input type="text" placeholder="অফারের নাম (যেমন: 1GB, 30 Days)" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="বিক্রয় মূল্য" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: parseFloat(e.target.value)})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black" />
                  <input type="number" placeholder="রেগুলার মূল্য" value={newOffer.regularPrice} onChange={e => setNewOffer({...newOffer, regularPrice: parseFloat(e.target.value)})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={newOffer.operator} onChange={e => setNewOffer({...newOffer, operator: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black">
                    {OPERATORS.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                  </select>
                  <select value={newOffer.type} onChange={e => setNewOffer({...newOffer, type: e.target.value as any})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black">
                    <option value="DRIVE">DRIVE (ড্রাইভ)</option>
                    <option value="REGULAR">REGULAR (রেগুলার)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">যোগ করুন</button>
              </form>
            </div>
            
            <div className="space-y-3">
              {offers.map(off => (
                <div key={off.id} className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-blue-900 uppercase">{off.operator} - {off.type}</p>
                    <p className="text-sm font-black text-gray-800">{off.title}</p>
                    <p className="text-[10px] font-bold text-gray-400">৳{off.price} (Regular: ৳{off.regularPrice})</p>
                  </div>
                  <button onClick={() => onManageOffers('DELETE', off)} className="p-2 text-red-500 bg-red-50 rounded-lg active:scale-90 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === 'TUTORIALS' && (
          <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border shadow-sm">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ভিডিও টিউটোরিয়াল যোগ করুন</h4>
              <form onSubmit={handleAddTutorial} className="space-y-4">
                <input type="text" placeholder="ভিডিওর শিরোনাম" value={newTutorial.title} onChange={e => setNewTutorial({...newTutorial, title: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black" required />
                <input type="url" placeholder="ভিডিও লিঙ্ক (YouTube/Video URL)" value={newTutorial.videoUrl} onChange={e => setNewTutorial({...newTutorial, videoUrl: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border text-xs font-bold text-black" required />
                <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg">আপলোড করুন</button>
              </form>
            </div>

            <div className="space-y-3">
              {tutorials.map(tut => (
                <div key={tut.id} className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                      <PlayCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{tut.title}</p>
                    </div>
                  </div>
                  <button onClick={() => onManageTutorials('DELETE', tut)} className="p-2 text-red-500 bg-red-50 rounded-lg active:scale-90 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Services Tab */}
        {activeTab === 'SERVICES' && (
          <div className="p-6 space-y-4">
             {services.map(service => (
               <div key={service.id} className="bg-white p-6 rounded-[32px] border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-2xl text-blue-900">
                      <Settings size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{service.name}</p>
                      <p className={`text-[9px] font-black uppercase ${service.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        {service.isActive ? 'Active' : 'Deactivated'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleService(service.id, !service.isActive)}
                    className={`p-2 rounded-xl transition-all ${service.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}
                  >
                    {service.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
               </div>
             ))}
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'USERS' && (
          <div className="p-4 space-y-3">
             {users.map(u => (
               <div key={u.id} className="bg-white p-5 rounded-[30px] border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <UserIcon size={20} className="text-blue-900" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{u.name}</p>
                      <p className="text-[9px] font-bold text-gray-400">{u.phone} • Balance: ৳{u.balance}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => { const amt = prompt('অ্যামাউন্ট লিখুন (Balance Update):', '0'); if(amt) onUpdateUser(u.id, {balance: parseFloat(amt)}); }}
                       className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-90"
                     >
                       <Banknote size={16} />
                     </button>
                     <button 
                       onClick={() => onUpdateUser(u.id, {isBlocked: !u.isBlocked})}
                       className={`p-2 rounded-lg active:scale-90 ${u.isBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                     >
                       <Shield size={16} />
                     </button>
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
