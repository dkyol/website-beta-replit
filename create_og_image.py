#!/usr/bin/env python3
"""
Create a proper Open Graph image for SightTune social media sharing using the actual logo
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_og_image():
    # Create a 1200x630 image (standard Open Graph size)
    width, height = 1200, 630
    
    # Create image with dark background
    bg_color = (26, 26, 26)  # Dark gray
    img = Image.new('RGB', (width, height), bg_color)
    
    # Try to open and use the actual SightTune logo
    try:
        logo_path = "attached_assets/SightTune_Logo_no words_1749825929879.png"
        logo = Image.open(logo_path)
        
        # Resize logo to fit nicely in the social media image
        logo_max_size = 200
        logo.thumbnail((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
        
        # Calculate position to center the logo
        logo_x = (width - logo.width) // 2
        logo_y = (height - logo.height) // 2 - 80
        
        # If the logo has transparency, paste it properly
        if logo.mode in ('RGBA', 'LA'):
            img.paste(logo, (logo_x, logo_y), logo)
        else:
            img.paste(logo, (logo_x, logo_y))
        
        center_y_text = logo_y + logo.height + 40
        
    except Exception as e:
        print(f"Could not load logo: {e}")
        # Fallback: create a simple text-only version
        center_y_text = height // 2
    
    draw = ImageDraw.Draw(img)
    
    # Colors
    white = (255, 255, 255)
    light_gray = (204, 204, 204)
    
    # Add text
    try:
        # Try to use a nice font
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # SightTune title
    title_text = "SightTune"
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = center_y_text
    draw.text((title_x, title_y), title_text, fill=white, font=title_font)
    
    # Subtitle
    subtitle_text = "Classical Music Discovery"
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = title_y + 90
    draw.text((subtitle_x, subtitle_y), subtitle_text, fill=light_gray, font=subtitle_font)
    
    # Save the image
    img.save('og-image.png', 'PNG', quality=95)
    print("Created og-image.png with actual SightTune logo")

if __name__ == "__main__":
    create_og_image()