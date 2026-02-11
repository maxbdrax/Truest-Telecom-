
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const HistoryView: React.FC<Props> = ({ transactions }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      <header className="p-4 bg-blue-900 text-white flex items-center sticky top-0 z-10 shadow-md">
        <button onClick={handleBack} className="mr-4 hover:bg-white/10 p-2 rounded-full transition-colors">
          <ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">লেনদেনের ইতিহাস</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="text-gray-300" size={32} />
            </div>
            <p className="text-sm text-gray-400 italic font-medium">কোন লেনদেনের তথ্য পাওয়া যায়নি।</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {tx.type === 'RECHARGE' || tx.type === 'SEND_MONEY' || tx.type === 'BILL_PAY' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm uppercase">{tx.type.replace('_', ' ')}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-blue-900">৳ {tx.amount.toLocaleString()}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {tx.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
