
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ServiceStatus, AppSettings } from '../types';
import { SERVICES, NAV_ITEMS } from '../constants';
import { Bell, LogOut, ChevronRight, Smartphone } from 'lucide-react';

interface Props {
  user: User;
  services: ServiceStatus[];
  settings: AppSettings;
  onLogout: () => void;
}

const UserDashboard: React.FC<Props> = ({ user, services, settings, onLogout }) => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'chat') {
      navigate('/chat');
      return;
    }
    if (serviceId === 'add_balance') {
      navigate('/service/add_money');
      return;
    }
    const service = services.find(s => s.id === serviceId);
    if (service && !service.isActive) {
      alert("দুঃখিত, এই সার্ভিসটি বর্তমানে বন্ধ আছে।");
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-20 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 text-white rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-full border-2 border-white/50 overflow-hidden bg-white/20 p-1">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} alt="Avatar" className="w-full h-full" />
            </div>
            <div>
              <p className="font-black text-lg leading-none">{user.name}</p>
              <p className="text-xs text-blue-200 mt-1">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2.5 bg-white/10 rounded-2xl"><Bell size={20} className="text-yellow-400" /></button>
            <button onClick={onLogout} className="p-2.5 bg-white/10 rounded-2xl"><LogOut size={20} /></button>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">Total Balance</p>
                <p className="text-4xl font-black">৳ {user.balance.toLocaleString()}</p>
              </div>
              <button onClick={() => handleServiceClick('add_balance')} className="bg-white text-blue-900 px-4 py-2 rounded-2xl text-xs font-bold">
                Add Money
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Banners */}
      <div className="p-4 -mt-6">
        <div className="overflow-x-auto flex space-x-4 no-scrollbar pb-2">
           {settings.banners.map((url, i) => (
             <img key={i} src={url} className="w-[85%] flex-shrink-0 h-32 object-cover rounded-2xl shadow-lg border border-white" alt="promo" />
           ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-4 grid grid-cols-4 gap-4">
        {SERVICES.map((service) => (
          <button key={service.id} onClick={() => handleServiceClick(service.id)} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-2 border border-gray-100">
              {React.cloneElement(service.icon as React.ReactElement, { size: 28 })}
            </div>
            <span className="text-[10px] font-black text-gray-600 text-center leading-tight">{service.label}</span>
          </button>
        ))}
      </div>

      {/* Promos */}
      <div className="px-6 py-4">
        <div className="bg-indigo-900 rounded-[30px] p-6 text-white flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Instant Loan</p>
            <h3 className="text-xl font-black mb-3 leading-tight">Apply for Loan<br/>upto 20,000 ৳</h3>
            <button onClick={() => handleServiceClick('loan')} className="bg-indigo-500 text-white px-5 py-2 rounded-2xl text-[10px] font-bold">Apply Now</button>
          </div>
          <Smartphone size={40} className="opacity-20 rotate-12" />
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t flex justify-around py-4 z-50">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => item.id === 'history' ? navigate('/history') : navigate('/dashboard')} className={`flex flex-col items-center ${item.id === 'home' ? 'text-blue-900' : 'text-gray-400'}`}>
            {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
            <span className="text-[9px] font-bold mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
