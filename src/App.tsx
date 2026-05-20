import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LeadsProvider } from './contexts/LeadsContext';
import { Sidebar, type Page } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Pipeline } from './pages/Pipeline';
import { Scoring } from './pages/Scoring';
import { Outreach } from './pages/Outreach';
import { ReplyAssistant } from './pages/ReplyAssistant';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'leads': return <Leads />;
      case 'pipeline': return <Pipeline />;
      case 'scoring': return <Scoring />;
      case 'outreach': return <Outreach />;
      case 'reply': return <ReplyAssistant />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar page={page} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LeadsProvider>
        <AppContent />
      </LeadsProvider>
    </ThemeProvider>
  );
}

export default App;
