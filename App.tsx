
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
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Supabase Credentials for Project: max999 (sxigiychhjxwisxbaamh)
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
        
        // Fetch users, transactions, offers, messages, and settings
        const [
          { data: userData, error: userError },
          { data: txData, error: txError },
          { data: offerData, error: offerError },
          { data: chatData, error: chatError },
          { data: settingsData, error: settingsError }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('offers').select('*'),
          supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
          supabase.from('app_settings').select('*').maybeSingle()
        ]);

        if (userError) throw userError;
        if (userData) setUsers(userData);
        if (txData) setTransactions(txData);
        if (offerData) setOffers(offerData);
        if (chatData) setChatMessages(chatData);
        if (settingsData) setSettings(settingsData);

        // Persistent Login Check
        const savedUserStr = localStorage.getItem('trust_telecom_user');
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          const verifiedUser = userData?.find(u => u.id === parsed.id);
          if (verifiedUser) {
            setCurrentUser(verifiedUser);
          } else {
            localStorage.removeItem('trust_telecom_user');
          }
        }
      } catch (err: any) {
        console.error("Critical initialization error:", err);
        setError("Supabase connection failed. Please ensure tables exist.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showPopup = (type: 'SUCCESS' | 'FAILED', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handleLogin = async (user: User) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('phone', user.phone).maybeSingle();
      if (data) {
        if (user.password && data.password && data.password !== user.password) {
          showPopup('FAILED', "পাসওয়ার্ড ভুল।");
          return;
        }
        setCurrentUser(data);
        localStorage.setItem('trust_telecom_user', JSON.stringify(data));
      } else {
        // Register new user if not found (Simple approach)
        const { data: newUser } = await supabase.from('users').insert([user]).select().single();
        if (newUser) {
          setCurrentUser(newUser);
          setUsers(prev => [...prev, newUser]);
          localStorage.setItem('trust_telecom_user', JSON.stringify(newUser));
        }
      }
    } catch (e) {
      showPopup('FAILED', "লগইন সফল হয়নি।");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trust_telecom_user');
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    try {
      const newTx = { ...tx, date: new Date().toISOString(), status: 'PENDING' };
      const { data } = await supabase.from('transactions').insert([newTx]).select().single();
      if (data) {
        setTransactions(prev => [data, ...prev]);
        showPopup('SUCCESS', "অনুরোধটি সফলভাবে পাঠানো হয়েছে।");
      }
    } catch (e) {
      showPopup('FAILED', "অনুরোধ পাঠানো সম্ভব হয়নি।");
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
        showPopup('SUCCESS', status === 'SUCCESS' ? "অনুমোদন সফল" : "অনুরোধ বাতিল");
      }
    } catch (e) { console.error(e); }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    const { data: updated } = await supabase.from('users').update(data).eq('id', userId).select().single();
    if (updated) {
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      if (currentUser?.id === userId) {
        setCurrentUser(updated);
        localStorage.setItem('trust_telecom_user', JSON.stringify(updated));
      }
      showPopup('SUCCESS', "আপডেট সফল হয়েছে");
    }
  };

  const sendMessage = async (text: string, isAdmin: boolean = false, recipientId?: string) => {
    const msg = { senderId: isAdmin ? 'ADMIN' : (currentUser?.id || ''), recipientId: isAdmin ? recipientId : 'ADMIN', text, timestamp: new Date().toISOString(), isAdmin };
    const { data } = await supabase.from('chat_messages').insert([msg]).select().single();
    if (data) setChatMessages(prev => [...prev, data]);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const { data } = await supabase.from('app_settings').upsert([{ id: 1, ...settings, ...newSettings }]).select().single();
    if (data) setSettings(data);
    showPopup('SUCCESS', "সেটিংস আপডেট হয়েছে");
  };

  const manageOffers = async (action: 'ADD' | 'DELETE', offer?: Offer) => {
    if (action === 'ADD' && offer) {
      const { data } = await supabase.from('offers').insert([offer]).select().single();
      if (data) setOffers([...offers, data]);
    } else if (action === 'DELETE' && offer) {
      const { error } = await supabase.from('offers').delete().eq('id', offer.id);
      if (!error) setOffers(offers.filter(o => o.id !== offer.id));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-blue-900 flex flex-col items-center justify-center p-10">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-black text-white">Trust Telecom</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={60} className="text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Error Connecting</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-900 text-white px-8 py-3 rounded-full font-bold">Retry</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
        {notification.show && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className={`${notification.type === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white/50`}>
              {notification.type === 'SUCCESS' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <span className="font-bold text-sm">{notification.message}</span>
            </div>
          </div>
        )}

        <Routes>
          {!currentUser ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register onRegister={handleLogin} />} />
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
