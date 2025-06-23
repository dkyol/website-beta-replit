import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PianoFallback } from "./piano-fallback";
import { SocialShare } from "./social-share";
import { formatConcertDate } from "@shared/dateUtils";
import { Share2 } from "lucide-react";
import type { Concert } from "@shared/schema";

interface FeaturedConcertProps {
  concert: Concert;
  timeLeft: number;
}

export function FeaturedConcert({ concert, timeLeft }: FeaturedConcertProps) {
  const [imageError, setImageError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Reset image error when concert changes
  useEffect(() => {
    setImageError(false);
  }, [concert.id]);

  return (
    <div className="flex justify-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Featured Concert</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <span>Next concert in:</span>
            <span className="font-mono font-semibold text-blue-600">
              {timeLeft}s
            </span>
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg max-w-2xl mx-auto">
          <CardContent className="p-0">
            <div className="p-8">
              <div className="text-center space-y-6">
                {imageError ? (
                  <div className="w-full h-64 bg-slate-100 rounded-xl shadow-md flex items-center justify-center mx-auto">
                    <PianoFallback className="w-full h-full" />
                  </div>
                ) : (
                  <img 
                    src={concert.imageUrl} 
                    alt={concert.title}
                    className="w-full h-64 object-cover rounded-xl shadow-md mx-auto"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                )}
                
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                    {concert.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {concert.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-slate-700">Date:</span>
                      <span className="text-slate-600">{formatConcertDate(concert.date)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-slate-700">Venue:</span>
                      <span className="text-slate-600">{concert.venue}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-slate-700">Price:</span>
                      <span className="text-slate-600">{concert.price}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-slate-700">Organizer:</span>
                      <span className="text-slate-600">{concert.organizer}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-slate-700">Location:</span>
                      <span className="text-slate-600">{concert.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <a 
                        href={concert.concertLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                      >
                        Buy Tickets →
                      </a>
                      <Button
                        onClick={() => setShowShareModal(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
        
        {/* Social Share Modal */}
        <SocialShare 
          concert={concert}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </motion.div>
    </div>
  );
}
