import React, { useRef } from 'react'
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { PinIcon } from "lucide-react"
import type { Task } from '~/types/task'

interface PinnedTasksProps {
  tasks: Task[];
  togglePin: (id: string) => void;
  toggleTaskRunning: (id: string) => void;
  calculateTotalTime: (timeEntries: Task['timeEntries']) => number;
  formatTime: (seconds: number) => string;
}

const PinnedTasks: React.FC<PinnedTasksProps> = ({
  tasks,
  togglePin,
  toggleTaskRunning,
  calculateTotalTime,
  formatTime
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-white p-4 shadow" ref={scrollContainerRef}>
      <div className="flex overflow-x-auto space-x-4">
        {tasks.map(task => (
          <div key={task.id} className="flex-shrink-0 w-64 bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{task.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePin(task.id)}
                className="text-blue-500"
              >
                <PinIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Switch
                checked={task.isRunning}
                onCheckedChange={() => toggleTaskRunning(task.id)}
              />
              <span>{formatTime(calculateTotalTime(task.timeEntries))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PinnedTasks