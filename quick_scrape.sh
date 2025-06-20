#!/bin/bash

# Quick Eventbrite Multi-Page Scraper (for testing)
# Scrapes classical concert data from Eventbrite pages 2-5 with minimal delays

set -e

BASE_URL="https://www.eventbrite.com/d/online/classical-concert/?page="
START_PAGE=2
END_PAGE=5
OUTPUT_FILE="combined_concerts.csv"

echo "Quick Eventbrite Scraper - Pages $START_PAGE to $END_PAGE"
echo "========================================================="

# Initialize output file with header if it doesn't exist
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "title,date,venue,price,organizer,description,image_url,concert_link,location,event_type" > "$OUTPUT_FILE"
    echo "Created new output file: $OUTPUT_FILE"
else
    echo "Appending to existing file: $OUTPUT_FILE"
fi

NEW_CONCERTS=0
SUCCESSFUL_PAGES=0

for page in $(seq $START_PAGE $END_PAGE); do
    url="${BASE_URL}${page}"
    echo "Scraping page $page: $url"
    
    # Run scraper and capture output
    if python eventbrite_scraper.py "$url" >/dev/null 2>&1; then
        if [ -f "scraped_concerts.csv" ]; then
            # Count concerts and add to combined file (skip header)
            count=$(tail -n +2 "scraped_concerts.csv" | wc -l)
            tail -n +2 "scraped_concerts.csv" >> "$OUTPUT_FILE"
            
            echo "✓ Page $page: $count concerts added"
            NEW_CONCERTS=$((NEW_CONCERTS + count))
            SUCCESSFUL_PAGES=$((SUCCESSFUL_PAGES + 1))
            
            # Clean up individual file
            rm "scraped_concerts.csv"
        else
            echo "✗ Page $page: No output file"
        fi
    else
        echo "✗ Page $page: Scraper failed"
    fi
    
    # Minimal delay
    sleep 1
done

# Get total concerts in file
TOTAL_CONCERTS=$(($(wc -l < "$OUTPUT_FILE") - 1))

echo ""
echo "Results:"
echo "- Successfully scraped: $SUCCESSFUL_PAGES/$((END_PAGE - START_PAGE + 1)) pages"
echo "- New concerts added: $NEW_CONCERTS"
echo "- Total concerts in file: $TOTAL_CONCERTS"
echo "- Output file: $OUTPUT_FILE"

if [ $TOTAL_CONCERTS -gt 0 ]; then
    echo ""
    echo "Sample entries:"
    head -4 "$OUTPUT_FILE"
fi