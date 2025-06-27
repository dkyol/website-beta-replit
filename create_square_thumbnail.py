#!/usr/bin/env python3
"""
Create a square thumbnail for social media sharing using the new SightTune logo
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_square_thumbnail():
    # Create a 512x512 square image for social media thumbnails
    size = 512
    
    # Create image with light background to match the logo style
    bg_color = (248, 250, 252)  # Light gray/white
    img = Image.new('RGB', (size, size), bg_color)
    
    # Try to open and use the actual SightTune logo
    try:
        logo_path = "attached_assets/logoRemod_1750993466008.png"
        logo = Image.open(logo_path)
        
        # Resize logo to fit nicely in the square thumbnail
        logo_max_size = 400
        logo.thumbnail((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
        
        # Calculate position to center the logo
        logo_x = (size - logo.width) // 2
        logo_y = (size - logo.height) // 2
        
        # If the logo has transparency, paste it properly
        if logo.mode in ('RGBA', 'LA'):
            img.paste(logo, (logo_x, logo_y), logo)
        else:
            img.paste(logo, (logo_x, logo_y))
        
    except Exception as e:
        print(f"Could not load logo: {e}")
        # Fallback: create a simple text version
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        except:
            font = ImageFont.load_default()
        
        text = "SIGHTTUNE"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_x = (size - text_width) // 2
        text_y = size // 2 - 24
        draw.text((text_x, text_y), text, fill=(30, 41, 59), font=font)
    
    # Save the square thumbnail
    img.save('square-thumbnail.png', 'PNG', quality=95)
    print("Created square-thumbnail.png with SightTune logo")

if __name__ == "__main__":
    create_square_thumbnail()