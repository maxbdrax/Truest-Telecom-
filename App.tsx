
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import HistoryView from './components/HistoryView';
import ServiceForm from './components/ServiceForm';
import ChatView from './components/ChatView';
import { User, UserRole, Transaction, ServiceStatus, ChatMessage, Offer, Loan, Savings, AppSettings } from './types';
import { CheckCircle, XCircle } from 'lucide-react';

// Using the provided credentials for Project: max999 (sxigiychhjxwisxbaamh)
const SUPABASE_URL = 'https://sxigiychhjxwisxbaamh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aWdpeWNoaGp4d2lzeGJhYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTE4NzcsImV4cCI6MjA4NTk2Nzg3N30.R3Yp5-K2HdQ2xm9r9VmSIc5QNHCzlnMHN4_NxUaRZIc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface ExtendedChatMessage extends ChatMessage {
  recipientId?: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ExtendedChatMessage[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savings, setSavings] = useState<Savings[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    bkashNumber: '01XXXXXXXXX',
    nagadNumber: '01XXXXXXXXX',
    rocketNumber: '01XXXXXXXXX',
    banners: []
  });
  
  const [services, setServices] = useState<ServiceStatus[]>([
    { id: 'topup', name: 'Top-up', isActive: true, requiresVerification: false },
    { id: 'drive', name: 'Drive Pack', isActive: true, requiresVerification: true },
    { id: 'regular', name: 'Regular Pack', isActive: true, requiresVerification: false },
    { id: 'loan', name: 'Loan', isActive: true, requiresVerification: true },
    { id: 'savings', name: 'Savings', isActive: true, requiresVerification: true },
    { id: 'send_money', name: 'Send Money', isActive: true, requiresVerification: false },
    { id: 'banking', name: 'Banking', isActive: true, requiresVerification: true },
    { id: 'm_banking', name: 'M-Banking', isActive: true, requiresVerification: true },
    { id: 'bill_pay', name: 'Bill Pay', isActive: true, requiresVerification: false },
  ]);

  const [notification, setNotification] = useState<{show: boolean, type: 'SUCCESS' | 'FAILED', message: string}>({show: false, type: 'SUCCESS', message: ''});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Parallel fetching for performance
        const [
          { data: userData, error: userError },
          { data: txData, error: txError },
          { data: offerData, error: offerError },
          { data: chatData, error: chatError },
          { data: settingsData, error: settingsError }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('offers').select('*'),
          supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
          supabase.from('app_settings').select('*').maybeSingle()
        ]);

        if (userData) setUsers(userData);
        if (txData) setTransactions(txData);
        if (offerData) setOffers(offerData);
        if (chatData) setChatMessages(chatData);
        if (settingsData) setSettings(settingsData);

        // Debug logging for developers
        if (userError || txError || offerError || chatError) {
           console.warn("Some data could not be fetched. Ensure your Supabase tables exist.");
        }

        // Persistent Login Check
        const savedUser = localStorage.getItem('trust_telecom_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const { data: verifiedUser } = await supabase.from('users').select('*').eq('id', parsed.id).maybeSingle();
          if (verifiedUser) {
            setCurrentUser(verifiedUser);
          } else {
            localStorage.removeItem('trust_telecom_user');
          }
        }
      } catch (err) {
        console.error("Critical initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const showPopup = (type: 'SUCCESS' | 'FAILED', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handleLogin = async (user: User) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('phone', user.phone).maybeSingle();
      if (data) {
        setCurrentUser(data);
        localStorage.setItem('trust_telecom_user', JSON.stringify(data));
      } else {
        const { data: newUser } = await supabase.from('users').insert([user]).select().single();
        if (newUser) {
          setCurrentUser(newUser);
          setUsers(prev => [...prev, newUser]);
          localStorage.setItem('trust_telecom_user', JSON.stringify(newUser));
        }
      }
    } catch (e) {
      console.error("Login process failed:", e);
      showPopup('FAILED', "লগইন সফল হয়নি।");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trust_telecom_user');
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    try {
      const newTx = {
        ...tx,
        date: new Date().toISOString(),
        status: 'PENDING'
      };
      const { data } = await supabase.from('transactions').insert([newTx]).select().single();
      if (data) {
        setTransactions(prev => [data, ...prev]);
        showPopup('SUCCESS', "অনুরোধটি সফলভাবে পাঠানো হয়েছে। অপেক্ষ করুন।");
      }
    } catch (e) {
      console.error("Transaction submission failed:", e);
      showPopup('FAILED', "অনুরোধ পাঠানো সম্ভব হয়নি।");
    }
  };

  const updateTransactionStatus = async (txId: string, status: 'SUCCESS' | 'FAILED') => {
    try {
      const { data: updatedTx } = await supabase.from('transactions').update({ status }).eq('id', txId).select().single();
      if (updatedTx) {
        if (status === 'SUCCESS') {
          const tx = updatedTx as Transaction;
          const targetUser = users.find(u => u.id === tx.userId);
          if (targetUser) {
            let newBalance = targetUser.balance;
            if (tx.type === 'ADD_MONEY') {
              newBalance += tx.amount;
            } else {
              const modifier = (['RECHARGE', 'DRIVE_PACK', 'SEND_MONEY', 'BILL_PAY', 'LOAN_INSTALLMENT', 'REGULAR_PACK'].includes(tx.type) ? -1 : 1);
              newBalance += (tx.amount * modifier);
            }
            const { data: updatedUser } = await supabase.from('users').update({ balance: newBalance }).eq('id', tx.userId).select().single();
            if (updatedUser) {
              setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }
          }
          showPopup('SUCCESS', "অনুমোদন সফল হয়েছে");
        } else {
          showPopup('FAILED', "অনুরোধটি বাতিল করা হয়েছে");
        }
        setTransactions(prev => prev.map(tx => tx.id === txId ? updatedTx : tx));
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const updateUser = async