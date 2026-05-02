import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Gift, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Referral() {
  const { profile } = useAuth();
  
  const referralLink = `${window.location.origin}/login?ref=${profile?.referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white italic uppercase">Invite & <span className="text-orange-500">Earn</span></h2>
            <p className="text-slate-400">Invite your friends to ChannelReact Pro and earn 20 coins for every successful referral.</p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>Share this link to start earning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="bg-slate-950 border-slate-800" />
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyToClipboard(referralLink)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input value={profile?.referralCode} readOnly className="bg-slate-950 border-slate-800 font-mono" />
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyToClipboard(profile?.referralCode || '')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-orange-500 text-white">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-orange-200 uppercase tracking-widest">Referral Bonus</p>
                <p className="text-4xl font-black text-white">20 Coins</p>
                <p className="text-xs text-orange-300/60 mt-1">Per unique verified user</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Referrals</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Total Earned</span>
                <span className="text-white font-bold">0 Coins</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
