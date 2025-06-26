# SightTune - Classical Music Discovery Platform

## Overview
An intelligent classical music concert discovery platform that simplifies live music exploration through dynamic, user-focused design and advanced event aggregation. The application features a comprehensive database of authentic classical concerts with social sharing capabilities and educational resources.

## Features
- **Concert Discovery**: Browse 580+ authentic classical concerts with real promotional images
- **30-Second Rotation**: Automatically cycles through featured concerts every 30 seconds
- **Future-Only Display**: Shows only upcoming concerts happening today and later
- **Concert Gallery**: Responsive grid layout showcasing 12 concerts with square thumbnails
- **Social Sharing**: Concert-specific sharing with dynamic Open Graph meta tags for Facebook, LinkedIn, and Twitter
- **Educational Links**: Wikipedia integration for music genres and concert venue types
- **YouTube Examples**: Direct links to classical music performance examples
- **External Resources**: Links to concert reviews, artist profiles, and concert calendars
- **Responsive Design**: Mobile-optimized with 2-5 column grid layouts

## Technology Stack

### Backend (Node.js/TypeScript)
- **Express**: Web framework with TypeScript
- **PostgreSQL**: Persistent database with 580+ concert records
- **Drizzle ORM**: Type-safe database operations and schema management
- **Dynamic Meta Tags**: Concert-specific Open Graph tags for social sharing

### Frontend (React)
- **React 18**: Modern UI framework with TypeScript
- **Vite**: Fast build tool with hot module replacement
- **TailwindCSS**: Utility-first styling with responsive design
- **TanStack Query**: Data fetching with 5-second auto-refresh
- **Wouter**: Lightweight client-side routing
- **Radix UI**: Accessible component primitives

### Data Sources & Integration
- **Eventbrite Scraping**: Authentic concert data with promotional images
- **Wikipedia Integration**: Educational links for music genres and venues
- **YouTube Integration**: Example performance videos
- **External Resources**: Classical music websites and calendars

## Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL database

### Setup
1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install flask flask-cors psycopg2-binary python-dotenv pydantic
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   # Database connection variables are automatically provided
   DATABASE_URL=your_postgres_url
   PGHOST=your_host
   PGDATABASE=your_database
   PGUSER=your_username
   PGPASSWORD=your_password
   PGPORT=your_port
   ```

5. Initialize the database:
   ```bash
   npm run db:push
   ```

## Running the Application

### Development Mode
```bash
python run.py
```

### Frontend Build (if needed)
```bash
cd client && npm run build
```

## API Endpoints

### Concerts
- `GET /api/concerts` - Get all concerts
- `GET /api/concerts/:id` - Get concert by ID

### Voting
- `POST /api/vote` - Submit a vote
  ```json
  {
    "concertId": 1,
    "voteType": "excited" | "interested"
  }
  ```

### Statistics
- `GET /api/vote-stats` - Get vote statistics
- `GET /api/rankings` - Get concerts with rankings and vote counts

## Database Schema

### Concerts Table
- `id` (serial, primary key)
- `title` (text)
- `date` (text)
- `venue` (text)
- `price` (text)
- `organizer` (text)
- `description` (text)
- `image_url` (text)

### Votes Table
- `id` (serial, primary key)
- `concert_id` (integer, foreign key)
- `vote_type` (text: 'excited' or 'interested')
- `created_at` (timestamp)

## Concert Data
The application features authentic piano concert data from Washington DC area venues:

1. **José Luiz Martins' Brazil Project** - Takoma Station Tavern
2. **Harpsichordist Jory Vinikour plays Sparkling Scarlatti Sonatas** - St. Columba's Episcopal Church
3. **Washington | 2025 Scholarship Pianists Debut Recital** - La Maison Française, Embassy of France
4. **Fatty Liver Foundation Benefit Recital | Celimene Daudet, Piano** - La Maison Française, Embassy of France
5. **DC Chamber Musicians Season Finale** - St Thomas Episcopal Church
6. **Considering Matthew Shepard** - Washington National Cathedral

All concerts include authentic promotional images from Eventbrite and real venue information.

## Architecture

### Backend (Flask)
- **Database Storage**: PostgreSQL with persistent data
- **API Routes**: RESTful endpoints for concerts, voting, and statistics
- **Data Models**: Pydantic models for validation
- **CORS Support**: Enables frontend communication

### Frontend (React)
- **Component Architecture**: Modular React components
- **State Management**: TanStack Query for server state
- **Real-time Updates**: Automatic polling for live data
- **Timer System**: 30-second rotation with visual countdown
- **Responsive Design**: Mobile-friendly interface

## Deployment
The application is ready for deployment with:
- Production-ready Flask configuration
- Built frontend assets
- Environment variable support
- Database migration scripts

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License
