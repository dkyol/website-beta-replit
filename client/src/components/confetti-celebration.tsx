import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!showConfetti) return null;

  // Generate random confetti pieces
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: -20,
    rotation: Math.random() * 360,
    color: [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
      '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'
    ][Math.floor(Math.random() * 10)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0.8, 0],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeIn",
            }}
            className="absolute"
            style={{
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Central celebration message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
          transition={{ 
            duration: 2.5,
            times: [0, 0.3, 0.7, 1],
            ease: "easeOut"
          }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ 
              duration: 0.5, 
              repeat: 4,
              repeatType: "reverse"
            }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 drop-shadow-lg">
            Milestone Achieved!
          </h2>
          <p className="text-xl text-slate-600 drop-shadow">
            Keep voting to unlock more badges!
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface MilestoneBadgePopupProps {
  badge: {
    name: string;
    description: string;
    icon: string;
    color: string;
  } | null;
  onClose: () => void;
}

export function MilestoneBadgePopup({ badge, onClose }: MilestoneBadgePopupProps) {
  useEffect(() => {
    if (badge) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -100 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-sm border-2 border-yellow-200"
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-4xl mb-3"
            >
              {badge.icon}
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-slate-800 mb-2"
            >
              New Badge Earned!
            </motion.h3>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${badge.color}`}
            >
              {badge.name}
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-slate-600 text-sm"
            >
              {badge.description}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}