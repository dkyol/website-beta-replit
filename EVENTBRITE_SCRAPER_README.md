# Eventbrite Concert Scraper

A comprehensive Python scraper that extracts classical and jazz concert data from Eventbrite URLs and formats it according to the SightTune database schema.

## Features

- **Multi-format Support**: Handles various Eventbrite URL structures and page layouts
- **Intelligent Data Extraction**: Uses multiple parsing strategies including HTML scraping and JSON-LD structured data
- **Robust Error Handling**: Gracefully handles blocked requests and parsing failures
- **Database Integration**: Can upload extracted data directly to PostgreSQL database
- **CSV Export**: Always creates a CSV backup of scraped data
- **Event Type Detection**: Automatically categorizes events as 'classical' or 'jazz'

## Required Fields Extracted

The scraper extracts all fields required by the SightTune schema:

- **title**: Event name
- **date**: Performance date and time
- **venue**: Performance location
- **price**: Ticket pricing information
- **organizer**: Event organizer/presenter
- **description**: Event description
- **image_url**: Event poster/image URL
- **concert_link**: Direct link to event page
- **location**: City/region (DC, Online, etc.)
- **event_type**: 'classical' or 'jazz'

## Usage

### Basic Scraping (CSV output only)
```bash
python eventbrite_scraper.py "https://www.eventbrite.com/d/online/classical-concert/?page=2"
```

### Scraping with Database Upload
```bash
python eventbrite_scraper.py "https://www.eventbrite.com/d/online/classical-concert/?page=2" --upload-db
```

## How It Works

1. **Request Handling**: Uses realistic browser headers to avoid detection
2. **HTML Parsing**: Searches for event cards using multiple CSS selectors
3. **JSON-LD Extraction**: Looks for structured data in script tags
4. **Data Standardization**: Formats extracted data to match database schema
5. **Duplicate Prevention**: Skips events already in database when uploading
6. **Fallback Data**: Creates sample data when site blocks requests (for testing)

## Output Files

- **scraped_concerts.csv**: Always created with extracted concert data
- **Console Output**: Detailed extraction log and first concert preview

## Error Handling

The scraper handles common issues:

- **Blocked Requests**: Creates sample data structure for testing
- **Missing Data**: Uses sensible defaults for optional fields
- **Database Errors**: Falls back to CSV-only output
- **Network Issues**: Retries with delays to avoid rate limiting

## Integration with SightTune

The scraper is designed to work seamlessly with the existing SightTune infrastructure:

- **Compatible Schema**: Matches the concerts table structure exactly
- **Event Type Classification**: Uses keyword analysis for classical/jazz categorization
- **DC Area Focus**: Prioritizes Washington DC area venue detection
- **Date Formatting**: Standardizes various date formats for consistency

## Advanced Features

- **Smart Venue Detection**: Distinguishes between physical venues and online events
- **Price Standardization**: Formats various pricing displays consistently
- **Location Intelligence**: Maps venue addresses to city codes
- **Organizer Extraction**: Identifies event organizers from multiple page sections
- **Image URL Processing**: Converts relative URLs to absolute paths

## Dependencies

- requests: HTTP requests with session management
- beautifulsoup4: HTML parsing and element extraction
- lxml: Fast XML/HTML parsing backend
- psycopg2-binary: PostgreSQL database connectivity (for upload feature)

## Sample Output

```csv
title,date,venue,price,organizer,description,image_url,concert_link,location,event_type
Classical Piano Recital: Chopin & Liszt,"Sat, Jan 25, 7:30 PM",Kennedy Center Concert Hall,From $35.00,Washington Classical Society,An evening of romantic piano masterpieces...,https://example.com/piano-recital.jpg,https://www.eventbrite.com/...,DC,classical
```

## Notes

- Eventbrite may block automated requests; the scraper handles this gracefully
- Sample data is provided when real scraping fails to demonstrate the expected format
- All extracted data follows the exact schema required by the SightTune database
- The scraper can be easily extended to handle additional Eventbrite page formats