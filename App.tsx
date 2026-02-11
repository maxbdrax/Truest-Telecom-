
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import HistoryView from './components/HistoryView';
import ServiceForm from './components/ServiceForm';
import ChatView from './components/ChatView';
import { User, UserRole, Transaction, ServiceStatus, ChatMessage, Offer, Loan, Savings, AppSettings } from './types';
import { CheckCircle, XCircle, AlertCircle, Loader2, Database } from 'lucide-react';

// Supabase Credentials
const SUPABASE_URL = 'https://sxigiychhjxwisxbaamh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aWdpeWNoaGp4d2lzeGJhYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTE4NzcsImV4cCI6MjA4NTk2Nzg3N30.R3Yp5-K2HdQ2xm9r9VmSIc5QNHCzlnMHN4_NxUaRZIc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ExtendedChatMessage extends ChatMessage {
  recipientId?: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ExtendedChatMessage[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    bkashNumber: '01XXXXXXXXX',
    nagadNumber: '01XXXXXXXXX',
    rocketNumber: '01XXXXXXXXX',
    banners: []
  });
  
  const [services, setServices] = useState<ServiceStatus[]>([
    { id: 'topup', name: 'Top-up', isActive: true, requiresVerification: false },
    { id: 'drive', name: 'Drive Pack', isActive: true, requiresVerification: true },
    { id: 'regular', name: 'Regular Pack', isActive: true, requiresVerification: false },
    { id: 'loan', name: 'Loan', isActive: true, requiresVerification: true },
    { id: 'savings', name: 'Savings', isActive: true, requiresVerification: true },
    { id: 'send_money', name: 'Send Money', isActive: true, requiresVerification: false },
    { id: 'banking', name: 'Banking', isActive: true, requiresVerification: true },
    { id: 'm_banking', name: 'M-Banking', isActive: true, requiresVerification: true },
    { id: 'bill_pay', name: 'Bill Pay', isActive: true, requiresVerification: false },
  ]);

  const [notification, setNotification] = useState<{show: boolean, type: 'SUCCESS' | 'FAILED', message: string}>({show: false, type: 'SUCCESS', message: ''});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const results = await Promise.allSettled([
        supabase.from('users').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('offers').select('*'),
        supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
        supabase.from('app_settings').select('*').maybeSingle()
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.data) setUsers(results[0].value.data);
      if (results[1].status === 'fulfilled' && results[1].value.data) setTransactions(results[1].value.data);
      if (results[2].status === 'fulfilled' && results[2].value.data) setOffers(results[2].value.data);
      if (results[3].status === 'fulfilled' && results[3].value.data) setChatMessages(results[3].value.data);
      if (results[4].status === 'fulfilled' && results[4].value.data) setSettings(results[4].value.data);

      const savedUserStr = localStorage.getItem('trust_telecom_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        const { data: verifiedUser } = await supabase.from('users').select('*').eq('id', parsed.id).maybeSingle();
        if (verifiedUser) {
          setCurrentUser(verifiedUser);
        } else {
          localStorage.removeItem('trust_telecom_user');
        }
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showPopup = (type: 'SUCCESS' | 'FAILED', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), type === 'FAILED' ? 10000 : 3000);
  };

  const handleLogin = async (user: User) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('phone', user.phone).maybeSingle();
      if (error) throw error;

      if (data) {
        if (data.password === user.password) {
          setCurrentUser(data);
          localStorage.setItem('trust_telecom_user', JSON.stringify(data));
          showPopup('SUCCESS', "লগইন সফল হয়েছে!");
        } else {
          showPopup('FAILED', "ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।");
        }
      } else {
        showPopup('FAILED', "এই নাম্বারে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।");
      }
    } catch (e: any) {
      showPopup('FAILED', `লগইন সমস্যা: ${e.message}`);
    }
  };

  const handleRegister = async (userData: Omit<User, 'id'>) => {
    try {
      const tempId = 'U' + Math.floor(100000 + Math.random() * 900000);
      const userToInsert = { ...userData, id: tempId };

      const { data: existing } = await supabase.from('users').select('id').eq('phone', userData.phone).maybeSingle();
      if (existing) {
        showPopup('FAILED', "এই নাম্বারে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।");
        return;
      }

      const { data: newUser, error: regError } = await supabase.from('users').insert([userToInsert]).select().single();
      
      if (regError) {
        let msg = regError.message;
        if (msg.includes('public.users')) msg = "ডাটাবেস টেবিল খুঁজে পাওয়া যাচ্ছে না। অ্যাডমিন প্যানেল থেকে SQL রান করুন।";
        showPopup('FAILED', `রেজিস্ট্রেশন ব্যর্থ: ${msg}`);
        return;
      }
      
      if (newUser) {
        setCurrentUser(newUser);
        setUsers(prev => [...prev, newUser]);
        localStorage.setItem('trust_telecom_user', JSON.stringify(newUser));
        showPopup('SUCCESS', "রেজিস্ট্রেশন সফল হয়েছে!");
      }
    } catch (e: any) {
      showPopup('FAILED', `ত্রুটি: ${e.message}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trust_telecom_user');
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    try {
      const { data, error } = await supabase.from('transactions').insert([{ ...tx, status: 'PENDING' }]).select().single();
      if (error) throw error;
      if (data) {
        setTransactions(prev => [data, ...prev]);
        showPopup('SUCCESS', "আবেদনটি সফলভাবে জমা হয়েছে।");
      }
    } catch (e) {
      showPopup('FAILED', "ট্রানজেকশন সফল হয়নি।");
    }
  };

  const updateTransactionStatus = async (txId: string, status: 'SUCCESS' | 'FAILED') => {
    try {
      const { data: updatedTx } = await supabase.from('transactions').update({ status }).eq('id', txId).select().single();
      if (updatedTx) {
        setTransactions(prev => prev.map(tx => tx.id === txId ? updatedTx : tx));
        fetchData(); // Refresh balances
        showPopup('SUCCESS', "স্ট্যাটাস আপডেট হয়েছে।");
      }
    } catch (e) { console.error(e); }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    const { data: updated } = await supabase.from('users').update(data).eq('id', userId).select().single();
    if (updated) {
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      if (currentUser?.id === userId) setCurrentUser(updated);
      showPopup('SUCCESS', "ইউজার আপডেট হয়েছে।");
    }
  };

  const manageOffers = async (action: 'ADD' | 'DELETE', offer?: Offer) => {
    if (action === 'ADD' && offer) {
      const { data } = await supabase.from('offers').insert([offer]).select().single();
      if (data) setOffers(prev => [...prev, data]);
    } else if (action === 'DELETE' && offer) {
      await supabase.from('offers').delete().eq('id', offer.id);
      setOffers(prev => prev.filter(o => o.id !== offer.id));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-blue-900 flex flex-col items-center justify-center p-10">
        <Loader2 className="w-16 h-16 text-white animate-spin mb-6" />
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Trust Telecom</h1>
      </div>
    );
  }

  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
        {notification.show && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md transition-all duration-300">
            <div className={`bg-white rounded-[40px] p-10 shadow-2xl max-w-xs w-full text-center border-t-[14px] ${notification.type === 'SUCCESS' ? 'border-green-500' : 'border-red-500'}`}>
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${notification.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {notification.type === 'SUCCESS' ? <CheckCircle size={48} /> : <Database size={48} />}
              </div>
              <h2 className={`text-xl font-black mb-3 ${notification.type === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                {notification.type === 'SUCCESS' ? 'সফল হয়েছে!' : 'ডেটাবেস এরর!'}
              </h2>
              <p className="text-gray-500 font-bold text-[10px] leading-relaxed mb-6">{notification.message}</p>
              <button 
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-xs uppercase"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}

        <Routes>
          {!currentUser ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register onRegister={handleRegister} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={
                currentUser.role === UserRole.ADMIN ? 
                <AdminDashboard 
                  user={currentUser} users={users} services={services} settings={settings} offers={offers}
                  onManageOffers={manageOffers} onUpdateSettings={(s) => supabase.from('app_settings').upsert([{id:1, ...settings, ...s}]).then(fetchData)} onUpdateUser={updateUser}
                  onToggleService={(id) => setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))} 
                  onLogout={handleLogout} transactions={transactions} onUpdateTransaction={updateTransactionStatus}
                  chatMessages={chatMessages} onAdminReply={(text, isAdmin, recipientId) => supabase.from('chat_messages').insert([{senderId:'ADMIN', recipientId, text, isAdmin:true}]).then(fetchData)}
                /> : 
                <UserDashboard user={currentUser} services={services} settings={settings} onLogout={handleLogout} onUpdateUser={updateUser} />
              } />
              <Route path="/history" element={<HistoryView transactions={transactions.filter(t => t.userId === currentUser.id)} />} />
              <Route path="/chat" element={<ChatView messages={chatMessages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id)} onSendMessage={(text) => supabase.from('chat_messages').insert([{senderId:currentUser.id, text, isAdmin:false}]).then(fetchData)} user={currentUser} />} />
              <Route path="/service/:id" element={<ServiceForm onSubmit={addTransaction} services={services} settings={settings} user={currentUser} loans={[]} savings={[]} offers={offers} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
