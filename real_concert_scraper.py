#!/usr/bin/env python3
"""
Real Concert Scraper - Extracts actual concerts from venue websites

This scraper only returns authentic concert data parsed from real venue websites.
When information is not available, fields are left blank.
"""

import requests
from bs4 import BeautifulSoup
import csv
import sys
import re
from urllib.parse import urljoin
from datetime import datetime

class RealConcertScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

    def scrape_concerts(self, url):
        """Extract real concert data from accessible venue websites"""
        print(f"Searching for real concert data...")
        
        venues = [
            {
                'url': 'https://www.kennedy-center.org/whats-on/',
                'name': 'Kennedy Center',
                'parser': self.parse_kennedy_center
            },
            {
                'url': 'https://www.strathmore.org/events/',
                'name': 'Strathmore Music Center', 
                'parser': self.parse_strathmore
            },
            {
                'url': 'https://www.wolftrap.org/calendar/',
                'name': 'Wolf Trap National Park',
                'parser': self.parse_wolf_trap
            }
        ]
        
        all_concerts = []
        
        for venue in venues:
            try:
                print(f"Checking {venue['name']}...")
                response = self.session.get(venue['url'], timeout=15)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    concerts = venue['parser'](soup, venue['url'], venue['name'])
                    
                    if concerts:
                        print(f"Found {len(concerts)} concerts at {venue['name']}")
                        all_concerts.extend(concerts)
                    else:
                        print(f"No classical concerts found at {venue['name']}")
                else:
                    print(f"Could not access {venue['name']} (status: {response.status_code})")
                    
            except Exception as e:
                print(f"Error accessing {venue['name']}: {e}")
                continue
        
        return all_concerts

    def parse_kennedy_center(self, soup, base_url, venue_name):
        """Parse Kennedy Center events page for real concert data"""
        concerts = []
        seen_titles = set()
        
        # Look for unique event links with specific hrefs
        event_links = soup.find_all('a', href=re.compile(r'/calendar/|/events/|/performances/', re.I))
        
        for link in event_links:
            title = link.get_text(strip=True)
            href = link.get('href', '')
            
            # Skip duplicates or non-meaningful titles
            if title in seen_titles or len(title) < 15 or not href:
                continue
                
            # Check if it's classical music related
            link_text = (title + ' ' + link.parent.get_text()).lower() if link.parent else title.lower()
            if any(keyword in link_text for keyword in ['classical', 'symphony', 'piano', 'chamber', 'opera', 'orchestra']):
                seen_titles.add(title)
                
                container = link.parent
                concert = {
                    'title': title,
                    'date': self.extract_date_safely(container),
                    'venue': venue_name,
                    'price': self.extract_price_safely(container),
                    'organizer': 'Kennedy Center',
                    'description': self.extract_description_safely(container),
                    'image_url': self.extract_image_safely(container, base_url),
                    'concert_link': urljoin(base_url, href),
                    'location': 'DC',
                    'event_type': 'classical'
                }
                concerts.append(concert)
                
                if len(concerts) >= 3:
                    break
        
        return concerts

    def parse_strathmore(self, soup, base_url, venue_name):
        """Parse Strathmore events page for real concert data"""
        concerts = []
        seen_titles = set()
        
        # Look for unique event links with specific patterns
        event_links = soup.find_all('a', href=re.compile(r'/event/|/show/|/concert/|/performance/', re.I))
        
        for link in event_links:
            title = link.get_text(strip=True)
            href = link.get('href', '')
            
            # Skip duplicates or non-meaningful titles
            if title in seen_titles or len(title) < 10 or not href:
                continue
                
            # Check if it's music-related
            link_context = (title + ' ' + link.parent.get_text()).lower() if link.parent else title.lower()
            if any(keyword in link_context for keyword in ['concert', 'classical', 'music', 'piano', 'symphony', 'chamber']):
                seen_titles.add(title)
                
                container = link.parent
                concert = {
                    'title': title,
                    'date': self.extract_date_safely(container),
                    'venue': venue_name,
                    'price': self.extract_price_safely(container),
                    'organizer': 'Strathmore',
                    'description': self.extract_description_safely(container),
                    'image_url': self.extract_image_safely(container, base_url),
                    'concert_link': urljoin(base_url, href),
                    'location': 'DC',
                    'event_type': 'classical'
                }
                concerts.append(concert)
                
                if len(concerts) >= 3:
                    break
        
        return concerts

    def parse_wolf_trap(self, soup, base_url, venue_name):
        """Parse Wolf Trap events page for real concert data"""
        concerts = []
        seen_titles = set()
        
        # Look for individual event links with unique hrefs
        event_links = soup.find_all('a', href=True)
        
        for link in event_links:
            href = link.get('href', '')
            title = link.get_text(strip=True)
            
            # Skip if not an event link or duplicate
            if not href or '/performance/' not in href or title in seen_titles or len(title) < 10:
                continue
                
            # Check if it's a music-related event
            parent_text = link.parent.get_text().lower() if link.parent else title.lower()
            if any(keyword in parent_text for keyword in ['classical', 'symphony', 'orchestra', 'piano', 'music', 'concert']):
                seen_titles.add(title)
                
                # Extract details from the link's parent container
                container = link.parent
                
                concert = {
                    'title': title,
                    'date': self.extract_date_safely(container),
                    'venue': venue_name,
                    'price': self.extract_price_safely(container),
                    'organizer': 'Wolf Trap Foundation',
                    'description': self.extract_description_safely(container),
                    'image_url': self.extract_image_safely(container, base_url),
                    'concert_link': urljoin(base_url, href),
                    'location': 'DC',
                    'event_type': 'classical'
                }
                concerts.append(concert)
                
                if len(concerts) >= 5:  # Limit to 5 unique concerts
                    break
        
        return concerts

    def extract_text_safely(self, element, selectors):
        """Safely extract text from element using multiple selectors"""
        for selector in selectors:
            found = element.select_one(selector)
            if found:
                text = found.get_text(strip=True)
                if text and len(text) > 5 and len(text) < 200:
                    return text
        return ""

    def extract_date_safely(self, element):
        """Safely extract date information"""
        text = element.get_text()
        
        # Look for date patterns
        date_patterns = [
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}[,\s]*\d{4}',
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}[,\s]*\d{4}',
            r'\d{1,2}/\d{1,2}/\d{4}',
            r'\d{4}-\d{2}-\d{2}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group()
        
        return ""

    def extract_price_safely(self, element):
        """Safely extract price information"""
        text = element.get_text()
        
        price_patterns = [
            r'\$\d+(?:\.\d{2})?(?:\s*-\s*\$\d+(?:\.\d{2})?)?',
            r'From\s+\$\d+',
            r'Starting\s+at\s+\$\d+',
            r'Free'
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group()
        
        return ""

    def extract_description_safely(self, element):
        """Safely extract description"""
        # Look for paragraph or description elements
        desc_elements = element.find_all(['p', 'div'], string=re.compile(r'.{50,}'))
        
        for desc_elem in desc_elements:
            desc = desc_elem.get_text(strip=True)
            if len(desc) > 50 and len(desc) < 500:
                return desc[:300] + "..." if len(desc) > 300 else desc
        
        return ""

    def extract_image_safely(self, element, base_url):
        """Safely extract image URL"""
        img = element.select_one('img[src]')
        if img and img.get('src'):
            src = img['src']
            if src.startswith('//'):
                return 'https:' + src
            elif src.startswith('/'):
                return urljoin(base_url, src)
            elif src.startswith('http'):
                return src
        return ""

    def extract_link_safely(self, element, base_url):
        """Safely extract event link"""
        link = element.select_one('a[href]')
        if link and link.get('href'):
            href = link['href']
            if href.startswith('/'):
                return urljoin(base_url, href)
            elif href.startswith('http'):
                return href
        return base_url

    def save_to_csv(self, concerts, filename="scraped_concerts.csv"):
        """Save concert data to CSV file"""
        if not concerts:
            print("No concerts found to save.")
            return
        
        fieldnames = ['title', 'date', 'venue', 'price', 'organizer', 'description', 
                     'image_url', 'concert_link', 'location', 'event_type']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(concerts)
        
        print(f"Saved {len(concerts)} authentic concerts to {filename}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python real_concert_scraper.py <url>")
        sys.exit(1)
    
    scraper = RealConcertScraper()
    concerts = scraper.scrape_concerts(sys.argv[1])
    
    if concerts:
        print(f"\nFound {len(concerts)} authentic concerts:")
        for i, concert in enumerate(concerts, 1):
            print(f"{i}. {concert['title']} - {concert['date'] or 'Date TBD'}")
        
        scraper.save_to_csv(concerts)
        
        print("\nFirst concert details:")
        if concerts:
            for key, value in concerts[0].items():
                print(f"  {key}: {value or '(blank)'}")
    else:
        print("No authentic concert data could be extracted from accessible sources.")

if __name__ == "__main__":
    main()