import { Puzzle } from 'lucide-react';

interface PuzzleLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const PuzzleLogo = ({ size = 'md' }: PuzzleLogoProps) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const iconSizes = {
    sm: 24,
    md: 40,
    lg: 64,
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Puzzle 
          size={iconSizes[size]} 
          className="text-primary animate-bounce-soft"
          strokeWidth={2.5}
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-float" />
      </div>
      <h1 className={`${sizeClasses[size]} font-bold text-foreground tracking-tight`}>
        Pic<span className="text-primary">zz</span>ly
      </h1>
    </div>
  );
};