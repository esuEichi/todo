import { Task, TimeEntry } from '~/types/task'
import { differenceInSeconds } from 'date-fns'

export const sortTasks = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    if (a.completed && !b.completed) return 1
    if (!a.completed && b.completed) return -1
    return 0
  })
}

export const calculateTotalTime = (task: Task): number => {
  if (!task.timeEntries || task.timeEntries.length === 0) {
    return 0
  }

  return task.timeEntries.reduce((total, entry) => {
    if (!entry.start || !entry.end) {
      return total
    }
    const start = new Date(entry.start)
    const end = new Date(entry.end)
    return total + differenceInSeconds(end, start)
  }, 0)
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}時間${minutes}分`
}