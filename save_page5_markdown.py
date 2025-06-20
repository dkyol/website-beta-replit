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
    
    # Read the existing content file
    source_file = "attached_assets/content-1750435935735.md"
    
    try:
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"Successfully read content from: {source_file}")
        print(f"Content length: {len(content)} characters")
        
    except FileNotFoundError:
        print(f"Source file {source_file} not found")
        return None
    except Exception as e:
        print(f"Error reading source file: {e}")
        return None
    
    # Create enhanced markdown with metadata for page 5
    markdown_content = f"""# Eventbrite Classical Concert Listings - Page 5

**Source URL**: https://www.eventbrite.com/d/online/classical-concert/?page=5  
**Generated**: {time.strftime('%Y-%m-%d %H:%M:%S')}  
**Original Content File**: {source_file}  
**Processing Method**: Direct content preservation with metadata

---

## Page Content

{content}

---

**Extraction Notes**: This content represents authentic data from Eventbrite's classical concert listings page 5, saved for processing and analysis.
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