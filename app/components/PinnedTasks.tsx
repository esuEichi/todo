import React from 'react'
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Pin, Play, Pause } from "lucide-react"
import type { Task } from '~/types/task'

interface PinnedTasksProps {
  tasks: Task[];
  togglePin: (id: string) => void;
  toggleTaskRunning: (id: string) => void;
  toggleComplete: (id: string) => void;
  calculateTotalTime: (timeEntries: Task['timeEntries']) => number;
  formatTime: (seconds: number) => string;
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
    <div className="bg-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-2">ピン留めされたタスク</h2>
      <div className="flex flex-wrap gap-2">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-2 rounded shadow flex items-center">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleComplete(task.id)}
              className="mr-2"
            />
            <span className={`mr-2 ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleTaskRunning(task.id)}
              className={`min-w-[80px] ${task.isRunning ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
            >
              {task.isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  停止
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  開始
                </>
              )}
            </Button>
            <span className="ml-2 min-w-[60px] text-right">{formatTime(calculateTotalTime(task.timeEntries))}</span>
            <Button variant="ghost" size="icon" onClick={() => togglePin(task.id)}>
              <Pin className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PinnedTasks