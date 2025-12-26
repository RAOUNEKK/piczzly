import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PuzzleLogo } from '@/components/PuzzleLogo';
import { PuzzleBoard } from '@/components/PuzzleBoard';
import { Celebration } from '@/components/Celebration';
import { PuzzleImage } from '@/types/puzzle';
import { Grid3x3, Grid2x2 } from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: 2, label: 'Kids', icon: '👶', pieces: 4, description: 'Very Easy' },
  { value: 3, label: 'Easy', icon: '😊', pieces: 9, description: 'Beginner' },
  { value: 4, label: 'Medium', icon: '🎯', pieces: 16, description: 'Casual' },
  { value: 5, label: 'Hard', icon: '💪', pieces: 25, description: 'Challenge' },
  { value: 6, label: 'Expert', icon: '🔥', pieces: 36, description: 'Pro' },
  { value: 8, label: 'Master', icon: '👑', pieces: 64, description: 'Extreme' },
];

const Play = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [image, setImage] = useState<PuzzleImage | null>(null);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'complete'>('setup');
  const [difficulty, setDifficulty] = useState<number>(4);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const img = location.state?.image as PuzzleImage | undefined;
    if (!img) {
      navigate('/');
      return;
    }
    setImage(img);
  }, [location.state, navigate]);

  const handleComplete = () => {
    setGameState('complete');
  };

  const handleRepeat = () => {
    setGameState('setup');
    setKey(prev => prev + 1);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleExit = () => {
    navigate('/library');
  };

  const handleStartGame = () => {
    setGameState('playing');
  };

  if (!image) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No puzzle selected</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen gradient-soft">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <PuzzleLogo size="sm" />
          </div>

          {/* Setup Section */}
          <div className="max-w-4xl mx-auto">
            <div className="card-playful p-8 mb-6">
              <h2 className="text-3xl font-bold text-center mb-2">Choose Your Challenge</h2>
              <p className="text-muted-foreground text-center mb-8">
                Select the difficulty level for <span className="font-semibold text-foreground">{image.name}</span>
              </p>

              {/* Difficulty Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDifficulty(option.value)}
                    className={`difficulty-option ${difficulty === option.value ? 'selected' : ''}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{option.icon}</div>
                      <div className="font-bold text-lg mb-1">{option.label}</div>
                      <div className="text-sm text-muted-foreground mb-1">{option.description}</div>
                      <div className="text-xs font-medium text-primary">
                        {option.value}×{option.value} ({option.pieces} pieces)
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Preview Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img 
                    src={image.src} 
                    alt={image.name}
                    className="w-64 h-auto rounded-2xl shadow-card"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full px-4 py-2 font-bold shadow-lg">
                    {difficulty}×{difficulty}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button onClick={handleExit} className="btn-secondary px-8 py-3">
                  Back to Library
                </button>
                <button onClick={handleStartGame} className="btn-primary px-12 py-3">
                  Start Puzzle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen gradient-soft">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <PuzzleLogo size="sm" />
          </div>

          {/* Game Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">{image.name}</h1>
            <p className="text-muted-foreground text-sm">
              Drag pieces to complete the puzzle • {difficulty}×{difficulty} ({difficulty * difficulty} pieces)
            </p>
          </div>

          {/* Puzzle Board */}
          <div className="flex justify-center">
            <PuzzleBoard 
              key={key}
              imageSrc={image.src} 
              onComplete={handleComplete}
              onExit={handleExit}
              gridSize={difficulty}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container mx-auto px-4 py-6">
        <Celebration onRepeat={handleRepeat} onHome={handleHome} />
      </div>
    </div>
  );
};

export default Play;