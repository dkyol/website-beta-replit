export function PianoFallback({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pianoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#2d3748", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1a202c", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Piano body */}
      <rect x="50" y="80" width="300" height="100" rx="8" fill="url(#pianoGradient)" stroke="#4a5568" strokeWidth="2"/>
      
      {/* Piano lid */}
      <rect x="55" y="75" width="290" height="15" rx="4" fill="#4a5568"/>
      
      {/* White keys */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect 
          key={`white-${i}`}
          x={70 + i * 37} 
          y="90" 
          width="35" 
          height="80" 
          fill="white" 
          stroke="#e2e8f0" 
          strokeWidth="1"
          rx="2"
        />
      ))}
      
      {/* Black keys */}
      {[0, 1, 3, 4, 5].map((i) => (
        <rect 
          key={`black-${i}`}
          x={89 + (i > 2 ? i + 1 : i) * 37} 
          y="90" 
          width="18" 
          height="50" 
          fill="#2d3748" 
          rx="2"
        />
      ))}
      
      {/* Piano legs */}
      <rect x="80" y="180" width="8" height="15" fill="#4a5568"/>
      <rect x="130" y="180" width="8" height="15" fill="#4a5568"/>
      <rect x="262" y="180" width="8" height="15" fill="#4a5568"/>
      <rect x="312" y="180" width="8" height="15" fill="#4a5568"/>
      
      {/* Musical notes decoration */}
      <circle cx="120" cy="45" r="8" fill="#805ad5"/>
      <path d="M120 37 L120 25 L135 20 L135 40" stroke="#805ad5" strokeWidth="2" fill="none"/>
      
      <circle cx="280" cy="50" r="6" fill="#38b2ac"/>
      <path d="M280 44 L280 35 L290 32 L290 45" stroke="#38b2ac" strokeWidth="2" fill="none"/>
      
      {/* Title text */}
      <text x="200" y="25" textAnchor="middle" className="fill-slate-600 text-sm font-medium">
        Piano Concert
      </text>
    </svg>
  );
}