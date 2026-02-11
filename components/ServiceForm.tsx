
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ServiceStatus, Transaction } from '../types';

interface Props {
  onSubmit: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  services: ServiceStatus[];
}

const ServiceForm: React.FC<Props> = ({ onSubmit, services }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [pin, setPin] = useState('');

  const service = services.find(s => s.id === id);
  const label = id?.replace('_', ' ').toUpperCase() || 'Service';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !number || !pin) return;
    
    onSubmit({
      userId: '1', // Hardcoded for demo
      type: (id?.toUpperCase() as any) || 'RECHARGE',
      amount: parseFloat(amount),
      details: `Number: ${number}`
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      <header className="p-4 bg-blue-900 text-white flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">{label}</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {service?.requiresVerification && (
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700 font-medium">
            Note: This service requires admin verification before processing.
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">ফোন নম্বর / অ্যাকাউন্ট নম্বর</label>
          <input 
            type="text" 
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="01xxxxxxxxx"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">টাকার পরিমাণ</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="0.00 TK"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">আপনার পিন</label>
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="••••"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          সাবমিট করুন
        </button>
      </form>
    </div>
  );
};

export default ServiceForm;
