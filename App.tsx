
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import HistoryView from './components/HistoryView';
import ServiceForm from './components/ServiceForm';
import ChatView from './components/ChatView';
import { User, UserRole, Transaction, ServiceStatus, ChatMessage, Offer, Loan, Savings, AppSettings } from './types';
import { CheckCircle, XCircle } from 'lucide-react';

export interface ExtendedChatMessage extends ChatMessage {
  recipientId?: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'A M IMRAN Dev', phone: '01863575188', role: UserRole.ADMIN, balance: 5000, driveBalance: 2500, isBlocked: false },
    { id: '2', name: 'Trust User', phone: '01700000000', role: UserRole.USER, balance: 100, driveBalance: 0, isBlocked: false }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ExtendedChatMessage[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savings, setSavings] = useState<Savings[]>([]);
  const [offers, setOffers] = useState<Offer[]>([
    { id: '1', type: 'DRIVE', operator: 'robi', title: '20 জিবি 100 মিনিট', price: 350, regularPrice: 380, validity: '30 দিন' },
    { id: '2', type: 'DRIVE', operator: 'robi', title: '5 GB 50 Minute', price: 130, regularPrice: 150, validity: '30 দিন' },
    { id: '3', type: 'DRIVE', operator: 'robi', title: '50 GB 300 Minute', price: 510, regularPrice: 550, validity: '30 দিন' },
    { id: '4', type: 'DRIVE', operator: 'robi', title: 'Unlimited GB', price: 999, regularPrice: 1190, validity: '30 দিন' },
  ]);
  const [settings, setSettings] = useState<AppSettings>({
    bkashNumber: '01875242742',
    nagadNumber: '01712345678',
    rocketNumber: '01900000000',
    banners: [
      'https://img.freepik.com/free-vector/cashback-concept-illustration_114360-5206.jpg',
      'https://t3.ftcdn.net/jpg/04/65/46/52/360_F_465465250_Suj9W9ycfn1624zYcfZ9A9mIcy3m89Vv.jpg'
    ]
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
    const savedUser = localStorage.getItem('trust_telecom_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const found = users.find(u => u.phone === parsed.phone);
      if (found) setCurrentUser(found);
    }
  }, [users]);

  const showPopup = (type: 'SUCCESS' | 'FAILED', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handleLogin = (user: User) => {
    const existing = users.find(u => u.phone === user.phone);
    if (existing) {
      setCurrentUser(existing);
      localStorage.setItem('trust_telecom_user', JSON.stringify(existing));
    } else {
      setUsers(prev => [...prev, user]);
      setCurrentUser(user);
      localStorage.setItem('trust_telecom_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trust_telecom_user');
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'PENDING'
    };
    setTransactions([newTx, ...transactions]);
    showPopup('SUCCESS', "অনুরোধটি সফলভাবে পাঠানো হয়েছে। অপেক্ষ করুন।");
  };

  const updateTransactionStatus = (txId: string, status: 'SUCCESS' | 'FAILED') => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        if (status === 'SUCCESS') {
          if (tx.type === 'ADD_MONEY') {
            setUsers(currentUsers => currentUsers.map(u => u.id === tx.userId ? { ...u, balance: u.balance + tx.amount } : u));
          } else {
             setUsers(currentUsers => currentUsers.map(u => {
              if (u.id === tx.userId) {
                const modifier = (['RECHARGE', 'DRIVE_PACK', 'SEND_MONEY', 'BILL_PAY', 'LOAN_INSTALLMENT', 'REGULAR_PACK'].includes(tx.type) ? -1 : 1);
                return { ...u, balance: u.balance + (tx.amount * modifier) };
              }
              return u;
            }));
          }
          showPopup('SUCCESS', `Transaction approved.`);
        } else {
          showPopup('FAILED', `Transaction rejected.`);
        }
        return { ...tx, status };
      }
      return tx;
    }));
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    showPopup('SUCCESS', "ইউজার আপডেট করা হয়েছে");
  };

  const sendMessage = (text: string, isAdmin: boolean = false, recipientId?: string) => {
    const msg: ExtendedChatMessage = {
      id: Math.random().toString(),
      senderId: isAdmin ? 'ADMIN' : (currentUser?.id || '2'),
      recipientId: isAdmin ? recipientId : 'ADMIN',
      text,
      timestamp: new Date().toISOString(),
      isAdmin
    };
    setChatMessages(prev => [...prev, msg]);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showPopup('SUCCESS', "সেটিংস আপডেট হয়েছে");
  };

  const manageOffers = (action: 'ADD' | 'DELETE', offer?: Offer) => {
    if (action === 'ADD' && offer) {
      setOffers([...offers, { ...offer, id: Math.random().toString() }]);
    } else if (action === 'DELETE' && offer) {
      setOffers(offers.filter(o => o.id !== offer.id));
    }
  };

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
                  user={currentUser} 
                  users={users}
                  services={services} 
                  settings={settings}
                  offers={offers}
                  onManageOffers={manageOffers}
                  onUpdateSettings={updateSettings}
                  onUpdateUser={updateUser}
                  onToggleService={(id) => setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))} 
                  onLogout={handleLogout} 
                  transactions={transactions} 
                  onUpdateTransaction={updateTransactionStatus}
                  chatMessages={chatMessages}
                  onAdminReply={(txt, isAdm, recId) => sendMessage(txt, isAdm, recId)}
                /> : 
                <UserDashboard user={currentUser} services={services} settings={settings} onLogout={handleLogout} />
              } />
              <Route path="/history" element={<HistoryView transactions={transactions.filter(t => t.userId === currentUser.id)} />} />
              <Route path="/chat" element={<ChatView messages={chatMessages.filter(m => m.senderId === currentUser.id || m.recipientId === currentUser.id)} onSendMessage={(txt) => sendMessage(txt, false)} user={currentUser} />} />
              <Route path="/service/:id" element={<ServiceForm onSubmit={addTransaction} services={services} settings={settings} user={currentUser} loans={loans} savings={savings} offers={offers} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
