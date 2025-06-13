import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedConcert } from "@/components/featured-concert";
import { Rankings } from "@/components/rankings";
import { useTimer } from "@/hooks/use-timer";
import type { Concert } from "@shared/schema";
import bannerImage from "@assets/Screenshot 2025-06-12 232843_1749785388266.png";

export default function Home() {
  const [currentConcertIndex, setCurrentConcertIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());

  const { data: concerts, isLoading } = useQuery<Concert[]>({
    queryKey: ['/api/concerts'],
  });

  const { data: voteStats } = useQuery<{ [concertId: number]: { excited: number; interested: number } }>({
    queryKey: ['/api/vote-stats'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time vote updates
  });

  const nextConcert = () => {
    if (concerts && concerts.length > 0) {
      setCurrentConcertIndex((prev) => (prev + 1) % concerts.length);
      // Reset vote state for new concert
      setUserVotes(new Set());
    }
  };

  const { timeLeft } = useTimer(30, nextConcert);

  // Reset to first concert when concerts load
  useEffect(() => {
    if (concerts && concerts.length > 0) {
      setCurrentConcertIndex(0);
    }
  }, [concerts]);

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
        />
        
        <Rankings />
      </main>
    </div>
  );
}
