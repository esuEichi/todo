import React from 'react'
import { Task } from '~/types/task'

interface TimeReportProps {
  tasks: Task[]
  startDate: Date
  endDate: Date
}

const TimeReport: React.FC<TimeReportProps> = ({ tasks, startDate, endDate }) => {
  const filteredTasks = tasks.filter(task => {
    if (!startDate || !endDate) return true
    return (task.startDate && task.startDate >= startDate && task.startDate <= endDate) ||
           (task.endDate && task.endDate >= startDate && task.endDate <= endDate)
  })

  return (
    <div>
      <h3>時間レポート</h3>
      {filteredTasks.length > 0 ? (
        // タスクの表示ロジック
        <ul>
          {filteredTasks.map(task => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      ) : (
        <p>該当するタスクがありません。</p>
      )}
    </div>
  )
}

export default TimeReport