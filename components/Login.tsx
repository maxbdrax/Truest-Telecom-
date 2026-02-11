
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Requested Admin Credentials: admin / 225588
    if (phone === 'admin' && password === '225588') {
      onLogin({
        id: 'admin_master',
        name: 'Master Admin',
        phone: 'admin',
        role: UserRole.ADMIN,
        balance: 999999,
        driveBalance: 0,
        isBlocked: false
      });
      navigate('/dashboard');
      setIsLoading(false);
      return;
    }

    // Standard User Login Logic
    if (phone && password) {
       onLogin({
        id: Math.random().toString(36).substring(7),
        name: 'Account User',
        phone: phone,
        role: UserRole.USER,
        balance: 0,
        driveBalance: 0,
        isBlocked: false
      });
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg">Trust Telecom</h1>
        <p className="text-blue-200 text-sm font-bold">সততাই আমাদের মূল লক্ষ্য</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div>
          <label className="block text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">Username or Phone</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold"
            placeholder="আপনার ইউজারনেম দিন"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold"
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 text-lg"
        >
          {isLoading ? 'লোড হচ্ছে...' : 'প্রবেশ করুন'}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-blue-100 font-medium">
          নতুন ইউজার? <Link to="/register" className="font-black text-white underline underline-offset-4">রেজিস্ট্রেশন করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
