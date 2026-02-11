
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';

interface Props {
  onRegister: (user: User) => void;
}

const Register: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      id: Math.random().toString(),
      name,
      phone,
      role: UserRole.USER,
      balance: 0,
      driveBalance: 0,
      isBlocked: false
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Trust Telecom</h1>
        <p className="text-blue-200">নতুন অ্যাকাউন্ট তৈরি করুন</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="আপনার নাম"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="01xxxxxxxxx"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-white text-blue-900 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
        >
          Register
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-blue-100">
          Already have an account? <Link to="/login" className="font-bold underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
