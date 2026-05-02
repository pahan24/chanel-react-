import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/error-handler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, Gift, ShoppingCart, UserPlus, Sparkles } from 'lucide-react';

export default function Transactions() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, 'transactions'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'transactions');
      }
    };
    fetchTransactions();
  }, [profile]);

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case 'signup_bonus': return <Sparkles className="text-purple-500" />;
      case 'reward': return <Gift className="text-emerald-500" />;
      case 'order': return <ShoppingCart className="text-rose-500" />;
      case 'referral': return <UserPlus className="text-blue-500" />;
      default: return <ArrowUpRight className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Full history of your coin intake and spending.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-500">Event</TableHead>
                <TableHead className="text-slate-500">Description</TableHead>
                <TableHead className="text-slate-500">Date</TableHead>
                <TableHead className="text-slate-500 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        {getIcon(tx.type)}
                      </div>
                      <span className="font-bold text-xs uppercase tracking-widest text-slate-400">{tx.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">{tx.description}</TableCell>
                  <TableCell className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-black text-lg ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-200'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-slate-500 italic">No transactions found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
