import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { OperationType, handleFirestoreError } from '../lib/error-handler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, HelpCircle, Mail, MessageSquare } from 'lucide-react';

export default function Support() {
  const { profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing & Coins');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!profile || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: profile.uid,
        userEmail: profile.email,
        subject,
        category,
        message,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      toast.success('Support ticket submitted successfully!');
      setSubject('');
      setMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'support_tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Open a Support Ticket</CardTitle>
              <CardDescription>Our team will get back to you within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    placeholder="e.g. Order not active" 
                    className="bg-slate-950 border-slate-800"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Billing & Coins</option>
                    <option>Technical Issue</option>
                    <option>Account Sync</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  placeholder="Describe your issue in detail..." 
                  className="bg-slate-950 border-slate-800 min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-500 font-bold h-12"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm">Quick Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <Mail className="w-5 h-5 text-orange-500" />
                <div className="text-xs">
                  <p className="text-slate-500 font-bold uppercase tracking-widest">Email Support</p>
                  <p className="text-white">support@channelreact.pro</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div className="text-xs">
                  <p className="text-slate-500 font-bold uppercase tracking-widest">Live Chat</p>
                  <p className="text-white">Available 9am - 6pm EST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 transition-all hover:border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                Common FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <details className="group cursor-pointer">
                <summary className="text-xs font-bold text-slate-300 group-open:text-orange-400 transition-colors">How long do reactions take?</summary>
                <p className="text-[10px] text-slate-500 mt-2 pl-2 border-l border-slate-800">Usually within 10-30 minutes depending on your window settings.</p>
              </details>
              <details className="group cursor-pointer">
                <summary className="text-xs font-bold text-slate-300 group-open:text-orange-400 transition-colors">Can I cancel a subscription?</summary>
                <p className="text-[10px] text-slate-500 mt-2 pl-2 border-l border-slate-800">Yes, you can cancel anytime from the Orders page.</p>
              </details>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
