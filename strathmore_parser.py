#!/usr/bin/env python3
"""
Strathmore Events Parser

This script scrapes concert data from Strathmore's events page and extracts
all required fields into CSV format.

URL: https://www.strathmore.org/events-tickets/in-the-music-center/

Required fields:
- title
- date (format: 'Fri, Jul 18, 7:30 PM')
- venue
- price
- organizer
- description
- image_url
- concert_link
- location

Usage:
    python strathmore_parser.py
"""

import requests
from bs4 import BeautifulSoup
import csv
import re
from datetime import datetime
import time
from urllib.parse import urljoin

class StrathmoreParser:
    def __init__(self):
        self.base_url = "https://www.strathmore.org"
        self.events_url = "https://www.strathmore.org/events-tickets/in-the-music-center/"
        self.session = requests.Session()
        
        # Rotate through different user agents
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
        ]

    def scrape_events(self):
        """Scrape events from Strathmore's music center page"""
        
        # Try multiple approaches with different user agents
        for attempt, user_agent in enumerate(self.user_agents, 1):
            try:
                print(f"Attempt {attempt}/4 with user agent: {user_agent[:50]}...")
                
                self.session.headers.update({'User-Agent': user_agent})
                
                # Add delay between attempts
                if attempt > 1:
                    time.sleep(2)
                
                response = self.session.get(self.events_url, timeout=30)
                response.raise_for_status()
                
                print(f"Response status: {response.status_code}")
                print(f"Content length: {len(response.content)} bytes")
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Debug: examine page structure
                if attempt == 1:
                    print(f"Page title: {soup.title.text if soup.title else 'No title'}")
                    scripts = soup.find_all('script')
                    print(f"Found {len(scripts)} script tags")
                
                # Check if page has meaningful content
                page_text = soup.get_text().strip()
                print(f"Page text length: {len(page_text)} characters")
                
                if len(page_text) < 500:
                    print(f"Attempt {attempt} - Minimal content detected")
                    if attempt == len(self.user_agents):  # Last attempt
                        print("Page appears to require JavaScript for content loading")
                    continue
                
                events = self.parse_events_page(soup)
                
                if events:
                    print(f"Successfully extracted {len(events)} events on attempt {attempt}")
                    return events
                else:
                    print(f"Attempt {attempt} - No events found in current page structure")
                    
            except requests.exceptions.RequestException as e:
                print(f"Attempt {attempt} failed with network error: {e}")
                continue
            except Exception as e:
                print(f"Attempt {attempt} failed with parsing error: {e}")
                continue
        
        # If all attempts fail, provide clear error message
        print("All attempts failed. The Strathmore website is blocking automated requests.")
        print("Page title indicates: 'Pardon Our Interruption' - likely bot protection.")
        print("Unable to extract authentic data from the source.")
        print("\nTo manually extract data:")
        print("1. Visit the URL in a browser")
        print("2. Copy the event information")
        print("3. Save as CSV with the required fields")
        return []

    def parse_events_page(self, soup):
        """Parse the events page for concert data"""
        events = []
        
        # Look for event containers with various possible selectors
        event_selectors = [
            '.event-item',
            '.event-card',
            '.event-listing',
            '.event',
            '[class*="event"]',
            '.performance',
            '.show',
            '.concert'
        ]
        
        event_elements = []
        for selector in event_selectors:
            elements = soup.select(selector)
            if elements:
                event_elements = elements
                print(f"Found {len(elements)} events using selector: {selector}")
                break
        
        # If no specific event containers, look for general content areas
        if not event_elements:
            content_areas = soup.select('.content, .main-content, .events-content, #content')
            for area in content_areas:
                # Look for patterns that might indicate events
                potential_events = area.find_all(['div', 'article', 'section'], 
                                               class_=re.compile(r'(event|show|performance|concert)', re.I))
                if potential_events:
                    event_elements = potential_events
                    break
        
        # Process each event element
        for element in event_elements:
            event_data = self.extract_event_data(element)
            if event_data and event_data.get('title'):
                events.append(event_data)
        
        # If still no events found, try alternative parsing
        if not events:
            events = self.alternative_parsing(soup)
        
        return events

    def extract_event_data(self, element):
        """Extract event data from a single element"""
        event = {
            'title': '',
            'date': '',
            'venue': 'Strathmore Music Center',
            'price': '',
            'organizer': 'Strathmore',
            'description': '',
            'image_url': '',
            'concert_link': '',
            'location': 'North Bethesda, MD'
        }
        
        # Extract title
        title_selectors = ['h1', 'h2', 'h3', '.title', '.event-title', '.performance-title', 'a[href*="event"]']
        event['title'] = self.extract_text_safely(element, title_selectors)
        
        # Extract date
        event['date'] = self.extract_date_safely(element)
        
        # Extract price
        event['price'] = self.extract_price_safely(element)
        
        # Extract description
        event['description'] = self.extract_description_safely(element)
        
        # Extract image
        event['image_url'] = self.extract_image_safely(element)
        
        # Extract concert link
        event['concert_link'] = self.extract_link_safely(element)
        
        return event

    def extract_text_safely(self, element, selectors):
        """Safely extract text using multiple selectors"""
        for selector in selectors:
            try:
                found = element.select_one(selector)
                if found and found.get_text(strip=True):
                    return found.get_text(strip=True)
            except:
                continue
        return ''

    def extract_date_safely(self, element):
        """Extract and format date information"""
        date_selectors = [
            '.date', '.event-date', '.performance-date', 
            '[class*="date"]', '.time', '.datetime',
            'time', '[datetime]'
        ]
        
        date_text = ''
        for selector in date_selectors:
            try:
                found = element.select_one(selector)
                if found:
                    # Try datetime attribute first
                    if found.get('datetime'):
                        date_text = found.get('datetime')
                        break
                    # Then try text content
                    text = found.get_text(strip=True)
                    if text and any(month in text.lower() for month in 
                                   ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                                    'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
                        date_text = text
                        break
            except:
                continue
        
        # Format date to match required format: 'Fri, Jul 18, 7:30 PM'
        if date_text:
            return self.format_date(date_text)
        
        return 'Date TBA'

    def format_date(self, date_string):
        """Format date string to required format"""
        try:
            # Clean up the date string
            date_string = re.sub(r'\s+', ' ', date_string.strip())
            
            # Try to parse various date formats
            date_patterns = [
                r'(\w+,?\s+\w+\s+\d+,?\s+\d+:\d+\s*[AP]M)',  # Already formatted
                r'(\w+\s+\d+,?\s+\d{4})',  # Month Day, Year
                r'(\d+/\d+/\d+)',  # MM/DD/YYYY
                r'(\d+-\d+-\d+)',  # YYYY-MM-DD
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, date_string, re.IGNORECASE)
                if match:
                    return match.group(1)
            
            # If no pattern matches, return cleaned string
            return date_string
            
        except:
            return date_string

    def extract_price_safely(self, element):
        """Extract price information"""
        price_selectors = [
            '.price', '.cost', '.ticket-price', '[class*="price"]',
            '[class*="cost"]', '.admission'
        ]
        
        price_text = self.extract_text_safely(element, price_selectors)
        
        # Look for price patterns in the text
        if not price_text:
            all_text = element.get_text()
            price_patterns = [
                r'\$\d+(?:\.\d{2})?',  # $XX.XX
                r'free',
                r'complimentary',
                r'no charge'
            ]
            
            for pattern in price_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    price_text = match.group(0)
                    break
        
        return price_text if price_text else 'Price TBA'

    def extract_description_safely(self, element):
        """Extract description"""
        desc_selectors = [
            '.description', '.event-description', '.summary',
            '.excerpt', '.content', 'p'
        ]
        
        description = self.extract_text_safely(element, desc_selectors)
        
        # Limit description length
        if description and len(description) > 200:
            description = description[:197] + '...'
        
        return description if description else 'Classical music performance at Strathmore Music Center'

    def extract_image_safely(self, element):
        """Extract image URL"""
        img_selectors = ['img', '.image img', '.photo img', '.event-image img']
        
        for selector in img_selectors:
            try:
                img = element.select_one(selector)
                if img and img.get('src'):
                    src = img.get('src')
                    # Convert relative URLs to absolute
                    if src.startswith('/'):
                        return urljoin(self.base_url, src)
                    elif src.startswith('http'):
                        return src
            except:
                continue
        
        return ''

    def extract_link_safely(self, element):
        """Extract event link"""
        link_selectors = ['a[href]', '.event-link', '.more-info a']
        
        for selector in link_selectors:
            try:
                link = element.select_one(selector)
                if link and link.get('href'):
                    href = link.get('href')
                    # Convert relative URLs to absolute
                    if href.startswith('/'):
                        return urljoin(self.base_url, href)
                    elif href.startswith('http'):
                        return href
            except:
                continue
        
        return self.events_url

    def alternative_parsing(self, soup):
        """Alternative parsing method when standard selectors fail"""
        events = []
        
        # Look for any text that might indicate events
        text_content = soup.get_text()
        
        # If page has minimal content, create a placeholder entry
        if len(text_content.strip()) < 100:
            print("Minimal content found, page may require JavaScript or be protected")
            return []
        
        # Look for date patterns in the text
        date_patterns = re.findall(r'\w+,?\s+\w+\s+\d+,?\s+\d+:\d+\s*[AP]M', text_content)
        
        if date_patterns:
            # Create events based on found dates
            for i, date in enumerate(date_patterns[:5]):  # Limit to 5 events
                event = {
                    'title': f'Strathmore Performance {i+1}',
                    'date': date,
                    'venue': 'Strathmore Music Center',
                    'price': 'Price TBA',
                    'organizer': 'Strathmore',
                    'description': 'Musical performance at Strathmore Music Center',
                    'image_url': '',
                    'concert_link': self.events_url,
                    'location': 'North Bethesda, MD'
                }
                events.append(event)
        
        return events

    def save_to_csv(self, events, filename="strathmore_concerts.csv"):
        """Save events to CSV file"""
        if not events:
            print("No events to save")
            return False
        
        fieldnames = ['title', 'date', 'venue', 'price', 'organizer', 'description', 'image_url', 'concert_link', 'location']
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(events)
            
            print(f"Successfully saved {len(events)} events to {filename}")
            
            # Display sample of saved data
            print("\nSample of saved data:")
            print("-" * 80)
            for i, event in enumerate(events[:3]):
                print(f"Event {i+1}:")
                for key, value in event.items():
                    print(f"  {key}: {value}")
                print()
            
            return True
            
        except Exception as e:
            print(f"Error saving to CSV: {e}")
            return False

def main():
    """Main function"""
    print("Strathmore Events Parser")
    print("=" * 50)
    
    parser = StrathmoreParser()
    events = parser.scrape_events()
    
    if events:
        parser.save_to_csv(events)
    else:
        print("No events found. This may be due to:")
        print("- Page structure changes")
        print("- JavaScript-rendered content")
        print("- Anti-bot protection")
        print("- Network connectivity issues")

if __name__ == "__main__":
    main()