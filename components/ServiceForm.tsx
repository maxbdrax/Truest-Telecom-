
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Landmark, 
  ReceiptText, 
  Wallet, 
  Package, 
  Info, 
  CreditCard, 
  Banknote, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Repeat, 
  Building2, 
  Send, 
  CreditCard as CardIcon, 
  Lock, 
  CheckCircle2, 
  PiggyBank,
  UserPlus,
  ArrowRightCircle
} from 'lucide-react';
import { ServiceStatus, Transaction, User, AppSettings, Offer } from '../types';
import { OPERATORS } from '../constants';

interface Props {
  onSubmit: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  services: ServiceStatus[];
  settings: AppSettings;
  user: User;
  offers: Offer[];
}

const ServiceForm: React.FC<Props> = ({ onSubmit, services, settings, user, offers }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'operator' | 'offers' | 'form' | 'payment'>((id === 'drive' || id === 'regular' || id === 'topup') ? 'operator' : 'form');
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [bankName, setBankName] = useState('Islami Bank');
  const [accName, setAccName] = useState('');
  const [tenure, setTenure] = useState('6'); 
  const [purpose, setPurpose] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [pin, setPin] = useState('');
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [billerType, setBillerType] = useState('Cash In');
  const [savingsPlan, setSavingsPlan] = useState('Monthly');

  const getTheme = () => {
    switch(id) {
      case 'topup': return 'bg-blue-600';
      case 'bill_pay': return 'bg-emerald-600';
      case 'banking': return 'bg-indigo-800';
      case 'm_banking': return 'bg-purple-700';
      case 'add_money': return 'bg-teal-600';
      case 'send_money': return 'bg-green-600';
      case 'loan': return 'bg-blue-900';
      case 'savings': return 'bg-pink-600';
      case 'drive': return 'bg-red-600';
      case 'regular': return 'bg-orange-600';
      default: return 'bg-blue-700';
    }
  };

  const label = id === 'topup' ? 'মোবাইল রিচার্জ' : 
                id === 'bill_pay' ? 'বিল পেমেন্ট' : 
                id === 'banking' ? 'ব্যাংক ট্রান্সফার' :
                id === 'm_banking' ? 'মোবাইল ব্যাংকিং' :
                id === 'add_money' ? 'অ্যাড ব্যালেন্স' :
                id === 'send_money' ? 'সেন্ড মানি' :
                id === 'drive' ? 'ড্রাইভ প্যাক' :
                id === 'regular' ? 'রেগুলার প্যাক' :
                id === 'loan' ? 'লোন আবেদন' : 
                id === 'savings' ? 'সেভিংস স্কিম' : 'সার্ভিস';

  const handleBack = () => {
    if (step === 'offers') setStep('operator');
    else if (step === 'payment') setStep(id === 'add_money' ? 'form' : (id === 'drive' || id === 'regular') ? 'offers' : 'form');
    else navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (id !== 'add_money' && pin !== user.payPassword) {
      alert("ভুল পিন (PIN) দিয়েছেন। আবার চেষ্টা করুন।");
      return;
    }

    const txType = id?.toUpperCase() as any;
    
    let details = `Number: ${number}`;
    if (id === 'bill_pay') details = `Type: ${billerType}, Bill No: ${number}`;
    if (id === 'banking') details = `Bank: ${bankName}, A/C: ${number}, Name: ${accName}`;
    if (id === 'm_banking') details = `Wallet: ${method}, Type: ${billerType}, No: ${number}`;
    if (id === 'send_money') details = `To: ${number}, Note: ${purpose}`;
    if (id === 'add_money') details = `Method: ${method}, TrxID: ${transactionId}`;
    if (id === 'loan') details = `Tenure: ${tenure} months, Purpose: ${purpose}`;
    if (id === 'savings') details = `Plan: ${savingsPlan}, Monthly Amount: ${amount}`;
    
    if (selectedOffer) {
      details = `Target: ${number}, Offer: ${selectedOffer.title}, Price: ${selectedOffer.price}`;
    }

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
      <header className={`p-4 ${getTheme()} text-white flex items-center shadow-lg sticky top-0 z-10`}>
        <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-black/10 active:scale-90 transition-all"><ChevronLeft size={24}/></button>
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">{label}</h1>
          <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest">Trust Telecom Official</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 pb-24">
        
        {step === 'operator' && (
          <div className="space-y-6">
            <h2 className="text-center text-sm font-black text-gray-400 uppercase tracking-widest mt-4">অপারেটর নির্বাচন করুন</h2>
            <div className="grid grid-cols-2 gap-4">
              {OPERATORS.map(op => (
                <button key={op.id} onClick={() => { setSelectedOperator(op.id); setStep(id === 'topup' ? 'form' : 'offers'); }} className="bg-white p-6 rounded-[35px] border-2 border-transparent hover:border-blue-500 shadow-sm flex flex-col items-center group active:scale-95 transition-all">
                  <div className={`w-16 h-16 rounded-3xl ${op.color} flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg`}>{op.name[0]}</div>
                  <span className="font-black text-gray-800 text-[11px] uppercase tracking-wider">{op.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-blue-900 uppercase bg-blue-50 px-3 py-1 rounded-full">{selectedOperator} {id === 'drive' ? 'Drive' : 'Regular'} Offers</span>
            </div>
            {filteredOffers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <Package className="mx-auto text-gray-200 mb-4" size={56} />
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">বর্তমানে কোনো অফার নেই।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredOffers.map(offer => (
                  <button key={offer.id} onClick={() => { setSelectedOffer(offer); setStep('payment'); }} className="bg-white p-5 rounded-[32px] border shadow-sm flex justify-between items-center group active:scale-95 transition-all text-left">
                    <div className="flex-1 pr-4">
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight line-clamp-1">{offer.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-red-600 font-black text-lg">৳{offer.price}</span>
                        <span className="text-[10px] text-gray-300 font-bold line-through">৳{offer.regularPrice}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[8px] font-black rounded-lg uppercase">{offer.validity}</div>
                      <div className={`p-2 rounded-full ${getTheme()} text-white shadow-lg shadow-black/10`}><ChevronRight size={14} /></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-6">
            <div className="bg-white p-8 rounded-[45px] shadow-sm border space-y-5">
              
              {/* Mobile Banking Section */}
              {id === 'm_banking' && (
                <div className="space-y-6">
                   <div className="flex flex-col items-center mb-4">
                      <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                        <Wallet size={32} />
                      </div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">সিলেক্ট করুন</p>
                   </div>

                   <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
                    {['Cash In', 'Cash Out', 'Send Money'].map(t => (
                      <button key={t} type="button" onClick={() => setBillerType(t)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${billerType === t ? 'bg-white text-purple-700 shadow-md scale-105' : 'text-gray-400'}`}>{t}</button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['bkash', 'nagad', 'rocket'].map(m => (
                      <button key={m} type="button" onClick={() => setMethod(m as any)} className={`py-4 rounded-3xl border-2 flex flex-col items-center gap-1 transition-all ${method === m ? 'border-purple-600 bg-purple-50' : 'border-transparent bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[10px] ${m === 'bkash' ? 'bg-pink-500' : m === 'nagad' ? 'bg-orange-500' : 'bg-purple-800'}`}>{m[0].toUpperCase()}</div>
                        <span className="text-[9px] font-black uppercase text-gray-700">{m}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">মোবাইল নাম্বার</label>
                      <input type="tel" placeholder="01XXXXXXXXX" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-purple-500 font-bold text-black text-lg outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">টাকার পরিমাণ</label>
                      <input type="number" placeholder="৳ ০.০০" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-purple-500 font-black text-black text-2xl outline-none" required />
                    </div>
                  </div>
                </div>
              )}

              {/* Send Money Section */}
              {id === 'send_money' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                      <Send size={32} />
                    </div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">ব্যালেন্স ট্রান্সফার</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">প্রাপকের নাম্বার</label>
                      <div className="relative">
                        <UserPlus className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input type="tel" placeholder="01XXXXXXXXX" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-green-500 font-bold text-black text-lg outline-none" required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">টাকার পরিমাণ</label>
                      <input type="number" placeholder="৳ ০.০০" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-green-500 font-black text-black text-2xl outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">নোট (ঐচ্ছিক)</label>
                      <textarea placeholder="টাকা পাঠানোর কারণ..." value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-green-500 font-bold text-black text-sm h-20 outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Savings Section */}
              {id === 'savings' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-2">
                      <PiggyBank size={32} />
                    </div>
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">ভবিষ্যৎ সঞ্চয়</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['Daily', 'Weekly', 'Monthly'].map(p => (
                      <button key={p} type="button" onClick={() => setSavingsPlan(p)} className={`py-3 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${savingsPlan === p ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-transparent bg-gray-50 text-gray-400'}`}>{p}</button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">কিস্তির পরিমাণ</label>
                      <input type="number" placeholder="৳ প্রতি কিস্তি" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 font-black text-black text-2xl outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2">আপনার মোবাইল নাম্বার</label>
                      <input type="tel" placeholder="01XXXXXXXXX" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 font-bold text-black text-lg outline-none" required />
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-2xl flex items-start gap-3">
                    <Info className="text-pink-600 shrink-0" size={18} />
                    <p className="text-[9px] font-bold text-pink-800 leading-relaxed uppercase">সঞ্চয় স্কিম চালু করার পর প্রতি সপ্তাহে/মাসে নির্দিষ্ট পরিমাণ টাকা আপনার একাউন্ট থেকে জমা হবে।</p>
                  </div>
                </div>
              )}

              {/* Common Recharge Field */}
              {id === 'topup' && (
                 <div className="space-y-5">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">মোবাইল নাম্বার</label>
                     <input type="tel" placeholder="01XXXXXXXXX" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-bold text-black text-lg outline-none" required />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">টাকার পরিমাণ</label>
                     <input type="number" placeholder="৳ ০.০০" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-black text-black text-2xl outline-none" required />
                   </div>
                 </div>
              )}

              {/* Add Balance Field */}
              {id === 'add_money' && (
                 <div className="space-y-6 text-center">
                    <input type="number" placeholder="৳ ০.০০" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-6 rounded-[35px] bg-teal-50 border font-black text-black text-4xl text-center outline-none" required />
                 </div>
               )}
            </div>

            <button type="submit" className={`w-full ${getTheme()} text-white py-5 rounded-[30px] font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2`}>
              পরবর্তী ধাপ <ArrowRightCircle size={24} />
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[45px] shadow-sm border space-y-6">
               <div className="text-center mb-4">
                  <div className={`w-16 h-16 ${getTheme()} text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <Lock size={32} />
                  </div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">লেনদেন নিশ্চিত করুন</h3>
               </div>

               <div className="bg-gray-50 p-5 rounded-[30px] border border-dashed border-gray-300 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">সার্ভিস</span>
                    <span className="text-[10px] font-black text-gray-800 uppercase">{label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">অ্যামাউন্ট</span>
                    <span className="text-lg font-black text-red-600">৳{amount || selectedOffer?.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">নাম্বার</span>
                    <span className="text-sm font-black text-gray-800">{number}</span>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-1">আপনার ৪-৬ সংখ্যার পিন দিন</label>
                  <input type="password" placeholder="••••" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} className="w-full p-5 rounded-[28px] bg-gray-50 border-2 border-transparent focus:border-blue-500 font-black text-black text-3xl tracking-[1em] text-center outline-none" required />
               </div>
            </div>

            <button onClick={handleSubmit} className={`w-full ${getTheme()} text-white py-6 rounded-[35px] font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-[0.15em]`}>
              পেমেন্ট নিশ্চিত করুন
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServiceForm;
