
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Calculator, Info, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { ServiceStatus, Transaction, User, AppSettings, Loan, Savings, Offer } from '../types';
import { OPERATORS } from '../constants';

interface Props {
  onSubmit: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  services: ServiceStatus[];
  settings: AppSettings;
  user: User;
  loans: Loan[];
  savings: Savings[];
  offers: Offer[];
}

const ServiceForm: React.FC<Props> = ({ onSubmit, services, settings, user, loans, savings: userSavings, offers }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State for flow
  const [step, setStep] = useState<'operator' | 'offers' | 'payment'>((id === 'drive' || id === 'regular') ? 'operator' : 'payment');
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  
  // Form fields
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [pin, setPin] = useState('');

  const [emiRate] = useState<string>('9');
  const [emiTenure] = useState<string>('12');
  const [emiResult, setEmiResult] = useState<{ monthly: number, totalInterest: number, totalPayment: number } | null>(null);

  const label = id === 'topup' ? 'মোবাইল রিচার্জ' : 
                id === 'loan' ? 'লোন এবং ইএমআই' : 
                id === 'add_money' ? 'অ্যাড ব্যালেন্স' :
                id === 'savings' ? 'সেভিংস' :
                id === 'drive' ? `${selectedOperator ? selectedOperator.charAt(0).toUpperCase() + selectedOperator.slice(1) : ''} Offer` :
                id?.replace('_', ' ').toUpperCase() || 'Service';

  const calculateEMI = () => {
    const p = parseFloat(amount) || 0;
    const r = parseFloat(emiRate) / 12 / 100;
    const n = parseFloat(emiTenure);
    if (p > 0 && r > 0 && n > 0) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmiResult({ monthly: Math.round(emi), totalInterest: Math.round(emi * n - p), totalPayment: Math.round(emi * n) });
    }
  };

  useEffect(() => { if (id === 'loan') calculateEMI(); }, [amount, id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('কপি করা হয়েছে');
  };

  const handleBack = () => {
    if (step === 'offers') setStep('operator');
    else if (step === 'payment' && (id === 'drive' || id === 'regular')) setStep('offers');
    else navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'add_money') {
      onSubmit({ userId: user.id, type: 'ADD_MONEY', amount: parseFloat(amount), details: `Method: ${method}, TrxID: ${transactionId}` });
    } else if (id === 'drive' || id === 'regular') {
      onSubmit({
        userId: user.id,
        type: id === 'drive' ? 'DRIVE_PACK' : 'REGULAR_PACK',
        amount: selectedOffer?.price || 0,
        details: `Offer: ${selectedOffer?.title}, TrxID: ${transactionId}, Target: ${number}`,
        operator: selectedOperator || undefined
      });
    } else {
      onSubmit({
        userId: user.id,
        type: (id?.toUpperCase() as any) || 'RECHARGE',
        amount: parseFloat(amount),
        details: `Number: ${number}${selectedOperator ? ` (${selectedOperator})` : ''}`,
        operator: selectedOperator || undefined
      });
    }
    navigate('/dashboard');
  };

  const filteredOffers = offers.filter(o => 
    o.operator.toLowerCase() === selectedOperator?.toLowerCase() && 
    o.type === (id === 'drive' ? 'DRIVE' : 'REGULAR')
  );

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      <header className="p-4 bg-red-600 text-white flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={handleBack} className="mr-4 p-1 rounded-full hover:bg-white/10"><ChevronLeft size={24}/></button>
        <h1 className="text-lg font-bold">{step === 'payment' ? 'Payment' : label}</h1>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        
        {/* Step 1: Select Operator */}
        {step === 'operator' && (
          <div className="p-6 space-y-6">
             <h2 className="text-gray-800 font-black text-center text-lg mb-8">অপারেটর সিলেক্ট করুন</h2>
             <div className="grid grid-cols-2 gap-4">
               {OPERATORS.map(op => (
                 <button 
                  key={op.id} 
                  onClick={() => { setSelectedOperator(op.id); setStep('offers'); }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center group active:scale-95 transition-all"
                >
                    <div className={`w-14 h-14 rounded-full ${op.color} flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg`}>
                      {op.name[0]}
                    </div>
                    <span className="font-bold text-gray-700">{op.name}</span>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* Step 2: Show Offers Grid (Screenshot 1) */}
        {step === 'offers' && (
          <div className="p-4 grid grid-cols-2 gap-3">
             {filteredOffers.length === 0 ? (
               <div className="col-span-2 text-center py-20 text-gray-400 font-bold">বর্তমানে কোন অফার নেই।</div>
             ) : (
               filteredOffers.map(offer => (
                 <div key={offer.id} onClick={() => { setSelectedOffer(offer); setStep('payment'); }} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden group active:scale-95 transition-all cursor-pointer">
                    <h3 className="text-[12px] font-black text-gray-800 mb-3 text-center">{offer.title}</h3>
                    <div className="h-[1px] bg-gray-100 w-full mb-3"></div>
                    <p className="text-red-500 text-2xl font-black mb-3">৳{offer.price}</p>
                    <div className="h-[1px] bg-gray-100 w-full mb-3"></div>
                    <p className="text-[11px] font-bold text-gray-700 mb-3">মেয়াদ {offer.validity}</p>
                    <div className="h-[1px] bg-gray-100 w-full mb-3"></div>
                    <div className="flex items-center space-x-2">
                       <div className="text-left">
                          <p className="text-[10px] font-bold text-gray-800">রেগুলার মূল্য</p>
                          <p className="text-[10px] font-bold text-gray-800">{offer.regularPrice}৳</p>
                       </div>
                       <div className="w-6 h-6 flex items-center justify-center">
                          <div className="w-4 h-4 bg-gradient-to-tr from-pink-500 to-orange-400 rotate-45 rounded-sm"></div>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {/* Step 3: Payment Screen (Screenshot 2) */}
        {step === 'payment' && (
          <div className="p-4 flex flex-col h-full space-y-6">
             
             {/* Payment Methods */}
             <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
               <button onClick={() => setMethod('bkash')} className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${method === 'bkash' ? 'border-pink-500 bg-pink-50/20' : 'border-transparent opacity-60'}`}>
                  <img src="https://logolook.net/wp-content/uploads/2023/11/bKash-Logo.png" alt="bkash" className="h-10 object-contain mb-1" />
                  <span className="text-[10px] font-bold">bKash</span>
               </button>
               <button onClick={() => setMethod('nagad')} className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${method === 'nagad' ? 'border-orange-500 bg-orange-50/20' : 'border-transparent opacity-60'}`}>
                  <img src="https://seeklogo.com/images/N/nagad-logo-7A70CC6684-seeklogo.com.png" alt="nagad" className="h-10 object-contain mb-1" />
                  <span className="text-[10px] font-bold">নগদ</span>
               </button>
               <button onClick={() => setMethod('rocket')} className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${method === 'rocket' ? 'border-purple-500 bg-purple-50/20' : 'border-transparent opacity-60'}`}>
                  <img src="https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1BD458D-seeklogo.com.png" alt="rocket" className="h-10 object-contain mb-1" />
                  <span className="text-[10px] font-bold">রকেট</span>
               </button>
             </div>

             {/* Dynamic Number Info */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-[12px] font-black text-gray-800 uppercase mb-1 capitalize">{method} Number :</p>
                   <p className="text-lg font-black text-blue-900 tracking-wider">
                     {method === 'bkash' ? settings.bkashNumber : method === 'nagad' ? settings.nagadNumber : settings.rocketNumber}
                   </p>
                </div>
                <button 
                  onClick={() => copyToClipboard(method === 'bkash' ? settings.bkashNumber : method === 'nagad' ? settings.nagadNumber : settings.rocketNumber)} 
                  className="bg-gray-100 p-3 rounded-full hover:bg-gray-200"
                >
                  <Copy size={20} className="text-gray-600" />
                </button>
             </div>

             {/* Selected Offer Details */}
             {selectedOffer && (
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                   <p className="text-sm font-black text-gray-800">{selectedOffer.title}</p>
                   <p className="text-red-500 font-black px-3 py-1 bg-red-50 rounded-lg">{selectedOffer.price}৳</p>
                </div>
             )}

             <p className="text-red-500 text-[11px] font-bold">*শুধুমাত্র চট্টগ্রামের লোকেরা পাবে এই অফারটি</p>

             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-wide">*Transaction Id</label>
                   <input 
                    type="text" 
                    placeholder="Transaction Id" 
                    value={transactionId} 
                    onChange={e => setTransactionId(e.target.value)} 
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-gray-700 font-bold"
                    required 
                   />
                </div>
                <div>
                   <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-wide">*Offer Number</label>
                   <input 
                    type="text" 
                    placeholder="Offer Number" 
                    value={number} 
                    onChange={e => setNumber(e.target.value)} 
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-gray-700 font-bold"
                    required 
                   />
                </div>
                <p className="text-red-500 text-[11px] font-bold">*ভুল নাম্বার দিলে কর্তৃপক্ষ দায়ী নয়!</p>

                <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-lg tracking-widest uppercase">
                   CONFIRM
                </button>
             </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServiceForm;
