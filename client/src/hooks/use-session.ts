import { useState, useEffect } from 'react';

const SESSION_STORAGE_KEY = 'concert_voting_session_id';

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get existing session from localStorage or create new one
    let existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!existingSessionId) {
      // Generate new session ID
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(SESSION_STORAGE_KEY, existingSessionId);
    }
    
    setSessionId(existingSessionId);
  }, []);

  return sessionId;
}