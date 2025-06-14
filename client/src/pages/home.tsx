import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedConcert } from "@/components/featured-concert";
import { Rankings } from "@/components/rankings";
import { UserBadges } from "@/components/user-badges";
import { useTimer } from "@/hooks/use-timer";
import { useSession } from "@/hooks/use-session";
import { filterFutureConcerts } from "@/lib/dateUtils";
import type { Concert } from "@shared/schema";
import bannerImage from "@assets/Screenshot 2025-06-12 232843_1749785388266.png";
import sightTuneLogo from "@assets/SightTune_Logo_no words_1749825929879.png";

export default function Home() {
  const [currentConcertIndex, setCurrentConcertIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionId = useSession();

  const { data: allConcerts, isLoading } = useQuery<Concert[]>({
    queryKey: ['/api/concerts'],
  });

  const { data: voteStats } = useQuery<{ [concertId: number]: { excited: number; interested: number } }>({
    queryKey: ['/api/vote-stats'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time vote updates
  });

  // Filter for future concerts only for featured rotation
  const concerts = useMemo(() => {
    if (!allConcerts) return [];
    const futureConcerts = filterFutureConcerts(allConcerts);
    return futureConcerts.length > 0 ? futureConcerts : allConcerts;
  }, [allConcerts]);
  
  const nextConcert = () => {
    if (concerts && concerts.length > 0) {
      setCurrentConcertIndex((prev) => (prev + 1) % concerts.length);
      // Reset vote state for new concert
      setUserVotes(new Set());
      resetTimer(); // Reset the timer when advancing
    }
  };

  const onVoteSubmitted = () => {
    // Immediately advance to next concert after vote
    nextConcert();
  };

  const { timeLeft, reset: resetTimer } = useTimer(7, nextConcert);

  // Initialize with random concert on first load
  useEffect(() => {
    if (concerts.length > 0 && !isInitialized) {
      const randomIndex = Math.floor(Math.random() * concerts.length);
      setCurrentConcertIndex(randomIndex);
      setIsInitialized(true);
    }
  }, [concerts.length, isInitialized]);

  // Only reset index if it's out of bounds
  useEffect(() => {
    if (concerts.length > 0 && currentConcertIndex >= concerts.length) {
      setCurrentConcertIndex(0);
    }
  }, [concerts.length, currentConcertIndex]);

  if (isLoading || !concerts || concerts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header 
          className="relative bg-cover bg-center bg-no-repeat shadow-sm border-b border-slate-200"
          style={{
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Enjoy Classical Music!
              </h1>
              <p className="text-white font-medium">
                Vote for your favorite artist
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentConcert = concerts[currentConcertIndex];
  const currentVoteStats = voteStats?.[currentConcert.id];

  return (
    <div className="min-h-screen bg-slate-50">
      <header 
        className="relative bg-cover bg-center bg-no-repeat shadow-sm border-b border-slate-200"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Enjoy Classical Music!
            </h1>
            <p className="text-white font-medium">
              Vote for your favorite artist
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <FeaturedConcert
          concert={currentConcert}
          timeLeft={timeLeft}
          voteStats={currentVoteStats}
          onVoteSubmitted={onVoteSubmitted}
          sessionId={sessionId}
        />
        
        {/* User Badges Section */}
        {sessionId && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <UserBadges sessionId={sessionId} />
          </div>
        )}
        
        <Rankings />
      </main>
      
      {/* Sponsor Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 text-slate-600">
            <span className="text-sm">Sponsored by <span className="font-bold">SightTune</span></span>
            <img 
              src={sightTuneLogo} 
              alt="SightTune Music Technology" 
              className="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
