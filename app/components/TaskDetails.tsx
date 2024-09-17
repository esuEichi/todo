import React from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { format, parseISO } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import type { Task, TimeEntry } from '~/types/task'

interface TaskDetailsProps {
  selectedTask: Task;
  updateTaskTitle: (id: string, title: string) => void;
  updateTaskDetails: (id: string, details: string) => void;
  updateTaskDate: (id: string, field: 'startDate' | 'endDate', date: Date | null) => void;
  removeTag: (taskId: string, tag: string) => void;
  addTag: (taskId: string, tag: string) => void;
  updateTimeEntry: (taskId: string, entryIndex: number, field: 'start' | 'end', value: string) => void;
  calculateTotalTime: (timeEntries: TimeEntry[]) => number;
  formatTime: (seconds: number) => string;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  selectedTask,
  updateTaskTitle,
  updateTaskDetails,
  updateTaskDate,
  removeTag,
  addTag,
  updateTimeEntry,
  calculateTotalTime,
  formatTime
}) => {
  const [newTag, setNewTag] = React.useState("")

  return (
    <div className="w-1/3 bg-white p-4 shadow overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">タスク詳細</h2>
      <div className="mb-4">
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">タイトル</label>
        <Input
          id="task-title"
          type="text"
          value={selectedTask.title}
          onChange={(e) => updateTaskTitle(selectedTask.id, e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="task-epic" className="block text-sm font-medium text-gray-700">エピック</label>
        <Input
          id="task-epic"
          type="text"
          value={selectedTask.epic}
          onChange={(e) => updateTaskTitle(selectedTask.id, e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="mb-4 flex space-x-4">
        <div className="flex-1">
          <label htmlFor="task-start-date" className="block text-sm font-medium text-gray-700">開始日</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="task-start-date"
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!selectedTask.startDate && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedTask.startDate ? format(selectedTask.startDate, "PPP") : <span>開始日を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedTask.startDate || undefined}
                onSelect={(date) => updateTaskDate(selectedTask.id, 'startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <label htmlFor="task-end-date" className="block text-sm font-medium text-gray-700">終了日</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="task-end-date"
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!selectedTask.endDate && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedTask.endDate ? format(selectedTask.endDate, "PPP") : <span>終了日を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedTask.endDate || undefined}
                onSelect={(date) => updateTaskDate(selectedTask.id, 'endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">タグ</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTask.tags.map((tag, index) => (
            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTag(selectedTask.id, tag)}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          ))}
        </div>
        <div className="flex mt-2">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="新しいタグを追加"
            className="flex-1 mr-2"
          />
          <Button onClick={() => {
            if (newTag && !selectedTask.tags.includes(newTag)) {
              addTag(selectedTask.id, newTag)
              setNewTag("")
            }
          }}>
            追加
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="task-details" className="block text-sm font-medium text-gray-700">詳細</label>
        <Textarea
          id="task-details"
          value={selectedTask.details}
          onChange={(e) => updateTaskDetails(selectedTask.id, e.target.value)}
          className="mt-1"
          rows={5}
          placeholder="タスクの詳細を入力してください"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">実施時間</label>
        <p className="mt-1">{formatTime(calculateTotalTime(selectedTask.timeEntries))}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">時間エントリー</label>
        {selectedTask.timeEntries.map((entry, index) => (
          <div key={index} className="flex items-center mt-2">
            <Input
              type="datetime-local"
              value={entry.start ? format(parseISO(entry.start), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => updateTimeEntry(selectedTask.id, index, 'start', e.target.value)}
              className="mr-2"
            />
            <Input
              type="datetime-local"
              value={entry.end ? format(parseISO(entry.end), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => updateTimeEntry(selectedTask.id, index, 'end', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskDetails