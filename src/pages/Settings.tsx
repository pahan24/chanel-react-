import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Trash2, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Profile Settings
          </h3>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input defaultValue={profile?.displayName} className="bg-slate-950 border-slate-800" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue={profile?.email} readOnly className="bg-slate-900 border-slate-800 text-slate-500" />
                </div>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-500">Update Profile</Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Notifications
          </h3>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Alerts</p>
                  <p className="text-sm text-slate-500">Receive order status updates via email</p>
                </div>
                {/* Simplified Toggle */}
                <div className="w-12 h-6 rounded-full bg-slate-800 relative cursor-pointer p-1">
                  <div className="w-4 h-4 rounded-full bg-white transition-all ml-0" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Reward Reminder</p>
                  <p className="text-sm text-slate-500">Get notified when your daily reward is ready</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-slate-800 relative cursor-pointer p-1">
                  <div className="w-4 h-4 rounded-full bg-white transition-all ml-0" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
            <Shield className="w-5 h-5" />
            Security & Danger Zone
          </h3>
          <Card className="bg-slate-900/50 border-rose-500/10">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-slate-500">Update your account password</p>
                </div>
                <Button variant="outline" className="border-slate-800">Update</Button>
              </div>
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-medium text-rose-500">Delete Account</p>
                  <p className="text-sm text-slate-500">Permanently remove all your data and coins</p>
                </div>
                <Button variant="destructive" className="bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600 hover:text-white">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
