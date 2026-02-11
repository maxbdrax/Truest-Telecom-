
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const HistoryView: React.FC<Props> = ({ transactions }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      <header className="p-4 bg-blue-900 text-white flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ChevronLeft />
        </button>
        <h1 className="text-lg font-bold">লেনদেনের ইতিহাস</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 italic">কোন লেনদেনের তথ্য পাওয়া যায়নি।</div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {tx.type === 'RECHARGE' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{tx.type}</p>
                  <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-900">{tx.amount} TK</p>
                <p className={`text-[10px] font-bold ${tx.status === 'SUCCESS' ? 'text-green-500' : 'text-yellow-500'}`}>
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
