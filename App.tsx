
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
import { User, UserRole, Transaction, ServiceStatus, ChatMessage, Offer, Loan, Savings, AppSettings, Tutorial } from './types';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const SUPABASE_URL = 'https://sxigiychhjxwisxbaamh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aWdpeWNoaGp4d2lzeGJhYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTE4NzcsImV4cCI6MjA4NTk2Nzg3N30.R3Yp5-K2HdQ2xm9r9VmSIc5QNHCzlnMHN4_NxUaRZIc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    bkashNumber: '01XXXXXXXXX',
    nagadNumber: '01XXXXXXXXX',
    rocketNumber: '01XXXXXXXXX',
    banners: []
  });

  const [notification, setNotification] = useState<{show: boolean, type: 'SUCCESS' | 'FAILED' | 'PERMISSION', message: string}>({show: false, type: 'SUCCESS', message: ''});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [uRes, tRes, oRes, cRes, sRes, tutRes, servRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('offers').select('*'),
        supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
        supabase.from('app_settings').select('*').maybeSingle(),
        supabase.from('tutorials').select('*'),
        supabase.from('service_status').select('*')
      ]);

      if (uRes.data) setUsers(uRes.data);
      if (tRes.data) setTransactions(tRes.data);
      if (oRes.data) setOffers(oRes.data);
      if (cRes.data) setChatMessages(cRes.data);
      if (sRes.data) setSettings(sRes.data || settings);
      if (tutRes.data) setTutorials(tutRes.data);
      if (servRes.data) setServices(servRes.data);

      const savedUserStr = localStorage.getItem('trust_telecom_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed.id === 'admin_master') {
          setCurrentUser(parsed);
        } else {
          const { data: verifiedUser } = await supabase.from('users').select('*').eq('id', parsed.id).maybeSingle();
          if (verifiedUser) setCurrentUser(verifiedUser);
          else localStorage.removeItem('trust_telecom_user');
        }
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showPopup = (type: 'SUCCESS' | 'FAILED' | 'PERMISSION', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('trust_telecom_user', JSON.stringify(user));
    showPopup('SUCCESS', "লগইন সফল হয়েছে!");
  };

  const handleRegister = async (userData: Omit<User, 'id'>) => {
    const tempId = (userData.role === UserRole.ADMIN ? 'A' : 'U') + Math.floor(100000 + Math.random() * 900000);
    const newUser = { ...userData, id: tempId };
    
    // Note: Users are stored in public.users table, not Auth.users
    const { error } = await supabase.from('users').insert([newUser]);
    
    if (error) {
      showPopup('FAILED', "রেজিস্ট্রেশন ব্যর্থ: " + error.message);
      throw error;
    } else {
      showPopup('SUCCESS', "রেজিস্ট্রেশন সফল! স্বাগতম।");
      handleLogin(newUser as User);
      await fetchData();
    }
  };

  const handleUpdateTransaction = async (txId: string, status: 'SUCCESS' | 'FAILED') => {
    const { error } = await supabase.from('transactions').update({ status }).eq('id', txId);
    if (!error) {
      showPopup('SUCCESS', `আবেদনটি ${status === 'SUCCESS' ? 'গ্রহণ' : 'বাতিল'} করা হয়েছে।`);
      fetchData();
    }
  };

  const handleManageOffers = async (action: 'ADD' | 'DELETE', offer?: Offer) => {
    if (action === 'ADD' && offer) {
      await supabase.from('offers').insert([offer]);
    } else if (action === 'DELETE' && offer) {
      await supabase.from('offers').delete().eq('id', offer.id);
    }
    fetchData();
  };

  if (isLoading && !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black text-xs uppercase tracking-[0.2em]">Trust Telecom Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
        {notification.show && (
          <div className="fixed inset-x-0 top-10 z-[10000] flex justify-center px-6">
            <div className={`bg-white rounded-3xl p-6 shadow-2xl flex items-center space-x-3 border-t-8 ${notification.type === 'SUCCESS' ? 'border-green-500' : 'border-red-500'}`}>
              {notification.type === 'SUCCESS' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
              <p className="text-xs font-black text-gray-800 uppercase">{notification.message}</p>
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
                  user={currentUser} users={users} services={services} settings={settings} offers={offers} tutorials={tutorials}
                  onManageOffers={handleManageOffers}
                  onManageTutorials={(a, t) => a === 'ADD' ? supabase.from('tutorials').insert([t]).then(fetchData) : supabase.from('tutorials').delete().eq('id', t?.id).then(fetchData)} 
                  onUpdateSettings={(s) => supabase.from('app_settings').upsert([{ id: 1, ...settings, ...s }]).then(fetchData)}
                  onUpdateUser={(id, d) => supabase.from('users').update(d).eq('id', id).then(fetchData)}
                  onToggleService={(id, a) => supabase.from('service_status').update({isActive: a}).eq('id', id).then(fetchData)}
                  onLogout={() => {setCurrentUser(null); localStorage.removeItem('trust_telecom_user');}} 
                  transactions={transactions} onUpdateTransaction={handleUpdateTransaction}
                  chatMessages={chatMessages} onAdminReply={(t, rid) => supabase.from('chat_messages').insert([{senderId:currentUser.id, recipientId:rid, text:t, isAdmin:true}]).then(fetchData)}
                /> : 
                <UserDashboard user={currentUser} services={services} settings={settings} tutorials={tutorials} onLogout={() => {setCurrentUser(null); localStorage.removeItem('trust_telecom_user');}} onUpdateUser={(id, d) => supabase.from('users').update(d).eq('id', id).then(fetchData)} />
              } />
              <Route path="/service/:id" element={<ServiceForm onSubmit={(tx) => supabase.from('transactions').insert([tx]).then(() => { fetchData(); showPopup('SUCCESS', 'আবেদন জমা হয়েছে।'); })} services={services} settings={settings} user={currentUser} offers={offers} />} />
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
