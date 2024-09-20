// app/types/task.ts
export type Epic = {
  id: string;
  title: string;
  description: string;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  tags: string[];
  epic: Epic | null;
  details: string;
  startDate: Date | null;
  endDate: Date | null;
  pinned: boolean;
  timeEntries: TimeEntry[];
  isRunning: boolean;
};

export interface TimeEntry {
  start: string;
  end: string | null;
}