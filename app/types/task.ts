// app/types/task.ts
export interface Epic {
  id: string;
  title: string;
  description: string;
  createdAt?: string; // オプショナルプロパティとして追加
};

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  tags: string[];
  epic: Epic | null;
  details: string;
  startDate: Date | null;  // string から Date に変更
  endDate: Date | null;    // string から Date に変更
  pinned: boolean;
  timeEntries: TimeEntry[];
  isRunning: boolean;
}

export interface TimeEntry {
  start: string;
  end: string | null;
}