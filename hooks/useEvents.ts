
import { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { INITIAL_EVENTS } from '../constants';
import { recalculateSchedule } from '../utils';
import { supabase } from '../supabaseClient';

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
      if (supabase) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('startTime', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
           // We need to ensure dynamic times are correct even if fetched from DB
           const calculated = recalculateSchedule(data as EventItem[]);
           setEvents(calculated);
        } else {
           // Fallback to initial if DB is empty (first run)
           setEvents(recalculateSchedule(INITIAL_EVENTS));
        }

      } else {
        // Fallback to Local Storage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setEvents(recalculateSchedule(JSON.parse(stored)));
        } else {
          setEvents(recalculateSchedule(INITIAL_EVENTS));
        }
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
      // Fallback to constants on error
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

    // 3. Persist
    try {
      if (supabase) {
        // Upsert to Supabase
        // Note: For a real app, you might want to sync individual changes to save bandwidth,
        // but for this demo, upserting the batch or just the changed item is fine.
        // Simplified: We assume the user wants to save the whole state.
        // In a real DB scenario, we would usually only update the modified row.
        const { error } = await supabase.from('events').upsert(calculatedEvents);
        if (error) throw error;
      } else {
        // Save to Local Storage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(calculatedEvents));
      }
    } catch (err: any) {
      console.error('Error saving events:', err);
      setError('Failed to save changes');
    }
  };

  return { events, loading, error, saveEvents };
};
