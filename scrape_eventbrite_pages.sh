#!/bin/bash

# Eventbrite Multi-Page Scraper
# Scrapes classical concert data from Eventbrite pages 2-5 and combines results

set -e  # Exit on any error

# Configuration
BASE_URL="https://www.eventbrite.com/d/online/classical-concert/?page="
START_PAGE=2
END_PAGE=5
OUTPUT_FILE="combined_concerts.csv"
TEMP_DIR="temp_scrape_$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Eventbrite Multi-Page Concert Scraper${NC}"
echo "======================================"
echo "Scraping pages $START_PAGE to $END_PAGE"
echo "Output file: $OUTPUT_FILE"
echo ""

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Track successful scrapes
SUCCESSFUL_PAGES=()
FAILED_PAGES=()

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up temporary files...${NC}"
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Function to scrape a single page
scrape_page() {
    local page=$1
    local url="${BASE_URL}${page}"
    local temp_file="${TEMP_DIR}/page_${page}.csv"
    
    echo -e "${BLUE}Scraping page $page...${NC}"
    echo "URL: $url"
    
    # Run the scraper
    if python eventbrite_scraper.py "$url" > "${TEMP_DIR}/page_${page}_log.txt" 2>&1; then
        # Check if CSV was created
        if [ -f "scraped_concerts.csv" ]; then
            mv "scraped_concerts.csv" "$temp_file"
            echo -e "${GREEN}✓ Page $page scraped successfully${NC}"
            SUCCESSFUL_PAGES+=($page)
            
            # Show number of concerts found
            local count=$(tail -n +2 "$temp_file" | wc -l)
            echo "  Found $count concerts"
        else
            echo -e "${RED}✗ Page $page failed - no CSV output${NC}"
            FAILED_PAGES+=($page)
        fi
    else
        echo -e "${RED}✗ Page $page failed - scraper error${NC}"
        FAILED_PAGES+=($page)
        
        # Show error details
        if [ -f "${TEMP_DIR}/page_${page}_log.txt" ]; then
            echo "Error details:"
            tail -5 "${TEMP_DIR}/page_${page}_log.txt" | sed 's/^/  /'
        fi
    fi
    
    echo ""
    
    # Add small delay between requests to be respectful
    sleep 3
}

# Scrape all pages
for page in $(seq $START_PAGE $END_PAGE); do
    scrape_page $page
done

# Combine results
echo -e "${BLUE}Combining results...${NC}"

if [ ${#SUCCESSFUL_PAGES[@]} -eq 0 ]; then
    echo -e "${RED}No pages were successfully scraped. Cannot create combined file.${NC}"
    exit 1
fi

# Check if output file exists, if not create with header
if [ ! -f "$OUTPUT_FILE" ]; then
    FIRST_PAGE=${SUCCESSFUL_PAGES[0]}
    head -1 "${TEMP_DIR}/page_${FIRST_PAGE}.csv" > "$OUTPUT_FILE"
    echo "Created new output file: $OUTPUT_FILE"
else
    echo "Appending to existing file: $OUTPUT_FILE"
fi

# Combine all data (skip headers from all files)
TOTAL_CONCERTS=0
NEW_CONCERTS=0
for page in "${SUCCESSFUL_PAGES[@]}"; do
    temp_file="${TEMP_DIR}/page_${page}.csv"
    if [ -f "$temp_file" ]; then
        # Add data rows (skip header)
        tail -n +2 "$temp_file" >> "$OUTPUT_FILE"
        
        # Count concerts from this page
        local page_count=$(tail -n +2 "$temp_file" | wc -l)
        NEW_CONCERTS=$((NEW_CONCERTS + page_count))
        
        echo "Added $page_count concerts from page $page"
    fi
done

# Count total concerts in file
TOTAL_CONCERTS=$(($(wc -l < "$OUTPUT_FILE") - 1))

# Summary
echo ""
echo -e "${GREEN}Scraping Complete!${NC}"
echo "=================="
echo "Successfully scraped pages: ${SUCCESSFUL_PAGES[*]}"

if [ ${#FAILED_PAGES[@]} -gt 0 ]; then
    echo -e "${RED}Failed pages: ${FAILED_PAGES[*]}${NC}"
fi

echo "New concerts added: $NEW_CONCERTS"
echo "Total concerts in file: $TOTAL_CONCERTS"
echo "Combined output file: $OUTPUT_FILE"

# Show preview of results
if [ -f "$OUTPUT_FILE" ] && [ $TOTAL_CONCERTS -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Preview of results:${NC}"
    echo "==================="
    head -6 "$OUTPUT_FILE" | column -t -s ','
    
    if [ $TOTAL_CONCERTS -gt 5 ]; then
        echo "... and $((TOTAL_CONCERTS - 5)) more concerts"
    fi
fi

echo ""
echo -e "${GREEN}Done! Results saved to $OUTPUT_FILE${NC}"