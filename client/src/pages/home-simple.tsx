import { useEffect } from "react";

export default function Home() {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/og-image.png" 
          alt="SightTune - Classical Music Discovery" 
          className="max-w-full h-auto mx-auto"
        />
      </div>
    </div>
  );
}