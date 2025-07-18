import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Share2, Facebook, Twitter, Instagram, Copy, Check, Download, Loader2 } from "lucide-react";
import sightTuneLogo from "@assets/logoRemod_1750993466008.png";
import type { Concert } from "@shared/schema";

interface SocialShareProps {
  concert: Concert;
  isOpen: boolean;
  onClose: () => void;
}

export function SocialShare({ concert, isOpen, onClose }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingInstagram, setIsGeneratingInstagram] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const shareText = `🎼 Don't miss "${concert.title}" at ${concert.venue} on ${concert.date}! 🎹 
  
Join the classical music community and discover amazing concerts at SightTune.`;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/concert/${concert.id}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);
  const concertTitle = encodeURIComponent(concert.title);
  const concertSummary = encodeURIComponent(`${concert.title} at ${concert.venue} on ${concert.date}`);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct text sharing
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${concertTitle}&summary=${concertSummary}`
  };

  const handleInstagramShare = async () => {
    if (isGeneratingInstagram) return;
    
    setIsGeneratingInstagram(true);
    
    try {
      const response = await fetch('/api/generate-instagram-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concertId: concert.id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Detect if user is on iOS/iPhone
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
          // For iOS devices, open image in new tab for manual save
          window.open(data.url, '_blank');
          toast({
            title: "Instagram Post Ready!",
            description: "Image opened in new tab. Press and hold to save to Photos, then share on Instagram!",
          });
        } else {
          // For other devices, use download link
          const link = document.createElement('a');
          link.href = data.url;
          link.download = `${concert.title.substring(0, 30)}_instagram_post.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Instagram Post Ready!",
            description: "Your custom concert image has been downloaded. Share it on Instagram!",
          });
        }
      } else {
        throw new Error(data.error || 'Failed to generate Instagram post');
      }
    } catch (error: any) {
      console.error('Instagram generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create Instagram post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInstagram(false);
    }
  };

  const handleShare = (platform: string) => {
    if (platform === 'instagram') {
      handleInstagramShare();
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
                {concert.venue} • {new Date(concert.date).toLocaleDateString()}<br />
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
                  disabled={isGeneratingInstagram}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                  size="sm"
                >
                  {isGeneratingInstagram ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Instagram className="w-4 h-4" />
                  )}
                  {isGeneratingInstagram ? "Creating..." : "Instagram"}
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