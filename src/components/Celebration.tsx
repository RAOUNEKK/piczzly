import { useEffect } from 'react';
import { Home, RotateCcw, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  onRepeat: () => void;
  onHome: () => void;
}

export const Celebration = ({ onRepeat, onHome }: CelebrationProps) => {
  useEffect(() => {
    // Grand celebration confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#B1DDC9', '#6CD0D0', '#FBCEB1', '#FFCBDB'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#B1DDC9', '#6CD0D0', '#FBCEB1', '#FFCBDB'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card-playful p-10 text-center max-w-md mx-4 animate-pop">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-turquoise rounded-full flex items-center justify-center mx-auto animate-bounce-soft">
            <PartyPopper size={48} className="text-primary-foreground" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Puzzle Complete!
        </h2>
        <p className="text-muted-foreground mb-8">
          Amazing job! You solved the puzzle beautifully.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRepeat}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
          <button
            onClick={onHome}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};
