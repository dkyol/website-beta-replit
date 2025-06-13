import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Concert, ConcertWithVotes } from "@shared/schema";

interface FeaturedConcertProps {
  concert: Concert;
  timeLeft: number;
  voteStats?: { excited: number; interested: number };
}

export function FeaturedConcert({ concert, timeLeft, voteStats }: FeaturedConcertProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'excited' | 'interested') => {
      const response = await apiRequest('POST', '/api/vote', {
        concertId: concert.id,
        voteType
      });
      return response.json();
    },
    onSuccess: () => {
      setHasVoted(true);
      toast({
        title: "Vote recorded!",
        description: "Thank you for voting on this concert.",
      });
      // Invalidate and refetch rankings
      queryClient.invalidateQueries({ queryKey: ['/api/rankings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vote-stats'] });
    },
    onError: () => {
      toast({
        title: "Vote failed",
        description: "There was an error recording your vote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleVote = (voteType: 'excited' | 'interested') => {
    if (hasVoted || voteMutation.isPending) return;
    voteMutation.mutate(voteType);
  };

  const stats = voteStats || { excited: 0, interested: 0 };
  const totalVotes = stats.excited + stats.interested;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Featured Concert</h2>
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <span>Next concert in:</span>
          <span className="font-mono font-bold text-blue-600">{timeLeft}s</span>
        </div>
      </div>

      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="space-y-6">
              <img 
                src={concert.imageUrl} 
                alt={concert.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl shadow-md"
              />
              
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  {concert.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {concert.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Date:</span>
                    <span className="text-slate-600">{concert.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Venue:</span>
                    <span className="text-slate-600">{concert.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Price:</span>
                    <span className="text-slate-600">{concert.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Organizer:</span>
                    <span className="text-slate-600">{concert.organizer}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-bold text-slate-800 mb-6">
                  How excited are you about this concert?
                </h4>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => handleVote('excited')}
                    disabled={hasVoted || voteMutation.isPending}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                  >
                    🎹 Very Excited!
                  </Button>
                  
                  <Button
                    onClick={() => handleVote('interested')}
                    disabled={hasVoted || voteMutation.isPending}
                    className="w-full py-4 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                  >
                    🎵 Somewhat Interested
                  </Button>
                </div>
                
                {hasVoted && (
                  <motion.p
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="text-green-600 font-semibold mt-4"
                  >
                    ✓ Vote recorded! Thank you!
                  </motion.p>
                )}
              </div>

              <Card className="bg-slate-50">
                <CardContent className="p-6">
                  <h5 className="font-bold text-slate-700 mb-3">Current Votes:</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Very Excited:</span>
                      <span className="font-semibold text-blue-600">{stats.excited}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Somewhat Interested:</span>
                      <span className="font-semibold text-slate-600">{stats.interested}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Total Votes:</span>
                      <span className="font-bold text-slate-800">{totalVotes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
