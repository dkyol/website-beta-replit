#!/usr/bin/env python3
"""
Create a complete set of favicon files using the new SightTune logo
"""

from PIL import Image
import os

def create_favicon_set():
    # Load the new logo
    try:
        logo_path = "attached_assets/logoRemod_1750993466008.png"
        logo = Image.open(logo_path)
        
        # Create different sized favicons
        sizes = [
            (16, 16, "favicon-16x16.png"),
            (32, 32, "favicon-32x32.png"),
            (180, 180, "apple-touch-icon.png"),
            (512, 512, "android-chrome-512x512.png"),
            (192, 192, "android-chrome-192x192.png")
        ]
        
        for width, height, filename in sizes:
            # Create a new image with the target size
            favicon = logo.copy()
            favicon.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Create a new image with exact dimensions and center the logo
            final_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            
            # Calculate position to center the logo
            x = (width - favicon.width) // 2
            y = (height - favicon.height) // 2
            
            # Paste the logo
            if favicon.mode in ('RGBA', 'LA'):
                final_img.paste(favicon, (x, y), favicon)
            else:
                final_img.paste(favicon, (x, y))
            
            # Save as PNG (browsers support this better than ICO)
            final_img.save(filename, 'PNG', quality=95)
            print(f"Created {filename}")
        
        # Create favicon.ico (traditional favicon)
        favicon_ico = logo.copy()
        favicon_ico.thumbnail((32, 32), Image.Resampling.LANCZOS)
        favicon_ico.save("favicon.ico", format='ICO', sizes=[(32, 32)])
        print("Created favicon.ico")
        
    except Exception as e:
        print(f"Error creating favicons: {e}")

if __name__ == "__main__":
    create_favicon_set()