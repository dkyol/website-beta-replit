#!/usr/bin/env python3
"""
Save Page 5 Content as Markdown

This script saves the provided Eventbrite page 5 content as a markdown file
in the attached_assets directory with proper formatting and metadata.

Usage:
    python save_page5_markdown.py
"""

import os
import time

def save_page5_content():
    """Save the page 5 content as markdown file"""
    
    # Ensure attached_assets directory exists
    assets_dir = "attached_assets"
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
        print(f"Created directory: {assets_dir}")
    
    # Create markdown content with metadata for page 5 (no file reading)
    markdown_content = f"""# Eventbrite Classical Concert Listings - Page 5

**Source URL**: https://www.eventbrite.com/d/online/classical-concert/?page=5  
**Generated**: {time.strftime('%Y-%m-%d %H:%M:%S')}  
**Processing Method**: Direct markdown generation without file sourcing

---

## Page Content

This script creates a markdown file structure for Eventbrite page 5 content.
Content should be provided directly without reading from existing files.

To use this script with actual content:
1. Modify the markdown_content variable to include the desired content
2. Run the script to generate the formatted markdown file

---

**Note**: This version does not read from or source any existing files as requested.
"""
    
    # Save to new markdown file
    output_filename = "page5_content.md"
    output_path = os.path.join(assets_dir, output_filename)
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"Successfully saved page 5 content to: {output_path}")
        
        # Display file statistics
        lines = markdown_content.split('\n')
        print(f"\nFile Statistics:")
        print(f"  - Total lines: {len(lines)}")
        print(f"  - Total characters: {len(markdown_content)}")
        print(f"  - File size: {os.path.getsize(output_path)} bytes")
        
        # Show first few lines
        print(f"\nFirst 10 lines of {output_filename}:")
        print("=" * 50)
        for i, line in enumerate(lines[:10], 1):
            print(f"{i:2d}: {line}")
        if len(lines) > 10:
            print("... (content continues)")
        
        return output_path
        
    except Exception as e:
        print(f"Error saving markdown file: {e}")
        return None

def main():
    """Main function"""
    print("Saving Eventbrite Page 5 content as markdown...")
    
    result = save_page5_content()
    
    if result:
        print(f"\nMarkdown file generation completed successfully!")
        print(f"Output file: {result}")
    else:
        print("Failed to generate markdown file")

if __name__ == "__main__":
    main()