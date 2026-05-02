import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Link2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/error-handler';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Channels() {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;
    fetchChannels();
  }, [profile]);

  const fetchChannels = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'channels'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setChannels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'channels');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!url) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/channel-preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setPreview(data);
    } catch (error) {
      toast.error('Could not preview this link');
    } finally {
      setSubmitting(false);
    }
  };

  const addChannel = async () => {
    if (!preview || !profile) return;
    try {
      setSubmitting(true);
      const newChannel = {
        userId: profile.uid,
        url: url,
        name: preview.name,
        followers: preview.followers,
        image: preview.image,
        description: preview.description,
        type: preview.type,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'channels'), newChannel);
      toast.success('Channel linked successfully!');
      setUrl('');
      setPreview(null);
      fetchChannels();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'channels');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to remove this channel? All active orders will stay active.')) return;
    try {
      await deleteDoc(doc(db, 'channels', id));
      setChannels(prev => prev.filter(c => c.id !== id));
      toast.success('Channel removed');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `channels/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Add Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div className="flex-1 space-y-2 w-full">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Link WhatsApp Channel or Post</label>
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <Input 
              placeholder="https://whatsapp.com/channel/..." 
              className="h-14 pl-12 bg-slate-950 border-slate-800 focus:border-orange-500 transition-all text-lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {preview ? (
            <Button size="lg" className="h-14 bg-emerald-600 hover:bg-emerald-500" onClick={addChannel} disabled={submitting}>
              Confirm Link
            </Button>
          ) : (
            <Button size="lg" className="h-14 bg-orange-600 hover:bg-orange-500" onClick={generatePreview} disabled={submitting || !url}>
              {submitting ? 'Fetching...' : 'Verify Link'}
            </Button>
          )}
          {preview && (
            <Button size="lg" variant="ghost" className="h-14 text-slate-400" onClick={() => setPreview(null)}>Cancel</Button>
          )}
        </div>
      </div>

      {/* Preview Card */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-slate-900 border-orange-500/50 shadow-2xl shadow-orange-500/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-800 border-4 border-slate-800 shrink-0">
                    <img src={preview.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <h3 className="text-2xl font-bold text-white">{preview.name}</h3>
                      <Badge className={preview.type === 'channel' ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 'bg-purple-500/10 text-purple-400 border-purple-400/20'}>
                        {preview.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-400">{preview.description}</p>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                      <div className="flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        {preview.followers.toLocaleString()} Followers
                      </div>
                      <div className="text-slate-500 text-sm">Last Sync: {new Date(preview.lastUpdated).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-xl bg-slate-800" />
                <Skeleton className="h-6 w-3/4 bg-slate-800" />
                <Skeleton className="h-20 w-full bg-slate-800" />
              </CardContent>
            </Card>
          ))
        ) : (
          channels.map((channel) => (
            <motion.div key={channel.id} layout>
              <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-800">
                    <img src={channel.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{channel.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Tv className="w-3 h-3" />
                      {channel.followers.toLocaleString()} followers
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-500 hover:text-red-500"
                    onClick={() => deleteChannel(channel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px] italic">
                    "{channel.description}"
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950/50" asChild>
                    <a href={channel.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 w-3 h-3" />
                      Open
                    </a>
                  </Button>
                  <Button size="sm" className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700" onClick={() => toast.success('Link copied')}>
                    <Copy className="mr-2 w-3 h-3" />
                    Copy
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {!loading && channels.length === 0 && !preview && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-400">No channels linked yet</h3>
          <p className="text-slate-500 mt-2">Link your first WhatsApp channel or post to start growing.</p>
        </div>
      )}
    </div>
  );
}
