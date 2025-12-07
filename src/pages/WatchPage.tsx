import { useState } from 'react';
import { Header } from '@/components/Header';
import { WatchList } from '@/components/WatchList';
import { WatchPlayer } from '@/components/WatchPlayer';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { ActivePlayer } from '@/types/game';

const WatchPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const { user, login, signup, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {selectedPlayer ? (
            <WatchPlayer
              playerId={selectedPlayer.id}
              onBack={() => setSelectedPlayer(null)}
            />
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-pixel text-2xl text-primary neon-text mb-2">WATCH MODE</h1>
                <p className="text-muted-foreground">
                  Watch other players compete in real-time
                </p>
              </div>
              <WatchList
                onSelectPlayer={setSelectedPlayer}
                selectedPlayerId={selectedPlayer?.id}
              />
            </>
          )}
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

export default WatchPage;
