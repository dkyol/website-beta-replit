import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConcertWithVotes } from "@shared/schema";

export function Rankings() {
  const { data: rankings, isLoading } = useQuery<ConcertWithVotes[]>({
    queryKey: ['/api/rankings'],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Current Rankings</h2>
            <p className="text-slate-600">Live vote totals and position changes</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 px-4">
            <div>Rank</div>
            <div className="col-span-2">Concert</div>
            <div className="text-right">Score</div>
          </div>
          
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 items-center p-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="col-span-2 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-5 w-12 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Current Rankings</h2>
          <p className="text-slate-600">Live vote totals and position changes</p>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 px-4">
          <div>Rank</div>
          <div className="col-span-2">Concert</div>
          <div className="text-right">Score</div>
        </div>
        
        <div className="space-y-2">
          {rankings?.map((concert, index) => {
            const rank = index + 1;
            const change = concert.rankChange || 0;
            
            let changeIcon = '';
            let changeClass = '';
            let borderClass = '';
            
            if (change > 0) {
              changeIcon = `↗ +${change}`;
              changeClass = 'text-green-600';
              borderClass = 'border-l-4 border-green-500';
            } else if (change < 0) {
              changeIcon = `↘ ${change}`;
              changeClass = 'text-red-600';
              borderClass = 'border-l-4 border-red-500';
            } else {
              changeIcon = '—';
              changeClass = 'text-slate-400';
              borderClass = 'border-l-4 border-slate-200';
            }

            return (
              <motion.div
                key={concert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`grid grid-cols-4 gap-4 items-center p-4 hover:bg-slate-50 rounded-xl transition-colors ${borderClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {rank}
                  </div>
                  <span className={`text-sm font-medium ${changeClass}`}>
                    {changeIcon}
                  </span>
                </div>
                
                <div className="col-span-2">
                  <h4 className="font-semibold text-slate-800 leading-tight">
                    {concert.title}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    {concert.venue} • {concert.date}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-800">
                    {concert.weightedScore}
                  </div>
                  <div className="text-xs text-slate-500">
                    {concert.totalVotes} votes
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
