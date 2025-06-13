from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
from typing import Optional, List, Dict
import json

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PGHOST'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD'),
        port=os.getenv('PGPORT')
    )

# Pydantic models
class Concert(BaseModel):
    id: int
    title: str
    date: str
    venue: str
    price: str
    organizer: str
    description: str
    imageUrl: str

class Vote(BaseModel):
    id: int
    concertId: int
    voteType: str
    createdAt: Optional[str] = None

class InsertVote(BaseModel):
    concertId: int
    voteType: str

class ConcertWithVotes(Concert):
    excitedVotes: int
    interestedVotes: int
    totalVotes: int
    weightedScore: int
    rank: int
    previousRank: Optional[int] = None
    rankChange: Optional[int] = None

# Initialize database with concert data
def initialize_concerts():
    concert_data = [
        {
            'title': "José Luiz Martins' Brazil Project",
            'date': "Sunday at 7:00 PM",
            'venue': "Takoma Station Tavern",
            'price': "From $23.18",
            'organizer': "Jazz Kitchen Productions",
            'description': "Experience the vibrant rhythms of Brazilian jazz with internationally acclaimed pianist José Luiz Martins.",
            'image_url': "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1051553063%2F53596862044%2F1%2Foriginal.20250612-114654?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=437618b6bf8a617d9e5b15c2f10c5200"
        },
        {
            'title': "Harpsichordist Jory Vinikour plays Sparkling Scarlatti Sonatas",
            'date': "Sat, Jun 28, 8:00 PM",
            'venue': "St. Columba's Episcopal Church",
            'price': "From $63.74",
            'organizer': "Capriccio Baroque",
            'description': "Renowned harpsichordist Jory Vinikour brings Scarlatti's brilliant sonatas to life in an intimate baroque setting.",
            'image_url': "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F923324233%2F226582576668%2F1%2Foriginal.20241226-115525?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=b5c46a7077ecbac3dfc3ff9b5bed4711"
        },
        {
            'title': "Washington | 2025 Scholarship Pianists Debut Recital",
            'date': "Fri, Jul 18, 7:30 PM",
            'venue': "La Maison Française, Embassy of France",
            'price': "Free",
            'organizer': "Embassy Cultural Program",
            'description': "Young scholarship recipients showcase their exceptional talent in this debut performance at the French Embassy.",
            'image_url': "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1012220253%2F90224703647%2F1%2Foriginal.20250418-200017?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=5e-05&fp-y=5e-05&s=5ff3ae740072ef59d20791697d58778f"
        },
        {
            'title': "Fatty Liver Foundation Benefit Recital | Celimene Daudet, Piano",
            'date': "Thu, Oct 23, 7:30 PM",
            'venue': "La Maison Française, Embassy of France",
            'price': "Donation",
            'organizer': "Fatty Liver Foundation",
            'description': "Celebrated pianist Celimene Daudet performs in support of fatty liver disease research and awareness.",
            'image_url': "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F838593109%2F90224703647%2F1%2Foriginal.20240831-144333?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=5e-05&fp-y=5e-05&s=03ddc74cba0bd3eea567787ed92885b6"
        },
        {
            'title': "DC Chamber Musicians Season Finale",
            'date': "Saturday at 3:00 PM",
            'venue': "St Thomas Episcopal Church",
            'price': "From $35.00",
            'organizer': "DC Chamber Musicians",
            'description': "The season concludes with an extraordinary chamber music performance featuring piano and strings.",
            'image_url': "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1034149363%2F1463811440923%2F1%2Foriginal.20250519-164932?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=a8ec10685630b68281387c02e91c3350"
        },
        {
            'title': "Considering Matthew Shepard",
            'date': "Fri, Jul 11, 7:30 PM",
            'venue': "Washington National Cathedral",
            'price': "From $23.18",
            'organizer': "Berkshire Choral",
            'description': "A powerful choral and piano performance honoring the memory of Matthew Shepard.",
            'image_url': "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1040576603%2F528497426627%2F1%2Foriginal.20250528-133310?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.512310606061&fp-y=0.224252491694&s=359684fec5bab0f97ff22326e33009c3"
        }
    ]
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Check if concerts already exist
    cur.execute("SELECT COUNT(*) FROM concerts")
    result = cur.fetchone()
    count = result[0] if result else 0
    
    if count == 0:
        for data in concert_data:
            cur.execute("""
                INSERT INTO concerts (title, date, venue, price, organizer, description, image_url)
                VALUES (%(title)s, %(date)s, %(venue)s, %(price)s, %(organizer)s, %(description)s, %(image_url)s)
            """, data)
        conn.commit()
    
    cur.close()
    conn.close()

