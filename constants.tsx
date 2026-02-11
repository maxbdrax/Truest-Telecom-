
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
  User as UserIcon,
  MessageCircle,
  PiggyBank,
  Banknote
} from 'lucide-react';

export const COLORS = {
  primary: '#1e3a8a',
  secondary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

export const OPERATORS = [
  { id: 'gp', name: 'Grameenphone', color: 'bg-blue-400' },
  { id: 'bl', name: 'Banglalink', color: 'bg-orange-500' },
  { id: 'robi', name: 'Robi', color: 'bg-red-600' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
  { id: 'teletalk', name: 'Teletalk', color: 'bg-green-600' }
];

export const SERVICES = [
  { id: 'topup', label: 'টপ-আপ', icon: <Smartphone className="text-blue-500" /> },
  { id: 'drive', label: 'ড্রাইভ প্যাক', icon: <Package className="text-red-500" /> },
  { id: 'regular', label: 'রেগুলার প্যাক', icon: <Package className="text-pink-500" /> },
  { id: 'loan', label: 'লোন', icon: <Banknote className="text-indigo-500" /> },
  { id: 'savings', label: 'সেভিংস', icon: <PiggyBank className="text-emerald-500" /> },
  { id: 'send_money', label: 'সেন্ড মানি', icon: <Send className="text-green-500" /> },
  { id: 'm_banking', label: 'এম-ব্যাংকিং', icon: <Wallet className="text-purple-600" /> },
  { id: 'banking', label: 'ব্যাংকিং', icon: <Building2 className="text-blue-800" /> },
  { id: 'bill_pay', label: 'বিল পে', icon: <Receipt className="text-green-600" /> },
  { id: 'chat', label: 'লাইভ চ্যাট', icon: <MessageCircle className="text-blue-400" /> },
  { id: 'add_balance', label: 'অ্যাড ব্যালেন্স', icon: <PlusCircle className="text-teal-500" /> },
  { id: 'tutorial', label: 'টিউটোরিয়াল', icon: <PlayCircle className="text-red-500" /> },
];

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'history', label: 'History', icon: <History /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
];
