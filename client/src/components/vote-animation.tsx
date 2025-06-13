import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface VoteAnimationProps {
  voteType: "excited" | "interested" | null;
  onAnimationComplete?: () => void;
}

export function VoteAnimation({ voteType, onAnimationComplete }: VoteAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (voteType) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onAnimationComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [voteType, onAnimationComplete]);

  const getAnimationConfig = () => {
    if (voteType === "excited") {
      return {
        icon: Heart,
        color: "text-red-500",
        bgColor: "bg-red-50",
        particles: Array.from({ length: 8 }, (_, i) => ({
          id: i,
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        })),
      };
    } else {
      return {
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        particles: Array.from({ length: 6 }, (_, i) => ({
          id: i,
          x: Math.random() * 160 - 80,
          y: Math.random() * 160 - 80,
          rotation: Math.random() * 360,
          scale: 0.4 + Math.random() * 0.4,
        })),
      };
    }
  };

  if (!showAnimation || !voteType) return null;

  const { icon: Icon, color, bgColor, particles } = getAnimationConfig();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative"
        >
          {/* Main icon animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.5, 1],
              rotate: [0, 360, 720],
            }}
            transition={{ 
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: "easeOut"
            }}
            className={`w-24 h-24 rounded-full ${bgColor} flex items-center justify-center shadow-lg`}
          >
            <Icon className={`w-12 h-12 ${color}`} />
          </motion.div>

          {/* Particle effects */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
                opacity: [0, 1, 0],
                rotate: particle.rotation,
              }}
              transition={{
                duration: 1.5,
                delay: 0.2 + particle.id * 0.1,
                ease: "easeOut",
              }}
              className="absolute top-12 left-12"
            >
              <Sparkles className={`w-4 h-4 ${color}`} />
            </motion.div>
          ))}

          {/* Ripple effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full border-2 ${color.replace('text-', 'border-')}`}
          />

          {/* Second ripple */}
          <motion.div
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full border ${color.replace('text-', 'border-')}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface FloatingVoteIndicatorProps {
  count: number;
  type: "excited" | "interested";
  position: { x: number; y: number };
}

export function FloatingVoteIndicator({ count, type, position }: FloatingVoteIndicatorProps) {
  return (
    <motion.div
      initial={{ 
        x: position.x, 
        y: position.y, 
        opacity: 0, 
        scale: 0.5 
      }}
      animate={{ 
        y: position.y - 50, 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 1] 
      }}
      transition={{ 
        duration: 2, 
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1]
      }}
      className="fixed pointer-events-none z-40"
    >
      <div className={`
        px-3 py-1 rounded-full text-sm font-medium shadow-lg
        ${type === "excited" 
          ? "bg-red-100 text-red-800 border border-red-200" 
          : "bg-blue-100 text-blue-800 border border-blue-200"
        }
      `}>
        +{count} {type === "excited" ? "excited" : "interested"}
      </div>
    </motion.div>
  );
}

interface PulseVoteButtonProps {
  children: React.ReactNode;
  isVoting: boolean;
  hasVoted: boolean;
  onClick: (event: React.MouseEvent) => void;
  className?: string;
}

export function PulseVoteButton({ 
  children, 
  isVoting, 
  hasVoted, 
  onClick, 
  className = "" 
}: PulseVoteButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isVoting}
      whileHover={{ scale: hasVoted ? 1 : 1.05 }}
      whileTap={{ scale: hasVoted ? 1 : 0.95 }}
      animate={isVoting ? {
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0)",
          "0 0 0 10px rgba(59, 130, 246, 0.3)",
          "0 0 0 0 rgba(59, 130, 246, 0)"
        ]
      } : {}}
      transition={{ 
        duration: 0.6,
        repeat: isVoting ? Infinity : 0
      }}
      className={`
        relative transition-all duration-200
        ${hasVoted ? "opacity-75" : ""}
        ${className}
      `}
    >
      {children}
      
      {isVoting && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-lg bg-white/20 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        </motion.div>
      )}
    </motion.button>
  );
}