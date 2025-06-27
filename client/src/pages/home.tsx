import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedConcert } from "@/components/featured-concert";
import { Rankings } from "@/components/rankings";
import { UserBadges } from "@/components/user-badges";
import { ConcertSearch } from "@/components/concert-search";
import { ConcertGallery } from "@/components/concert-gallery";
import { useTimer } from "@/hooks/use-timer";
import { useSession } from "@/hooks/use-session";
import { filterFutureConcerts } from "@/lib/dateUtils";
import type { Concert } from "@shared/schema";
import bannerImage from "@assets/Screenshot 2025-06-12 232843_1749785388266.png";
import sightTuneLogo from "@assets/logoRemod_1750993466008.png";

export default function Home() {
  const [currentConcertIndex, setCurrentConcertIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionId = useSession();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: allConcerts, isLoading } = useQuery<Concert[]>({
    queryKey: ["/api/concerts"],
  });



  // Use only current and future concerts for featured rotation
  const concerts = useMemo(() => {
    if (!allConcerts) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    return allConcerts.filter(concert => {
      const concertDate = new Date(concert.date);
      return concertDate >= today;
    });
  }, [allConcerts]);

  const nextConcert = () => {
    if (concerts && concerts.length > 0) {
      setCurrentConcertIndex((prev) => (prev + 1) % concerts.length);
      // Reset vote state for new concert
      setUserVotes(new Set());
      resetTimer(); // Reset the timer when advancing
    }
  };



  const { timeLeft, reset: resetTimer } = useTimer(7, nextConcert);

  // Initialize with random concert on first load
  useEffect(() => {
    if (concerts.length > 0 && !isInitialized) {
      const randomIndex = Math.floor(Math.random() * concerts.length);
      setCurrentConcertIndex(randomIndex);
      setIsInitialized(true);
    }
  }, [concerts.length, isInitialized]);

  // Only reset index if it's out of bounds
  useEffect(() => {
    if (concerts.length > 0 && currentConcertIndex >= concerts.length) {
      setCurrentConcertIndex(0);
    }
  }, [concerts.length, currentConcertIndex]);

  if (isLoading || !concerts || concerts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header
          className="relative bg-cover bg-center bg-no-repeat shadow-sm border-b border-slate-200"
          style={{
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Enjoy Classical Music!
              </h1>
              <p className="text-white font-medium">
                Discover amazing classical performances
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Structured Data for Current Concert */}
      {currentConcert && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicEvent",
              name: currentConcert.title,
              description: currentConcert.description,
              startDate: currentConcert.date,
              location: {
                "@type": "Place",
                name: currentConcert.venue,
                address: currentConcert.venue,
              },
              performer: {
                "@type": "Person",
                name: currentConcert.organizer,
              },
              offers: {
                "@type": "Offer",
                price: currentConcert.price,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode:
                "https://schema.org/OfflineEventAttendanceMode",
              genre: "Classical Music",
              image: currentConcert.imageUrl,
            }),
          }}
        />
      )}

      <header
        className="relative bg-cover bg-center bg-no-repeat shadow-sm border-b border-slate-200"
        role="banner"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Enjoy Classical Music!
            </h1>
            <p className="text-white font-medium text-lg">
              Discover upcoming classical performances and connect with fellow music lovers
            </p>
            <div className="mt-4 text-white/80 text-sm">
              <span>Piano Concerts</span> • <span>Chamber Music</span> •{" "}
              <span>Orchestral Performances</span> • <span>Recitals</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8" role="main">
        {/* SEO-optimized content sections */}
        <section aria-labelledby="featured-concert" className="mb-8">
          <h2 id="featured-concert" className="sr-only">
            Featured Classical Concert
          </h2>
          <FeaturedConcert
            concert={currentConcert}
            timeLeft={timeLeft}
          />
        </section>

        {/* Concert Search Section */}
        <section
          aria-labelledby="concert-search"
          className="mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-sm border border-slate-300 p-8"
        >
          <h2 id="concert-search" className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Discover a New Artist
          </h2>
          <ConcertSearch concerts={allConcerts || []} />
        </section>

        {/* Concert Gallery Section */}
        <section
          aria-labelledby="concert-gallery"
          className="mb-8 bg-white rounded-lg shadow-sm border border-slate-200 p-8"
        >
          <h2 id="concert-gallery" className="sr-only">
            Upcoming Concert Gallery
          </h2>
          <ConcertGallery concerts={allConcerts || []} />
        </section>



        {/* SEO Content Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Discover Classical Music Concerts and Piano Recitals
            </h2>
            <p className="text-slate-600 mb-4">
              Find the most anticipated classical music performances, piano
              recitals, and chamber music concerts. Our community-driven
              platform helps you discover talented artists and upcoming events
              in your area.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Piano Concerts & Recitals
                </h3>
                <p className="text-slate-600">
                  Experience world-class piano performances featuring classical
                  masterpieces, contemporary compositions, and emerging artists.
                  Vote for your favorite pianists and help others discover
                  exceptional talent.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Chamber Music Events
                </h3>
                <p className="text-slate-600">
                  Intimate chamber music performances showcasing string
                  quartets, violin sonatas, cello recitals, and ensemble pieces.
                  Connect with fellow classical music enthusiasts and share your
                  recommendations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Orchestra Concerts
                </h3>
                <p className="text-slate-600">
                  Full orchestral performances featuring symphonies, concertos,
                  and classical repertoire. Stay updated on concert schedules
                  and find the best seats for upcoming performances.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Community Engagement
                </h3>
                <p className="text-slate-600">
                  Join our community of classical music lovers. Discover upcoming
                  concerts, share your favorites, and connect with others who
                  appreciate exceptional musical experiences.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced SEO Footer */}
      <footer
        className="bg-white text-slate-800 py-16 mt-12"
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Classical Concerts</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a 
                    href="https://www.youtube.com/playlist?list=PLBjoEdEVMABLKzpMqti_pyCt2dS5kYiqD" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Piano Recitals
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/watch?v=JTc1mDieQI8" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Chamber Music
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/watch?v=rOjHhS5MtvA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Orchestra Concerts
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/watch?v=6HV_4QrJbOs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Violin Performances
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/watch?v=1prweT95Mo0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Cello Recitals
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Concert Venues</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Concert_hall" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Concert Halls
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Music_school" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Music Conservatories
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/University_performance_hall" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    University Venues
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Community_centre" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Community Centers
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Outdoor_concert" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Outdoor Venues
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Music Genres</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Baroque_music" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Baroque Music
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Romantic_music" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Romantic Period
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Contemporary_classical_music" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Contemporary Classical
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Contemporary_classical_music" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Modern Compositions
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Third_stream" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Jazz Classical Fusion
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a 
                    href="https://www.classicalsource.com/concert-reviews/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Concert Reviews
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.classicalmusicartists.com/cma/artists.aspx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Artist Profiles
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.allclassical.org/events/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Concert Calendar
                  </a>
                </li>
                <li>
                  <a 
                    href="https://en.wikipedia.org/wiki/Music_education" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-800 hover:underline"
                  >
                    Music Education
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:info@sighttune.com?subject=Subscribe to Updates&body=Hi, I would like to subscribe to SightTune updates and notifications about new classical music concerts." 
                    className="hover:text-slate-800 hover:underline"
                  >
                    Subscribe to Updates
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-10 space-y-8">
            <div className="text-center text-base text-slate-600 leading-relaxed max-w-5xl mx-auto px-8 py-4 bg-slate-100 rounded-lg">
              <p>
                Find classical music concerts, piano recitals, chamber music,
                and orchestral performances. Join our community of music
                enthusiasts and discover your next favorite artist.
              </p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center space-x-5">
                <span className="text-base text-slate-600">Powered by</span>
                <img
                  src={sightTuneLogo}
                  alt="SightTune - Classical Music Discovery Platform"
                  className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
                <a 
                  href="https://www.sighttune.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-2xl text-slate-800 hover:text-blue-600 transition-colors"
                >
                  SightTune
                </a>
              </div>

              <div className="text-base text-slate-600">
                <p>
                  &copy; 2024 SightTune. Connecting classical music lovers
                  worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
