import React from 'react';
import { CreateModelPage } from './pages/CreateModelPage';
import { InferencePage } from './pages/InferencePage';
import { ModelsPage } from './pages/ModelsPage';
import { GalleryPage } from './pages/GalleryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { Toaster } from 'sonner';
import { AIModel } from './types/model';
import { SideNav } from './components/SideNav';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<'create' | 'models' | 'generate' | 'gallery' | 'settings'>('create');
  const [selectedModel, setSelectedModel] = React.useState<AIModel | undefined>();

  const handleGenerateClick = (model: AIModel) => {
    setSelectedModel(model);
    setCurrentPage('generate');
  };

  const handleRemix = (image: { prompt: string; seed: string; model_id: string }) => {
    setCurrentPage('generate');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" expand={true} richColors closeButton />
      
      <SideNav currentPage={currentPage} onPageChange={setCurrentPage} user={user} />

      <div className="pl-64">
        {currentPage === 'create' && (
          <CreateModelPage />
        )}
        {currentPage === 'models' && (
          <ModelsPage onGenerateClick={handleGenerateClick} />
        )}
        {currentPage === 'generate' && (
          <InferencePage initialModel={selectedModel} />
        )}
        {currentPage === 'gallery' && (
          <GalleryPage onRemix={handleRemix} />
        )}
        {currentPage === 'settings' && user ? (
          <SettingsPage />
        ) : currentPage === 'settings' ? (
          <AuthPage />
        ) : null}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;