import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PuzzleLogo } from '@/components/PuzzleLogo';
import { useImageLibrary } from '@/hooks/useImageLibrary';
import { ArrowLeft, Upload as UploadIcon, Image, X } from 'lucide-react';
import { toast } from 'sonner';

const Upload = () => {
  const navigate = useNavigate();
  const { addImage } = useImageLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setFileName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleGeneratePuzzle = () => {
    if (!preview) return;
    
    const newImage = addImage(preview, fileName || 'My Puzzle');
    toast.success('Image saved to library!');
    navigate('/play', { state: { image: newImage } });
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          <div className="w-20" />
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Puzzle</h1>
          <p className="text-muted-foreground">Upload your own image to turn it into a puzzle</p>
        </div>

        {/* Upload Area */}
        <div className="max-w-xl mx-auto">
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`card-playful p-12 text-center cursor-pointer transition-all ${
                isDragging ? 'border-turquoise border-4 bg-primary/10' : ''
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <UploadIcon size={36} className="text-turquoise" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Drop your image here
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse your files
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP up to 10MB
              </p>
            </div>
          ) : (
            <div className="card-playful overflow-hidden animate-pop">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full aspect-video object-cover"
                />
                <button
                  onClick={clearPreview}
                  className="absolute top-4 right-4 p-2 bg-card/90 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Puzzle Name
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter a name for your puzzle"
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-turquoise focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={clearPreview}
                    className="flex-1 btn-secondary py-3"
                  >
                    Choose Different
                  </button>
                  <button
                    onClick={handleGeneratePuzzle}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    <Image size={20} />
                    Generate Puzzle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
