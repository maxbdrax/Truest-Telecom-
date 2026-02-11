
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';

interface Props {
  onRegister: (user: Omit<User, 'id'>) => Promise<void>;
}

const Register: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password || !payPassword) {
      alert("সবগুলো ঘর পূরণ করুন");
      return;
    }
    
    if (payPassword.length < 4) {
      alert("লেনদেন পিন কমপক্ষে ৪ সংখ্যার হতে হবে");
      return;
    }

    setIsLoading(true);
    try {
      await onRegister({
        name,
        phone,
        password,
        payPassword,
        role: UserRole.USER,
        balance: 0,
        driveBalance: 0,
        isBlocked: false
      });
    } catch (err) {
      console.error("Registration UI handle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg">Trust Telecom</h1>
        <p className="text-blue-200 font-bold">নতুন অ্যাকাউন্ট তৈরি করুন</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold"
            placeholder="আপনার নাম"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Phone Number</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold"
            placeholder="01xxxxxxxxx"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Login Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Transaction PIN</label>
            <input 
              type="password" 
              value={payPassword}
              onChange={(e) => setPayPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold"
              placeholder="1234"
              maxLength={6}
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 text-lg"
        >
          {isLoading ? 'প্রসেসিং হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-blue-100 font-medium">
          ইতিমধ্যে একাউন্ট আছে? <Link to="/login" className="font-black text-white underline underline-offset-4">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
