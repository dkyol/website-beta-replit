#!/usr/bin/env python3
"""
Markdown Generator Script

This script extracts content from an Eventbrite URL and generates a markdown file
saved in the attached_assets directory.

Usage:
    python markdown.py <eventbrite_url>

Example:
    python markdown.py "https://www.eventbrite.com/d/online/classical-concert/?page=4"
"""

import requests
from bs4 import BeautifulSoup
import sys
import os
from urllib.parse import urlparse
import time

class MarkdownGenerator:
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
        """Extract content from the Eventbrite page using multiple methods"""
        print(f"Extracting content from: {url}")
        
        # Try multiple user agents and approaches
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
        
        for i, user_agent in enumerate(user_agents):
            try:
                print(f"Attempt {i+1}/3 with different user agent...")
                
                # Update headers for this attempt
                self.session.headers.update({
                    'User-Agent': user_agent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none'
                })
                
                # Add increasing delays between attempts
                time.sleep(1 + i)
                
                response = self.session.get(url, timeout=20)
                
                if response.status_code == 200:
                    print(f"Successfully retrieved content (attempt {i+1})")
                    return self.process_html_content(response.content)
                else:
                    print(f"Attempt {i+1} failed with status: {response.status_code}")
                    
            except requests.RequestException as e:
                print(f"Attempt {i+1} failed: {e}")
                continue
            except Exception as e:
                print(f"Attempt {i+1} error: {e}")
                continue
        
        print("All extraction attempts failed")
        return None

    def process_html_content(self, html_content):
        """Process HTML content and convert to clean markdown-friendly text"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(["script", "style", "nav", "header", "footer", "aside"]):
            element.decompose()
        
        # Look for main content areas
        main_content = soup.find('main') or soup.find('div', {'id': 'main'}) or soup.body
        
        if main_content:
            content_text = main_content.get_text()
        else:
            content_text = soup.get_text()
        
        # Clean up the text formatting
        lines = []
        for line in content_text.splitlines():
            line = line.strip()
            if line and len(line) > 2:  # Skip very short lines
                lines.append(line)
        
        # Join lines with proper spacing
        cleaned_content = '\n\n'.join(lines)
        
        # Remove excessive whitespace
        import re
        cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)
        
        return cleaned_content

    def generate_markdown_from_url(self, url, output_filename="demo.md"):
        """Generate markdown file from URL content"""
        
        # Ensure attached_assets directory exists
        assets_dir = "attached_assets"
        if not os.path.exists(assets_dir):
            os.makedirs(assets_dir)
            print(f"Created directory: {assets_dir}")
        
        # Extract content from URL
        content = self.extract_page_content(url)
        
        if not content:
            print("Failed to extract content from URL")
            return None
        
        # Create markdown content with header
        markdown_content = f"""# Eventbrite Classical Concert Listings

**Source URL**: {url}  
**Generated**: {time.strftime('%Y-%m-%d %H:%M:%S')}

---

{content}
"""
        
        # Save to file in attached_assets directory
        output_path = os.path.join(assets_dir, output_filename)
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            print(f"Successfully saved markdown content to: {output_path}")
            print(f"File size: {len(markdown_content)} characters")
            
            return output_path
            
        except Exception as e:
            print(f"Error saving file: {e}")
            return None

    def generate_fallback_markdown(self, url, output_filename="demo.md"):
        """Generate a fallback markdown file when URL is inaccessible"""
        
        assets_dir = "attached_assets"
        if not os.path.exists(assets_dir):
            os.makedirs(assets_dir)
        
        fallback_content = f"""# Eventbrite Classical Concert Listings

**Source URL**: {url}  
**Generated**: {time.strftime('%Y-%m-%d %H:%M:%S')}  
**Status**: Unable to access URL directly (likely blocked by anti-bot measures)

---

## Note

This URL was not accessible during content extraction. This commonly occurs with Eventbrite pages that implement anti-bot protection.

To manually extract content:
1. Visit the URL in a browser: {url}
2. Copy the page content
3. Replace this placeholder content with the actual page data

## Alternative Approach

Use browser developer tools to save the page source, then process it with this script:

```bash
# Save page source to a file, then run:
python markdown.py --file page_source.html
```

---

**URL**: {url}
**Extraction Date**: {time.strftime('%Y-%m-%d')}
"""
        
        output_path = os.path.join(assets_dir, output_filename)
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(fallback_content)
            
            print(f"Generated fallback markdown file: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"Error saving fallback file: {e}")
            return None

    def generate_markdown_from_existing_content(self, output_filename="demo.md"):
        """Generate markdown from existing content file as demonstration"""
        
        assets_dir = "attached_assets"
        if not os.path.exists(assets_dir):
            os.makedirs(assets_dir)
        
        # Try to use existing content files
        existing_files = [
            "attached_assets/content-1750435595501.md",  # Latest content from page 4
            "attached_assets/content-1750286233795.md",
            "attached_assets/content-1749781800512.md"
        ]
        
        for content_file in existing_files:
            if os.path.exists(content_file):
                print(f"Using existing content from: {content_file}")
                
                try:
                    with open(content_file, 'r', encoding='utf-8') as f:
                        existing_content = f.read()
                    
                    # Create enhanced markdown with metadata
                    markdown_content = f"""# Eventbrite Classical Concert Listings

**Source**: Processed from existing content file  
**Original File**: {content_file}  
**Generated**: {time.strftime('%Y-%m-%d %H:%M:%S')}  
**Processing Method**: Content extraction and formatting

---

## Extracted Concert Data

{existing_content}

---

**Note**: This content was processed from an existing markdown file to demonstrate the markdown generation functionality.
"""
                    
                    output_path = os.path.join(assets_dir, output_filename)
                    
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(markdown_content)
                    
                    print(f"Successfully generated markdown from existing content: {output_path}")
                    return output_path
                    
                except Exception as e:
                    print(f"Error processing {content_file}: {e}")
                    continue
        
        return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python markdown.py <eventbrite_url>")
        print("Example: python markdown.py 'https://www.eventbrite.com/d/online/classical-concert/?page=4'")
        print("Note: Due to anti-bot measures, the script will use existing content for demonstration")
        sys.exit(1)
    
    url = sys.argv[1]
    
    # Create markdown generator
    generator = MarkdownGenerator()
    
    # Try to generate markdown from URL
    result = generator.generate_markdown_from_url(url, "demo.md")
    
    if not result:
        print("Failed to extract content from the URL. Unable to generate markdown.")
        print("This is likely due to anti-bot protection or network restrictions.")
        sys.exit(1)
    
    if result:
        print(f"\nMarkdown generation completed!")
        print(f"Output file: {result}")
        
        # Show file stats and preview
        try:
            with open(result, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
            print(f"File statistics:")
            print(f"  - Total lines: {len(lines)}")
            print(f"  - Total characters: {len(content)}")
            print(f"  - File size: {os.path.getsize(result)} bytes")
            
            print(f"\nFirst 10 lines of {os.path.basename(result)}:")
            print("=" * 50)
            for i, line in enumerate(lines[:10], 1):
                print(f"{i:2d}: {line}")
            if len(lines) > 10:
                print("... (content continues)")
                
        except Exception as e:
            print(f"Could not preview file: {e}")
    else:
        print("Failed to generate markdown file")
        sys.exit(1)

if __name__ == "__main__":
    main()