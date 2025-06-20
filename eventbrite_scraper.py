#!/usr/bin/env python3
"""
Eventbrite Classical Concert Scraper

This script scrapes classical concert data from Eventbrite URLs and extracts
all required fields matching the sample_concerts.csv format.

Required fields:
- title
- date
- venue
- price
- organizer
- description
- image_url
- concert_link
- location
- event_type

Usage:
    python eventbrite_scraper.py <eventbrite_url>

Example:
    python eventbrite_scraper.py "https://www.eventbrite.com/d/online/classical-concert/?page=2"
"""

import requests
from bs4 import BeautifulSoup
import csv
import sys
import re
from urllib.parse import urljoin, urlparse
from datetime import datetime
import json

class EventbriteScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })

    def scrape_concerts(self, url):
        """Scrape concert data from Eventbrite URL"""
        try:
            # Add delay to avoid rate limiting
            import time
            time.sleep(2)
            
            # Try multiple approaches to access the content
            response = None
            
            # First attempt: standard request
            try:
                response = self.session.get(url, timeout=30, allow_redirects=True)
                if response.status_code == 405:
                    print(f"Method not allowed, trying alternative approaches...")
                    
                    # Try with different user agent
                    self.session.headers.update({
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    })
                    response = self.session.get(url, timeout=30)
                    
                if response.status_code != 200:
                    print(f"Status code {response.status_code}, trying with requests library directly...")
                    import requests
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                    }
                    response = requests.get(url, headers=headers, timeout=30)
                    
            except Exception as e:
                print(f"Request failed: {e}")
                return []
            
            if response and response.status_code == 200:
                response.raise_for_status()
            else:
                print(f"Unable to access URL. Status: {response.status_code if response else 'No response'}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            concerts = []
            
            # Debug: Print page title and some content
            title = soup.find('title')
            print(f"Page title: {title.get_text() if title else 'No title found'}")
            
            # Look for event cards/listings
            event_cards = self.find_event_cards(soup)
            
            if not event_cards:
                # If no cards found, try to extract any structured data
                print("No event cards found, trying alternative extraction methods...")
                concerts = self.extract_from_json_ld(soup, url)
                if not concerts:
                    print("No structured data found either.")
                    # Save HTML for debugging
                    with open('debug_page.html', 'w', encoding='utf-8') as f:
                        f.write(str(soup))
                    print("Saved page HTML to debug_page.html for analysis")
                    return []
            else:
                for card in event_cards:
                    concert_data = self.extract_concert_data(card, url)
                    if concert_data:
                        concerts.append(concert_data)
            
            return concerts
            
        except requests.RequestException as e:
            print(f"Error fetching URL: {e}")
            return []
        except Exception as e:
            print(f"Error parsing content: {e}")
            return []

    def extract_from_json_ld(self, soup, base_url):
        """Extract event data from JSON-LD structured data"""
        concerts = []
        
        # Look for JSON-LD script tags
        scripts = soup.find_all('script', type='application/ld+json')
        
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    for item in data:
                        if item.get('@type') == 'Event':
                            concert = self.parse_json_ld_event(item, base_url)
                            if concert:
                                concerts.append(concert)
                elif data.get('@type') == 'Event':
                    concert = self.parse_json_ld_event(data, base_url)
                    if concert:
                        concerts.append(concert)
            except json.JSONDecodeError:
                continue
        
        return concerts

    def parse_json_ld_event(self, event_data, base_url):
        """Parse a single event from JSON-LD data"""
        try:
            return {
                'title': event_data.get('name', ''),
                'date': self.format_json_date(event_data.get('startDate', '')),
                'venue': self.extract_venue_from_location(event_data.get('location', {})),
                'price': self.extract_price_from_offers(event_data.get('offers', [])),
                'organizer': self.extract_organizer_name(event_data.get('organizer', {})),
                'description': event_data.get('description', 'Classical music performance'),
                'image_url': event_data.get('image', 'https://example.com/default-concert-image.jpg'),
                'concert_link': event_data.get('url', base_url),
                'location': self.extract_city_from_location(event_data.get('location', {})),
                'event_type': self.determine_event_type_from_text(event_data.get('name', '') + ' ' + event_data.get('description', ''))
            }
        except Exception:
            return None

    def create_sample_data(self, url):
        """Create sample concert data for testing when scraping fails"""
        print("Creating sample data for demonstration...")
        
        sample_concerts = [
            {
                'title': 'Classical Piano Recital: Chopin & Liszt',
                'date': 'Sat, Jan 25, 7:30 PM',
                'venue': 'Kennedy Center Concert Hall',
                'price': 'From $35.00',
                'organizer': 'Washington Classical Society',
                'description': 'An evening of romantic piano masterpieces featuring works by Chopin and Liszt performed by internationally acclaimed pianist.',
                'image_url': 'https://example.com/piano-recital.jpg',
                'concert_link': url,
                'location': 'DC',
                'event_type': 'classical'
            },
            {
                'title': 'Chamber Music Series: String Quartet',
                'date': 'Sun, Jan 26, 3:00 PM',
                'venue': 'Strathmore Music Center',
                'price': 'From $25.00',
                'organizer': 'Bethesda Chamber Music',
                'description': 'Intimate chamber music performance featuring Mozart and Brahms string quartets in our historic venue.',
                'image_url': 'https://example.com/chamber-music.jpg',
                'concert_link': url,
                'location': 'DC',
                'event_type': 'classical'
            },
            {
                'title': 'Jazz Piano Trio Live',
                'date': 'Fri, Jan 31, 8:00 PM',
                'venue': 'Blues Alley',
                'price': 'From $45.00',
                'organizer': 'DC Jazz Collective',
                'description': 'Contemporary jazz trio featuring original compositions and classic standards in an intimate club setting.',
                'image_url': 'https://example.com/jazz-trio.jpg',
                'concert_link': url,
                'location': 'DC',
                'event_type': 'jazz'
            }
        ]
        
        return sample_concerts

    def format_json_date(self, date_str):
        """Format JSON-LD date to readable format"""
        if not date_str:
            return ""
        
        try:
            # Parse ISO date format
            from datetime import datetime
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt.strftime('%a, %b %d, %I:%M %p')
        except:
            return date_str

    def extract_venue_from_location(self, location_data):
        """Extract venue name from location object"""
        if isinstance(location_data, dict):
            return location_data.get('name', 'Venue TBD')
        elif isinstance(location_data, str):
            return location_data
        return "Venue TBD"

    def extract_price_from_offers(self, offers_data):
        """Extract price from offers array"""
        if isinstance(offers_data, list) and offers_data:
            offer = offers_data[0]
            if isinstance(offer, dict):
                price = offer.get('price', offer.get('lowPrice', ''))
                currency = offer.get('priceCurrency', '$')
                if price:
                    return f"From {currency}{price}"
        elif isinstance(offers_data, dict):
            price = offers_data.get('price', offers_data.get('lowPrice', ''))
            currency = offers_data.get('priceCurrency', '$')
            if price:
                return f"From {currency}{price}"
        return "Price not listed"

    def extract_organizer_name(self, organizer_data):
        """Extract organizer name from organizer object"""
        if isinstance(organizer_data, dict):
            return organizer_data.get('name', 'Event Organizer')
        elif isinstance(organizer_data, str):
            return organizer_data
        return "Event Organizer"

    def extract_city_from_location(self, location_data):
        """Extract city from location object"""
        if isinstance(location_data, dict):
            address = location_data.get('address', {})
            if isinstance(address, dict):
                city = address.get('addressLocality', '')
                if 'washington' in city.lower() or 'dc' in city.lower():
                    return "DC"
                return city if city else "Online"
        return "Online"

    def determine_event_type_from_text(self, text):
        """Determine event type from text content"""
        text_lower = text.lower()
        
        classical_keywords = ['classical', 'symphony', 'orchestra', 'piano', 'violin', 'chamber', 
                             'baroque', 'romantic', 'opera', 'recital', 'chopin', 'mozart', 'bach']
        jazz_keywords = ['jazz', 'blues', 'swing', 'bebop', 'improvisation']
        
        classical_score = sum(1 for keyword in classical_keywords if keyword in text_lower)
        jazz_score = sum(1 for keyword in jazz_keywords if keyword in text_lower)
        
        return "jazz" if jazz_score > classical_score else "classical"

    def find_event_cards(self, soup):
        """Find event cards using comprehensive selectors"""
        # Print page structure for debugging
        print("Analyzing page structure...")
        
        # Updated selectors based on current Eventbrite structure
        selectors = [
            # Modern Eventbrite selectors
            '[data-testid*="event"]',
            '[data-testid*="card"]', 
            '[data-event-id]',
            '.event-listing',
            '.search-event-card-wrapper',
            '.search-results-event-card',
            '.search-event-card',
            '.event-card-details',
            '[class*="SearchEventCard"]',
            '[class*="EventCard"]',
            '[class*="event-card"]',
            '[class*="search-event"]',
            # Generic selectors
            'article',
            '[role="article"]',
            '.card',
            '[class*="card"]'
        ]
        
        for selector in selectors:
            cards = soup.select(selector)
            if cards and len(cards) > 0:
                # Filter out obviously wrong elements
                valid_cards = []
                for card in cards:
                    card_text = card.get_text().strip()
                    if len(card_text) > 50 and any(keyword in card_text.lower() for keyword in ['concert', 'music', 'piano', 'classical', 'jazz', 'performance', 'recital', 'orchestra', 'chamber']):
                        valid_cards.append(card)
                
                if valid_cards:
                    print(f"Found {len(valid_cards)} valid events using selector: {selector}")
                    return valid_cards
                else:
                    print(f"Found {len(cards)} elements but none contain concert-related content with selector: {selector}")
        
        # More aggressive content-based search
        print("Trying content-based search...")
        all_elements = soup.find_all(['div', 'article', 'section'])
        potential_cards = []
        
        for element in all_elements:
            text = element.get_text().lower()
            if any(keyword in text for keyword in ['concert', 'piano', 'classical', 'music', 'recital', 'orchestra']) and len(text) > 100 and len(text) < 2000:
                potential_cards.append(element)
        
        if potential_cards:
            print(f"Found {len(potential_cards)} elements with concert-related content")
            return potential_cards[:20]  # Limit to first 20 to avoid noise
            
        print("No event cards found with any selector")
        return []

    def extract_concert_data(self, card, base_url):
        """Extract concert data from a single event card"""
        try:
            data = {
                'title': self.extract_title(card),
                'date': self.extract_date(card),
                'venue': self.extract_venue(card),
                'price': self.extract_price(card),
                'organizer': self.extract_organizer(card),
                'description': self.extract_description(card),
                'image_url': self.extract_image_url(card, base_url),
                'concert_link': self.extract_concert_link(card, base_url),
                'location': self.extract_location(card),
                'event_type': self.determine_event_type(card)
            }
            
            # Only return if we have essential data
            if data['title'] and (data['date'] or data['venue']):
                return data
            
        except Exception as e:
            print(f"Error extracting data from card: {e}")
        
        return None

    def extract_title(self, card):
        """Extract event title with enhanced parsing"""
        selectors = [
            # Eventbrite specific
            '[data-testid*="title"]',
            '[data-testid*="event-title"]',
            '[aria-label*="title"]',
            # Generic title selectors
            'h1', 'h2', 'h3', 'h4',
            '.event-title', '.card-title', '.title',
            '[class*="title"]', '[class*="Title"]',
            '[class*="name"]', '[class*="Name"]',
            # Link-based titles
            'a[href*="/e/"]',
            'a[href*="eventbrite"]',
            'a[title]'
        ]
        
        for selector in selectors:
            elements = card.select(selector)
            for element in elements:
                title = element.get_text(strip=True)
                # More sophisticated title validation
                if title and len(title) > 5 and len(title) < 200:
                    # Skip generic text
                    skip_phrases = ['view event', 'learn more', 'register', 'buy tickets', 'see details']
                    if not any(phrase in title.lower() for phrase in skip_phrases):
                        return title
        
        # Fallback: look for any text that looks like a title
        text_elements = card.find_all(text=True)
        for text in text_elements:
            if text and len(text.strip()) > 10 and len(text.strip()) < 150:
                text = text.strip()
                if any(keyword in text.lower() for keyword in ['concert', 'recital', 'symphony', 'piano', 'classical', 'jazz']):
                    return text
        
        return "Concert Event"

    def extract_date(self, card):
        """Extract event date with enhanced parsing"""
        selectors = [
            # Eventbrite specific
            '[data-testid*="date"]',
            '[data-testid*="time"]',
            '[data-testid*="datetime"]',
            '[aria-label*="date"]',
            '[aria-label*="time"]',
            # Generic date selectors
            '.event-date', '.date', '.datetime',
            '[class*="date"]', '[class*="Date"]',
            '[class*="time"]', '[class*="Time"]',
            'time', '[datetime]'
        ]
        
        for selector in selectors:
            elements = card.select(selector)
            for element in elements:
                # Check datetime attribute first
                if element.get('datetime'):
                    return self.standardize_date(element.get('datetime'))
                
                date_text = element.get_text(strip=True)
                if date_text and len(date_text) > 3:
                    standardized = self.standardize_date(date_text)
                    if standardized and standardized != date_text:
                        return standardized
        
        # Text-based date extraction
        all_text = card.get_text()
        import re
        
        # Look for date patterns
        date_patterns = [
            r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[,\s]+([A-Za-z]+\s+\d{1,2})[,\s]*(\d{4})?[,\s]*(\d{1,2}:\d{2}\s*[APap][Mm])?',
            r'([A-Za-z]+\s+\d{1,2})[,\s]*(\d{4})?[,\s]*(\d{1,2}:\d{2}\s*[APap][Mm])',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{4}-\d{2}-\d{2})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, all_text, re.IGNORECASE)
            if match:
                return self.standardize_date(match.group(0))
        
        return "Date TBD"

    def standardize_date(self, date_text):
        """Standardize date format to match expected format"""
        # Remove extra whitespace and common words
        date_text = re.sub(r'\s+', ' ', date_text.strip())
        date_text = re.sub(r'(starts|on|at)\s+', '', date_text, flags=re.IGNORECASE)
        
        # If it looks like a reasonable date, return it
        if any(month in date_text.lower() for month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                                                        'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
            return date_text
        
        return date_text

    def extract_venue(self, card):
        """Extract venue information with enhanced parsing"""
        selectors = [
            # Eventbrite specific
            '[data-testid*="location"]',
            '[data-testid*="venue"]',
            '[aria-label*="location"]',
            '[aria-label*="venue"]',
            # Generic venue selectors
            '.venue', '.location', '.address',
            '[class*="venue"]', '[class*="Venue"]',
            '[class*="location"]', '[class*="Location"]',
            '[class*="address"]', '[class*="Address"]'
        ]
        
        for selector in selectors:
            elements = card.select(selector)
            for element in elements:
                venue = element.get_text(strip=True)
                if venue and len(venue) > 3:
                    # Skip obvious non-venue text
                    skip_terms = ['show map', 'directions', 'view location', 'get directions']
                    if not any(term in venue.lower() for term in skip_terms):
                        if venue.lower() not in ['online', 'virtual', 'tbd', 'location']:
                            return venue
        
        # Text-based venue extraction
        all_text = card.get_text()
        venue_keywords = ['center', 'hall', 'theater', 'theatre', 'auditorium', 'venue', 'concert hall', 'academy', 'conservatory']
        
        import re
        lines = all_text.split('\n')
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in venue_keywords) and len(line) > 5 and len(line) < 100:
                return line
        
        return "Venue TBD"

    def extract_price(self, card):
        """Extract price information with enhanced parsing"""
        selectors = [
            # Eventbrite specific
            '[data-testid*="price"]',
            '[data-testid*="cost"]',
            '[aria-label*="price"]',
            '[aria-label*="cost"]',
            # Generic price selectors
            '.price', '.cost', '.fee', '.ticket-price',
            '[class*="price"]', '[class*="Price"]',
            '[class*="cost"]', '[class*="Cost"]',
            '[class*="fee"]', '[class*="ticket"]'
        ]
        
        for selector in selectors:
            elements = card.select(selector)
            for element in elements:
                price_text = element.get_text(strip=True)
                if price_text and (('$' in price_text and any(c.isdigit() for c in price_text)) or 'free' in price_text.lower()):
                    return price_text
        
        # Enhanced text-based price extraction
        text = card.get_text()
        import re
        
        # Look for various price patterns
        price_patterns = [
            r'Free',
            r'\$\d+(?:\.\d{2})?(?:\s*-\s*\$\d+(?:\.\d{2})?)?',
            r'From\s+\$\d+(?:\.\d{2})?',
            r'\$\d+(?:\.\d{2})?\+?',
            r'Starting\s+at\s+\$\d+(?:\.\d{2})?',
            r'Tickets\s+from\s+\$\d+(?:\.\d{2})?'
        ]
        
        for pattern in price_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0]
        
        # Look for just dollar amounts
        dollar_match = re.search(r'\$[\d,]+(?:\.\d{2})?', text)
        if dollar_match:
            return f"From {dollar_match.group()}"
        
        if re.search(r'\bfree\b', text, re.IGNORECASE):
            return "Free"
        
        return "Price not listed"

    def extract_organizer(self, card):
        """Extract organizer information"""
        selectors = [
            '[data-testid="event-organizer"]', '.organizer', '[class*="organizer"]',
            '.host', '[class*="host"]', '.by', '[class*="by"]'
        ]
        
        for selector in selectors:
            element = card.select_one(selector)
            if element:
                organizer = element.get_text(strip=True)
                if organizer:
                    return organizer
        
        return "Event Organizer"

    def extract_description(self, card):
        """Extract event description"""
        selectors = [
            '[data-testid="event-description"]', '.description', '.summary',
            '[class*="description"]', '[class*="summary"]', 'p'
        ]
        
        for selector in selectors:
            element = card.select_one(selector)
            if element:
                desc = element.get_text(strip=True)
                if desc and len(desc) > 20:
                    # Limit description length
                    return desc[:300] + "..." if len(desc) > 300 else desc
        
        return "Classical music performance"

    def extract_image_url(self, card, base_url):
        """Extract event image URL"""
        selectors = [
            'img[src]', '[data-testid="event-image"] img', '.event-image img'
        ]
        
        for selector in selectors:
            img = card.select_one(selector)
            if img and img.get('src'):
                img_url = img['src']
                # Convert relative URLs to absolute
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    img_url = urljoin(base_url, img_url)
                
                if 'placeholder' not in img_url.lower():
                    return img_url
        
        return "https://example.com/default-concert-image.jpg"

    def extract_concert_link(self, card, base_url):
        """Extract direct link to the concert"""
        # Look for event links
        link_selectors = [
            'a[href*="/e/"]', 'a[href*="eventbrite.com"]', 'a[href]'
        ]
        
        for selector in link_selectors:
            link = card.select_one(selector)
            if link and link.get('href'):
                href = link['href']
                # Convert relative URLs to absolute
                if href.startswith('/'):
                    href = urljoin(base_url, href)
                
                if 'eventbrite.com' in href:
                    return href
        
        return base_url

    def extract_location(self, card):
        """Extract location/city information"""
        text = card.get_text().lower()
        
        # Look for common DC area locations
        dc_indicators = ['washington', 'dc', 'arlington', 'alexandria', 'bethesda', 'rockville']
        
        for indicator in dc_indicators:
            if indicator in text:
                return "DC"
        
        # Look for other major cities
        cities = ['new york', 'nyc', 'boston', 'philadelphia', 'baltimore', 'richmond']
        for city in cities:
            if city in text:
                return city.title()
        
        return "Online"

    def determine_event_type(self, card):
        """Determine if event is classical, jazz, or other"""
        text = card.get_text().lower()
        
        classical_keywords = ['classical', 'symphony', 'orchestra', 'piano', 'violin', 'chamber', 
                             'baroque', 'romantic', 'opera', 'recital', 'chopin', 'mozart', 'bach']
        
        jazz_keywords = ['jazz', 'blues', 'swing', 'bebop', 'improvisation']
        
        # Count keyword matches
        classical_score = sum(1 for keyword in classical_keywords if keyword in text)
        jazz_score = sum(1 for keyword in jazz_keywords if keyword in text)
        
        if classical_score > jazz_score:
            return "classical"
        elif jazz_score > 0:
            return "jazz"
        else:
            return "classical"  # Default to classical for music events

    def save_to_csv(self, concerts, filename="scraped_concerts.csv"):
        """Save concert data to CSV file"""
        if not concerts:
            print("No concerts to save.")
            return
        
        fieldnames = ['title', 'date', 'venue', 'price', 'organizer', 'description', 
                     'image_url', 'concert_link', 'location', 'event_type']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(concerts)
        
        print(f"Saved {len(concerts)} concerts to {filename}")

    def upload_to_database(self, concerts):
        """Upload scraped concerts directly to the database"""
        try:
            import psycopg2
            import os
            from datetime import datetime
            
            # Get database connection
            conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
            cursor = conn.cursor()
            
            inserted_count = 0
            for concert in concerts:
                try:
                    cursor.execute("""
                        INSERT INTO concerts (title, date, venue, price, organizer, description, 
                                            image_url, concert_link, location, event_type)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        concert['title'],
                        concert['date'],
                        concert['venue'],
                        concert['price'],
                        concert['organizer'],
                        concert['description'],
                        concert['image_url'],
                        concert['concert_link'],
                        concert['location'],
                        concert['event_type']
                    ))
                    inserted_count += 1
                except psycopg2.IntegrityError:
                    # Skip duplicate entries
                    conn.rollback()
                    print(f"Skipped duplicate: {concert['title']}")
                    continue
                except Exception as e:
                    conn.rollback()
                    print(f"Error inserting {concert['title']}: {e}")
                    continue
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"Successfully uploaded {inserted_count} concerts to database")
            
        except Exception as e:
            print(f"Database upload failed: {e}")
            print("Data saved to CSV file instead")

def main():
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: python eventbrite_scraper.py <eventbrite_url> [--upload-db]")
        print("Example: python eventbrite_scraper.py 'https://www.eventbrite.com/d/online/classical-concert/?page=2'")
        print("Example: python eventbrite_scraper.py 'https://www.eventbrite.com/d/online/classical-concert/?page=2' --upload-db")
        sys.exit(1)
    
    url = sys.argv[1]
    upload_to_db = len(sys.argv) == 3 and sys.argv[2] == '--upload-db'
    
    # Validate URL
    if 'eventbrite.com' not in url:
        print("Error: Please provide a valid Eventbrite URL")
        sys.exit(1)
    
    print(f"Scraping concerts from: {url}")
    if upload_to_db:
        print("Will upload results directly to database")
    
    scraper = EventbriteScraper()
    concerts = scraper.scrape_concerts(url)
    
    if concerts:
        print(f"\nFound {len(concerts)} concerts:")
        for i, concert in enumerate(concerts, 1):
            print(f"{i}. {concert['title']} - {concert['date']}")
        
        # Save to CSV file
        scraper.save_to_csv(concerts)
        
        # Upload to database if requested
        if upload_to_db:
            scraper.upload_to_database(concerts)
        
        # Display first concert details for verification
        print("\nFirst concert details:")
        if concerts:
            for key, value in concerts[0].items():
                print(f"  {key}: {value}")
    else:
        print("No concerts found. The page structure might have changed or there are no events listed.")

if __name__ == "__main__":
    main()