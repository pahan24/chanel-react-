import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/error-handler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShieldAlert, User, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        const oSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'admin data');
      }
    };
    fetchData();
  }, []);

  const adjustCoins = async (userId: string, current: number, amount: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), { coins: current + amount });
      toast.success(`Adjusted coins by ${amount}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, coins: u.coins + amount } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-8">
        <ShieldAlert className="w-8 h-8 text-purple-500" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">System <span className="text-purple-500">Admin</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-slate-500">Total Users</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{users.length}</p></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-slate-500">Total Orders</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{orders.length}</p></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-slate-500">Revenue (Coins)</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{orders.reduce((acc, o) => acc + (o.coinsPaid || 0), 0)}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div className="relative w-48">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search users..." className="pl-8 h-9 bg-slate-950 border-slate-800 text-xs" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead>User</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id} className="border-slate-800">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"><User className="w-4 h-4" /></div>
                        <div className="text-sm">
                          <p className="font-bold">{user.displayName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-orange-500">{user.coins}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => adjustCoins(user.id, user.coins, 100)}>+</Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => adjustCoins(user.id, user.coins, -100)}>-</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Global Orders */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader><CardTitle>Global Orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead>Channel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id} className="border-slate-800">
                    <TableCell className="text-sm font-medium">{order.packageName}</TableCell>
                    <TableCell className="uppercase text-[10px] font-bold text-slate-500">{order.type}</TableCell>
                    <TableCell><Badge variant="outline" className="border-slate-800">{order.status}</Badge></TableCell>
                    <TableCell className="text-right text-orange-500 font-bold">{order.coinsPaid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
