
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock logic
    if (phone === '01863575188' && password === 'admin') {
      onLogin({
        id: '1',
        name: 'A M IMRAN Dev',
        phone: '01863575188',
        role: UserRole.ADMIN,
        balance: 5000,
        driveBalance: 2500,
        isBlocked: false
      });
      navigate('/dashboard');
    } else if (phone && password) {
       onLogin({
        id: '2',
        name: 'Trust User',
        phone: phone,
        role: UserRole.USER,
        balance: 100,
        driveBalance: 0,
        isBlocked: false
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-6 text-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Trust Telecom</h1>
        <p className="text-blue-200">সততাই আমাদের মূল লক্ষ্য</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
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
          Login
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-blue-100">
          Don't have an account? <Link to="/register" className="font-bold underline">Register</Link>
        </p>
        <p className="mt-4 text-xs text-blue-300">Admin Tip: Use 01863575188 / admin</p>
      </div>
    </div>
  );
};

export default Login;
