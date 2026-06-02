import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  GraduationCap, LayoutDashboard, CheckSquare, Target, LogOut, X
} from 'lucide-react';

type Page = 'dashboard' | 'tarefas' | 'metas';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'tarefas', label: 'Minhas Tarefas', icon: CheckSquare },
  { id: 'metas', label: 'Metas', icon: Target },
];

export default function Sidebar({ open, onClose, currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar: mobile (off-canvas) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-indigo-950 to-indigo-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">EduFlow</h1>
              <p className="text-indigo-300 text-xs">Atividades Escolares</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center font-bold text-sm">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-indigo-300 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white text-indigo-900 shadow-md"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-indigo-600" : "text-indigo-300")} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
          <p className="text-center text-indigo-400/50 text-xs mt-3">EduFlow v1.0</p>
        </div>
      </aside>

      {/* Sidebar: desktop (static, in-flow) */}
      <aside className="hidden lg:flex lg:flex-col w-72 h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white shadow-none">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">EduFlow</h1>
            <p className="text-indigo-300 text-xs">Atividades Escolares</p>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center font-bold text-sm">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-indigo-300 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); /* desktop: no auto-close */ }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white text-indigo-900 shadow-md"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-indigo-600" : "text-indigo-300")} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
          <p className="text-center text-indigo-400/50 text-xs mt-3">EduFlow v1.0</p>
        </div>
      </aside>
    </>
  );
}
