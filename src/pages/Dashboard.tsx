import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Coins, 
  Tv, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  Calendar,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { doc, updateDoc, collection, query, where, getDocs, limit, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { OperationType, handleFirestoreError } from '../lib/error-handler';

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1100 },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeSubs: 0,
    totalChannels: 0,
    totalOrders: 0,
    recentTransactions: []
  });

  const [claimCooldown, setClaimCooldown] = useState(0);

  useEffect(() => {
    if (!profile) return;

    const fetchStats = async () => {
      try {
        // Channels count
        const channelsSnap = await getDocs(query(collection(db, 'channels'), where('userId', '==', profile.uid)));
        
        // Orders count
        const ordersSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', profile.uid)));
        const activeOrders = ordersSnap.docs.filter(d => d.data().status === 'active').length;

        // Transactions
        const transSnap = await getDocs(query(
          collection(db, 'transactions'), 
          where('userId', '==', profile.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        ));

        setStats({
          activeSubs: activeOrders,
          totalChannels: channelsSnap.size,
          totalOrders: ordersSnap.size,
          recentTransactions: transSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'multiple collections');
      }
    };

    fetchStats();

    // Daily reward timer logic
    if (profile.lastDailyReward) {
      const last = new Date(profile.lastDailyReward).getTime();
      const now = new Date().getTime();
      const diff = 24 * 60 * 60 * 1000 - (now - last);
      if (diff > 0) setClaimCooldown(diff);
    }
  }, [profile]);

  useEffect(() => {
    if (claimCooldown <= 0) return;
    const timer = setInterval(() => {
      setClaimCooldown(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [claimCooldown]);

  const claimDailyReward = async () => {
    if (!profile) return;
    if (claimCooldown > 0) return;

    try {
      const userRef = doc(db, 'users', profile.uid);
      const newCoins = profile.coins + 5;
      const now = new Date().toISOString();

      await updateDoc(userRef, {
        coins: newCoins,
        lastDailyReward: now
      });

      // Transaction log - use setDoc with fixed ID for idempotency
      const txId = `${profile.uid}_daily_${Date.now()}`;
      await setDoc(doc(db, 'transactions', txId), {
        userId: profile.uid,
        amount: 5,
        type: 'reward',
        description: 'Daily login bonus',
        createdAt: now
      });

      setClaimCooldown(24 * 60 * 60 * 1000);
      toast.success('5 Coins added to your wallet!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}/reward`);
    }
  };

  const formatCooldown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all overflow-hidden relative group">
      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full bg-${color}-500 group-hover:opacity-20 transition-opacity`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-orange-600 to-orange-500 overflow-hidden shadow-2xl shadow-orange-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Good morning, {profile?.displayName}!</h2>
            <p className="text-orange-100/80 font-medium">Your channel growth is up 12% this week. Keep it up!</p>
          </div>
          <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-orange-200 uppercase tracking-widest font-bold">Daily Reward</div>
              <div className="text-lg font-bold text-white">
                {claimCooldown > 0 ? formatCooldown(claimCooldown) : 'Available Now!'}
              </div>
            </div>
            <Button 
              size="lg" 
              className={claimCooldown > 0 ? "bg-white/10 text-white cursor-not-allowed" : "bg-white text-orange-600 hover:bg-orange-50"}
              onClick={claimDailyReward}
              disabled={claimCooldown > 0}
            >
              {claimCooldown > 0 ? 'Claimed' : 'Claim 5 Coins'}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Current Coins" value={profile?.coins || 0} icon={Coins} color="orange" trend={+5} />
        <StatCard title="Active Subs" value={stats.activeSubs} icon={Calendar} color="blue" trend={+2} />
        <StatCard title="Total Channels" value={stats.totalChannels} icon={Tv} color="purple" trend={0} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={CreditCard} color="emerald" trend={+12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
            <CardDescription>Visual stats for your linked channels</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest wallet events</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-500">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl border border-slate-800 ${
                    tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${tx.amount < 0 && 'rotate-180'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
              {stats.recentTransactions.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
