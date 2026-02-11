
import React from 'react';
import { User, ServiceStatus, Transaction } from '../types';
import { Users, UserX, CheckCircle, XCircle, Clock, Smartphone, LogOut, Settings } from 'lucide-react';

interface Props {
  user: User;
  services: ServiceStatus[];
  onToggleService: (id: string) => void;
  onLogout: () => void;
  transactions: Transaction[];
}

const AdminDashboard: React.FC<Props> = ({ user, services, onToggleService, onLogout, transactions }) => {
  const stats = [
    { label: 'Total Users', count: 124, icon: <Users />, color: 'bg-blue-500' },
    { label: 'Blocked Users', count: 3, icon: <UserX />, color: 'bg-green-500' },
    { label: 'Total Success Payment', count: 89, icon: <CheckCircle />, color: 'bg-sky-500' },
    { label: 'Total Failed Payment', count: 12, icon: <XCircle />, color: 'bg-orange-400' },
    { label: 'Total Pending Money Out', count: 5, icon: <Clock />, color: 'bg-yellow-500' },
    { label: 'Total Success Money Out', count: 42, icon: <CheckCircle />, color: 'bg-emerald-500' },
    { label: 'Total Failed Money Out', count: 8, icon: <XCircle />, color: 'bg-rose-400' },
    { label: 'Total Success Recharge', count: 256, icon: <Smartphone />, color: 'bg-blue-600' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-100 overflow-y-auto pb-6">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Settings size={20} className="text-gray-600" />
          <h1 className="text-lg font-bold">Dashboard</h1>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-full text-red-500">
          <LogOut size={20} />
        </button>
      </header>

      <div className="p-4 space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.color} p-4 rounded-xl text-white flex items-center justify-between shadow-sm`}>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold">{stat.count} টি/জন</p>
                <p className="text-xs font-medium opacity-90">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Service Controls (Off-Season)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
          {services.map((service) => (
            <div key={service.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{service.name}</p>
                <p className="text-xs text-gray-500">Status: {service.isActive ? 'Active' : 'Offline'}</p>
              </div>
              <button 
                onClick={() => onToggleService(service.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  service.isActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {service.isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
