export type EventType = 'date' | 'escape' | 'big_trip' | 'custom';
export type EventStatus = 'planned' | 'done' | 'missed';
export type IdeaLevel = 'chill' | 'romantic' | 'adventure' | 'home' | 'surprise';
export type RitualStatus = 'ok' | 'due' | 'missing';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Couple {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface CoupleMember {
  id: string;
  couple_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface CalendarEvent {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  type: EventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  budget: number | null;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventChecklistItem {
  id: string;
  event_id: string;
  text: string;
  is_done: boolean;
  created_at: string;
}

export interface DateIdea {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  category: string;
  level: IdeaLevel;
  estimated_budget: number | null;
  estimated_duration: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
}

export interface Memory {
  id: string;
  couple_id: string;
  event_id: string;
  title: string;
  note: string | null;
  photo_url: string | null;
  created_by: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  event_id: string;
  remind_at: string;
  sent: boolean;
  created_at: string;
}

export interface RitualState {
  status: RitualStatus;
  last_event: CalendarEvent | null;
  next_due_date: Date | null;
  days_remaining: number | null;
}

export interface Rule222State {
  date: RitualState;
  escape: RitualState;
  big_trip: RitualState;
}
