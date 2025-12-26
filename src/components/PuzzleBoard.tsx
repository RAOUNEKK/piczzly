import { useState, useEffect, useRef, useCallback } from 'react';
import { JigsawPiece, PuzzleConfig, PuzzleBoardProps } from '../types/puzzle';
import confetti from 'canvas-confetti';

// --- CONSTANTS ---
const TAB = 24;            
const SNAP_DIST = 40;      
const BOARD_MARGIN = 20;

export const PuzzleBoard = ({ 
  imageSrc, 
  onComplete, 
  onExit, 
  gridSize = 3 
}: PuzzleBoardProps) => {
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [pieces, setPieces] = useState<JigsawPiece[]>([]);
  const [config, setConfig] = useState<PuzzleConfig | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{w: number, h: number} | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // --- 1. SHAPE GENERATOR ---
  const getPiecePath = (width: number, height: number, shape: number[]) => {
    const [top, right, bottom, left] = shape;
    const neck = TAB * 0.22;
    const head = TAB * 0.70;
    const reach = TAB * 1.15;
    let path = `M ${TAB} ${TAB}`;

    const appendEdge = (x1: number, y1: number, x2: number, y2: number, type: number) => {
      if (type === 0) return ` L ${x2} ${y2}`;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      const s = type === 1 ? 1 : -1;
      const transform = (ox: number, oy: number) => {
        const cos = dx / dist;
        const sin = dy / dist;
        return { 
          x: midX + (ox * cos - oy * sin), 
          y: midY + (ox * sin + oy * cos) 
        };
      };

      const p0 = transform(-neck, 0);
      const cp1 = transform(-head, -reach * s);
      const cp2 = transform(head, -reach * s); 
      const endNeck = transform(neck, 0);

      return ` L ${p0.x} ${p0.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endNeck.x} ${endNeck.y} L ${x2} ${y2}`;
    };

    path += appendEdge(TAB, TAB, TAB + width, TAB, top);
    path += appendEdge(TAB + width, TAB, TAB + width, TAB + height, right);
    path += appendEdge(TAB + width, TAB + height, TAB, TAB + height, bottom);
    path += appendEdge(TAB, TAB + height, TAB, TAB, left);
    path += ' Z';
    return path;
  };

  // --- 2. LAYOUT CALCULATION ENGINE ---
  const calculateMetrics = useCallback((winW: number, winH: number, imgW: number, imgH: number) => {
    
    // Determine Orientation based on WINDOW size
    const isPortrait = winH > winW;

    // 1. Determine "Safe Zone" for the board (Where the ghost image goes)
    let availableW, availableH;
    let scatterZone; // Where pieces start

    if (isPortrait) {
      // Portrait: Board at top (60%), Tray at bottom
      availableW = winW - (BOARD_MARGIN * 2);
      availableH = (winH * 0.60) - (BOARD_MARGIN * 2);
      
      // Calculate Scale to fit image in Safe Zone
      const scale = Math.min(1, availableW / imgW, availableH / imgH);
      const boardW = Math.floor(imgW * scale);
      const boardH = Math.floor(imgH * scale);
      
      // Define Tray (Bottom area)
      scatterZone = {
        x: BOARD_MARGIN,
        y: boardH + BOARD_MARGIN + 40,
        w: winW - (BOARD_MARGIN * 2),
        h: (winH - boardH) - 100
      };

      return { scale, boardW, boardH, scatterZone };

    } else {
      // Landscape: Board at Left (70%), Tray at Right (30%)
      const trayW = Math.max(250, winW * 0.30); // At least 250px tray
      
      availableW = (winW - trayW) - (BOARD_MARGIN * 2);
      availableH = winH - (BOARD_MARGIN * 2);

      // Calculate Scale
      const scale = Math.min(1, availableW / imgW, availableH / imgH);
      const boardW = Math.floor(imgW * scale);
      const boardH = Math.floor(imgH * scale);

      // Define Tray (Right area)
      scatterZone = {
        x: boardW + BOARD_MARGIN + 40,
        y: BOARD_MARGIN,
        w: trayW - 60,
        h: winH - (BOARD_MARGIN * 2)
      };

      return { scale, boardW, boardH, scatterZone };
    }
  }, []);


  // --- 3. INIT & RESIZE LISTENER ---
  
  // Track Window Resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setImgDimensions({ w: img.width, h: img.height });
      setLoading(false);
    };
  }, [imageSrc]);

  // Recalculate Board when Window or Image changes
  useEffect(() => {
    if (!imgDimensions || loading) return;

    const { w: winW, h: winH } = windowSize;
    const { w: imgW, h: imgH } = imgDimensions;

    // Run Calculation
    const metrics = calculateMetrics(winW, winH, imgW, imgH);
    
    const pieceW = Math.floor(metrics.boardW / gridSize);
    const pieceH = Math.floor(metrics.boardH / gridSize);
    const exactW = pieceW * gridSize;
    const exactH = pieceH * gridSize;
    const fw = pieceW + TAB * 2;
    const fh = pieceH + TAB * 2;

    const newConfig: PuzzleConfig = {
      rows: gridSize, cols: gridSize,
      pieceWidth: pieceW, pieceHeight: pieceH,
      boardWidth: exactW, boardHeight: exactH,
      totalPieceWidth: fw, totalPieceHeight: fh
    };

    // If this is the FIRST load, generate pieces
    if (pieces.length === 0) {
      // Shapes
      const shapes: number[][][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          shapes[r][c] = [
            r === 0 ? 0 : -shapes[r - 1][c][2], 
            c === gridSize - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
            r === gridSize - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
            c === 0 ? 0 : -shapes[r][c - 1][1]
          ];
        }
      }

      const generatedPieces: JigsawPiece[] = [];
      const { scatterZone } = metrics;
      
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          generatedPieces.push({
            id: r * gridSize + c,
            correctRow: r,
            correctCol: c,
            // Random scatter
            currentX: scatterZone.x + Math.random() * Math.max(0, scatterZone.w - fw),
            currentY: scatterZone.y + Math.random() * Math.max(0, scatterZone.h - fh),
            rotation: (Math.random() * 20) - 10,
            isPlaced: false,
            shape: shapes[r][c] as [number, number, number, number],
          });
        }
      }
      setPieces(generatedPieces);
    } else if (config) {
      // If Resizing (Rotation), scale piece positions intelligently
      const ratioX = pieceW / config.pieceWidth;
      const ratioY = pieceH / config.pieceHeight;

      setPieces(prev => prev.map(p => {
        if (p.isPlaced) {
           // If placed, snap to new correct grid slot
           return {
             ...p,
             currentX: BOARD_MARGIN + (p.correctCol * pieceW) - TAB,
             currentY: BOARD_MARGIN + (p.correctRow * pieceH) - TAB
           };
        } else {
           // If loose, scale position
           let nx = p.currentX * ratioX;
           let ny = p.currentY * ratioY;
           
           // Clamp to new window size so they don't disappear
           const maxX = winW - fw;
           const maxY = winH - fh;
           return { 
             ...p, 
             currentX: Math.min(Math.max(0, nx), maxX), 
             currentY: Math.min(Math.max(0, ny), maxY)
           };
        }
      }));
    }

    setConfig(newConfig);

  }, [windowSize, imgDimensions, gridSize, loading]); // Dependencies for recalc


  // --- 4. DRAG HANDLER ---
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.button !== 0 || !containerRef.current) return;
    
    const piece = pieces.find(p => p.id === id);
    if (!piece || piece.isPlaced) return;

    // Get Mouse Pos relative to Scrollable Area
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    const mouseX = (e.clientX - rect.left) + scrollLeft;
    const mouseY = (e.clientY - rect.top) + scrollTop;

    setDragOffset({
      x: mouseX - piece.currentX,
      y: mouseY - piece.currentY
    });
    setDragging(id);
    setPieces(prev => [...prev.filter(p => p.id !== id), piece]);
  };

  useEffect(() => {
    if (dragging === null) return;

    const handleGlobalMove = (e: PointerEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const scrollTop = containerRef.current.scrollTop;

      const mouseX = (e.clientX - rect.left) + scrollLeft;
      const mouseY = (e.clientY - rect.top) + scrollTop;

      setPieces(prev => prev.map(p => 
        p.id === dragging ? {
          ...p,
          currentX: mouseX - dragOffset.x,
          currentY: mouseY - dragOffset.y,
          rotation: 0
        } : p
      ));
    };

    const handleGlobalUp = (e: PointerEvent) => {
      e.preventDefault();
      if (!config) return;
      
      let didSnap = false;
      let snapPos = { x: 0, y: 0 };

      setPieces(prev => {
        const next = prev.map(p => {
          if (p.id !== dragging) return p;
          
          const targetX = BOARD_MARGIN + (p.correctCol * config.pieceWidth) - TAB;
          const targetY = BOARD_MARGIN + (p.correctRow * config.pieceHeight) - TAB;
          
          const dist = Math.hypot(p.currentX - targetX, p.currentY - targetY);

          if (dist < SNAP_DIST) {
            didSnap = true;
            snapPos = { x: targetX, y: targetY };
            return { ...p, currentX: targetX, currentY: targetY, isPlaced: true, rotation: 0 };
          }
          return p;
        });
        if (next.every(p => p.isPlaced) && onComplete) setTimeout(onComplete, 1000);
        return next;
      });

      if (didSnap && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;
        
        confetti({
          particleCount: 30, spread: 50,
          origin: {
            x: (rect.left + (snapPos.x - scrollLeft) + config.pieceWidth/2) / window.innerWidth,
            y: (rect.top + (snapPos.y - scrollTop) + config.pieceHeight/2) / window.innerHeight
          }
        });
      }
      setDragging(null);
    };

    window.addEventListener('pointermove', handleGlobalMove, { passive: false });
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [dragging, dragOffset, config, onComplete]);


  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-100 font-bold text-gray-400">Loading Jigsaw...</div>;

  return (
    // FULLSCREEN OVERLAY: fixed inset-0 z-50
    // This forces the puzzle to cover the entire screen, ignoring parent layout issues.
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-100 font-sans select-none overflow-hidden touch-none">
      
      {/* HEADER */}
      <div className="flex-none flex justify-between items-center px-6 py-3 bg-white shadow z-20">
        <h2 className="font-bold text-stone-700 text-lg">Jigsaw Puzzle</h2>
        <button onClick={onExit} className="px-5 py-1.5 bg-rose-500 text-white font-medium rounded-full hover:bg-rose-600 transition">
          Exit
        </button>
      </div>

      {/* SCROLLABLE VIEWPORT */}
      <div className="flex-1 overflow-auto bg-stone-100 relative w-full h-full">
        {config && (
          <div 
            ref={containerRef}
            className="relative"
            style={{ 
              minWidth: '100%', 
              minHeight: '100%',
              // Ensure area handles pieces that might be dragged slightly off-board
              width: Math.max(windowSize.w, config.boardWidth + 50),
              height: Math.max(windowSize.h, config.boardHeight + 50),
              touchAction: 'none'
            }}
          >
            
            {/* GHOST BOARD */}
            <div 
              className="absolute border-2 border-stone-200 rounded overflow-hidden"
              style={{ 
                top: BOARD_MARGIN, 
                left: BOARD_MARGIN, 
                width: config.boardWidth, 
                height: config.boardHeight,
                background: '#f5f5f4'
              }}
            >
              {/* Force Image to Fit exactly (matches aspect ratio calculation) */}
              <img 
                src={imageSrc} 
                alt="" 
                className="w-full h-full object-cover pointer-events-none"
                style={{ opacity: 0.25 }} 
              />
              <svg width={config.boardWidth} height={config.boardHeight} className="absolute inset-0 overflow-visible pointer-events-none">
                {pieces.map(p => (
                  <path 
                    key={`ghost-${p.id}`}
                    d={getPiecePath(config.pieceWidth, config.pieceHeight, p.shape)}
                    transform={`translate(${p.correctCol * config.pieceWidth - TAB}, ${p.correctRow * config.pieceHeight - TAB})`}
                    fill="none" 
                    stroke="#000" 
                    strokeWidth={gridSize > 4 ? "0.5" : "1.5"} 
                    style={{ opacity: gridSize > 4 ? 0.1 : 0.25 }} 
                  />
                ))}
              </svg>
              {!pieces.some(p => p.isPlaced) && (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-bold text-2xl uppercase opacity-50 tracking-widest pointer-events-none">
                    Place Here
                  </div>
              )}
            </div>

            {/* PIECES */}
            {pieces.map(p => (
              <div
                key={p.id}
                onPointerDown={(e) => handlePointerDown(e, p.id)}
                className="absolute"
                style={{
                  left: 0, top: 0,
                  width: config.totalPieceWidth,
                  height: config.totalPieceHeight,
                  transform: `translate(${p.currentX}px, ${p.currentY}px) rotate(${p.rotation}deg)`,
                  zIndex: p.isPlaced ? 1 : (dragging === p.id ? 100 : 10),
                  cursor: p.isPlaced ? 'default' : 'grab',
                  pointerEvents: p.isPlaced ? 'none' : 'auto', 
                  transition: dragging === p.id ? 'none' : 'transform 0.1s ease-out',
                  filter: p.isPlaced ? 'none' : 'drop-shadow(2px 3px 5px rgba(0,0,0,0.3))',
                  touchAction: 'none'
                }}
              >
                <svg width={config.totalPieceWidth} height={config.totalPieceHeight} className="overflow-visible" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <clipPath id={`clip-${p.id}`}>
                      <path d={getPiecePath(config.pieceWidth, config.pieceHeight, p.shape)} />
                    </clipPath>
                    <filter id="bevel">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                      <feSpecularLighting in="blur" surfaceScale="2" specularConstant="0.8" specularExponent="15" lightingColor="#white" result="specOut">
                        <fePointLight x="-5000" y="-10000" z="20000" />
                      </feSpecularLighting>
                      <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                    </filter>
                  </defs>

                  <g clipPath={`url(#clip-${p.id})`}>
                    <image 
                      href={imageSrc} 
                      width={config.boardWidth} 
                      height={config.boardHeight}
                      x={-(p.correctCol * config.pieceWidth) + TAB}
                      y={-(p.correctRow * config.pieceHeight) + TAB}
                    />
                    <rect width="100%" height="100%" fill="transparent" filter="url(#bevel)" />
                  </g>
                  <path d={getPiecePath(config.pieceWidth, config.pieceHeight, p.shape)} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
                </svg>
              </div>
            ))}
            
            {/* Reference Image */}
            <div className="fixed bottom-4 right-4 w-40 bg-white p-1 shadow-lg rounded z-50 pointer-events-none opacity-90 border border-gray-200">
              <img src={imageSrc} className="w-full rounded" />
            </div>

          </div>
        )}
      </div>
    </div>
  );
};