/**
 * Date parsing and filtering utilities for concert dates
 */

export function parseConcertDate(dateString: string): Date {
  try {
    const trimmed = dateString.trim();
    const currentYear = new Date().getFullYear();
    
    // Handle formats like "Sat, Jun 28, 8:00 PM"
    const dateWithDayPattern = /^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}, \d{1,2}:\d{2} [AP]M$/;
    if (dateWithDayPattern.test(trimmed)) {
      try {
        const dateWithYear = `${currentYear} ${trimmed}`;
        const parsed = new Date(dateWithYear);
        if (!isNaN(parsed.getTime())) {
          // If the parsed date is in the past, try next year
          if (parsed < new Date()) {
            const nextYearDate = `${currentYear + 1} ${trimmed}`;
            const nextYearParsed = new Date(nextYearDate);
            if (!isNaN(nextYearParsed.getTime())) {
              return nextYearParsed;
            }
          }
          return parsed;
        }
      } catch {
        // Fall through to default handling
      }
    }
    
    // Handle formats like "Sunday at 7:00 PM" - assume next occurrence
    const dayAtTimePattern = /^[A-Za-z]+ at \d{1,2}:\d{2} [AP]M$/;
    if (dayAtTimePattern.test(trimmed)) {
      // For relative dates, assume they're in the future
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    // Default: try to parse as-is, or assume future
    const directParse = new Date(trimmed);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }
    
    // If all parsing fails, assume it's a future concert
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return futureDate;
    
  } catch {
    // If parsing completely fails, assume it's future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return futureDate;
  }
}

export function isFutureConcert(dateString: string): boolean {
  try {
    const concertDate = parseConcertDate(dateString);
    return concertDate > new Date();
  } catch {
    // If we can't parse the date, assume it's future to be safe
    return true;
  }
}

export function filterFutureConcerts<T extends { date: string }>(concerts: T[]): T[] {
  return concerts.filter(concert => isFutureConcert(concert.date));
}