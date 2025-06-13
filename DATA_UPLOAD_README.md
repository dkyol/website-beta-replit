# Concert Data Upload Guide

## Overview
The `dataUpload.py` script allows you to bulk upload concert data to the PostgreSQL database from CSV files.

## Requirements
- Python 3.11+
- PostgreSQL database (configured via environment variables)
- Required Python packages: psycopg2, pydantic, python-dotenv

## CSV Format
Your CSV file must include these exact column headers:
```
title,date,venue,price,organizer,description,image_url
```

### Column Descriptions
- **title**: Concert title/name
- **date**: Performance date and time (e.g., "Sat, Dec 14, 8:00 PM")
- **venue**: Performance location
- **price**: Ticket pricing (e.g., "From $25.00", "Free", "Donation")
- **organizer**: Organization hosting the event
- **description**: Concert description/details
- **image_url**: URL to promotional image

## Usage

### Create a Sample CSV
```bash
python dataUpload.py --create-sample
```
This creates `sample_concerts.csv` with the correct format.

### Upload Data from CSV
```bash
python dataUpload.py your_concerts.csv
```

### Example CSV Content
```csv
title,date,venue,price,organizer,description,image_url
Sample Piano Recital,"Sat, Dec 14, 8:00 PM",Kennedy Center Concert Hall,From $25.00,Washington Piano Society,"An evening of classical piano music featuring works by Chopin, Debussy, and Rachmaninoff.",https://example.com/sample-concert-image.jpg
Jazz Piano Night,"Fri, Dec 20, 7:30 PM",Blues Alley,From $35.00,DC Jazz Collective,Contemporary jazz piano performances featuring local and touring artists.,https://example.com/jazz-piano-image.jpg
```

## Features
- **Validation**: Validates CSV format and data integrity
- **Duplicate Prevention**: Checks for existing concerts by title and venue
- **Error Handling**: Reports validation errors with row numbers
- **Progress Tracking**: Shows successful uploads and skipped duplicates
- **Rollback Support**: Database transactions prevent partial uploads

## Output
The script provides detailed feedback:
```
Reading CSV file: concerts.csv
Found 2 valid concerts in CSV
Connected to database
Successfully added concert: Sample Piano Recital (ID: 7)
Concert already exists: Jazz Piano Night at Blues Alley

Upload complete!
Successfully added: 1 concerts
Skipped (duplicates/errors): 1 concerts
```

## Error Handling
- Missing required columns
- Invalid data formats
- Database connection issues
- Duplicate concert detection
- Row-level validation errors

## Database Schema
Concerts are stored with these fields:
- `id` (auto-generated)
- `title`
- `date`
- `venue`
- `price`
- `organizer`
- `description`
- `image_url` (as imageUrl in API responses)

## Integration
After upload, concerts immediately appear in:
- Featured concert rotation (7-second intervals)
- Rankings display
- Voting interface
- API endpoints (`/api/concerts`, `/api/rankings`)

## Security
- Uses environment variables for database credentials
- SQL injection protection via parameterized queries
- Transaction-based uploads for data integrity