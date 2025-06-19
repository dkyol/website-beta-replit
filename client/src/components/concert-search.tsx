import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Concert } from "@shared/schema";

interface ConcertSearchProps {
  concerts: Concert[];
}

export function ConcertSearch({ concerts }: ConcertSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([-365, 365]); // Days from today (include past events too)
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Calculate date boundaries
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 365);

  const filteredConcerts = useMemo(() => {
    if (!concerts.length) return [];

    let filtered = concerts.filter((concert) => {
      // Keyword search - match title, venue, or location
      const query = submittedQuery.toLowerCase();
      const matchesKeyword = !query || 
        concert.title.toLowerCase().includes(query) ||
        concert.venue.toLowerCase().includes(query) ||
        (concert.location && concert.location.toLowerCase().includes(query));

      // Date filter - parse various date formats
      let matchesDate = true; // Default to true if date parsing fails
      try {
        const concertDate = new Date(concert.date);
        if (!isNaN(concertDate.getTime())) {
          const daysDiff = Math.ceil((concertDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          matchesDate = daysDiff >= dateRange[0] && daysDiff <= dateRange[1];
        }
      } catch (error) {
        // If date parsing fails, include the concert
        matchesDate = true;
      }

      return matchesKeyword && matchesDate;
    });

    // Sort by date (soonest first)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Return top 3 results
    return filtered.slice(0, 3);
  }, [concerts, submittedQuery, dateRange]);

  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <label htmlFor="concert-search" className="text-sm font-medium text-slate-700">
          Search by title, venue, or location
        </label>
        <div className="flex gap-2">
          <Input
            id="concert-search"
            type="text"
            placeholder="Enter keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white border-slate-300 focus:border-slate-500 flex-1"
          />
          <button
            onClick={handleSearchSubmit}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Date Range Slider */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-700">
          Date Range: {dateRange[0]} to {dateRange[1]} days from today
        </label>
        <Slider
          value={dateRange}
          onValueChange={setDateRange}
          max={365}
          min={-365}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>1 Year Ago</span>
          <span>Today</span>
          <span>1 Year Future</span>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Top 3 Results ({filteredConcerts.length} found)
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
          <div className="grid gap-4">
            {filteredConcerts.map((concert, index) => (
              <Card key={concert.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-800 leading-tight">
                      {concert.title}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {formatDate(concert.date)}
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {concert.venue}
                      {concert.location && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {concert.location}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="w-4 h-4 mr-2 text-slate-400" />
                      {concert.organizer}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium text-slate-800">
                        {concert.price}
                      </span>
                      {concert.concertLink && (
                        <a
                          href={concert.concertLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
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
        )}
      </div>
    </div>
  );
}