
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ServiceStatus, AppSettings, Tutorial } from '../types';
import { SERVICES, NAV_ITEMS } from '../constants';
import { Bell, LogOut, ChevronRight, Smartphone, Settings, X, Lock, PlayCircle, ChevronLeft, Video } from 'lucide-react';

interface Props {
  user: User;
  services: ServiceStatus[];
  settings: AppSettings;
  tutorials: Tutorial[];
  onLogout: () => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
}

const UserDashboard: React.FC<Props> = ({ user, services, settings, tutorials, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'HOME' | 'PROFILE' | 'TUTORIALS'>('HOME');
  const [newPassword, setNewPassword] = useState('');

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'chat') { navigate('/chat'); return; }
    if (serviceId === 'add_balance') { navigate('/service/add_money'); return; }
    if (serviceId === 'tutorial') { setActiveView('TUTORIALS'); return; }
    
    const serviceStatus = services.find(s => s.id === serviceId);
    if (serviceStatus && !serviceStatus.isActive) {
      alert(`দুঃখিত, ${serviceStatus.name} সার্ভিসটি বর্তমানে বন্ধ আছে।`);
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  const handleChangePassword = () => {
    if (newPassword.trim()) {
      onUpdateUser(user.id, { password: newPassword });
      setNewPassword('');
      alert("পাসওয়ার্ড পরিবর্তন সফল হয়েছে।");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-20 overflow-y-auto h-full">
      {activeView === 'HOME' && (
        <>
          {/* Header Section */}
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
                <button onClick={() => setActiveView('PROFILE')} className="p-2.5 bg-white/10 rounded-2xl"><Settings size={20} /></button>
                <button onClick={onLogout} className="p-2.5 bg-white/10 rounded-2xl"><LogOut size={20} /></button>
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">Available Balance</p>
                    <p className="text-4xl font-black">৳ {user.balance.toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleServiceClick('add_balance')} className="bg-white text-blue-900 px-4 py-2 rounded-2xl text-xs font-bold shadow-lg active:scale-95">
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Grid */}
          <div className="p-4 grid grid-cols-4 gap-4">
            {SERVICES.map((service) => (
              <button key={service.id} onClick={() => handleServiceClick(service.id)} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-2 border border-gray-100 group-active:scale-95 transition-all">
                  {React.cloneElement(service.icon as React.ReactElement, { size: 28 })}
                </div>
                <span className="text-[10px] font-black text-gray-600 text-center leading-tight">{service.label}</span>
              </button>
            ))}
          </div>

          <div className="px-6 py-4">
            <div className="bg-indigo-900 rounded-[30px] p-6 text-white flex items-center justify-between shadow-2xl">
              <div>
                <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Instant Loan</p>
                <h3 className="text-xl font-black mb-3 leading-tight">Apply for Loan<br/>upto 20,000 ৳</h3>
                <button onClick={() => handleServiceClick('loan')} className="bg-indigo-500 text-white px-5 py-2 rounded-2xl text-[10px] font-bold shadow-lg">Apply Now</button>
              </div>
              <Smartphone size={40} className="opacity-20 rotate-12" />
            </div>
          </div>
        </>
      )}

      {/* Tutorial View */}
      {activeView === 'TUTORIALS' && (
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveView('HOME')} className="p-2 bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
              <h2 className="text-2xl font-black text-blue-900 tracking-tight">ভিডিও টিউটোরিয়াল</h2>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            {tutorials.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <Video className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">বর্তমানে কোন ভিডিও নেই।</p>
              </div>
            ) : (
              tutorials.map(tut => (
                <div key={tut.id} className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-gray-100 group">
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <PlayCircle className="text-white opacity-50 group-hover:scale-125 transition-transform" size={48} />
                    {/* Note: In a real app, you'd use a YouTube player or Video tag here */}
                  </div>
                  <div className="p-5 flex justify-between items-center bg-white">
                    <div>
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{tut.title}</h3>
                      <p className="text-[9px] text-blue-500 font-bold mt-1">Trust Telecom Official</p>
                    </div>
                    <a href={tut.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Watch Now</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Profile View */}
      {activeView === 'PROFILE' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-blue-900">আপনার প্রোফাইল</h2>
            <button onClick={() => setActiveView('HOME')} className="p-2 bg-gray-100 rounded-full"><X size={24} /></button>
          </div>
          <div className="bg-white p-6 rounded-[30px] shadow-lg border mb-6 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 mx-auto mb-4 border-4 border-blue-900/10 flex items-center justify-center">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-20" alt="profile" />
            </div>
            <h3 className="text-xl font-black">{user.name}</h3>
            <p className="text-gray-400 font-bold">{user.phone}</p>
          </div>
          <div className="bg-white p-6 rounded-[30px] shadow-lg border">
            <h4 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><Lock size={18} /> পাসওয়ার্ড পরিবর্তন</h4>
            <div className="space-y-4">
              <input type="password" placeholder="নতুন পাসওয়ার্ড" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border outline-none font-bold" />
              <button onClick={handleChangePassword} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-lg">আপডেট করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t flex justify-around py-4 z-50">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => {
            if (item.id === 'history') navigate('/history');
            else if (item.id === 'profile') setActiveView('PROFILE');
            else setActiveView('HOME');
          }} className={`flex flex-col items-center ${item.id === 'home' && activeView === 'HOME' ? 'text-blue-900' : item.id === 'profile' && activeView === 'PROFILE' ? 'text-blue-900' : 'text-gray-400'}`}>
            {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
            <span className="text-[9px] font-bold mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
