import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Share2, Facebook, Twitter, Instagram, Copy, Check } from "lucide-react";
import type { Concert } from "@shared/schema";

interface SocialShareProps {
  concert: Concert;
  isOpen: boolean;
  onClose: () => void;
}

export function SocialShare({ concert, isOpen, onClose }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const shareText = `🎼 Don't miss "${concert.title}" at ${concert.venue} on ${concert.date}! 🎹 
  
Join the classical music community and vote for your favorite concerts at SightTune.`;

  const shareUrl = window.location.origin;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct text sharing
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`
  };

  const handleShare = (platform: string) => {
    if (platform === 'instagram') {
      toast({
        title: "Instagram Sharing",
        description: "Please share manually on Instagram by copying the text below.",
      });
      return;
    }

    window.open(socialLinks[platform as keyof typeof socialLinks], '_blank', 'width=600,height=400');
    
    toast({
      title: "Share opened",
      description: `Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)} share dialog...`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Concert details copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Concert
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Concert Details:</h4>
              <p className="text-sm text-slate-600">
                <strong>{concert.title}</strong><br />
                {concert.venue} • {concert.date}<br />
                Price: {concert.price}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Share on:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                
                <Button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600"
                  size="sm"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                
                <Button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                  LinkedIn
                </Button>
                
                <Button
                  onClick={() => handleShare('instagram')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="sm"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link & Text"}
              </Button>
            </div>

            <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
              <strong>Preview:</strong><br />
              {shareText}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}