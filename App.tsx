
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
  const [error, setError] = useState<string | null>(null);
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
          const verifiedUser = (results[0].status === 'fulfilled' ? results[0].value.data : [])?.find((u: User) => u.id === parsed.id);
          if (verifiedUser) {
            setCurrentUser(verifiedUser);
          } else {
            localStorage.removeItem('trust_telecom_user');
          }
        }
      } catch (err: any) {
        setError("সিস্টেম লোড করতে সমস্যা হচ্ছে।");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showPopup = (type: 'SUCCESS' | 'FAILED', message: string) => {
    setNotification({ show: true, type, message });
    const duration = type === 'FAILED' ? 15000 : 3000;
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), duration);
  };

  const handleLogin = async (user: User) => {
    try {
      const { data, error: loginError } = await supabase.from('users').select('*').eq('phone', user.phone).maybeSingle();
      if (loginError) throw loginError;

      if (data) {
        if (user.password && data.password && data.password !== user.password) {
          showPopup('FAILED', "পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।");
          return;
        }
        setCurrentUser(data);
        localStorage.setItem('trust_telecom_user', JSON.stringify(data));
      } else {
        showPopup('FAILED', "অ্যাকাউন্ট নেই। রেজিস্ট্রেশন করুন।");
      }
    } catch (e: any) {
      showPopup('FAILED', `লগইন ব্যর্থ। ডেটাবেস চেক করুন।`);
    }
  };

  const handleRegister = async (userData: Omit<User, 'id'>) => {
    try {
      // Generate ID as string (Not UUID)
      const tempId = 'U' + Math.floor(10000 + Math.random() * 90000);
      const userToInsert = { ...userData, id: tempId };

      const { data: existing, error: checkError } = await supabase.from('users').select('id').eq('phone', userData.phone).maybeSingle();
      if (checkError) throw checkError;
      
      if (existing) {
        showPopup('FAILED', "ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।");
        return;
      }

      const { data: newUser, error: regError } = await supabase.from('users').insert([userToInsert]).select().single();
      
      if (regError) {
        console.error("Supabase Reg Error:", regError);
        let msg = regError.message;
        if (regError.message.includes('payPassword')) {
          msg = "আপনার ডেটাবেসে 'payPassword' কলামটি নেই। অ্যাডমিন প্যানেলের 'Database Fix' ট্যাবে গিয়ে SQL রান করুন এবং 'NOTIFY' কমান্ডটি ব্যবহার করুন।";
        } else if (regError.message.includes('uuid')) {
          msg = "আপনার 'id' কলামটি UUID হিসেবে আছে। এটিকে TEXT এ পরিবর্তন করতে হবে। অ্যাডমিন প্যানেল দেখুন।";
        }
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
      showPopup('FAILED', `ত্রুটি: ${e.message || "সার্ভার সংযোগ সমস্যা"}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trust_telecom_user');
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    try {
      const newTx = { ...tx, date: new Date().toISOString(), status: 'PENDING' };
      const { data, error: txError } = await supabase.from('transactions').insert([newTx]).select().single();
      if (txError) throw txError;
      if (data) {
        setTransactions(prev => [data, ...prev]);
        showPopup('SUCCESS', "অনুরোধ পাঠানো হয়েছে।");
      }
    } catch (e: any) {
      showPopup('FAILED', `অনুরোধ ব্যর্থ হয়েছে।`);
    }
  };

  const updateTransactionStatus = async (txId: string, status: 'SUCCESS' | 'FAILED') => {
    try {
      const { data: updatedTx } = await supabase.from('transactions').update({ status }).eq('id', txId).select().single();
      if (updatedTx) {
        if (status === 'SUCCESS') {
          const tx = updatedTx as Transaction;
          const targetUser = users.find(u => u.id === tx.userId);
          if (targetUser) {
            let newBalance = targetUser.balance;
            if (tx.type === 'ADD_MONEY') newBalance += tx.amount;
            else {
              const modifier = (['RECHARGE', 'DRIVE_PACK', 'SEND_MONEY', 'BILL_PAY', 'LOAN_INSTALLMENT', 'REGULAR_PACK'].includes(tx.type) ? -1 : 1);
              newBalance += (tx.amount * modifier);
            }
            const { data: updatedUser } = await supabase.from('users').update({ balance: newBalance }).eq('id', tx.userId).select().single();
            if (updatedUser) setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          }
        }
        setTransactions(prev => prev.map(tx => tx.id === txId ? updatedTx : tx));
        showPopup('SUCCESS', "আপডেট সম্পন্ন।");
      }
    } catch (e) { console.error(e); }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      const { data: updated, error: upError } = await supabase.from('users').update(data).eq('id', userId).select().single();
      if (upError) throw upError;
      if (updated) {
        setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('trust_telecom_user', JSON.stringify(updated));
        }
        showPopup('SUCCESS', "আপডেট সফল।");
      }
    } catch (e: any) {
      showPopup('FAILED', `ব্যর্থ: ${e.message}`);
    }
  };

  const sendMessage = async (text: string, isAdmin: boolean = false, recipientId?: string) => {
    try {
      const msg = { senderId: isAdmin ? 'ADMIN' : (currentUser?.id || ''), recipientId: isAdmin ? recipientId : 'ADMIN', text, timestamp: new Date().toISOString(), isAdmin };
      const { data } = await supabase.from('chat_messages').insert([msg]).select().single();
      if (data) setChatMessages(prev => [...prev, data]);
    } catch (e) { console.error(e); }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const { data, error: sError } = await supabase.from('app_settings').upsert([{ id: 1, ...settings, ...newSettings }]).select().single();
      if (sError) throw sError;
      if (data) setSettings(data);
      showPopup('SUCCESS', "সেটিংস আপডেট হয়েছে।");
    } catch (e: any) {
      showPopup('FAILED', "সেটিংস আপডেট ব্যর্থ।");
    }
  };

  const manageOffers = async (action: 'ADD' | 'DELETE', offer?: Offer) => {
    try {
      if (action === 'ADD' && offer) {
        const { data } = await supabase.from('offers').insert([offer]).select().single();
        if (data) setOffers(prev => [...prev, data]);
        showPopup('SUCCESS', "অফার যোগ হয়েছে।");
      } else if (action === 'DELETE' && offer) {
        const { error: delError } = await supabase.from('offers').delete().eq('id', offer.id);
        if (!delError) {
          setOffers(prev => prev.filter(o => o.id !== offer.id));
          showPopup('SUCCESS', "অফার মুছে ফেলা হয়েছে।");
        }
      }
    } catch (e) { console.error(e); }
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
            <div className={`bg-white rounded-[40px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-xs w-full text-center border-t-[14px] ${notification.type === 'SUCCESS' ? 'border-green-500' : 'border-red-500'} transform scale-100 animate-in zoom-in duration-200`}>
              <div className={`w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center ${notification.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {notification.type === 'SUCCESS' ? <CheckCircle size={60} /> : <Database size={60} />}
              </div>
              <h2 className={`text-2xl font-black mb-4 tracking-tight leading-none ${notification.type === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                {notification.type === 'SUCCESS' ? 'সফল হয়েছে!' : 'ডেটাবেস এরর!'}
              </h2>
              <p className="text-gray-500 font-bold text-xs leading-relaxed mb-8">{notification.message}</p>
              <button 
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-800 active:scale-95 transition-all"
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
                  onManageOffers={manageOffers} onUpdateSettings={updateSettings} onUpdateUser={updateUser}
                  onToggleService={(id) => setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))} 
                  onLogout={handleLogout} transactions={transactions} onUpdateTransaction={updateTransactionStatus}
                  chatMessages={chatMessages} onAdminReply={(txt, isAdm, recId) => sendMessage(txt, isAdm, recId)}
                /> : 
                <UserDashboard user={currentUser} services={services} settings={settings} onLogout={handleLogout} onUpdateUser={updateUser} />
              } />
              <Route path="/history" element={<HistoryView transactions={transactions.filter(t => t.userId === currentUser.id)} />} />
              <Route path="/chat" element={<ChatView messages={chatMessages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id)} onSendMessage={(txt) => sendMessage(txt, false)} user={currentUser} />} />
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
