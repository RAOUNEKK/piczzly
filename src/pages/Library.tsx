import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PuzzleLogo } from '@/components/PuzzleLogo';
import { ImageCard } from '@/components/ImageCard';
import { useImageLibrary } from '@/hooks/useImageLibrary';
import { PuzzleImage } from '@/types/puzzle';
import { ArrowLeft, ImagePlus } from 'lucide-react';

const Library = () => {
  const navigate = useNavigate();
  const { allImages, removeImage } = useImageLibrary();
  const [selectedImage, setSelectedImage] = useState<PuzzleImage | null>(null);

  const handleSelectImage = (image: PuzzleImage) => {
    setSelectedImage(image);
  };

  const handlePlay = () => {
    if (selectedImage) {
      navigate('/play', { state: { image: selectedImage } });
    }
  };

  return (
    <div className="min-h-screen gradient-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <PuzzleLogo size="sm" />
          <Link
            to="/upload"
            className="flex items-center gap-2 btn-accent py-2 px-4 text-sm"
          >
            <ImagePlus size={18} />
            Upload
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Image Library</h1>
          <p className="text-muted-foreground">Choose an image to turn into a puzzle</p>
        </div>

        {/* Image Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onSelect={handleSelectImage}
              onDelete={!image.isBuiltIn ? removeImage : undefined}
            />
          ))}
        </div>

        {allImages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No images yet. Upload your first one!</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card-playful p-6 max-w-md w-full animate-pop">
            <img
              src={selectedImage.src}
              alt={selectedImage.name}
              className="w-full aspect-video object-cover rounded-2xl mb-6"
            />
            <h3 className="text-xl font-bold text-foreground mb-2 text-center">
              {selectedImage.name}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Ready to create your puzzle?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={handlePlay}
                className="flex-1 btn-primary py-3"
              >
                Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
