import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CreatePostModal from './components/CreatePostModal';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import AIStudioPage from './pages/AIStudioPage';
import AccountsPage from './pages/AccountsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalInitialContent, setModalInitialContent] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-indigo-400 font-bold text-sm">
        Initializing PostPulse Platform...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleOpenCreateModalWithContent = (content) => {
    setModalInitialContent(content);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenCreateModal={() => { setModalInitialContent(null); setIsCreateModalOpen(true); }} />
        <main className="flex-1 p-8 ml-64 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage onOpenCreateModal={() => { setModalInitialContent(null); setIsCreateModalOpen(true); }} />} />
            <Route path="/calendar" element={<CalendarPage onOpenCreateModal={() => { setModalInitialContent(null); setIsCreateModalOpen(true); }} />} />
            <Route path="/ai-studio" element={<AIStudioPage onOpenScheduleWithContent={handleOpenCreateModalWithContent} />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={() => window.location.reload()}
        initialAIContent={modalInitialContent}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}
