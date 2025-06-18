#!/usr/bin/env python3
"""
Create a proper Open Graph image for SightTune social media sharing
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_og_image():
    # Create a 1200x630 image (standard Open Graph size)
    width, height = 1200, 630
    
    # Create image with dark background
    bg_color = (26, 26, 26)  # Dark gray
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Colors
    white = (255, 255, 255)
    light_gray = (204, 204, 204)
    
    # Draw owl silhouette (simplified)
    center_x, center_y = width // 2, height // 2 - 50
    
    # Owl body (circle)
    owl_size = 120
    draw.ellipse([
        center_x - owl_size, center_y - owl_size,
        center_x + owl_size, center_y + owl_size
    ], fill=white)
    
    # Owl eyes
    eye_size = 25
    eye_offset = 40
    # Left eye
    draw.ellipse([
        center_x - eye_offset - eye_size, center_y - 30 - eye_size,
        center_x - eye_offset + eye_size, center_y - 30 + eye_size
    ], fill=bg_color)
    # Right eye
    draw.ellipse([
        center_x + eye_offset - eye_size, center_y - 30 - eye_size,
        center_x + eye_offset + eye_size, center_y - 30 + eye_size
    ], fill=bg_color)
    
    # Eye highlights
    highlight_size = 8
    draw.ellipse([
        center_x - eye_offset - highlight_size, center_y - 30 - highlight_size,
        center_x - eye_offset + highlight_size, center_y - 30 + highlight_size
    ], fill=white)
    draw.ellipse([
        center_x + eye_offset - highlight_size, center_y - 30 - highlight_size,
        center_x + eye_offset + highlight_size, center_y - 30 + highlight_size
    ], fill=white)
    
    # Owl beak
    beak_points = [
        (center_x, center_y + 10),
        (center_x - 15, center_y + 35),
        (center_x + 15, center_y + 35)
    ]
    draw.polygon(beak_points, fill=white)
    
    # Ear tufts
    tuft_points_left = [
        (center_x - 60, center_y - 120),
        (center_x - 100, center_y - 160),
        (center_x - 40, center_y - 140)
    ]
    tuft_points_right = [
        (center_x + 60, center_y - 120),
        (center_x + 100, center_y - 160),
        (center_x + 40, center_y - 140)
    ]
    draw.polygon(tuft_points_left, fill=white)
    draw.polygon(tuft_points_right, fill=white)
    
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
    title_y = center_y + 160
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
    print("Created og-image.png")

if __name__ == "__main__":
    create_og_image()