
import { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { INITIAL_EVENTS } from '../constants';
import { recalculateSchedule } from '../utils';

const LOCAL_STORAGE_KEY = 'program_events_data';

export const useEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
        // Load from Local Storage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setEvents(recalculateSchedule(parsed));
          } catch (e) {
            console.error("Failed to parse local storage", e);
            setEvents(recalculateSchedule(INITIAL_EVENTS));
          }
        } else {
          setEvents(recalculateSchedule(INITIAL_EVENTS));
        }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
      setEvents(recalculateSchedule(INITIAL_EVENTS));
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = async (newEvents: EventItem[]) => {
    // 1. Recalculate times
    const calculatedEvents = recalculateSchedule(newEvents);
    
    // 2. Optimistic update
    setEvents(calculatedEvents);

    // 3. Persist to Local Storage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(calculatedEvents));
    } catch (err: any) {
      console.error('Error saving events:', err);
      setError('Failed to save changes');
    }
  };

  return { events, loading, error, saveEvents };
};
