
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ServiceStatus } from '../types';
import { SERVICES, NAV_ITEMS } from '../constants';
import { Bell, LogOut } from 'lucide-react';

interface Props {
  user: User;
  services: ServiceStatus[];
  onLogout: () => void;
}

const UserDashboard: React.FC<Props> = ({ user, services, onLogout }) => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service && !service.isActive) {
      alert("দুঃখিত, এই সার্ভিসটি বর্তমানে বন্ধ আছে।");
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-blue-900 p-4 text-white rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-300">
               <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt="Avatar" />
            </div>
            <div>
              <p className="font-bold text-sm">{user.name}</p>
              <p className="text-xs text-blue-200">{user.phone} <span className="ml-1 bg-white/20 px-1 rounded">{user.role}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-white/10 rounded-full">
              <Bell size={20} className="text-yellow-400" />
            </button>
            <button onClick={onLogout} className="p-2 bg-white/10 rounded-full">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        <div className="text-center font-bold text-lg mb-4">
           TRUST TELECOM
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
            <p className="text-xs text-blue-100 font-medium">টপ-আপ</p>
            <p className="text-xl font-bold">{user.balance} TK</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
            <p className="text-xs text-blue-100 font-medium">ড্রাইভ</p>
            <p className="text-xl font-bold">{user.driveBalance} TK</p>
          </div>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div className="bg-blue-50 py-2 px-4 border-b overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-blue-800 text-sm font-medium">
          আছেন সবাই আল্লাহ রহমতে আমি ও অনেক ভালো আছি আলহামদুলিল্লাহ! সকল সার্ভিসের জন্য আমাদের সাথে থাকুন।
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-4 grid grid-cols-4 gap-4">
        {SERVICES.map((service) => (
          <button 
            key={service.id}
            onClick={() => handleServiceClick(service.id)}
            className="flex flex-col items-center group"
          >
            <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-1 group-active:scale-95 transition-transform border border-gray-100">
              {React.cloneElement(service.icon as React.ReactElement, { size: 28 })}
            </div>
            <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">
              {service.label}
            </span>
          </button>
        ))}
      </div>

      {/* Ad Banner */}
      <div className="mx-4 mt-2 mb-4 rounded-xl overflow-hidden shadow-lg">
        <img src="https://picsum.photos/seed/ads/400/150" alt="Promo" className="w-full h-auto object-cover" />
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t flex justify-around py-3">
        {NAV_ITEMS.map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              if (item.id === 'history') navigate('/history');
              else if (item.id === 'home') navigate('/dashboard');
              else alert('Profile clicked');
            }}
            className="flex flex-col items-center text-gray-400 hover:text-blue-900"
          >
            {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
