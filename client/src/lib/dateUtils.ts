/**
 * Date parsing and filtering utilities for concert dates
 */

export function parseConcertDate(dateString: string): Date {
  try {
    const trimmed = dateString.trim();
    
    // Handle standardized format "Day, Month DD, YYYY at H:MM PM"
    const standardPattern = /^([A-Za-z]+), ([A-Za-z]+) (\d{1,2}), (\d{4}) at (\d{1,2}):(\d{2}) ([AP]M)$/;
    const match = trimmed.match(standardPattern);
    
    if (match) {
      const [, , monthName, day, year, hour, minute, period] = match;
      
      // Convert month name to number
      const monthMap: { [key: string]: number } = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      
      const monthNum = monthMap[monthName];
      if (monthNum !== undefined) {
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        const date = new Date(parseInt(year), monthNum, parseInt(day), hour24, parseInt(minute));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Fallback: try direct parsing
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