import React from 'react'
import { Task } from '~/types/task'
import { Button } from "~/components/ui/button"
import { Play, Pause, X } from "lucide-react"

interface PinnedTasksProps {
  tasks: Task[]
  togglePin: (id: string) => void
  toggleTaskRunning: (id: string) => void
  toggleComplete: (id: string) => void
  calculateTotalTime: (task: Task) => number
  formatTime: (seconds: number) => string
}

const PinnedTasks: React.FC<PinnedTasksProps> = ({
  tasks,
  togglePin,
  toggleTaskRunning,
  toggleComplete,
  calculateTotalTime,
  formatTime
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
      <h2 className="text-lg font-bold mb-2">ピン留めされたタスク</h2>
      <div className="flex space-x-4 overflow-x-auto">
        {tasks.map(task => (
          <div key={task.id} className="flex-shrink-0 w-64 bg-gray-100 p-2 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
              <Button variant="ghost" size="icon" onClick={() => togglePin(task.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Button
                variant={task.isRunning ? "destructive" : "default"}
                size="sm"
                onClick={() => toggleTaskRunning(task.id)}
              >
                {task.isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {task.isRunning ? '停止' : '開始'}
              </Button>
              <span>{formatTime(calculateTotalTime(task))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PinnedTasks