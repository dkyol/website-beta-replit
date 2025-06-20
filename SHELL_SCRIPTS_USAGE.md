# Shell Scripts for Multi-Page Eventbrite Scraping

This document describes the updated shell scripts that properly append data instead of overwriting existing CSV files.

## Scripts Available

### 1. `scrape_eventbrite_pages.sh` (Full-Featured)
Complete script with error handling, colored output, and detailed logging.

**Features:**
- Checks if output file exists before creating header
- Appends new data to existing files
- Comprehensive error reporting
- Colored terminal output
- Detailed progress tracking
- Temporary file management with cleanup

**Usage:**
```bash
./scrape_eventbrite_pages.sh
```

### 2. `quick_scrape.sh` (Streamlined)
Fast execution with minimal output for automation and testing.

**Features:**
- Quick execution with 1-second delays
- Simple progress reporting
- Automatic append detection
- Minimal resource usage

**Usage:**
```bash
./quick_scrape.sh
```

## Key Improvements

### Append Logic
Both scripts now implement proper append functionality:

1. **File Check**: Scripts check if `combined_concerts.csv` exists
2. **Header Management**: Only adds CSV header if creating new file
3. **Data Appending**: Always appends concert data, never overwrites
4. **Count Tracking**: Distinguishes between new concerts added vs total in file

### Output Reporting
Scripts now provide clear feedback:
- "Created new output file" - for first run
- "Appending to existing file" - for subsequent runs
- "New concerts added: X" - concerts from current run
- "Total concerts in file: Y" - cumulative total

## Configuration

Default settings (can be modified in script files):
```bash
BASE_URL="https://www.eventbrite.com/d/online/classical-concert/?page="
START_PAGE=2
END_PAGE=5
OUTPUT_FILE="combined_concerts.csv"
```

## Example Output

### First Run
```
Quick Eventbrite Scraper - Pages 2 to 5
=========================================================
Created new output file: combined_concerts.csv
✓ Page 2: 3 concerts added
✓ Page 3: 3 concerts added
✓ Page 4: 3 concerts added
✓ Page 5: 3 concerts added

Results:
- Successfully scraped: 4/4 pages
- New concerts added: 12
- Total concerts in file: 12
```

### Subsequent Runs
```
Quick Eventbrite Scraper - Pages 2 to 5
=========================================================
Appending to existing file: combined_concerts.csv
✓ Page 2: 3 concerts added
✓ Page 3: 3 concerts added
✓ Page 4: 3 concerts added
✓ Page 5: 3 concerts added

Results:
- Successfully scraped: 4/4 pages
- New concerts added: 12
- Total concerts in file: 24
```

## File Structure

The output CSV maintains proper structure:
- Single header row (never duplicated)
- Properly formatted concert data
- All required fields per sample_concerts.csv format
- Chronological append order

## Error Handling

Scripts handle common scenarios:
- Network timeouts
- Missing scraper output files
- File permission issues
- Partial scraping failures

Failed pages are reported separately from successful ones, ensuring transparency in data collection results.

## Integration with Database Upload

The combined CSV file can be uploaded to the database using:
```bash
python dataUpload.py combined_concerts.csv
```

This allows for batch processing of multiple pages worth of concert data in a single database operation.