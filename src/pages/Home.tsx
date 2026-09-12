import { useNavigate } from 'react-router-dom';
import { PuzzleLogo } from '@/components/PuzzleLogo';
import { ImagePlus, Images } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="flex justify-center mb-6">
            <PuzzleLogo size="lg" />
          </div>
          <p className="text-xl text-muted-foreground font-medium max-w-md mx-auto">
             Made by Roounek.hrz
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Use Existing Images */}
          <button
            onClick={() => navigate('/library')}
            className="card-playful p-8 text-left group"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
              <Images size={32} className="text-turquoise" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Use Existing Images
            </h2>
            <p className="text-muted-foreground">
              Browse our curated gallery of beautiful images or your previously uploaded photos
            </p>
          </button>

          {/* Create New Puzzle */}
          <button
            onClick={() => navigate('/upload')}
            className="card-playful p-8 text-left group"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/70 transition-colors">
              <ImagePlus size={32} className="text-secondary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Create New Puzzle
            </h2>
            <p className="text-muted-foreground">
              Upload your own photo and transform it into a fun jigsaw puzzle
            </p>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/30 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-secondary/40 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default Home;
