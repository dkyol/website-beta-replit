import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PianoFallback } from "./piano-fallback";
import { formatConcertDateShort } from "@shared/dateUtils";
import type { Concert } from "@shared/schema";

interface ConcertGalleryProps {
  concerts: Concert[];
}

export function ConcertGallery({ concerts }: ConcertGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Get 10 random upcoming concerts
  const randomConcerts = useMemo(() => {
    if (!concerts.length) return [];
    
    // Filter for future concerts
    const now = new Date();
    const futureConcerts = concerts.filter(concert => 
      new Date(concert.date) > now
    );
    
    // Shuffle and take 10
    const shuffled = [...futureConcerts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [concerts]);

  const handleImageError = (concertId: number) => {
    setImageErrors(prev => new Set([...prev, concertId]));
  };

  const handleImageLoad = (concertId: number) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(concertId);
      return newSet;
    });
  };

  if (randomConcerts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No upcoming concerts available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Upcoming Concerts
        </h3>
        <p className="text-slate-600 text-sm">
          Discover exciting classical performances happening soon
        </p>
      </div>

      <div className="grid grid-cols-6 gap-3" style={{ gridAutoRows: '100px' }}>
        {randomConcerts.map((concert, index) => {
          const hasError = imageErrors.has(concert.id);
          
          // Create specific layout pattern matching the attached image
          const layouts = [
            "col-span-2 row-span-1", // Wide rectangle
            "col-span-1 row-span-2", // Tall rectangle  
            "col-span-1 row-span-2", // Tall rectangle
            "col-span-2 row-span-1", // Wide rectangle
            "col-span-2 row-span-1", // Wide rectangle
            "col-span-1 row-span-2", // Tall rectangle
            "col-span-1 row-span-1", // Small square
            "col-span-2 row-span-1", // Wide rectangle
            "col-span-2 row-span-1", // Wide rectangle
            "col-span-1 row-span-1", // Small square
          ];
          
          const layoutClass = layouts[index % layouts.length];
          
          return (
            <Card 
              key={concert.id} 
              className={`${layoutClass} overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <a
                href={concert.concertLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <CardContent className="p-0 h-full relative">
                  <div className="relative h-full w-full">
                    {hasError ? (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <PianoFallback className="w-full h-full opacity-50" />
                      </div>
                    ) : (
                      <img
                        src={concert.imageUrl}
                        alt={concert.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(concert.id)}
                        onLoad={() => handleImageLoad(concert.id)}
                      />
                    )}
                    
                    {/* Overlay with date */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-white">
                          <p className="text-xs font-medium mb-1 line-clamp-2">
                            {concert.title}
                          </p>
                          <p className="text-xs opacity-90">
                            {formatConcertDateShort(concert.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Date badge - always visible */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                      <p className="text-xs font-medium text-slate-800">
                        {formatConcertDateShort(concert.date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </a>
            </Card>
          );
        })}
      </div>
    </div>
  );
}