
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
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, ShieldAlert } from 'lucide-react';

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

  const [notification, setNotification] = useState<{show: boolean, type: 'SUCCESS' | 'FAILED' | 'PERMISSION', message: string}>({show: false, type: 'SUCCESS', message: ''});

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
        if (verifiedUser) setCurrentUser(verifiedUser);
        else localStorage.removeItem('trust_telecom_user');
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showPopup = (type: 'SUCCESS' | 'FAILED' | 'PERMISSION', message: string) => {
    setNotification({ show: true, type, message });
    if (type !== 'PERMISSION') {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000);
    }
  };

  const handleLogin = async (user: User) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('phone', user.phone).maybeSingle();
      if (error) {
        if (error.message.includes('permission')) showPopup('PERMISSION', "আপনার সুপাবেজ ডাটাবেসে পারমিশন নেই। অ্যাডমিন প্যানেল থেকে SQL রান করুন।");
        else throw error;
        return;
      }
      if (data && data.password === user.password) {
        setCurrentUser(data);
        localStorage.setItem('trust_telecom_user', JSON.stringify(data));
        showPopup('SUCCESS', "লগইন সফল হয়েছে!");
      } else {
        showPopup('FAILED', "ভুল মোবাইল নাম্বার বা পাসওয়ার্ড দিয়েছেন।");
      }
    } catch (e: any) {
      showPopup('FAILED', e.message);
    }
  };

  const handleRegister = async (userData: Omit<User, 'id'>) => {
    try {
      // Create a unique user ID
      const tempId = 'U' + Math.floor(100000 + Math.random() * 900000);
      const userToInsert = { ...userData, id: tempId };

      const { error: regError, data: newUser } = await supabase.from('users').insert([userToInsert]).select().single();
      
      if (regError) {
        if (regError.message.includes('permission')) {
          showPopup('PERMISSION', "রেজিস্ট্রেশন করতে পারছে না কারণ ডাটাবেসে পারমিশন এরর আছে। অ্যাডমিন থেকে GRANT SQL রান করুন।");
        } else {
          showPopup('FAILED', `রেজিস্ট্রেশন ব্যর্থ: ${regError.message}`);
        }
        return;
      }
      
      if (newUser) {
        setCurrentUser(newUser);
        localStorage.setItem('trust_telecom_user', JSON.stringify(newUser));
        showPopup('SUCCESS', "রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম।");
        fetchData();
      }
    } catch (e: any) {
      showPopup('FAILED', `ত্রুটি: ${e.message}`);
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
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className={`bg-white rounded-[40px] p-10 shadow-2xl max-w-xs w-full text-center border-t-[14px] ${notification.type === 'SUCCESS' ? 'border-green-500' : 'border-red-500'}`}>
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${notification.type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {notification.type === 'SUCCESS' ? <CheckCircle size={48} /> : notification.type === 'PERMISSION' ? <ShieldAlert size={48} /> : <Database size={48} />}
              </div>
              <h2 className="text-xl font-black mb-3">{notification.type === 'SUCCESS' ? 'সফল হয়েছে!' : 'সিকিউরিটি সমস্যা!'}</h2>
              <p className="text-gray-500 font-bold text-[11px] leading-relaxed mb-6">{notification.message}</p>
              <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg">বন্ধ করুন</button>
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
                  onManageOffers={(action, offer) => {
                     if(action === 'ADD') supabase.from('offers').insert([offer]).then(fetchData);
                     else supabase.from('offers').delete().eq('id', offer?.id).then(fetchData);
                  }} 
                  onUpdateSettings={(s) => supabase.from('app_settings').upsert([{id:1, ...settings, ...s}]).then(fetchData)} 
                  onUpdateUser={(id, data) => supabase.from('users').update(data).eq('id', id).then(fetchData)}
                  onToggleService={() => {}} 
                  onLogout={() => {setCurrentUser(null); localStorage.removeItem('trust_telecom_user');}} 
                  transactions={transactions} onUpdateTransaction={(id, status) => supabase.from('transactions').update({status}).eq('id', id).then(fetchData)}
                  chatMessages={chatMessages} onAdminReply={() => {}}
                /> : 
                <UserDashboard user={currentUser} services={services} settings={settings} onLogout={() => {setCurrentUser(null); localStorage.removeItem('trust_telecom_user');}} onUpdateUser={() => {}} />
              } />
              <Route path="/service/:id" element={<ServiceForm onSubmit={(tx) => supabase.from('transactions').insert([tx]).then(() => { fetchData(); showPopup('SUCCESS', 'আবেদন জমা হয়েছে।'); })} services={services} settings={settings} user={currentUser} loans={[]} savings={[]} offers={offers} />} />
              <Route path="/chat" element={<ChatView messages={chatMessages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id)} onSendMessage={(text) => supabase.from('chat_messages').insert([{senderId:currentUser.id, text, isAdmin:false}]).then(fetchData)} user={currentUser} />} />
              <Route path="/history" element={<HistoryView transactions={transactions.filter(t => t.userId === currentUser.id)} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
