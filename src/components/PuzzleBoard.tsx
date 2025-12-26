import { useState, useEffect, useRef } from 'react';
import { JigsawPiece, PuzzleConfig, PuzzleBoardProps } from '../types/puzzle';
import confetti from 'canvas-confetti';

// --- CONSTANTS ---
const TAB = 24;            // Size of the connector tab
const SNAP_DIST = 40;      // Distance to snap
const BOARD_MARGIN = 20;   // Physical spacing around the board

export const PuzzleBoard = ({ 
  imageSrc, 
  onComplete, 
  onExit, 
  gridSize = 3 
}: PuzzleBoardProps) => {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<JigsawPiece[]>([]);
  const [config, setConfig] = useState<PuzzleConfig | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // --- 1. SYMMETRICAL PATH GENERATOR ---
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

  // --- 2. INIT ---
  useEffect(() => {
    setLoading(true);
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const isMobile = window.innerWidth < 800;
      const trayWidth = isMobile ? 0 : 300; 
      
      // Calculate available space minus margins
      const availableW = window.innerWidth - trayWidth - (BOARD_MARGIN * 3);
      const availableH = isMobile ? window.innerHeight * 0.5 : window.innerHeight - (BOARD_MARGIN * 3);

      const scale = Math.min(1, availableW / img.width, availableH / img.height);
      
      // Floor dimensions to avoid sub-pixel rendering gaps
      const boardW = Math.floor(img.width * scale);
      const boardH = Math.floor(img.height * scale);
      const pieceW = Math.floor(boardW / gridSize);
      const pieceH = Math.floor(boardH / gridSize);
      
      const exactW = pieceW * gridSize;
      const exactH = pieceH * gridSize;

      // Shapes Grid
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

      const newPieces: JigsawPiece[] = [];
      const fw = pieceW + TAB * 2;
      const fh = pieceH + TAB * 2;
      
      let startX, startY, scatterW, scatterH;

      if (isMobile) {
        startX = BOARD_MARGIN;
        startY = exactH + BOARD_MARGIN + 20; 
        scatterW = window.innerWidth - fw - 40;
        scatterH = 300;
      } else {
        startX = exactW + BOARD_MARGIN + 40;
        startY = BOARD_MARGIN;
        scatterW = trayWidth - fw - 20;
        scatterH = window.innerHeight - fh - 50;
      }
      
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          newPieces.push({
            id: r * gridSize + c,
            correctRow: r,
            correctCol: c,
            currentX: startX + Math.random() * scatterW,
            currentY: startY + Math.random() * scatterH,
            rotation: (Math.random() * 20) - 10,
            isPlaced: false,
            shape: shapes[r][c] as [number, number, number, number],
          });
        }
      }

      setConfig({ 
        rows: gridSize, cols: gridSize, 
        pieceWidth: pieceW, pieceHeight: pieceH, 
        boardWidth: exactW, boardHeight: exactH,
        totalPieceWidth: fw, totalPieceHeight: fh
      });
      setPieces(newPieces);
      setLoading(false);
    };
  }, [imageSrc, gridSize]);

  // --- 3. FIXED DRAG LOGIC (POINTER EVENTS) ---
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    // e.button === 0 is Left Click or Touch Contact
    if (e.button !== 0) return;
    
    // Prevent default browser behaviors (like text selection or scrolling initiation)
    e.preventDefault(); 
    e.stopPropagation();

    const piece = pieces.find(p => p.id === id);
    if (!piece || piece.isPlaced || !containerRef.current) return;

    // Optional: Capture pointer to ensure we don't lose the drag if moving fast
    (e.target as Element).setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    // Calculate Position RELATIVE TO CONTENT
    const mouseX = (e.clientX - rect.left) + scrollLeft;
    const mouseY = (e.clientY - rect.top) + scrollTop;

    setDragOffset({
      x: mouseX - piece.currentX,
      y: mouseY - piece.currentY
    });
    setDragging(id);
    setPieces(prev => [...prev.filter(p => p.id !== id), piece]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging === null || !containerRef.current) return;
    e.preventDefault(); 
    
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    // Apply scroll correction here too
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

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging === null || !config || !containerRef.current) return;
    e.preventDefault();
    
    // Release capture if we set it
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore errors if element was removed
    }

    let didSnap = false;
    let snapPos = { x: 0, y: 0 };

    setPieces(prev => {
      const next = prev.map(p => {
        if (p.id !== dragging) return p;
        
        // Target calculation must include the BOARD_MARGIN
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

    if (didSnap) {
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

  if (loading || !config) return <div className="p-20 text-center font-bold text-gray-400">Loading Jigsaw...</div>;

  // Ensure container is big enough to scroll
  const containerW = Math.max(window.innerWidth, config.boardWidth + 400);
  const containerH = Math.max(window.innerHeight, config.boardHeight + 500);

  return (
    <div className="flex flex-col h-screen bg-stone-100 font-sans select-none overflow-hidden">
      
      {/* HEADER */}
      <div className="flex-none flex justify-between items-center px-6 py-3 bg-white shadow z-20">
        <h2 className="font-bold text-stone-700 text-lg">Jigsaw Puzzle</h2>
        <button onClick={onExit} className="px-5 py-1.5 bg-rose-500 text-white font-medium rounded-full hover:bg-rose-600 transition">
          Exit
        </button>
      </div>

      {/* SCROLLABLE VIEWPORT */}
      <div className="flex-1 overflow-auto bg-stone-100 relative">
        <div 
          ref={containerRef}
          className="relative"
          style={{ 
            minWidth: '100%', 
            minHeight: '100%',
            width: containerW,
            height: containerH
          }}
          // SWITCHED TO POINTER EVENTS
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          
          {/* 1. GHOST BOARD */}
          <div 
            className="absolute border-2 border-stone-300 bg-white/50 rounded"
            style={{ 
              top: BOARD_MARGIN, 
              left: BOARD_MARGIN, 
              width: config.boardWidth, 
              height: config.boardHeight 
            }}
          >
             <svg width={config.boardWidth} height={config.boardHeight} className="overflow-visible opacity-25 pointer-events-none">
               {pieces.map(p => (
                 <path 
                   key={`ghost-${p.id}`}
                   d={getPiecePath(config.pieceWidth, config.pieceHeight, p.shape)}
                   transform={`translate(${p.correctCol * config.pieceWidth - TAB}, ${p.correctRow * config.pieceHeight - TAB})`}
                   fill="none" stroke="#000" strokeWidth="1.5"
                 />
               ))}
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-stone-300 font-bold text-3xl uppercase opacity-50 tracking-widest">
               Drop Zone
             </div>
          </div>

          {/* 2. PIECES */}
          {pieces.map(p => (
            <div
              key={p.id}
              // SWITCHED TO POINTER DOWN
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
                // CRITICAL FOR MOBILE: Prevents scrolling when touching the piece
                touchAction: 'none'
              }}
            >
              <svg width={config.totalPieceWidth} height={config.totalPieceHeight} className="overflow-visible">
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
      </div>
    </div>
  );
};