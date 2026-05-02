import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tv, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInWithGoogle, auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success('Welcome to ChannelReact Pro!');
      navigate('/');
    } catch (error) {
      toast.error('Google Sign-in failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      // Profile creation handled by useAuth hook listener
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
            <Tv className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            ChannelReact <span className="text-orange-500">PRO</span>
          </h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800 p-1 mb-6">
            <TabsTrigger value="login" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-slate-400">
                  Login to manage your channel auto-reactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Email address" 
                      className="bg-slate-950/50 border-slate-800 pl-10 h-12" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="bg-slate-950/50 border-slate-800 pl-10 h-12" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all"
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  {loading ? 'Sign-in...' : 'Login to Account'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or continue with</span></div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button variant="link" className="text-slate-500 hover:text-orange-400 text-sm">Forgot Password?</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription className="text-slate-400">
                  Join 10,000+ users and get 50 coins free.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Full Name" 
                      className="bg-slate-950/50 border-slate-800 pl-10 h-12" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Email address" 
                      className="bg-slate-950/50 border-slate-800 pl-10 h-12" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="bg-slate-950/50 border-slate-800 pl-10 h-12" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Register & Claim Bonus'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
              <CardFooter className="text-center text-xs text-slate-500 italic">
                By registering, you agree to our Terms of Service and Privacy Policy.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
