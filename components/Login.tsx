
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sxigiychhjxwisxbaamh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aWdpeWNoaGp4d2lzeGJhYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTE4NzcsImV4cCI6MjA4NTk2Nzg3N30.R3Yp5-K2HdQ2xm9r9VmSIc5QNHCzlnMHN4_NxUaRZIc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    // Hardcoded Master Admin Logic
    if (phone === '01987624041' && password === '225588') {
      const adminUser: User = {
        id: 'admin_master',
        name: 'Master Admin',
        phone: '01987624041',
        password: '225588',
        payPassword: '1234',
        role: UserRole.ADMIN,
        balance: 999999,
        driveBalance: 0,
        isBlocked: false
      };
      onLogin(adminUser);
      navigate('/dashboard');
      setIsLoading(false);
      return;
    }

    try {
      // Database Login Logic
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (error) {
        setErrorMsg("ডাটাবেস এরর: " + error.message);
      } else if (data && data.password === password) {
        if (data.isBlocked) {
          setErrorMsg("আপনার একাউন্টটি বর্তমানে ব্লক করা আছে।");
        } else {
          onLogin(data);
          navigate('/dashboard');
        }
      } else {
        setErrorMsg("মোবাইল নাম্বার বা পাসওয়ার্ড ভুল।");
      }
    } catch (err) {
      setErrorMsg("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg text-white">Trust Telecom</h1>
        <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Login to Portal</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-5 max-w-sm">
        {errorMsg && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-[10px] font-black uppercase text-red-200 text-center">
            {errorMsg}
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-blue-100 uppercase tracking-widest ml-1">Username or Phone</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 rounded-3xl bg-white border border-white/20 text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold text-sm"
            placeholder="আপনার ইউজারনেম দিন"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-blue-100 uppercase tracking-widest ml-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-3xl bg-white border border-white/20 text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-bold text-sm"
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-white text-blue-900 font-black py-4 rounded-3xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 text-base uppercase tracking-widest mt-4"
        >
          {isLoading ? 'লোড হচ্ছে...' : 'প্রবেশ করুন'}
        </button>
      </form>
      
      <div className="mt-10 text-center">
        <p className="text-xs text-blue-100 font-bold uppercase tracking-widest">
          নতুন ইউজার? <Link to="/register" className="text-white underline underline-offset-4 decoration-2">রেজিস্ট্রেশন করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
