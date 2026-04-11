import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, BarChart3, Settings, Calendar, Trophy, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/routine', icon: Clock, label: 'Routine' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/awards', icon: Trophy, label: 'Awards' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user } = useApp();

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 gradient-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-sidebar-foreground text-lg">StudyFlow</h1>
              <p className="text-xs text-sidebar-foreground/60">Smart Revision</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                location.pathname === item.to
                  ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 mb-2">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
        <div className="p-4 mx-3 mb-4 rounded-lg bg-sidebar-accent/30 border border-sidebar-border/50">
          <p className="text-xs text-sidebar-foreground/60 font-body">Stay consistent,</p>
          <p className="text-sm text-sidebar-foreground font-heading font-semibold">keep learning! 🚀</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 gradient-sidebar border-b border-sidebar-border flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="text-sidebar-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-sidebar-foreground">StudyFlow</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full gradient-sidebar flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-sidebar-foreground">StudyFlow</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    location.pathname === item.to
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => { setMobileOpen(false); signOut(); }}
              className="flex items-center gap-3 px-7 py-3 text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground mb-4"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:max-h-screen lg:overflow-y-auto pt-14 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
