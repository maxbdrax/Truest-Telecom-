
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Calculator, Info, Copy, CheckCircle2, ChevronRight, Smartphone, Landmark, ReceiptText, Wallet, Package } from 'lucide-react';
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

const ServiceForm: React.FC<Props> = ({ onSubmit, services, settings, user, loans, savings, offers }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'operator' | 'offers' | 'form' | 'payment'>((id === 'drive' || id === 'regular') ? 'operator' : 'form');
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [billerType, setBillerType] = useState('Electricity');

  const label = id === 'topup' ? 'মোবাইল রিচার্জ' : 
                id === 'bill_pay' ? 'বিল পেমেন্ট' : 
                id === 'banking' ? 'ব্যাংক ট্রান্সফার' :
                id === 'm_banking' ? 'মোবাইল ব্যাংকিং' :
                id === 'add_money' ? 'অ্যাড ব্যালেন্স' :
                id === 'drive' ? 'ড্রাইভ প্যাক' :
                id === 'regular' ? 'রেগুলার প্যাক' : 'সার্ভিস';

  const handleBack = () => {
    if (step === 'offers') setStep('operator');
    else if (step === 'payment') setStep(id === 'add_money' ? 'form' : (id === 'drive' || id === 'regular') ? 'offers' : 'form');
    else navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const txType = id?.toUpperCase() as any;
    
    let details = `Number: ${number}`;
    if (id === 'bill_pay') details = `Type: ${billerType}, Consumer ID: ${number}`;
    if (id === 'banking') details = `Bank: ${billerType}, Account: ${number}`;
    if (id === 'add_money') details = `Method: ${method}, TrxID: ${transactionId}`;
    if (selectedOffer) details += `, Offer: ${selectedOffer.title}, TrxID: ${transactionId}`;

    onSubmit({
      userId: user.id,
      type: txType || 'RECHARGE',
      amount: parseFloat(amount) || selectedOffer?.price || 0,
      details,
      operator: selectedOperator || undefined
    });
    navigate('/dashboard');
  };

  const filteredOffers = offers.filter(o => 
    o.operator.toLowerCase() === selectedOperator?.toLowerCase() && 
    o.type === (id === 'drive' ? 'DRIVE' : 'REGULAR')
  );

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
      <header className={`p-4 ${id === 'topup' ? 'bg-blue-600' : id === 'bill_pay' ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center sticky top-0 z-10 shadow-lg`}>
        <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-black/10 transition-colors"><ChevronLeft size={24}/></button>
        <h1 className="text-lg font-black tracking-tight">{label}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        
        {/* Recharge / Operator selection */}
        {step === 'operator' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {OPERATORS.map(op => (
              <button key={op.id} onClick={() => { setSelectedOperator(op.id); setStep('offers'); }} className="bg-white p-6 rounded-[30px] border shadow-sm flex flex-col items-center group active:scale-95 transition-all">
                <div className={`w-14 h-14 rounded-full ${op.color} flex items-center justify-center text-white font-black text-xl mb-3`}>{op.name[0]}</div>
                <span className="font-black text-gray-700">{op.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Offers list */}
        {step === 'offers' && (
          <div className="grid grid-cols-2 gap-4">
            {filteredOffers.length === 0 ? (
              <div className="col-span-2 text-center py-20 bg-white rounded-[32px] border border-dashed">
                <Package className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-bold">এই অপারেটরে কোন অফার নেই।</p>
              </div>
            ) : (
              filteredOffers.map(offer => (
                <div key={offer.id} onClick={() => { setSelectedOffer(offer); setStep('payment'); }} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center group active:scale-95 transition-all">
                  <h3 className="text-[11px] font-black text-gray-800 text-center mb-2 line-clamp-2">{offer.title}</h3>
                  <p className="text-red-500 text-2xl font-black">৳{offer.price}</p>
                  <p className="text-[9px] text-gray-400 font-bold mt-1 line-through">৳{offer.regularPrice}</p>
                  <div className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full">{offer.validity}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Specialized Forms */}
        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); if(id === 'add_money') setStep('payment'); else handleSubmit(e); }} className="space-y-6">
            
            {id === 'topup' && (
              <div className="bg-white p-6 rounded-[32px] shadow-sm border space-y-4">
                 <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Smartphone size={20} /> <span className="font-black text-xs uppercase">রিচার্জ ডিটেইলস</span>
                 </div>
                 <input type="tel" placeholder="মোবাইল নাম্বার দিন" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold outline-none focus:border-blue-500" required />
                 <input type="number" placeholder="টাকার পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold outline-none focus:border-blue-500" required />
              </div>
            )}

            {id === 'bill_pay' && (
              <div className="bg-white p-6 rounded-[32px] shadow-sm border space-y-4">
                 <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <ReceiptText size={20} /> <span className="font-black text-xs uppercase">বিলার ডিটেইলস</span>
                 </div>
                 <select value={billerType} onChange={e => setBillerType(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold">
                    <option>Electricity (DESCO/DPDC)</option>
                    <option>Water (WASA)</option>
                    <option>Gas</option>
                    <option>Internet</option>
                 </select>
                 <input type="text" placeholder="কাস্টমার আইডি / বিল নাম্বার" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold" required />
                 <input type="number" placeholder="বিলের পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold" required />
              </div>
            )}

            {id === 'banking' && (
              <div className="bg-white p-6 rounded-[32px] shadow-sm border space-y-4">
                 <div className="flex items-center space-x-2 text-blue-800 mb-2">
                    <Landmark size={20} /> <span className="font-black text-xs uppercase">ব্যাংক ডিটেইলস</span>
                 </div>
                 <select value={billerType} onChange={e => setBillerType(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold">
                    <option>Dutch Bangla Bank</option>
                    <option>Islami Bank</option>
                    <option>Sonali Bank</option>
                    <option>Brac Bank</option>
                 </select>
                 <input type="text" placeholder="একাউন্ট নাম্বার" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold" required />
                 <input type="number" placeholder="অ্যামাউন্ট" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold" required />
              </div>
            )}

            {id === 'add_money' && (
              <div className="bg-white p-6 rounded-[32px] shadow-sm border space-y-4">
                 <div className="flex items-center space-x-2 text-teal-600 mb-2">
                    <Wallet size={20} /> <span className="font-black text-xs uppercase">অ্যামাউন্ট দিন</span>
                 </div>
                 <input type="number" placeholder="কত টাকা যোগ করবেন?" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border font-bold text-center text-2xl" required />
                 <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].map(val => (
                      <button key={val} type="button" onClick={() => setAmount(val.toString())} className="py-2 bg-gray-100 rounded-xl font-bold text-xs text-gray-600">৳{val}</button>
                    ))}
                 </div>
                 <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black shadow-lg">পরবর্তী ধাপ</button>
              </div>
            )}

            {id !== 'add_money' && (
              <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-red-200 active:scale-95 transition-all">সাবমিট করুন</button>
            )}
          </form>
        )}

        {/* Payment Screen (For Add Money, Drive, Regular) */}
        {step === 'payment' && (
          <div className="space-y-6">
             <div className="flex space-x-2 bg-white p-2 rounded-2xl border">
               {['bkash', 'nagad', 'rocket'].map(m => (
                 <button key={m} onClick={() => setMethod(m as any)} className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all ${method === m ? 'border-red-500 bg-red-50' : 'border-transparent opacity-50'}`}>
                    <span className="text-[10px] font-black uppercase">{m}</span>
                 </button>
               ))}
             </div>

             <div className="bg-white p-6 rounded-[32px] shadow-sm border text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">পেমেন্ট নাম্বার (Send Money)</p>
                <p className="text-2xl font-black text-blue-900 tracking-wider">
                  {method === 'bkash' ? settings.bkashNumber : method === 'nagad' ? settings.nagadNumber : settings.rocketNumber}
                </p>
                <button onClick={() => { navigator.clipboard.writeText(method === 'bkash' ? settings.bkashNumber : settings.nagadNumber); alert('নাম্বার কপি হয়েছে'); }} className="mt-3 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase">Copy Number</button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Transaction ID লিখুন" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full p-4 rounded-2xl bg-white border font-bold" required />
                { (id === 'drive' || id === 'regular') && <input type="tel" placeholder="অফারটি কোন নাম্বারে যাবে?" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-white border font-bold" required /> }
                <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl active:scale-95 transition-all">পেমেন্ট নিশ্চিত করুন</button>
             </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServiceForm;
