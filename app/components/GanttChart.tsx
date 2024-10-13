import React from 'react'
import { Task } from '~/types/task'
import { format, differenceInDays, addDays, isWithinInterval } from 'date-fns'
import { ja } from 'date-fns/locale'

interface GanttChartProps {
  tasks: Task[]
  startDate: Date
  endDate: Date
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, startDate, endDate }) => {
  const totalDays = differenceInDays(endDate, startDate) + 1

  const filteredTasks = tasks.filter(task => 
    task.startDate && task.endDate &&
    isWithinInterval(new Date(task.startDate), { start: startDate, end: endDate }) ||
    isWithinInterval(new Date(task.endDate), { start: startDate, end: endDate })
  )

  return (
    <div className="overflow-x-auto mt-4">
      <div className="min-w-max">
        <div className="flex">
          <div className="w-40 font-bold">タスク名</div>
          {Array.from({ length: totalDays }).map((_, index) => (
            <div key={index} className="w-8 text-center text-xs">
              {format(addDays(startDate, index), 'd', { locale: ja })}
            </div>
          ))}
        </div>
        {filteredTasks.map(task => (
          <div key={task.id} className="flex">
            <div className="w-40 truncate">{task.title}</div>
            {Array.from({ length: totalDays }).map((_, index) => {
              const currentDate = addDays(startDate, index)
              const isInRange = task.startDate && task.endDate &&
                isWithinInterval(currentDate, { start: task.startDate, end: task.endDate })
              return (
                <div key={index} className={`w-8 h-6 ${isInRange ? 'bg-blue-500' : ''}`} />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GanttChart