# Initialize concerts on startup
initialize_concerts()

@app.route('/api/concerts', methods=['GET'])
def get_concerts():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, title, date, venue, price, organizer, description, image_url as imageUrl FROM concerts")
        concerts = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([dict(concert) for concert in concerts])
    except Exception as e:
        return jsonify({'error': 'Failed to fetch concerts'}), 500

@app.route('/api/concerts/<int:concert_id>', methods=['GET'])
def get_concert_by_id(concert_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, title, date, venue, price, organizer, description, image_url as imageUrl FROM concerts WHERE id = %s", (concert_id,))
        concert = cur.fetchone()
        cur.close()
        conn.close()
        
        if not concert:
            return jsonify({'error': 'Concert not found'}), 404
            
        return jsonify(dict(concert))
    except Exception as e:
        return jsonify({'error': 'Failed to fetch concert'}), 500

@app.route('/api/vote', methods=['POST'])
def submit_vote():
    try:
        data = request.get_json()
        vote_data = InsertVote(**data)
        
        # Verify concert exists
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM concerts WHERE id = %s", (vote_data.concertId,))
        concert = cur.fetchone()
        
        if not concert:
            cur.close()
            conn.close()
            return jsonify({'error': 'Concert not found'}), 404
        
        # Verify vote type is valid
        if vote_data.voteType not in ['excited', 'interested']:
            cur.close()
            conn.close()
            return jsonify({'error': 'Invalid vote type'}), 400
        
        # Insert vote
        cur.execute("""
            INSERT INTO votes (concert_id, vote_type)
            VALUES (%s, %s)
            RETURNING id, concert_id, vote_type, created_at
        """, (vote_data.concertId, vote_data.voteType))
        
        vote = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if vote:
            return jsonify({
                'id': vote[0],
                'concertId': vote[1],
                'voteType': vote[2],
                'createdAt': vote[3].isoformat() if vote[3] else None
            })
        else:
            return jsonify({'error': 'Failed to create vote'}), 500
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid vote data'}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to submit vote'}), 500

@app.route('/api/vote-stats', methods=['GET'])
def get_vote_stats():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT concert_id, vote_type, COUNT(*) as count
            FROM votes
            GROUP BY concert_id, vote_type
        """)
        
        vote_results = cur.fetchall()
        cur.close()
        conn.close()
        
        stats = {}
        for result in vote_results:
            concert_id, vote_type, count = result
            if concert_id not in stats:
                stats[concert_id] = {'excited': 0, 'interested': 0}
            stats[concert_id][vote_type] = count
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch vote statistics'}), 500

@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get concerts with vote counts
        cur.execute("""
            SELECT 
                c.id, c.title, c.date, c.venue, c.price, c.organizer, c.description, 
                c.image_url as imageUrl,
                COALESCE(SUM(CASE WHEN v.vote_type = 'excited' THEN 1 ELSE 0 END), 0) as excitedVotes,
                COALESCE(SUM(CASE WHEN v.vote_type = 'interested' THEN 1 ELSE 0 END), 0) as interestedVotes,
                COALESCE(COUNT(v.id), 0) as totalVotes,
                COALESCE(SUM(CASE WHEN v.vote_type = 'excited' THEN 2 WHEN v.vote_type = 'interested' THEN 1 ELSE 0 END), 0) as weightedScore
            FROM concerts c
            LEFT JOIN votes v ON c.id = v.concert_id
            GROUP BY c.id, c.title, c.date, c.venue, c.price, c.organizer, c.description, c.image_url
            ORDER BY weightedScore DESC
        """)
        
        concerts = cur.fetchall()
        cur.close()
        conn.close()
        
        # Add ranking information
        ranked_concerts = []
        for index, concert in enumerate(concerts):
            concert_dict = dict(concert)
            concert_dict['rank'] = index + 1
            concert_dict['previousRank'] = index + 1  # For now, same as current rank
            concert_dict['rankChange'] = 0  # No change for simplicity
            ranked_concerts.append(concert_dict)
        
        return jsonify(ranked_concerts)
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch rankings'}), 500

# Serve React app
@app.route('/')
def serve_react_app():
    if app.static_folder:
        return send_from_directory(app.static_folder, 'index.html')
    return "Frontend not built yet", 404

@app.route('/<path:path>')
def serve_static_files(path):
    if app.static_folder:
        return send_from_directory(app.static_folder, path)
    return "File not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)