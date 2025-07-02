#!/usr/bin/env python3
"""
Create Instagram-style social media post images for concert sharing
"""

from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
import os
import json
import sys

def create_instagram_post(concert_data, output_filename="instagram_post.png"):
    """
    Create an Instagram-style post image with concert thumbnail and information
    
    Args:
        concert_data: Dictionary containing concert information
        output_filename: Name of the output file
    """
    # Instagram post dimensions (1080x1080 square)
    post_size = 1080
    
    # Create background with gradient
    img = Image.new('RGB', (post_size, post_size), (248, 250, 252))
    draw = ImageDraw.Draw(img)
    
    # Create a subtle gradient background
    for i in range(post_size):
        color_value = int(248 - (i / post_size) * 20)  # Subtle gradient
        draw.line([(0, i), (post_size, i)], fill=(color_value, color_value + 2, color_value + 4))
    
    # Load and process concert thumbnail
    thumbnail_size = 400
    thumbnail_y = 80
    
    try:
        # Download the concert image
        if concert_data.get('imageUrl') and concert_data['imageUrl'].startswith('http'):
            response = requests.get(concert_data['imageUrl'], timeout=10)
            if response.status_code == 200:
                concert_img = Image.open(BytesIO(response.content))
                
                # Resize and crop to square
                concert_img.thumbnail((thumbnail_size, thumbnail_size), Image.Resampling.LANCZOS)
                
                # Create a square version
                square_img = Image.new('RGB', (thumbnail_size, thumbnail_size), (255, 255, 255))
                paste_x = (thumbnail_size - concert_img.width) // 2
                paste_y = (thumbnail_size - concert_img.height) // 2
                square_img.paste(concert_img, (paste_x, paste_y))
                
                # Add rounded corners
                mask = Image.new('L', (thumbnail_size, thumbnail_size), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.rounded_rectangle([0, 0, thumbnail_size, thumbnail_size], radius=20, fill=255)
                
                # Apply mask
                square_img.putalpha(mask)
                
                # Paste onto main image
                img_x = (post_size - thumbnail_size) // 2
                img.paste(square_img, (img_x, thumbnail_y), square_img)
        else:
            # Fallback: create a placeholder with concert title
            placeholder = Image.new('RGB', (thumbnail_size, thumbnail_size), (100, 116, 139))
            placeholder_draw = ImageDraw.Draw(placeholder)
            
            try:
                placeholder_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            except:
                placeholder_font = ImageFont.load_default()
            
            # Draw music note icon as text
            note_text = "♪ ♫"
            note_bbox = placeholder_draw.textbbox((0, 0), note_text, font=placeholder_font)
            note_width = note_bbox[2] - note_bbox[0]
            note_x = (thumbnail_size - note_width) // 2
            note_y = thumbnail_size // 2 - 40
            placeholder_draw.text((note_x, note_y), note_text, fill=(255, 255, 255), font=placeholder_font)
            
            # Add "CONCERT" text
            try:
                concert_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
            except:
                concert_font = ImageFont.load_default()
            
            concert_text = "CONCERT"
            concert_bbox = placeholder_draw.textbbox((0, 0), concert_text, font=concert_font)
            concert_width = concert_bbox[2] - concert_bbox[0]
            concert_x = (thumbnail_size - concert_width) // 2
            concert_y = note_y + 60
            placeholder_draw.text((concert_x, concert_y), concert_text, fill=(255, 255, 255), font=concert_font)
            
            img_x = (post_size - thumbnail_size) // 2
            img.paste(placeholder, (img_x, thumbnail_y))
            
    except Exception as e:
        print(f"Error loading concert image: {e}")
        # Create simple placeholder
        placeholder = Image.new('RGB', (thumbnail_size, thumbnail_size), (100, 116, 139))
        img_x = (post_size - thumbnail_size) // 2
        img.paste(placeholder, (img_x, thumbnail_y))
    
    # Add concert information text
    text_y = thumbnail_y + thumbnail_size + 40
    text_margin = 60
    text_width = post_size - (text_margin * 2)
    
    # Load fonts
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        info_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except:
        title_font = ImageFont.load_default()
        info_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Draw concert title (wrapped)
    title = concert_data.get('title', 'Classical Concert')
    title_lines = wrap_text(title, title_font, text_width, draw)
    
    current_y = text_y
    for line in title_lines:
        line_bbox = draw.textbbox((0, 0), line, font=title_font)
        line_width = line_bbox[2] - line_bbox[0]
        line_x = (post_size - line_width) // 2
        draw.text((line_x, current_y), line, fill=(30, 41, 59), font=title_font)
        current_y += 40
    
    current_y += 20
    
    # Draw venue and date
    venue_date = f"{concert_data.get('venue', 'Concert Hall')} • {concert_data.get('date', 'TBD')}"
    venue_lines = wrap_text(venue_date, info_font, text_width, draw)
    
    for line in venue_lines:
        line_bbox = draw.textbbox((0, 0), line, font=info_font)
        line_width = line_bbox[2] - line_bbox[0]
        line_x = (post_size - line_width) // 2
        draw.text((line_x, current_y), line, fill=(100, 116, 139), font=info_font)
        current_y += 32
    
    current_y += 15
    
    # Draw price
    price_text = f"Price: {concert_data.get('price', 'See website')}"
    price_bbox = draw.textbbox((0, 0), price_text, font=small_font)
    price_width = price_bbox[2] - price_bbox[0]
    price_x = (post_size - price_width) // 2
    draw.text((price_x, current_y), price_text, fill=(100, 116, 139), font=small_font)
    current_y += 40
    
    # Add SightTune branding
    try:
        logo_path = "attached_assets/logoRemod_1750993466008.png"
        if os.path.exists(logo_path):
            logo = Image.open(logo_path)
            logo_size = 80
            logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            logo_x = (post_size - logo.width) // 2
            logo_y = post_size - 150
            
            if logo.mode in ('RGBA', 'LA'):
                img.paste(logo, (logo_x, logo_y), logo)
            else:
                img.paste(logo, (logo_x, logo_y))
            
            # Add "Discover more at SightTune" text
            sighttune_text = "Discover more at SightTune"
            sighttune_bbox = draw.textbbox((0, 0), sighttune_text, font=small_font)
            sighttune_width = sighttune_bbox[2] - sighttune_bbox[0]
            sighttune_x = (post_size - sighttune_width) // 2
            sighttune_y = logo_y + logo.height + 15
            draw.text((sighttune_x, sighttune_y), sighttune_text, fill=(100, 116, 139), font=small_font)
        else:
            # Fallback text branding
            brand_text = "SightTune Music Technology"
            brand_bbox = draw.textbbox((0, 0), brand_text, font=info_font)
            brand_width = brand_bbox[2] - brand_bbox[0]
            brand_x = (post_size - brand_width) // 2
            brand_y = post_size - 80
            draw.text((brand_x, brand_y), brand_text, fill=(100, 116, 139), font=info_font)
    except Exception as e:
        print(f"Error adding logo: {e}")
    
    # Save the image
    img.save(output_filename, 'PNG', quality=95)
    print(f"Created Instagram post: {output_filename}")
    return output_filename

def wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width"""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                # Single word is too long, add it anyway
                lines.append(word)
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines

def main():
    """Main function for command line usage"""
    if len(sys.argv) > 1:
        # Read concert data from command line argument (JSON string)
        try:
            concert_data = json.loads(sys.argv[1])
            output_file = sys.argv[2] if len(sys.argv) > 2 else "instagram_post.png"
            create_instagram_post(concert_data, output_file)
        except json.JSONDecodeError:
            print("Error: Invalid JSON data provided")
        except Exception as e:
            print(f"Error: {e}")
    else:
        # Sample data for testing
        sample_concert = {
            "title": "Fatly Liver Foundation Benefit Recital | Celimene Daudet, Piano",
            "venue": "La Maison Française, Embassy of France",
            "date": "2025-10-23T19:30:00.000Z",
            "price": "Donation",
            "imageUrl": "https://example.com/concert-image.jpg"
        }
        create_instagram_post(sample_concert)

if __name__ == "__main__":
    main()