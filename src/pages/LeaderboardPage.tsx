import { useState } from 'react';
import { Header } from '@/components/Header';
import { Leaderboard } from '@/components/Leaderboard';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

const LeaderboardPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, login, signup, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Leaderboard />
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onSignup={signup}
      />
    </div>
  );
};

export default LeaderboardPage;
