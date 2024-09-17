import { differenceInSeconds, parseISO } from "date-fns"
import type { Task, TimeEntry } from '~/types/task'

export const sortTasks = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1
    return 0
  })
}

export const calculateTotalTime = (timeEntries: TimeEntry[]): number => {
  return timeEntries.reduce((total, entry) => {
    if (entry.start && entry.end) {
      return total + differenceInSeconds(parseISO(entry.end), parseISO(entry.start))
    }
    return total
  }, 0)
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}