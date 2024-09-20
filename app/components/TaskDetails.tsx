import React, { useState, useCallback, KeyboardEvent } from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { format, parse } from "date-fns"
import { ja } from "date-fns/locale"
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
  const [newTag, setNewTag] = useState("")
  const [localTitle, setLocalTitle] = useState(selectedTask.title)
  const [localDetails, setLocalDetails] = useState(selectedTask.details)

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value)
  }, [])

  const handleTitleUpdate = useCallback(() => {
    updateTaskTitle(selectedTask.id, localTitle)
  }, [selectedTask.id, localTitle, updateTaskTitle])

  const handleTitleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleUpdate()
    }
  }, [handleTitleUpdate])

  const handleDetailsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalDetails(e.target.value)
  }, [])

  const handleDetailsUpdate = useCallback(() => {
    updateTaskDetails(selectedTask.id, localDetails)
  }, [selectedTask.id, localDetails, updateTaskDetails])

  const handleDetailsKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleDetailsUpdate()
    }
  }, [handleDetailsUpdate])

  const formatDate = (date: Date | null) => {
    return date ? format(date, "yyyy年MM月dd日", { locale: ja }) : ''
  }

  const parseDate = (dateString: string) => {
    return parse(dateString, "yyyy年MM月dd日", new Date(), { locale: ja })
  }

  return (
    <div className="w-1/3 bg-white p-4 shadow overflow-y-auto">
      <div className="mb-4">
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">タイトル</label>
        <Input
          id="task-title"
          type="text"
          value={localTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleUpdate}
          onKeyDown={handleTitleKeyDown}
          className="mt-1"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="task-epic" className="block text-sm font-medium text-gray-700">エピック</label>
        <Input
          id="task-epic"
          type="text"
          value={selectedTask.epic?.title || ''}
          readOnly
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
                {formatDate(selectedTask.startDate) || <span>開始日を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedTask.startDate}
                onSelect={(date) => updateTaskDate(selectedTask.id, 'startDate', date)}
                initialFocus
                locale={ja}
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
                {formatDate(selectedTask.endDate) || <span>終了日を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedTask.endDate}
                onSelect={(date) => updateTaskDate(selectedTask.id, 'endDate', date)}
                initialFocus
                locale={ja}
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
          value={localDetails}
          onChange={handleDetailsChange}
          onBlur={handleDetailsUpdate}
          onKeyDown={handleDetailsKeyDown}
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
              value={entry.start ? format(new Date(entry.start), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => updateTimeEntry(selectedTask.id, index, 'start', e.target.value)}
              className="mr-2"
            />
            <Input
              type="datetime-local"
              value={entry.end ? format(new Date(entry.end), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => updateTimeEntry(selectedTask.id, index, 'end', e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskDetails