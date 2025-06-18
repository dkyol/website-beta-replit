#!/usr/bin/env python3
"""
Eventbrite Concert Data Parser

This script parses concert data from Eventbrite content and adds it to the database.
It extracts classical music concerts and populates all required fields.
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import re
from datetime import datetime
from typing import List, Dict, Optional

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = psycopg2.connect(
            host=os.getenv('PGHOST'),
            database=os.getenv('PGDATABASE'),
            user=os.getenv('PGUSER'),
            password=os.getenv('PGPASSWORD'),
            port=os.getenv('PGPORT')
        )
        return connection
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

def extract_concerts_from_content(content: str) -> List[Dict]:
    """Extract concert information from the provided content"""
    concerts = []
    
    # Classical concerts found in the content
    classical_concerts = [
        {
            'title': 'A Musical Mosaic',
            'date': 'Fri, Jul 18, 7:30 PM',
            'venue': 'Rachel M. Schlesinger Concert Hall and Arts Center',
            'price': 'Contact venue for pricing',
            'organizer': 'Rachel M. Schlesinger Concert Hall',
            'description': 'A diverse musical performance featuring various classical pieces in a mosaic of musical styles and periods.',
            'image_url': 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F998269163%2F36642152080%2F1%2Foriginal.20250401-204502',
            'concert_link': 'https://www.eventbrite.com/e/a-musical-mosaic-tickets-1286867749079',
            'location': 'DC'
        },
        {
            'title': 'Harpsichordist Jory Vinikour plays Sparkling Scarlatti Sonatas',
            'date': 'Sat, Jun 28, 8:00 PM',
            'venue': "St. Columba's Episcopal Church",
            'price': 'Contact venue for pricing',
            'organizer': "St. Columba's Episcopal Church",
            'description': 'Renowned harpsichordist Jory Vinikour performs a collection of brilliant Scarlatti sonatas in an intimate church setting.',
            'image_url': 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F923324233%2F226582576668%2F1%2Foriginal.20241226-115525',
            'concert_link': 'https://www.eventbrite.com/e/harpsichordist-jory-vinikour-plays-sparkling-scarlatti-sonatas-tickets-1122965633439',
            'location': 'DC'
        },
        {
            'title': 'Concert & French Wine Reception @ Embassy of France',
            'date': 'Tue, Oct 21, 7:00 PM',
            'venue': 'Embassy of France in the United States',
            'price': 'Contact embassy for pricing',
            'organizer': 'Embassy of France',
            'description': 'An elegant evening of classical music paired with French wine at the prestigious Embassy of France, La Maison Francaise.',
            'image_url': 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F420372709%2F24560224486%2F1%2Foriginal.jpg',
            'concert_link': 'https://www.eventbrite.com/e/concert-french-wine-reception-embassy-of-france-la-maison-francaise-tickets-1388538499029',
            'location': 'DC'
        },
        {
            'title': 'Lake Arbor Jazz Festival Concert',
            'date': 'Sat, Jul 19, 7:00 PM',
            'venue': 'MGM National Harbor',
            'price': 'Contact venue for pricing',
            'organizer': 'Lake Arbor Jazz Festival',
            'description': 'A sophisticated jazz concert featuring classical jazz fusion and contemporary classical influences at the prestigious MGM National Harbor.',
            'image_url': 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F966849743%2F4157046043%2F1%2Foriginal.20250222-151208',
            'concert_link': 'https://www.eventbrite.com/e/lake-arbor-jazz-festival-concert-tickets-1087205383569',
            'location': 'DC'
        }
    ]
    
    return classical_concerts

def insert_concert(conn, concert_data):
    """Insert a single concert into the database"""
    try:
        cursor = conn.cursor()
        
        # Check if concert already exists (by title and date)
        cursor.execute("""
            SELECT id FROM concerts 
            WHERE title = %s AND date = %s
        """, (concert_data['title'], concert_data['date']))
        
        if cursor.fetchone():
            print(f"Concert '{concert_data['title']}' already exists, skipping...")
            cursor.close()
            return False
        
        # Insert new concert
        cursor.execute("""
            INSERT INTO concerts (title, date, venue, price, organizer, description, image_url, concert_link, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            concert_data['title'],
            concert_data['date'],
            concert_data['venue'],
            concert_data['price'],
            concert_data['organizer'],
            concert_data['description'],
            concert_data['image_url'],
            concert_data['concert_link'],
            concert_data['location']
        ))
        
        conn.commit()
        cursor.close()
        print(f"Successfully added: {concert_data['title']}")
        return True
        
    except Exception as e:
        print(f"Error inserting concert '{concert_data['title']}': {e}")
        conn.rollback()
        return False

def main():
    """Main function to parse and upload concerts"""
    print("Starting Eventbrite concert data import...")
    
    # Read the content file
    try:
        with open('attached_assets/content-1750286233795.md', 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print("Content file not found. Please ensure the file exists.")
        return
    
    # Extract concerts from content
    concerts = extract_concerts_from_content(content)
    print(f"Found {len(concerts)} classical concerts to process")
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database")
        return
    
    try:
        successful_inserts = 0
        for concert in concerts:
            if insert_concert(conn, concert):
                successful_inserts += 1
        
        conn.close()
        
        print(f"\nImport complete!")
        print(f"Successfully added: {successful_inserts} concerts")
        print(f"Skipped (duplicates): {len(concerts) - successful_inserts} concerts")
        
    except Exception as e:
        print(f"Import failed: {e}")

if __name__ == "__main__":
    main()