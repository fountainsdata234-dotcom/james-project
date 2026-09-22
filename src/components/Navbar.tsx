import React from 'react';
import { 
  MessageCircleHeart, 
  Sparkles, 
  BarChart3, 
  Lock, 
  FlaskConical, 
  PhoneCall, 
  Menu, 
  X, 
  ShieldCheck 
} from 'lucide-react';

export type ActiveTab = 'chat' | 'coping' | 'analytics' | 'privacy' | 'feedback';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCrisis: () => void;
  isEncrypted: boolean;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCrisis,
  isEncrypted,
  onOpenPrivacy,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'chat', label: 'Support Chat', icon: MessageCircleHeart },
    { id: 'coping', label: 'Coping Toolkit', icon: Sparkles },
    { id: 'analytics', label: 'Mood & Metrics', icon: BarChart3 },
    { id: 'privacy', label: 'Privacy Vault', icon: Lock },
    { id: 'feedback', label: 'Testing Lab', icon: FlaskConical },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 min-h-[4rem]">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="brand-logo-button"
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2.5 text-left group focus:outline-none min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition-colors shrink-0">
                <MessageCircleHeart className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight block leading-tight truncate">
                  Aura Wellness
                </span>
                <span className="hidden sm:block text-[11px] text-teal-700 font-medium truncate">
                  Mental Health AI &amp; NLP Companion
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 shadow-xs border border-teal-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Status Right Side */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* E2EE Status Pill */}
            <button
              id="header-encryption-pill"
              onClick={onOpenPrivacy}
              title="Click to view client-side AES-256 encryption status"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AES-256 E2EE Protected</span>
            </button>

            {/* Crisis Help Button */}
            <button
              id="header-crisis-btn"
              onClick={onOpenCrisis}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Crisis Support (988)</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-crisis-button"
              onClick={onOpenCrisis}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
              aria-label="Open emergency crisis resources"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer" 
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                setActiveTab('privacy');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AES-256 Encryption Active</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              id="mobile-drawer-crisis-btn"
              onClick={() => {
                onOpenCrisis();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Get Immediate Crisis Support (988)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
