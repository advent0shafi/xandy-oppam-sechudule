
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
  if (!timeStr.includes(':')) return 0;
  let [h, m] = timeStr.split(':').map(Number);
  
  // Heuristic for this specific event: 
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
  const updatedEvents = [...events];
  
  // Logic: 
  // Indices 0-8 are "Morning/Static" (08:30 block). We do NOT touch their times automatically.
  // Index 9 is the Anchor for the Program. We FORCE it to 09:50.
  // Indices 10+ are calculated based on previous event's start + duration.
  
  const DYNAMIC_START_INDEX = 9;
  const ANCHOR_TIME = "09:50";

  // If we don't have enough events to reach the dynamic section, just return
  if (updatedEvents.length <= DYNAMIC_START_INDEX) return updatedEvents;

  // 1. Force the anchor time
  updatedEvents[DYNAMIC_START_INDEX] = {
      ...updatedEvents[DYNAMIC_START_INDEX],
      startTime: ANCHOR_TIME
  };

  // 2. Cascade calculations for subsequent events
  for (let i = DYNAMIC_START_INDEX + 1; i < updatedEvents.length; i++) {
    const prevEvent = updatedEvents[i - 1];
    const durationMins = parseDurationToMinutes(prevEvent.duration);
    
    // If previous event has no duration (0), start time is same as previous
    // If it has duration, add it.
    const newStartTime = addMinutesToTime(prevEvent.startTime, durationMins);
    
    updatedEvents[i] = {
      ...updatedEvents[i],
      startTime: newStartTime
    };
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
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Remove header row if it exists
  const dataRows = rows.slice(1);

  return dataRows.map((row, index) => {
    // Map CSV columns to EventItem. 
    // Assumed Order: Start Time, Duration, Title, Description, Team Lead, Team Members, Logistics, Notes, Script, Category
    return {
      id: Date.now().toString() + index,
      startTime: row[0] || '',
      duration: row[1] || '',
      title: row[2] || 'Untitled',
      description: row[3] || '',
      teamLead: row[4] || '',
      teamMembers: row[5] || '',
      logistics: row[6] || '',
      notes: row[7] || '',
      script: row[8] || '',
      category: (row[9] as any) || 'general'
    };
  }).filter(e => e.title); // Filter out empty rows
};
