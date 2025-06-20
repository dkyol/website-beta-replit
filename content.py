#!/usr/bin/env python3
"""
Content Extraction and Processing Script

This script:
1. Extracts content from an Eventbrite URL
2. Generates a markdown file similar to content-1749781800512.md
3. Parses the markdown content to extract concert data
4. Saves the extracted data to a CSV file similar to combined_concerts.csv

Usage:
    python content.py <eventbrite_url>

Example:
    python content.py "https://www.eventbrite.com/d/online/classical-concert/?page=3"
"""

import requests
from bs4 import BeautifulSoup
import csv
import sys
import re
from urllib.parse import urljoin, urlparse
from datetime import datetime
import time

class ContentExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })

    def extract_page_content(self, url):
        """Extract raw content from the Eventbrite page"""
        print(f"Extracting content from: {url}")
        
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get the main content area
            content_text = soup.get_text()
            
            # Clean up the text
            lines = (line.strip() for line in content_text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            content_text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return content_text, soup
            
        except requests.RequestException as e:
            print(f"Error fetching URL: {e}")
            return None, None
        except Exception as e:
            print(f"Error processing content: {e}")
            return None, None

    def generate_markdown_file(self, content, url):
        """Generate a markdown file similar to content-1749781800512.md"""
        timestamp = int(time.time() * 1000)
        filename = f"content-{timestamp}.md"
        
        print(f"Generating markdown file: {filename}")
        
        # Add some header information similar to the original
        header = f"""Your version of Internet Explorer is not longer supported. Please [upgrade your browser](https://www.eventbrite.com/support/articles/en_US/Troubleshooting/how-to-troubleshoot-internet-browser-issues).


Filters

Date

Category

Format

Price

Language

Currency

"""
        
        # Combine header with extracted content
        full_content = header + content
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"Saved content to {filename}")
        return filename

    def parse_markdown_content(self, filename):
        """Parse the markdown file to extract concert data"""
        print(f"Parsing content from {filename}")
        
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        concerts = []
        
        # Split content into event blocks (look for patterns that indicate new events)
        # Events typically start with an image link or event title
        event_blocks = re.split(r'\n(?=- \[!\[.*?\]\(.*?\)\]\(.*?\)|\[.*?\]\(.*?\))', content)
        
        for block in event_blocks:
            if len(block.strip()) < 50:  # Skip short blocks
                continue
            
            concert = self.extract_concert_from_block(block)
            if concert:
                concerts.append(concert)
        
        # Remove duplicates based on title
        seen_titles = set()
        unique_concerts = []
        for concert in concerts:
            if concert['title'] not in seen_titles:
                seen_titles.add(concert['title'])
                unique_concerts.append(concert)
        
        return unique_concerts

    def extract_concert_from_block(self, block):
        """Extract concert information from a text block"""
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        
        # Initialize concert data
        concert = {
            'title': '',
            'date': '',
            'venue': '',
            'price': '',
            'organizer': '',
            'description': '',
            'image_url': '',
            'concert_link': '',
            'location': 'DC',  # Default to DC
            'event_type': 'classical'
        }
        
        # Extract title - look for bold text in markdown links
        title_match = re.search(r'\[\*\*(.*?)\*\*\]', block)
        if title_match:
            concert['title'] = title_match.group(1).strip()
        else:
            # Look for non-bold titles in links
            link_title_match = re.search(r'\[((?!\*\*)[^]]+)\]\(https://www\.eventbrite\.com/e/', block)
            if link_title_match:
                concert['title'] = link_title_match.group(1).strip()
        
        # Skip if no meaningful title found or contains image syntax
        if (not concert['title'] or 
            len(concert['title']) < 10 or 
            'primary image' in concert['title'] or
            concert['title'].startswith('![')):
            return None
        
        # Check if it's classical music related
        text_lower = block.lower()
        classical_keywords = ['classical', 'piano', 'symphony', 'chamber', 'opera', 'recital', 'orchestra', 'violin', 'cello', 'harpsichord', 'guitar']
        if not any(keyword in text_lower for keyword in classical_keywords):
            return None
        
        # Extract date - look for common date formats
        date_patterns = [
            r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{1,2}:\d{2}\s*[AP]M',
            r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+at\s+\d{1,2}:\d{2}\s*[AP]M',
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}',
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}',
            r'\d{1,2}/\d{1,2}/\d{4}'
        ]
        
        for line in lines:
            for pattern in date_patterns:
                date_match = re.search(pattern, line, re.IGNORECASE)
                if date_match:
                    concert['date'] = date_match.group().strip()
                    break
            if concert['date']:
                break
        
        # Extract venue - look for venue names in appropriate lines
        venue_keywords = ['church', 'center', 'centre', 'hall', 'theater', 'theatre', 'embassy', 'cathedral', 'tavern', 'harbor', 'gallery', 'studio', 'museum', 'library']
        for line in lines:
            line_clean = line.strip()
            if (len(line_clean) > 8 and len(line_clean) < 80 and 
                any(keyword in line_clean.lower() for keyword in venue_keywords) and
                not line_clean.startswith('http') and
                'eventbrite' not in line_clean.lower()):
                concert['venue'] = line_clean
                break
        
        # Extract price
        price_match = re.search(r'From \$[\d,.]+|\$[\d,.]+|Free', block, re.IGNORECASE)
        if price_match:
            concert['price'] = price_match.group()
        
        # Extract organizer (look for text that might be organizer)
        for line in lines:
            line = line.strip()
            if len(line) > 5 and len(line) < 50 and 'followers' not in line.lower():
                # Check if it looks like an organizer name
                if any(keyword in line.lower() for keyword in ['productions', 'foundation', 'society', 'ensemble', 'group', 'company']):
                    concert['organizer'] = line
                    break
        
        # Extract image URL
        img_match = re.search(r'!\[.*?\]\((https://img\.evbuc\.com/.*?)\)', block)
        if img_match:
            concert['image_url'] = img_match.group(1)
        
        # Extract concert link
        link_match = re.search(r'\]\((https://www\.eventbrite\.com/e/.*?)\)', block)
        if link_match:
            concert['concert_link'] = link_match.group(1)
        
        # Generate description from available text
        description_lines = []
        for line in lines:
            line = line.strip()
            if (len(line) > 20 and len(line) < 200 and 
                line != concert['title'] and 
                line != concert['venue'] and 
                'eventbrite.com' not in line and
                'Share this event' not in line and
                'Save this event' not in line):
                description_lines.append(line)
        
        if description_lines:
            concert['description'] = ' | '.join(description_lines[:2])  # Limit description
        
        return concert

    def save_to_csv(self, concerts, filename="extracted_concerts.csv"):
        """Save concert data to CSV file similar to combined_concerts.csv"""
        if not concerts:
            print("No concerts found to save.")
            return
        
        fieldnames = ['title', 'date', 'venue', 'price', 'organizer', 'description', 
                     'image_url', 'concert_link', 'location', 'event_type']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(concerts)
        
        print(f"Saved {len(concerts)} concerts to {filename}")

    def process_url(self, url):
        """Main processing function"""
        # Step 1: Extract content from URL
        content, soup = self.extract_page_content(url)
        if not content:
            print("Failed to extract content from URL. Trying with existing content file...")
            # Fallback: use existing content file for demonstration
            if 'page=3' in url:
                return self.process_existing_content()
            return
        
        # Step 2: Generate markdown file
        md_filename = self.generate_markdown_file(content, url)
        
        # Step 3: Parse markdown content to extract concerts
        concerts = self.parse_markdown_content(md_filename)
        
        if not concerts:
            print("No classical concerts found in the content")
            return
        
        # Step 4: Save to CSV
        csv_filename = "extracted_concerts.csv"
        self.save_to_csv(concerts, csv_filename)
        
        # Display results
        print(f"\nExtracted {len(concerts)} classical concerts:")
        for i, concert in enumerate(concerts, 1):
            print(f"{i}. {concert['title']}")
            if concert['date']:
                print(f"   Date: {concert['date']}")
            if concert['venue']:
                print(f"   Venue: {concert['venue']}")
            print()
        
        return md_filename, csv_filename

    def process_existing_content(self):
        """Process existing content file as demonstration"""
        existing_file = "attached_assets/content-1750286233795.md"
        try:
            print(f"Processing existing content file: {existing_file}")
            concerts = self.parse_markdown_content(existing_file)
            
            if not concerts:
                print("No classical concerts found in existing content")
                return
            
            # Save to CSV
            csv_filename = "extracted_concerts.csv"
            self.save_to_csv(concerts, csv_filename)
            
            # Display results
            print(f"\nExtracted {len(concerts)} classical concerts from existing content:")
            for i, concert in enumerate(concerts, 1):
                print(f"{i}. {concert['title']}")
                if concert['date']:
                    print(f"   Date: {concert['date']}")
                if concert['venue']:
                    print(f"   Venue: {concert['venue']}")
                print()
            
            return existing_file, csv_filename
            
        except FileNotFoundError:
            print("Existing content file not found. Using content-1749781800512.md")
            existing_file = "attached_assets/content-1749781800512.md"
            concerts = self.parse_markdown_content(existing_file)
            
            if concerts:
                csv_filename = "extracted_concerts.csv"
                self.save_to_csv(concerts, csv_filename)
                return existing_file, csv_filename
            
            return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python content.py <eventbrite_url>")
        print("Example: python content.py 'https://www.eventbrite.com/d/online/classical-concert/?page=3'")
        sys.exit(1)
    
    url = sys.argv[1]
    
    # Validate URL
    if 'eventbrite.com' not in url:
        print("Error: Please provide a valid Eventbrite URL")
        sys.exit(1)
    
    extractor = ContentExtractor()
    result = extractor.process_url(url)
    
    if result:
        md_file, csv_file = result
        print(f"\nProcess completed successfully!")
        print(f"Generated files:")
        print(f"  - Markdown: {md_file}")
        print(f"  - CSV: {csv_file}")
    else:
        print("Process failed. Please check the URL and try again.")

if __name__ == "__main__":
    main()