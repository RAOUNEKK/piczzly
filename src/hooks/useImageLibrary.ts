import { useState, useEffect } from 'react';
import { PuzzleImage } from '@/types/puzzle';
import puzzle1 from '@/assets/puzzle-1.jpg';
import puzzle2 from '@/assets/puzzle-2.jpg';
import puzzle3 from '@/assets/puzzle-3.jpg';
import puzzle4 from '@/assets/puzzle-4.jpg';
import puzzle5 from '@/assets/puzzle-5.jpg';
import puzzle6 from '@/assets/puzzle-6.jpg';
import puzzle7 from '@/assets/puzzle-7.jpg';
import puzzle8 from '@/assets/puzzle-8.jpg';
import puzzle9 from '@/assets/puzzle-9.jpg';


const STORAGE_KEY = 'piczzly_images';

const BUILT_IN_IMAGES: PuzzleImage[] = [
  { id: 'builtin-1', src: puzzle1, name: '80s ', isBuiltIn: true },
  { id: 'builtin-2', src: puzzle2, name: 'chinese culture', isBuiltIn: true },
  { id: 'builtin-3', src: puzzle3, name: 'Fairy old days', isBuiltIn: true },
  { id: 'builtin-4', src: puzzle4, name: 'Cobble Hill Cafe Paris', isBuiltIn: true },
  { id: 'builtin-5', src: puzzle5, name: 'Library', isBuiltIn: true },
  { id: 'builtin-6', src: puzzle6, name: 'Indie Jungle', isBuiltIn: true },
  { id: 'builtin-7', src: puzzle7, name: 'Train Station', isBuiltIn: true },
  { id: 'builtin-8', src: puzzle8, name: 'Paris Time ', isBuiltIn: true },
  { id: 'builtin-9', src: puzzle9, name: 'Warm Vibes', isBuiltIn: true },
];

export const useImageLibrary = () => {
  const [userImages, setUserImages] = useState<PuzzleImage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUserImages(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored images');
      }
    }
  }, []);

  const addImage = (imageData: string, name: string) => {
    const newImage: PuzzleImage = {
      id: `user-${Date.now()}`,
      src: imageData,
      name,
      isBuiltIn: false,
    };
    const updated = [...userImages, newImage];
    setUserImages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newImage;
  };

  const removeImage = (id: string) => {
    const updated = userImages.filter(img => img.id !== id);
    setUserImages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const allImages = [...BUILT_IN_IMAGES, ...userImages];

  return {
    builtInImages: BUILT_IN_IMAGES,
    userImages,
    allImages,
    addImage,
    removeImage,
  };
};
