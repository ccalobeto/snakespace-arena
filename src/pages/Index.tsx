import { useState } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { GameControls } from '@/components/GameControls';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { calculateFinalScore } from '@/lib/gameLogic';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { gameState, start, pause, changeDirection, changeMode, reset } = useGame();
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  const { toast } = useToast();

  // Submit score when game ends
  const handleGameEnd = async () => {
    if (isAuthenticated && gameState.score > 0) {
      const finalScore = calculateFinalScore(gameState.score, gameState.mode);
      const result = await api.submitScore(finalScore, gameState.mode);
      if ('id' in result) {
        toast({
          title: 'Score submitted!',
          description: `Your score of ${finalScore} has been added to the leaderboard.`,
        });
      }
    }
  };

  // Check for game over and submit score
  if (gameState.status === 'game-over' && gameState.score > 0) {
    handleGameEnd();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr_300px] gap-8">
            <div className="flex flex-col items-center">
              <GameBoard gameState={gameState} />
            </div>
            <div>
              <GameControls
                gameState={gameState}
                onStart={start}
                onPause={pause}
                onReset={reset}
                onChangeDirection={changeDirection}
                onChangeMode={changeMode}
              />
            </div>
          </div>
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

export default Index;
