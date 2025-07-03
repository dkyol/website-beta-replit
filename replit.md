# Enjoy Classical Music - SightTune

## Overview

This is an interactive voting application for classical music concerts featuring automatic 30-second rotations, real-time ranking displays, and persistent data storage. The application allows users to vote on their favorite upcoming piano concerts with real-time feedback and a badge system to encourage engagement.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern UI development
- **Vite** as the build tool and development server for fast builds and hot reloading
- **TailwindCSS** for utility-first styling with custom CSS variables for theming
- **Framer Motion** for smooth animations and transitions
- **TanStack Query** for efficient data fetching, caching, and real-time updates
- **Wouter** as a lightweight routing solution
- **Radix UI** components for accessible, unstyled UI primitives

### Backend Architecture
- **Python Flask** web framework for REST API endpoints
- **PostgreSQL** for persistent data storage with proper relational design
- **Drizzle ORM** for type-safe database operations and schema management
- **Flask-CORS** for cross-origin resource sharing
- **Pydantic** for data validation and serialization

## Key Components

### Frontend Components
1. **FeaturedConcert** - Displays the current featured concert with voting buttons
2. **Rankings** - Real-time leaderboard showing concert popularity with position tracking
3. **UserBadges** - Gamification system displaying earned achievements
4. **ConcertSearch** - Advanced search and filtering for concerts
5. **ConcertGallery** - Visual gallery of upcoming concerts
6. **VoteAnimation** - Engaging animations for user vote feedback
7. **SocialShare** - Social media sharing functionality

### Backend Components
1. **Concert Management** - CRUD operations for concert data
2. **Voting System** - Vote processing with session tracking
3. **Rankings Engine** - Real-time ranking calculations with position change tracking
4. **Badge System** - Achievement tracking and awarding
5. **User Sessions** - Anonymous session management for personalization

### Database Schema
- **concerts** - Concert information (title, date, venue, price, organizer, description, images)
- **votes** - User votes with session tracking (excited/interested ratings)
- **user_sessions** - Session-based user statistics for badge calculations

## Data Flow

1. **Concert Display**: Concerts rotate every 30 seconds using a timer hook
2. **Vote Processing**: User votes are immediately sent to backend with session tracking
3. **Real-time Updates**: Rankings update every 5 seconds via TanStack Query
4. **Badge Calculation**: User achievements are calculated server-side based on voting patterns
5. **Social Sharing**: Dynamic Open Graph meta tags for concert-specific sharing

## External Dependencies

### Development Tools
- **Drizzle Kit** for database migrations and schema management
- **ESBuild** for production bundling
- **PostCSS** with Autoprefixer for CSS processing

### Python Libraries
- **psycopg2-binary** for PostgreSQL database connectivity
- **python-dotenv** for environment variable management
- **beautifulsoup4** and **requests** for web scraping concert data
- **pillow** for image processing

### Data Sources
- Concert data is scraped from Eventbrite using custom Python scripts
- Real concert images and information from DC area venues
- Fallback piano SVG graphics for missing images

## Deployment Strategy

### Development Environment
- **Replit** platform with Node.js 20 and PostgreSQL 16
- Hot reloading for both frontend and backend
- Environment variables for database credentials

### Production Build
- Frontend builds to `dist/public` directory
- Backend bundles with ESBuild to `dist/index.js`
- Static file serving from Express server
- Database migrations managed through Drizzle Kit

### Performance Optimizations
- TanStack Query for intelligent caching and background updates
- Image lazy loading and error handling
- Optimized bundle splitting with Vite
- Real-time updates without unnecessary re-renders

## Changelog

### June 26, 2025
- Initial setup with voting functionality

### Recent Updates (June 2025)
- **Database Expansion**: Added 580+ authentic concerts from Eventbrite with real promotional images
- **Social Sharing Enhancement**: Implemented concert-specific URLs with dynamic Open Graph meta tags
- **Instagram Post Generator**: iOS-compatible JPEG image creation for Instagram sharing with concert thumbnails and branding
- **Logo Rebranding**: Updated all social media assets to use new SightTune Music Technology logo
- **Educational Integration**: Added Wikipedia links for music genres and venue types
- **YouTube Integration**: Added direct links to classical performance examples
- **External Resources**: Connected to professional concert review sites and artist databases
- **Image Quality Control**: Implemented filtering to exclude placeholder/generic images
- **Responsive Design**: Updated to square thumbnails with mobile-optimized grid layouts
- **Geographic Expansion**: Changed from DC-focused to global classical music events
- **Future-Only Display**: Modified to show only upcoming concerts (today and later)
- **Meta Tag Updates**: Enhanced social media preview images and descriptions

## User Preferences

Preferred communication style: Simple, everyday language.