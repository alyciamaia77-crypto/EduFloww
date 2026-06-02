import { GraduationCap, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuToggle: () => void;
  pageTitle: string;
}

export default function Header({ onMenuToggle, pageTitle }: HeaderProps) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('eduflow_theme') === 'dark' ||
      (!localStorage.getItem('eduflow_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('eduflow_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        {/* Logo for mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-indigo-600">EduFlow</span>
        </div>
        <h2 className="hidden lg:block text-lg font-semibold text-gray-800 dark:text-gray-100">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(!dark)}
          title={dark ? 'Modo claro' : 'Modo escuro'}
        >
          {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </Button>
      </div>
    </header>
  );
}
