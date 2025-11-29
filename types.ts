
export interface EventItem {
  id: string;
  startTime: string;
  duration: string;
  title: string;
  description: string;
  teamLead: string;
  teamMembers: string;
  logistics: string;
  notes: string;
  script?: string;
  category: 'general' | 'stage' | 'food' | 'registration';
  isExpanded?: boolean;
}

export type EventColumn = keyof Omit<EventItem, 'id' | 'isExpanded' | 'category'>;

export const CATEGORY_STYLES = {
  general: 'bg-gray-100 text-gray-800 border-gray-200',
  stage: 'bg-rose-50 text-rose-600 border-rose-100',
  food: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  registration: 'bg-blue-50 text-blue-600 border-blue-100',
};
