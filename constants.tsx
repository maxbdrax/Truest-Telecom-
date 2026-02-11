
import React from 'react';
import { 
  Smartphone, 
  Package, 
  UserPlus, 
  Send, 
  PlusCircle, 
  Headphones, 
  CreditCard, 
  Wallet, 
  Building2, 
  Receipt, 
  PlayCircle,
  History,
  Home,
  User as UserIcon
} from 'lucide-react';

export const COLORS = {
  primary: '#1e3a8a', // Dark blue
  secondary: '#3b82f6', // Bright blue
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

export const SERVICES = [
  { id: 'topup', label: 'টপ-আপ', icon: <Smartphone className="text-blue-500" /> },
  { id: 'drive', label: 'ড্রাইভ প্যাক', icon: <Package className="text-red-500" /> },
  { id: 'regular', label: 'রেগুলার প্যাক', icon: <Package className="text-pink-500" /> },
  { id: 'register', label: 'রেজিস্টার', icon: <UserPlus className="text-orange-400" /> },
  { id: 'send_money', label: 'সেন্ড মানি', icon: <Send className="text-green-500" /> },
  { id: 'add_balance', label: 'অ্যাড ব্যালেন্স', icon: <PlusCircle className="text-teal-500" /> },
  { id: 'helpline', label: 'হেল্প-লাইন', icon: <Headphones className="text-gray-700" /> },
  { id: 'scratch', label: 'স্ক্র্যাচ কার্ড', icon: <CreditCard className="text-red-600" /> },
  { id: 'm_banking', label: 'এম-ব্যাংকিং', icon: <Wallet className="text-purple-600" /> },
  { id: 'banking', label: 'ব্যাংকিং', icon: <Building2 className="text-blue-800" /> },
  { id: 'bill_pay', label: 'বিল পে', icon: <Receipt className="text-green-600" /> },
  { id: 'tutorial', label: 'টিউটোরিয়াল', icon: <PlayCircle className="text-red-500" /> },
];

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'history', label: 'History', icon: <History /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
];
