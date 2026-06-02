import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TarefasProvider } from '@/contexts/TarefasContext';
import { ToastProvider } from '@/components/ui/toast';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/pages/Dashboard';
import TarefasPage from '@/pages/TarefasPage';
import MetasPage from '@/pages/MetasPage';

type Page = 'dashboard' | 'tarefas' | 'metas';

const pageTitles: Record<Page, string> = {
  dashboard: 'Início',
  tarefas: 'Minhas Tarefas',
  metas: 'Metas',
};

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    // Apply dark mode on mount
    const saved = localStorage.getItem('eduflow_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-indigo-200 text-sm">Carregando EduFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <TarefasProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />

        {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all">
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            pageTitle={pageTitles[currentPage]}
          />

          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'tarefas' && <TarefasPage />}
            {currentPage === 'metas' && <MetasPage />}
          </main>
        </div>
      </div>
    </TarefasProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
