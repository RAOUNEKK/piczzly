import { PuzzleImage } from '@/types/puzzle';
import { Puzzle, Trash2 } from 'lucide-react';

interface ImageCardProps {
  image: PuzzleImage;
  onSelect: (image: PuzzleImage) => void;
  onDelete?: (id: string) => void;
}

export const ImageCard = ({ image, onSelect, onDelete }: ImageCardProps) => {
  return (
    <div className="card-playful overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image.src}
          alt={image.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {!image.isBuiltIn && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
            className="absolute top-3 right-3 p-2 bg-card/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-3 truncate">{image.name}</h3>
        <button
          onClick={() => onSelect(image)}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          <Puzzle size={18} />
          Generate Puzzle
        </button>
      </div>
    </div>
  );
};
