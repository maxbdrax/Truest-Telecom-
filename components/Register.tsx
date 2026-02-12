
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';
import { ShieldCheck, User as UserIcon, Lock, Smartphone, Key } from 'lucide-react';

interface Props {
  onRegister: (user: Omit<User, 'id'>) => Promise<void>;
}

const Register: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
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
      const assignedRole = secretCode === 'trust1122' ? UserRole.ADMIN : UserRole.USER;
      
      await onRegister({
        name,
        phone,
        password,
        payPassword,
        role: assignedRole,
        balance: 0,
        driveBalance: 0,
        isBlocked: false
      });
      // App.tsx handles navigation by updating state
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white overflow-y-auto">
      <div className="mb-8 text-center mt-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg">Trust Telecom</h1>
        <p className="text-blue-200 font-bold uppercase text-[10px] tracking-widest">Create New Account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4 max-w-sm pb-10">
        <div className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-4 text-blue-300" size={20} />
            <input 
              type="text" placeholder="পুরো নাম" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl bg-white border border-white/20 text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold"
              required
            />
          </div>
          <div className="relative">
            <Smartphone className="absolute left-4 top-4 text-blue-300" size={20} />
            <input 
              type="tel" placeholder="মোবাইল নাম্বার" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl bg-white border border-white/20 text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-blue-300" size={18} />
              <input 
                type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-10 rounded-2xl bg-white border border-white/20 text-black placeholder-blue-300 text-xs font-bold"
                required
              />
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-4 text-blue-300" size={18} />
              <input 
                type="password" placeholder="পিন (PIN)" value={payPassword} onChange={(e) => setPayPassword(e.target.value)}
                className="w-full p-4 pl-10 rounded-2xl bg-white border border-white/20 text-black placeholder-blue-300 text-xs font-bold"
                maxLength={6} required
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-4 text-yellow-600" size={20} />
              <input 
                type="text" placeholder="Admin Secret Code (Optional)" value={secretCode} onChange={(e) => setSecretCode(e.target.value)}
                className="w-full p-4 pl-12 rounded-2xl bg-yellow-100 border border-yellow-500/30 text-black placeholder-yellow-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 font-bold text-xs"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 text-lg uppercase tracking-widest mt-6"
        >
          {isLoading ? 'প্রসেসিং হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
        </button>
      </form>
      
      <div className="mt-2 text-center pb-10">
        <p className="text-sm text-blue-100 font-medium">
          ইতিমধ্যে একাউন্ট আছে? <Link to="/login" className="font-black text-white underline underline-offset-4">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
