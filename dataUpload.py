#!/usr/bin/env python3
"""
Concert Data Upload Script

This script reads concert data from a CSV file and uploads it to the PostgreSQL database.

CSV Format Expected:
title,date,venue,price,organizer,description,image_url

Usage:
    python dataUpload.py <csv_file_path>

Example:
    python dataUpload.py concerts.csv
"""

import sys
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
from typing import Optional

# Load environment variables
load_dotenv()

class ConcertData(BaseModel):
    title: str
    date: str
    venue: str
    price: str
    organizer: str
    description: str
    image_url: str
    concert_link: str
    location: str
    event_type: str

def get_db_connection():
    """Create and return a database connection"""
    return psycopg2.connect(
        host=os.getenv('PGHOST'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD'),
        port=os.getenv('PGPORT')
    )

def validate_csv_headers(headers):
    """Validate that CSV has required headers"""
    required_headers = ['title', 'date', 'venue', 'price', 'organizer', 'description', 'image_url', 'concert_link', 'location', 'event_type']
    missing_headers = [h for h in required_headers if h not in headers]
    
    if missing_headers:
        raise ValueError(f"Missing required headers: {', '.join(missing_headers)}")
    
    return True

def read_csv_file(file_path):
    """Read and validate CSV file data"""
    concerts = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Validate headers
            validate_csv_headers(reader.fieldnames)
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 since row 1 is headers
                try:
                    # Clean and validate the row data
                    concert_data = ConcertData(
                        title=row['title'].strip(),
                        date=row['date'].strip(),
                        venue=row['venue'].strip(),
                        price=row['price'].strip(),
                        organizer=row['organizer'].strip(),
                        description=row['description'].strip(),
                        image_url=row['image_url'].strip(),
                        concert_link=row['concert_link'].strip(),
                        location=row['location'].strip(),
                        event_type=row['event_type'].strip()
                    )
                    concerts.append(concert_data)
                    
                except ValidationError as e:
                    print(f"Error in row {row_num}: {e}")
                    continue
                except KeyError as e:
                    print(f"Missing column in row {row_num}: {e}")
                    continue
                    
    except FileNotFoundError:
        raise FileNotFoundError(f"CSV file not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error reading CSV file: {e}")
    
    return concerts

def insert_concert(conn, concert_data):
    """Insert a single concert into the database"""
    cur = conn.cursor()
    
    try:
        # Check if concert already exists (by title and venue)
        cur.execute("""
            SELECT id FROM concerts 
            WHERE title = %s AND venue = %s
        """, (concert_data.title, concert_data.venue))
        
        existing = cur.fetchone()
        if existing:
            print(f"Concert already exists: {concert_data.title} at {concert_data.venue}")
            return False
        
        # Insert new concert
        cur.execute("""
            INSERT INTO concerts (title, date, venue, price, organizer, description, image_url, concert_link, location, event_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            concert_data.title,
            concert_data.date,
            concert_data.venue,
            concert_data.price,
            concert_data.organizer,
            concert_data.description,
            concert_data.image_url,
            concert_data.concert_link,
            concert_data.location,
            concert_data.event_type
        ))
        
        concert_id = cur.fetchone()[0]
        conn.commit()
        
        print(f"Successfully added concert: {concert_data.title} (ID: {concert_id})")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Error inserting concert '{concert_data.title}': {e}")
        return False
    finally:
        cur.close()

def upload_concerts_from_csv(csv_file_path):
    """Main function to upload concerts from CSV file"""
    print(f"Reading CSV file: {csv_file_path}")
    
    try:
        # Read and validate CSV data
        concerts = read_csv_file(csv_file_path)
        print(f"Found {len(concerts)} valid concerts in CSV")
        
        if not concerts:
            print("No valid concerts found in CSV file")
            return
        
        # Connect to database
        conn = get_db_connection()
        print("Connected to database")
        
        # Insert concerts
        successful_inserts = 0
        for concert in concerts:
            if insert_concert(conn, concert):
                successful_inserts += 1
        
        conn.close()
        
        print(f"\nUpload complete!")
        print(f"Successfully added: {successful_inserts} concerts")
        print(f"Skipped (duplicates/errors): {len(concerts) - successful_inserts} concerts")
        
    except Exception as e:
        print(f"Upload failed: {e}")
        sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print("Usage: python dataUpload.py <csv_file_path>")
        
        print("\nCSV Format Required:")
        print("title,date,venue,price,organizer,description,image_url")
        sys.exit(1)

    
    csv_file_path = sys.argv[1]
    upload_concerts_from_csv(csv_file_path)

if __name__ == "__main__":
    main()