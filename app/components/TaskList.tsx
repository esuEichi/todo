import React from 'react'
import { Task } from '~/types/task'
import { Checkbox } from "~/components/ui/checkbox"
import { Button } from "~/components/ui/button"
import { Star, Trash2 } from "lucide-react"

interface TaskListProps {
  filteredTasks: Task[]
  editingTaskId: string | null
  setEditingTaskId: (id: string | null) => void
  toggleComplete: (id: string) => void
  updateTaskTitle: (id: string, title: string) => void
  toggleImportant: (id: string) => void
  togglePin: (id: string) => void
  removeTag: (taskId: string, tag: string) => void
  addTag: (taskId: string, tag: string) => void
  setSelectedTask: (task: Task) => void
  deleteTask: (id: string) => void
}

const TaskList: React.FC<TaskListProps> = ({
  filteredTasks,
  editingTaskId,
  setEditingTaskId,
  toggleComplete,
  updateTaskTitle,
  toggleImportant,
  togglePin,
  removeTag,
  addTag,
  setSelectedTask,
  deleteTask
}) => {
  return (
    <ul className="space-y-2">
      {filteredTasks.map((task) => (
        <li
          key={task.id}
          className="bg-white p-4 rounded shadow flex items-center space-x-4"
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => toggleComplete(task.id)}
          />
          {editingTaskId === task.id ? (
            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTaskTitle(task.id, e.target.value)}
              onBlur={() => setEditingTaskId(null)}
              autoFocus
              className="flex-1"
            />
          ) : (
            <span
              onClick={() => setEditingTaskId(task.id)}
              className="flex-1 cursor-pointer"
            >
              {task.title}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleImportant(task.id)}
          >
            <Star className={task.important ? "text-yellow-400" : "text-gray-400"} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePin(task.id)}
          >
            📌
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTask(task)}
          >
            詳細
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask(task.id)}
            className="text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}

export default TaskList
