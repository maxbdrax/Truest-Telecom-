
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import HistoryView from './components/HistoryView';
import ServiceForm from './components/ServiceForm';
import { User, UserRole, Transaction, ServiceStatus } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([
    { id: 'topup', name: 'Top-up', isActive: true, requiresVerification: false },
    { id: 'drive', name: 'Drive Pack', isActive: true, requiresVerification: true },
    { id: 'send_money', name: 'Send Money', isActive: true, requiresVerification: false },
    { id: 'banking', name: 'Banking', isActive: true, requiresVerification: true },
    { id: 'm_banking', name: 'M-Banking', isActive: true, requiresVerification: true },
    { id: 'bill_pay', name: 'Bill Pay', isActive: true, requiresVerification: false },
  ]);

  // Mock data initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('trust_telecom_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('trust_telecom_user', JSON.stringify(user));
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
    alert("আপনার অনুরোধটি সফলভাবে পাঠানো হয়েছে। এডমিন ভেরিফিকেশন এর জন্য অপেক্ষা করুন।");
  };

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
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
                <AdminDashboard user={currentUser} services={services} onToggleService={toggleService} onLogout={handleLogout} transactions={transactions} /> : 
                <UserDashboard user={currentUser} services={services} onLogout={handleLogout} />
              } />
              <Route path="/history" element={<HistoryView transactions={transactions.filter(t => t.userId === currentUser.id)} />} />
              <Route path="/service/:id" element={<ServiceForm onSubmit={addTransaction} services={services} />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
