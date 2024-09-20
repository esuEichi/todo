import React from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import { Star, Pin, X, GripVertical, MoreVertical } from "lucide-react" // Pin を使用
import { Draggable, Droppable } from 'react-beautiful-dnd'
import type { Task } from '~/types/task'

interface TaskListProps {
  filteredTasks: Task[];
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  toggleComplete: (id: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
  toggleImportant: (id: string) => void;
  togglePin: (id: string) => void;
  removeTag: (taskId: string, tag: string) => void;
  addTag: (taskId: string, tag: string) => void;
  setSelectedTask: (task: Task) => void;
  deleteTask: (id: string) => void; // 削除機能を追加
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
  deleteTask // 削除機能を追加
}) => {
  return (
    <Droppable droppableId="tasks">
      {(provided) => (
        <ul {...provided.droppableProps} ref={provided.innerRef}>
          {filteredTasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <li
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`mb-4 bg-white p-3 rounded shadow ${snapshot.isDragging ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center mb-2">
                    <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleComplete(task.id)}
                    />
                    {editingTaskId === task.id ? (
                      <Input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                        onBlur={() => setEditingTaskId(null)}
                        autoFocus
                        className="ml-2 flex-1"
                      />
                    ) : (
                      <span
                        className={`ml-2 flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}`}
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setSelectedTask(task);
                        }}
                      >
                        {task.title}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleImportant(task.id)}
                      className={`${task.important ? 'text-yellow-500' : ''} hover:bg-transparent`}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePin(task.id)}
                      className={`${task.pinned ? 'text-blue-500' : ''} hover:bg-transparent`}
                    >
                      <Pin className="h-4 w-4" /> {/* PinIcon を Pin に変更 */}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)} // 削除機能を呼び出す
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.tags.map((tag) => (
                      <span key={`${task.id}-${tag}`} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTag(task.id, tag)}
                          className="ml-1 h-4 w-4 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </span>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget as HTMLFormElement;
                      const newTagInput = form.elements.namedItem('newTag') as HTMLInputElement;
                      const newTag = newTagInput.value.trim()
                      if (newTag && !task.tags.includes(newTag)) {
                        addTag(task.id, newTag)
                        form.reset()
                      }
                    }}
                    className="mt-2"
                  >
                    <Input
                      type="text"
                      name="newTag"
                      placeholder="新しいタグを追加"
                      className="text-sm"
                    />
                  </form>
                </li>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  )
}

export default TaskList