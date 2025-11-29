
import { EventItem } from './types';

// Helper to parse duration strings like "10 mns", "1 hr", "45 mns" into minutes
export const parseDurationToMinutes = (durationStr: string): number => {
  if (!durationStr) return 0;
  const d = durationStr.toLowerCase().trim();
  
  // Extract the first number found
  const match = d.match(/(\d+)/);
  if (!match) return 0;
  
  let val = parseInt(match[0], 10);
  
  // If unit indicates hours, convert to minutes
  if (d.includes('hr') || d.includes('hour')) {
    val = val * 60;
  }
  
  return val;
};

// Helper to convert time string "HH:MM" (12h format heuristics) to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  let [h, m] = timeStr.split(':').map(Number);
  
  // Heuristic for this specific event schedule: 
  // If hour is 1, 2, 3, 4, 5, 6, 7 => assume PM (13:00 - 19:00)
  // If hour is 8, 9, 10, 11 => assume AM
  // If hour is 12 => assume 12 PM (Noon)
  
  if (h < 8) {
    h += 12;
  }
  // 12 is already 12, no change needed.
  
  return h * 60 + m;
};

// Helper to convert minutes from midnight back to "HH:MM" 12h format string
const minutesToTimeStr = (totalMinutes: number): string => {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  
  let h12 = h24;
  if (h12 > 12) h12 -= 12;
  if (h12 === 0) h12 = 12;
  
  return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  const currentMinutes = timeToMinutes(timeStr);
  const newMinutes = currentMinutes + minutesToAdd;
  return minutesToTimeStr(newMinutes);
};

// Main logic to recalculate schedule
export const recalculateSchedule = (events: EventItem[]): EventItem[] => {
  if (!events || events.length === 0) return [];

  const updatedEvents = [...events];
  
  // Find the anchor event. The default anchor is "Intro: Beyond Learning" at 09:50.
  const anchorIndex = updatedEvents.findIndex(e => 
    e.title.toLowerCase().includes('intro: beyond learning')
  );

  // If we found the specific anchor event, we enforce the timeline logic.
  // Otherwise, we assume it's a custom schedule and respect the provided times (unless we're dragging).
  
  if (anchorIndex !== -1) {
      const ANCHOR_TIME = "09:50";
      
      // 1. Force the anchor time
      updatedEvents[anchorIndex] = {
          ...updatedEvents[anchorIndex],
          startTime: ANCHOR_TIME
      };

      // 2. Cascade calculations for subsequent events
      for (let i = anchorIndex + 1; i < updatedEvents.length; i++) {
        const prevEvent = updatedEvents[i - 1];
        const durationMins = parseDurationToMinutes(prevEvent.duration);
        
        const newStartTime = addMinutesToTime(prevEvent.startTime, durationMins);
        
        updatedEvents[i] = {
          ...updatedEvents[i],
          startTime: newStartTime
        };
      }
  } else {
      // For completely custom schedules (no "Intro: Beyond Learning"),
      // we can optionally chain times based on the FIRST event if the user edits a duration.
      // But for now, let's just ensure if we edit a duration, subsequent times update.
      // We will assume the first event's time is fixed.
      
      for (let i = 1; i < updatedEvents.length; i++) {
        const prevEvent = updatedEvents[i - 1];
        if (prevEvent.duration && parseDurationToMinutes(prevEvent.duration) > 0) {
           const durationMins = parseDurationToMinutes(prevEvent.duration);
           updatedEvents[i] = {
             ...updatedEvents[i],
             startTime: addMinutesToTime(prevEvent.startTime, durationMins)
           };
        }
      }
  }
  
  return updatedEvents;
};

export const parseCSV = (csvText: string): EventItem[] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Robust CSV parsing to handle newlines inside quotes
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Skip CRLF pair
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  // Push the last field/row if exists
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Remove header row if it exists (heuristic: check for "Start Time" or "Title")
  let dataRows = rows;
  if (rows.length > 0 && (rows[0][0]?.toLowerCase().includes('start time') || rows[0][2]?.toLowerCase().includes('title'))) {
      dataRows = rows.slice(1);
  }

  return dataRows.map((row, index) => {
    // Map CSV columns to EventItem. 
    // Assumed Order based on user CSV: 
    // 0: Start Time, 1: Duration, 2: Title, 3: Description, 4: Team Lead, 
    // 5: Team Members, 6: Logistics, 7: Notes, 8: Script, 9: Category
    
    // Safety check for short rows
    const safeGet = (idx: number) => row[idx] ? row[idx].trim() : '';

    return {
      id: Date.now().toString() + index,
      startTime: safeGet(0) || '',
      duration: safeGet(1) || '',
      title: safeGet(2) || 'Untitled',
      description: safeGet(3),
      teamLead: safeGet(4),
      teamMembers: safeGet(5),
      logistics: safeGet(6),
      notes: safeGet(7),
      script: safeGet(8),
      category: (safeGet(9) as any) || 'general'
    };
  }).filter(e => e.title && e.title !== 'Untitled'); // Filter out empty rows
};
