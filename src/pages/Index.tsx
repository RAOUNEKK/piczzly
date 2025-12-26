import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* 1. HERO LOGO SECTION */}
      <div className="flex flex-col items-center gap-4 mb-10 animate-fade-in">
        
        {/* NEW "SOFT & PRETTY" LOGO */}
        <div className="relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-default p-4">
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-wide"
              style={{
                fontFamily: "'Titan One', cursive", 
                position: 'relative',
                lineHeight: '1.2',
              }}
          >
            {/* 1. THE SOFT OUTLINE (Deep Plum instead of Black) */}
            <span style={{
              position: 'absolute',
              top: '4px', left: '4px',
              width: '100%',
              zIndex: -1,
              color: '#4a044e', // Deep Plum
              WebkitTextStroke: '12px #4a044e', // Thinner, softer stroke
            }}>
              Piczzly
            </span>

            {/* 2. THE SOFT DROP SHADOW (Diffused) */}
            <span style={{
              position: 'absolute',
              top: '10px', left: '10px',
              width: '100%',
              zIndex: -2,
              color: 'rgba(0,0,0,0.2)', // Very transparent shadow
              WebkitTextStroke: '12px rgba(0,0,0,0.2)',
              filter: 'blur(4px)' // Soft blur makes it dreamy
            }}>
              Piczzly
            </span>

            {/* 3. THE MAIN "CANDY" GRADIENT */}
            <span style={{
              // Creamy Yellow -> Soft Peach -> Candy Pink
              background: 'linear-gradient(180deg, #FFFDE7 0%, #FFECB3 25%, #FFAB91 50%, #F48FB1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              // Thin inner stroke to define letters
              WebkitTextStroke: '1.5px #4a044e', 
              filter: 'drop-shadow(0px 2px 0px rgba(255,255,255,0.6))', 
              zIndex: 10,
              position: 'relative'
            }}>
              Piczzly
            </span>
            
            {/* 4. THE HIGHLIGHT BUBBLE (The "Cute" shine) */}
            <span style={{
               position: 'absolute',
               top: '5px', left: '5px', 
               width: '95%', height: '40%', // Only top half
               background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 90%, transparent 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               borderRadius: '50%',
               zIndex: 20,
               pointerEvents: 'none',
               opacity: 0.8
            }}>
              Piczzly
            </span>
          </h1>
        </div>
        
        <p className="text-xl text-white font-medium max-w-xl mt-2 leading-relaxed opacity-95 drop-shadow-sm">
          Turn pictures into playful puzzles and enjoy the <br/>
          calm fun of assembling them piece by piece
        </p>
      </div>

      {/* 2. ACTION CARDS */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl animate-slide-up">
        
        {/* CARD 1 */}
        <div 
          onClick={() => navigate('/library')}
          className="group flex-1 rounded-[2rem] p-8 cursor-pointer shadow-xl hover:-translate-y-2 transition-all duration-300 border-4 border-white/20 hover:border-[#FFCB3E] flex flex-col items-center justify-center gap-4 min-h-[320px]"
          style={{ backgroundColor: '#FFEE8C' }}
        >
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-inner">
             <svg className="w-12 h-12 text-[#FFCB3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-[#FFCB3E] tracking-tight">Use Existing Images</h3>
            <p className="text-white font-bold text-base leading-relaxed opacity-90 px-2">
              Browse our curated gallery of beautiful images or your previously uploaded photos
            </p>
          </div>
        </div>

        {/* CARD 2 */}
        <div 
          onClick={() => navigate('/upload')}
          className="group flex-1 rounded-[2rem] p-8 cursor-pointer shadow-xl hover:-translate-y-2 transition-all duration-300 border-4 border-white/20 hover:border-[#C1549C] flex flex-col items-center justify-center gap-4 min-h-[320px]"
          style={{ backgroundColor: '#FFEE8C' }}
        >
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-inner">
            <svg className="w-12 h-12 text-[#FFCB3E] group-hover:text-[#C1549C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-[#FFCB3E] group-hover:text-[#C1549C] transition-colors tracking-tight">Create New Puzzle</h3>
            <p className="text-white font-bold text-base leading-relaxed opacity-90 px-2">
              Upload your own photo and transform it into a fun jigsaw puzzle
            </p>
          </div>
        </div>

      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-md pointer-events-none animate-float" />
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-[#FFCB3E]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
    </div>
  );
};

export default Index;