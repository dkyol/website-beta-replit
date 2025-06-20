import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";

interface AnimatedVoteCounterProps {
  excited: number;
  interested: number;
  previousExcited?: number;
  previousInterested?: number;
}

export function AnimatedVoteCounter({ 
  excited, 
  interested, 
  previousExcited = 0, 
  previousInterested = 0 
}: AnimatedVoteCounterProps) {
  const [displayExcited, setDisplayExcited] = useState(excited);
  const [displayInterested, setDisplayInterested] = useState(interested);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (excited !== previousExcited || interested !== previousInterested) {
      setIsAnimating(true);
      
      // Animate counters with a slight delay between them
      const timer1 = setTimeout(() => setDisplayExcited(excited), 200);
      const timer2 = setTimeout(() => setDisplayInterested(interested), 400);
      const timer3 = setTimeout(() => setIsAnimating(false), 800);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [excited, interested, previousExcited, previousInterested]);

  const totalVotes = displayExcited + displayInterested;
  const totalPoints = (displayExcited * 2) + (displayInterested * 1);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="text-slate-600">Very Excited:</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={`excited-${displayExcited}`}
            initial={{ scale: 0.5, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`font-bold ${isAnimating ? 'text-red-500' : 'text-slate-800'}`}
          >
            {displayExcited}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-blue-500" />
          <span className="text-slate-600">Interested:</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={`interested-${displayInterested}`}
            initial={{ scale: 0.5, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
            className={`font-bold ${isAnimating ? 'text-blue-500' : 'text-slate-800'}`}
          >
            {displayInterested}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div 
        className="border-t pt-2"
        animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between">
          <span className="text-slate-600">Weighted Score:</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`points-${totalPoints}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
              className={`font-bold ${isAnimating ? 'text-green-600' : 'text-slate-800'}`}
            >
              {totalPoints} points
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 text-sm">Total Votes:</span>
          <motion.span 
            className="text-slate-600 text-sm"
            animate={isAnimating ? { color: ["#64748b", "#16a34a", "#64748b"] } : {}}
            transition={{ duration: 0.6 }}
          >
            {totalVotes}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

interface VoteProgressBarProps {
  excited: number;
  interested: number;
  maxVotes?: number;
}

export function VoteProgressBar({ excited, interested, maxVotes = 50 }: VoteProgressBarProps) {
  const totalVotes = excited + interested;
  const excitedPercentage = totalVotes > 0 ? (excited / totalVotes) * 100 : 0;
  const interestedPercentage = totalVotes > 0 ? (interested / totalVotes) * 100 : 0;
  const progressPercentage = Math.min((totalVotes / maxVotes) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Vote Distribution</span>
        <span>{totalVotes}/{maxVotes} votes</span>
      </div>
      
      {/* Overall progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full"
        />
      </div>

      {/* Vote type distribution */}
      {totalVotes > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${excitedPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="h-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center"
          >
            {excitedPercentage > 15 && (
              <span className="text-white text-xs font-medium">
                {Math.round(excitedPercentage)}%
              </span>
            )}
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${interestedPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center"
          >
            {interestedPercentage > 15 && (
              <span className="text-white text-xs font-medium">
                {Math.round(interestedPercentage)}%
              </span>
            )}
          </motion.div>
        </div>
      )}

      <div className="flex justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Very Excited</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Interested</span>
        </div>
      </div>
    </div>
  );
}