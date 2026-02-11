
import React, { useState } from 'react';
import { User, ServiceStatus, Transaction, ChatMessage, AppSettings, Offer } from '../types';
import { Users, CheckCircle, XCircle, Clock, Smartphone, LogOut, Settings, Edit3, Image, CreditCard, Plus, Trash2, Tag, ChevronRight, Send } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'STATS' | 'REQUESTS' | 'USERS' | 'CHAT' | 'SETTINGS' | 'OFFERS'>('STATS');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New Offer State
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({ type: 'DRIVE', operator: 'gp', validity: '30 দিন' });

  const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
  const getUserById = (id: string) => users.find(u => u.id === id);

  const userIdsInChat = Array.from(new Set(
    chatMessages.filter(m => !m.isAdmin || m.recipientId).map(m => m.isAdmin ? m.recipientId : m.senderId)
  )).filter(id => id !== 'ADMIN') as string[];

  const filteredMessages = selectedChatUser 
    ? chatMessages.filter(m => m.senderId === selectedChatUser || m.recipientId === selectedChatUser)
    : [];

  return (
    <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden h-full">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <Settings size={20} className="text-gray-600" />
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-full text-red-500">
          <LogOut size={20} />
        </button>
      </header>

      {/* Admin Tabs */}
      <div className="bg-white flex border-b overflow-x-auto no-scrollbar">
        {['STATS', 'REQUESTS', 'USERS', 'OFFERS', 'CHAT', 'SETTINGS'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`whitespace-nowrap px-6 py-3 text-[10px] font-bold uppercase tracking-wider ${activeTab === tab ? 'text-blue-900 border-b-2 border-blue-900' : 'text-gray-400'}`}
          >
            {tab === 'REQUESTS' ? `Req (${pendingTransactions.length})` : tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {activeTab === 'STATS' && (
          <div className="p-4 space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500 p-4 rounded-2xl text-white shadow-lg">
                   <p className="text-[10px] font-bold opacity-80 uppercase">Total User Balance</p>
                   <p className="text-xl font-black">{users.reduce((acc, u) => acc + u.balance, 0).toLocaleString()} ৳</p>
                </div>
                <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg">
                   <p className="text-[10px] font-bold opacity-80 uppercase">Total Users</p>
                   <p className="text-xl font-black">{users.length}</p>
                </div>
             </div>
             <div className="p-4 bg-white rounded-2xl border border-gray-200">
               <h3 className="text-sm font-bold mb-4">Service Control</h3>
               <div className="space-y-3">
                 {services.map(s => (
                   <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                     <span className="text-sm font-medium">{s.name}</span>
                     <button onClick={() => onToggleService(s.id)} className={`px-3 py-1 rounded-full text-[10px] font-bold ${s.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {s.isActive ? 'ONLINE' : 'OFFLINE'}
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'OFFERS' && (
          <div className="p-4 space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-black text-blue-900 mb-4 flex items-center"><Tag size={18} className="mr-2"/> Add New Offer</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Offer Title (Data/Minute)</label>
                      <input type="text" value={newOffer.title || ''} onChange={e => setNewOffer({...newOffer, title: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="e.g. 20GB 500Min" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                      <input type="number" value={newOffer.price || ''} onChange={e => setNewOffer({...newOffer, price: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Regular Price</label>
                      <input type="number" value={newOffer.regularPrice || ''} onChange={e => setNewOffer({...newOffer, regularPrice: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Operator</label>
                      <select value={newOffer.operator} onChange={e => setNewOffer({...newOffer, operator: e.target.value})} className="w-full p-3 border rounded-xl capitalize">
                         {OPERATORS.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                      <select value={newOffer.type} onChange={e => setNewOffer({...newOffer, type: e.target.value as any})} className="w-full p-3 border rounded-xl">
                         <option value="DRIVE">Drive Offer</option>
                         <option value="REGULAR">Regular Offer</option>
                      </select>
                   </div>
                   <div className="col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Validity</label>
                      <input type="text" value={newOffer.validity || ''} onChange={e => setNewOffer({...newOffer, validity: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="e.g. 30 দিন" />
                   </div>
                </div>
                <button 
                  onClick={() => { if(newOffer.title && newOffer.price) { onManageOffers('ADD', newOffer as Offer); setNewOffer({type: 'DRIVE', operator: 'gp', validity: '30 দিন'}); } }} 
                  className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                   <Plus size={18}/> <span>Add Offer</span>
                </button>
             </div>

             <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Existing Offers</h3>
                {offers.map(o => (
                  <div key={o.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center">
                     <div>
                        <div className="flex items-center space-x-2">
                           <span className="bg-blue-100 text-blue-900 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{o.operator}</span>
                           <span className="text-sm font-bold">{o.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Price: {o.price}৳ (Reg: {o.regularPrice}৳)</p>
                     </div>
                     <button onClick={() => onManageOffers('DELETE', o)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="p-4 space-y-3">
            {editingUser ? (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-900 shadow-xl">
                 <h2 className="font-black text-blue-900 mb-4">Edit User: {editingUser.name}</h2>
                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Balance</label>
                      <input 
                        type="number" 
                        value={editingUser.balance}
                        onChange={(e) => setEditingUser({...editingUser, balance: parseFloat(e.target.value)})}
                        className="w-full p-3 bg-gray-50 rounded-xl border font-bold text-blue-900"
                      />
                    </div>
                    <div className="flex space-x-2">
                       <button onClick={() => { onUpdateUser(editingUser.id, editingUser); setEditingUser(null); }} className="flex-1 bg-blue-900 text-white py-3 rounded-xl font-bold">Save</button>
                       <button onClick={() => setEditingUser(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
                    </div>
                 </div>
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-between items-center">
                   <div>
                     <p className="text-sm font-bold text-gray-800">{u.name}</p>
                     <p className="text-[10px] text-gray-400">{u.phone}</p>
                     <p className="text-xs font-black text-blue-900 mt-1">{u.balance} ৳</p>
                   </div>
                   <button onClick={() => setEditingUser(u)} className="p-2 bg-blue-50 text-blue-900 rounded-lg"><Edit3 size={18}/></button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'REQUESTS' && (
          <div className="p-4 space-y-3">
             {pendingTransactions.map(tx => (
               <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-blue-900 uppercase">{tx.type}</p>
                      <p className="text-sm font-bold">{getUserById(tx.userId)?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400">{tx.details}</p>
                    </div>
                    <p className="text-lg font-black text-gray-800">{tx.amount} ৳</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => onUpdateTransaction(tx.id, 'SUCCESS')} className="py-2 bg-green-500 text-white rounded-xl text-xs font-bold">Approve</button>
                    <button onClick={() => onUpdateTransaction(tx.id, 'FAILED')} className="py-2 bg-red-500 text-white rounded-xl text-xs font-bold">Reject</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="p-4 space-y-4">
             <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold mb-4 flex items-center"><CreditCard size={16} className="mr-2"/> Payment Numbers</h3>
                <div className="space-y-4">
                   {['bkashNumber', 'nagadNumber', 'rocketNumber'].map(field => (
                     <div key={field}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase">{field}</label>
                        <input 
                          type="text" 
                          value={(settings as any)[field]}
                          onChange={(e) => onUpdateSettings({[field]: e.target.value})}
                          className="w-full p-3 bg-gray-50 border rounded-xl"
                        />
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <h3 className="text-sm font-bold mb-4 flex items-center"><Image size={16} className="mr-2"/> Banners (URLs)</h3>
                <textarea 
                  className="w-full p-3 bg-gray-50 border rounded-xl h-24 text-xs font-mono"
                  placeholder="Paste banner image URLs separated by new line"
                  value={settings.banners.join('\n')}
                  onChange={(e) => onUpdateSettings({banners: e.target.value.split('\n').filter(Boolean)})}
                />
             </div>
          </div>
        )}

        {activeTab === 'CHAT' && (
          <div className="p-4 space-y-4 h-full flex flex-col">
            {!selectedChatUser ? (
              <div className="bg-white rounded-2xl border border-gray-200 divide-y flex-1">
                {userIdsInChat.map(uid => (
                  <button key={uid} onClick={() => setSelectedChatUser(uid)} className="w-full p-4 flex items-center justify-between">
                    <span className="text-sm font-bold">{getUserById(uid)?.name || uid}</span>
                    <ChevronRight size={16}/>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl border flex-1 flex flex-col h-full overflow-hidden min-h-[400px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2">
                  {filteredMessages.map(m => (
                    <div key={m.id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-2 rounded-xl text-[11px] ${m.isAdmin ? 'bg-blue-100 text-blue-900' : 'bg-gray-100'}`}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2 border-t pt-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 border p-2 rounded-lg text-xs text-blue-900 font-bold" />
                  <button onClick={() => { if(replyText.trim()) { onAdminReply(replyText, true, selectedChatUser!); setReplyText(''); } }} className="bg-blue-900 text-white p-2 rounded-lg"><Send size={16}/></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
