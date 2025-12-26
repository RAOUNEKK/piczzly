// src/types/puzzle.ts

// Keep this (used for your Library/Gallery)
export interface PuzzleImage {
  id: string;
  src: string;
  name: string;
  isBuiltIn: boolean;
}

// Updated Piece definition to support Jigsaw Shapes
export interface PuzzlePiece {
  id: number;
  correctRow: number;
  correctCol: number;
  currentX: number;
  currentY: number;
  isPlaced: boolean;
  rotation: number; 
  // [Top, Right, Bottom, Left] 
  // 1 = Tab Out, -1 = Slot In, 0 = Flat Border
  shape: [number, number, number, number]; 
}

// Updated Config to include total dimensions (tabs included)
export interface PuzzleConfig {
  rows: number;
  cols: number;
  pieceWidth: number;  // Width of the grid cell
  pieceHeight: number; // Height of the grid cell
  boardWidth: number;  // Total width of the puzzle
  boardHeight: number; // Total height of the puzzle
  totalPieceWidth: number;  // Width + Tabs
  totalPieceHeight: number; // Height + Tabs
}

// Props for the Component
export interface PuzzleBoardProps {
  imageSrc: string;
  gridSize?: number; // e.g., 4 for 4x4
  onComplete?: () => void;
  onExit?: () => void;
}