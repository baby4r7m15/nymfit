import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Users, ShieldCheck, TrendingUp, ChevronLeft } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { useTheme } from '@/lib/useTheme';

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Home' },
  { to: '/workouts',      icon: Dumbbell,        label: 'Workouts' },
  { to: '/body-progress', icon: TrendingUp,       label: 'Progress' },
  { to: '/community',     icon: Users,            label: 'Community' },
];

const TOP_LEVEL = new Set(['/dashboard', '/workouts', '/body-progress', '/community', '/profile', '/admin']);

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  useTheme();

  const isTopLevel = TOP_LEVEL.has(location.pathname);

  return (
    <div className="flex min-h-screen bg-sniff-gradient overscroll-none">
      {/* ── Sidebar (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-card/70 backdrop-blur-md border-r border-border shrink-0 py-6 px-4 sticky top-0 h-screen overflow-y-auto">
        <Link to="/" className="font-display text-2xl text-primary mb-8 px-2 select-none">NymFit</Link>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all select-none ${
                  active ? 'bg-accent text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        {user?.role === 'admin' && (
          <Link to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all mt-1 select-none ${
              location.pathname === '/admin' ? 'bg-accent text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Admin
          </Link>
        )}
        <div className="space-y-2 mt-auto pt-4 border-t border-border">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-muted transition-colors select-none">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-base shrink-0">
              {user?.avatar_emoji || '🌸'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{user?.display_name || user?.full_name || 'my profile'}</div>
              <div className="text-[10px] text-muted-foreground">view profile</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Mobile top header ── */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-40 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4 h-14 select-none"
        style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        {!isTopLevel ? (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-2"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : null}
        <Link to="/" className="font-display text-xl text-primary">NymFit</Link>
        <div className="ml-auto flex items-center gap-1">
          {user?.role === 'admin' && (
            <Link to="/admin" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around px-2 select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all flex-1 justify-center ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}>
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link to="/profile"
          className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all flex-1 justify-center ${
            location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
          }`}>
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[11px] leading-none">
            {user?.avatar_emoji || '🌸'}
          </div>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

      {/* ── Main content ── */}
      <main
        className="flex-1 min-w-0 lg:overflow-y-auto overscroll-y-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 lg:pb-12"
          style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top) + 1.5rem)', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}