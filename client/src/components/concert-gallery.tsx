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

  // Get 10 random upcoming concerts with real images
  const randomConcerts = useMemo(() => {
    if (!concerts.length) return [];
    
    // Filter for current and future concerts with real images (not placeholder images)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    const futureConcerts = concerts.filter(concert => {
      const concertDate = new Date(concert.date);
      const isTodayOrFuture = concertDate >= today;
      
      // Check if concert has a real image URL
      if (!concert.imageUrl || concert.imageUrl === '') {
        return false;
      }
      
      // List of placeholder image patterns to exclude
      const placeholderPatterns = [
        'placeholder',
        'default',
        'fallback',
        '105961_RETINA_PORTRAIT_16_9',
        'ef64d601-8740-43cd-86ea-ed9b392e4f7b',
        'piano-icon',
        'piano_fallback',
        'generic',
        'no-image',
        'missing'
      ];
      
      // Check if URL contains any placeholder patterns
      const hasPlaceholderPattern = placeholderPatterns.some(pattern => 
        concert.imageUrl.toLowerCase().includes(pattern.toLowerCase())
      );
      
      // Additional check: if image URL is very short or looks like a default pattern
      const isValidImageUrl = concert.imageUrl.length > 20 && 
        (concert.imageUrl.includes('ticketm.net') || 
         concert.imageUrl.includes('amazonaws') ||
         concert.imageUrl.includes('cloudfront') ||
         concert.imageUrl.includes('imgix') ||
         concert.imageUrl.includes('unsplash') ||
         concert.imageUrl.startsWith('http'));
      
      return isTodayOrFuture && !hasPlaceholderPattern && isValidImageUrl;
    });
    
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
        <p>No upcoming concerts with images available</p>
        <p className="text-sm mt-1">Check back soon for more featured performances</p>
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

      <div className="relative">
        <div className="grid grid-cols-6 gap-3" style={{ gridAutoRows: '100px' }}>
          {randomConcerts.filter(concert => !imageErrors.has(concert.id)).slice(0, 9).map((concert, index) => {
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
                      // Don't show fallback - skip this concert entirely by not rendering
                      <div className="hidden"></div>
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
        
        {/* Large thumbnail in lower right */}
        {randomConcerts.filter(concert => !imageErrors.has(concert.id)).length > 9 && (
          <div className="absolute bottom-0 right-0 w-48 h-32">
            <a 
              href={randomConcerts[9]?.concertLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-full group"
            >
              <Card className="w-full h-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-0 h-full relative">
                  <div className="relative h-full w-full">
                    <img
                      src={randomConcerts[9]?.imageUrl}
                      alt={randomConcerts[9]?.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(randomConcerts[9]?.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <div className="bg-white/90 text-slate-800 px-2 py-1 rounded text-xs font-medium mb-1">
                        {formatConcertDateShort(randomConcerts[9]?.date)}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                        {randomConcerts[9]?.title}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}