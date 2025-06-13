import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedConcert } from "@/components/featured-concert";
import { Rankings } from "@/components/rankings";
import { useTimer } from "@/hooks/use-timer";
import type { Concert } from "@shared/schema";

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
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                DC Piano Concert Rankings
              </h1>
              <p className="text-slate-600 font-medium">
                Vote for the upcoming performances you're most excited about
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
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              DC Piano Concert Rankings
            </h1>
            <p className="text-slate-600 font-medium">
              Vote for the upcoming performances you're most excited about
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
