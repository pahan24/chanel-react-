import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tv, 
  Package, 
  ShoppingCart, 
  Wallet, 
  History, 
  BarChart3, 
  Users, 
  Bell, 
  LifeBuoy, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Menu,
  X,
  Coins
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Tv, label: 'My Channels', path: '/channels' },
  { icon: Package, label: 'Packages', path: '/packages' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: History, label: 'Transactions', path: '/transactions' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Referral', path: '/referral' },
  { icon: LifeBuoy, label: 'Support', path: '/support' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Tv className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          ChannelReact
        </span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                location.pathname === item.path 
                  ? "bg-orange-500/10 text-orange-500" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-orange-500" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium">{item.label}</span>
              {location.pathname === item.path && (
                <div className="absolute right-0 w-1 h-6 bg-orange-500 rounded-l-full" />
              )}
            </Link>
          ))}
          
          {profile?.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10",
                location.pathname === '/admin' && "bg-purple-500/10"
              )}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Balance</span>
            <Coins className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {profile?.coins || 0} <span className="text-sm text-slate-500">Coins</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 hidden xl:block z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        "xl:pl-64"
      )}>
        {/* Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <div className="xl:hidden p-2 rounded-md hover:bg-slate-800/50 text-slate-400 cursor-pointer">
                  <Menu className="w-6 h-6" />
                </div>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-slate-950 border-r border-slate-800">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-white hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-slate-950" />
            </Button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{profile?.displayName}</div>
                <div className="text-xs text-slate-500">{profile?.email}</div>
              </div>
              <Avatar className="h-10 w-10 border-2 border-slate-800">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName}`} />
                <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
