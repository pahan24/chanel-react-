import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/error-handler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../types';
import { Tv, Package, Clock, Calendar } from 'lucide-react';

export default function Orders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'orders');
      }
    };
    fetchOrders();
  }, [profile]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
      case 'completed': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Completed</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'expired': return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">Expired</Badge>;
      case 'cancelled': return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Cancelled</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>Monitor your active subscriptions and post reaction status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-500">Order ID</TableHead>
                <TableHead className="text-slate-500">Channel</TableHead>
                <TableHead className="text-slate-500">Package</TableHead>
                <TableHead className="text-slate-500">Status</TableHead>
                <TableHead className="text-slate-500">Date</TableHead>
                <TableHead className="text-slate-500 text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/20">
                  <TableCell className="font-mono text-xs text-slate-500 uppercase">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Tv className="w-4 h-4 text-slate-500" />
                       <span className="font-medium">{order.packageName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs uppercase font-bold tracking-tighter">{order.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-orange-500">{order.coinsPaid} Coins</TableCell>
                </TableRow>
              ))}
              {!loading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-500 italic">No orders found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
