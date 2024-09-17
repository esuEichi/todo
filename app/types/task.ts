// app/types/task.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  tags: string[];
  epic: string;
  details: string;
  startDate: Date | null;
  endDate: Date | null;
  pinned: boolean;
  timeEntries: TimeEntry[];
  isRunning: boolean;
}

export interface TimeEntry {
  start: string;
  end: string | null;
}