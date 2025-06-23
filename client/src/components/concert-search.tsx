import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { SocialShare } from "@/components/social-share";
import { formatConcertDate } from "@shared/dateUtils";
import type { Concert } from "@shared/schema";

interface ConcertSearchProps {
  concerts: Concert[];
}

export function ConcertSearch({ concerts }: ConcertSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([0, 365]); // Days from today into the future
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const RESULTS_PER_PAGE = 3;

  const filteredConcerts = useMemo(() => {
    if (!concerts.length) return [];

    let filtered = concerts.filter((concert) => {
      // Date range filter
      const concertDate = new Date(concert.date);
      const today = new Date();
      const daysDiff = Math.floor((concertDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const matchesDate = daysDiff >= dateRange[0] && daysDiff <= dateRange[1];

      // Keyword search - match title, venue, or location
      const query = submittedQuery.toLowerCase();
      const matchesKeyword = !query || 
        concert.title.toLowerCase().includes(query) ||
        concert.venue.toLowerCase().includes(query) ||
        (concert.location && concert.location.toLowerCase().includes(query));

      return matchesKeyword && matchesDate;
    });

    // Sort by date (soonest first)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filtered;
  }, [concerts, submittedQuery, dateRange]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredConcerts.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentPageConcerts = filteredConcerts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleShareClick = (concert: Concert) => {
    setSelectedConcert(concert);
    setShareDialogOpen(true);
  };

  const handleCloseShare = () => {
    setShareDialogOpen(false);
    setSelectedConcert(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Search by title, venue, or location (e.g., 'DC', 'piano', 'Kennedy Center')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearchSubmit} className="px-6 hover:scale-105 transition-transform duration-200">
            Search
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Date Range: {dateRange[0]} to {dateRange[1]} days from today
          </label>
          <Slider
            value={dateRange}
            onValueChange={setDateRange}
            max={365}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Today</span>
            <span>365 Days</span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Results
          </h3>
          {submittedQuery && (
            <div className="text-sm text-slate-600">
              Searching for: <span className="font-medium">"{submittedQuery}"</span>
              <button 
                onClick={() => setSubmittedQuery("")}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        
        {submittedQuery && filteredConcerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No concerts match your search criteria.</p>
            <p className="text-sm mt-1">Try adjusting your keywords or date range.</p>
            <div className="mt-4 text-xs text-slate-400">
              Debug: Searching for "{submittedQuery}" in {concerts.length} concerts
            </div>
          </div>
        ) : !submittedQuery ? (
          <div className="text-center py-8 text-slate-500">
            <p>Enter a search term and press Enter or click Search to find concerts.</p>
            <p className="text-sm mt-1">Search by title, venue, or location (like "DC").</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredConcerts.length)} of {filteredConcerts.length} concert{filteredConcerts.length !== 1 ? 's' : ''}
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
            
            <div className="grid gap-4">
              {currentPageConcerts.map((concert, index) => (
                <Card key={concert.id} className="bg-white border-slate-200 hover:shadow-lg hover:scale-[1.01] hover:border-slate-300 transition-all duration-300 ease-out cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors duration-200">
                        {concert.title}
                      </CardTitle>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        #{startIndex + index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatConcertDate(concert.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{concert.venue}</span>
                          {concert.location && (
                            <span className="text-slate-500">• {concert.location}</span>
                          )}
                        </div>
                        {concert.price && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Price:</span> {concert.price}
                          </div>
                        )}
                        {concert.organizer && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Organizer:</span> {concert.organizer}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => handleShareClick(concert)}
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 h-7 hover:scale-105 transition-transform duration-200"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                        {concert.concertLink && (
                          <a
                            href={concert.concertLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:scale-105 transition-all duration-200 hover:underline"
                          >
                            Buy Tickets →
                          </a>
                        )}
                      </div>

                      {concert.description && (
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                          {concert.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 hover:scale-105 transition-transform duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10 hover:scale-110 transition-transform duration-200"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 hover:scale-105 transition-transform duration-200"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Social Share Dialog */}
      {selectedConcert && (
        <SocialShare 
          concert={selectedConcert}
          isOpen={shareDialogOpen}
          onClose={handleCloseShare}
        />
      )}
    </div>
  );
}