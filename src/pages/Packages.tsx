import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Package as PackageIcon, 
  Clock, 
  Calendar, 
  Check, 
  AlertCircle,
  Coins,
  ChevronRight,
  TrendingUp,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/error-handler';
import { SUBSCRIPTION_PACKAGES, POST_PACKAGES, TIME_WINDOWS, Package } from '../types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface PackageCardProps {
  key?: string | number;
  pkg: Package;
  isPopular?: boolean;
  onSelect: (pkg: Package) => void;
}

const PackageCard = ({ pkg, isPopular, onSelect }: PackageCardProps) => (
  <Card className={cn(
    "bg-slate-900/50 border-slate-800 transition-all cursor-pointer relative overflow-hidden group",
    isPopular && "border-orange-500/50 shadow-2xl shadow-orange-500/5"
  )}>
    {isPopular && (
      <div className="absolute top-4 right-[-35px] bg-orange-500 text-white text-[10px] font-bold py-1 px-10 rotate-45 uppercase tracking-widest shadow-lg">
        Best Value
      </div>
    )}
    <CardHeader>
      <div className="p-3 w-fit rounded-xl bg-slate-800 mb-2 group-hover:scale-110 transition-transform">
        {pkg.type === 'subscription' ? <Zap className="w-6 h-6 text-orange-500" /> : <Tv className="w-6 h-6 text-blue-500" />}
      </div>
      <CardTitle className="text-xl">{pkg.name}</CardTitle>
      <CardDescription>Target: {pkg.reactions.toLocaleString()} reactions</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">{pkg.price}</span>
        <span className="text-slate-500 mb-1">coins / {pkg.type === 'subscription' ? 'day' : 'post'}</span>
      </div>
      <ul className="space-y-2 text-sm text-slate-400">
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Automated delivery</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Safe for channel</li>
        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Premium server pool</li>
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full bg-slate-800 hover:bg-orange-600 hover:text-white transition-all border-none"
        onClick={() => onSelect(pkg)}
      >
        Select Plan
      </Button>
    </CardFooter>
  </Card>
);

export default function Packages() {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [days, setDays] = useState(1);
  const [window, setWindow] = useState(TIME_WINDOWS[1]); // 30 mins default
  const [checkoutMode, setCheckoutMode] = useState<'sub' | 'post' | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const fetchChannels = async () => {
      try {
        const q = query(collection(db, 'channels'), where('userId', '==', profile.uid));
        const snap = await getDocs(q);
        setChannels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'channels');
      }
    };
    fetchChannels();
  }, [profile]);

  const totalPrice = selectedPackage?.type === 'subscription' 
    ? selectedPackage.price * days 
    : selectedPackage?.price || 0;

  const handleCheckout = async () => {
    if (!profile || !selectedChannel || !selectedPackage) return;
    if (profile.coins < totalPrice) {
      toast.error('Insufficient coins in your wallet!');
      return;
    }

    try {
      const orderData = {
        userId: profile.uid,
        channelId: selectedChannel,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        type: selectedPackage.type,
        coinsPaid: totalPrice,
        durationDays: selectedPackage.type === 'subscription' ? days : 0,
        scheduleWindow: window,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: selectedPackage.type === 'subscription' 
          ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() 
          : new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // 1. Deduct coins from user
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, { coins: profile.coins - totalPrice });

      // 2. Create order
      await addDoc(collection(db, 'orders'), orderData);

      // 3. Create transaction log
      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        amount: -totalPrice,
        type: 'order',
        description: `Order: ${selectedPackage.name}`,
        createdAt: new Date().toISOString()
      });

      toast.success('Subscription activated successfully!');
      setShowCheckout(false);
      setSelectedPackage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'checkout');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Growth <span className="text-orange-500">Packages</span></h2>
        <p className="text-slate-400">Choose the perfect plan to skyrocket your WhatsApp channel reach with automated reactions.</p>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="subscriptions" className="px-8 py-2">Subscriptions</TabsTrigger>
            <TabsTrigger value="posts" className="px-8 py-2">Single Posts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="subscriptions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PackageCard pkg={SUBSCRIPTION_PACKAGES[0]} onSelect={(p) => { setSelectedPackage(p); setCheckoutMode('sub'); setShowCheckout(true); }} />
            <PackageCard pkg={SUBSCRIPTION_PACKAGES[1]} isPopular onSelect={(p) => { setSelectedPackage(p); setCheckoutMode('sub'); setShowCheckout(true); }} />
            <PackageCard pkg={SUBSCRIPTION_PACKAGES[2]} onSelect={(p) => { setSelectedPackage(p); setCheckoutMode('sub'); setShowCheckout(true); }} />
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POST_PACKAGES.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} onSelect={(p) => { setSelectedPackage(p); setCheckoutMode('post'); setShowCheckout(true); }} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="bg-slate-950 border-slate-800 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
            <DialogDescription>Configure and confirm your reaction order.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Step 1: Channel Select */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">1. Select Destination</label>
              <div className="space-y-2">
                {channels.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-sm text-slate-500">
                    No channels found. Please add a channel first.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {channels.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedChannel(c.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                          selectedChannel === c.id ? "bg-orange-500/10 border-orange-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white uppercase truncate">{c.name}</div>
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{c.type}</div>
                        </div>
                        {selectedChannel === c.id && <Check className="w-5 h-5 text-orange-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Duration (if sub) */}
            {selectedPackage?.type === 'subscription' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">2. Select Duration (Days)</label>
                <div className="flex gap-2">
                  {[1, 7, 30, 90, 365].map(d => (
                    <Button 
                      key={d} 
                      variant="outline" 
                      className={cn("flex-1 h-12 border-slate-800", days === d && "bg-orange-500/10 border-orange-500 text-orange-500 hover:text-orange-500")}
                      onClick={() => setDays(d)}
                    >
                      {d} {d === 1 ? 'Day' : 'Days'}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    min={1} 
                    max={365} 
                    value={days} 
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                    className="bg-slate-900 border-slate-800 h-10 pl-4"
                    placeholder="Custom days..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Time Window */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">{selectedPackage?.type === 'subscription' ? '3' : '2'}. Schedule Window</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_WINDOWS.map(w => (
                  <Button 
                    key={w} 
                    variant="outline" 
                    size="sm"
                    className={cn("h-10 border-slate-800 text-xs", window === w && "bg-orange-500/10 border-orange-500 text-orange-500")}
                    onClick={() => setWindow(w)}
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Package:</span>
                <span className="text-white font-bold">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Coins:</span>
                <span className="text-orange-500 font-black text-lg">{totalPrice} Coins</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <span>Wallet Balance:</span>
                <span>{profile?.coins} Coins</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowCheckout(false)}>Cancel</Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold h-12 px-8"
              onClick={handleCheckout}
              disabled={!selectedChannel || (profile?.coins || 0) < totalPrice}
            >
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
