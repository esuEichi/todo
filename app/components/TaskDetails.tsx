import React, { useState, useCallback, KeyboardEvent, useEffect } from 'react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, X, Plus, Trash2, Edit2 } from "lucide-react"
import type { Task, TimeEntry, Epic } from '~/types/task'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

interface TaskDetailsProps {
  selectedTask: Task | null;
  updateTaskTitle: (id: string, title: string) => void;
  updateTaskDetails: (id: string, details: string) => void;
  updateTaskDate: (id: string, field: 'startDate' | 'endDate', date: Date | null) => void;
  removeTag: (taskId: string, tag: string) => void;
  addTag: (taskId: string, tag: string) => void;
  updateTimeEntry: (taskId: string, entryIndex: number, field: "start" | "end", value: string) => void;
  addTimeEntry: (taskId: string) => void;
  removeTimeEntry: (taskId: string, entryIndex: number) => void;
  calculateTotalTime: (task: Task) => number;
  formatTime: (seconds: number, showSeconds?: boolean) => string;
  allTags: string[];
  updateAllTags: (newTag: string) => void;
  onClose: () => void;
  updateTaskEpic: (taskId: string, epicId: string | null) => void;
  epics: Epic[];
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  selectedTask,
  updateTaskTitle,
  updateTaskDetails,
  updateTaskDate,
  removeTag,
  addTag,
  updateTimeEntry,
  addTimeEntry,
  removeTimeEntry,
  calculateTotalTime,
  formatTime,
  allTags,
  updateAllTags,
  onClose,
  updateTaskEpic,
  epics,
}) => {
  const [newTag, setNewTag] = useState("")
  const [localTitle, setLocalTitle] = useState("")
  const [localDetails, setLocalDetails] = useState("")
  const [localTags, setLocalTags] = useState<string[]>([])
  const [editingTimeEntry, setEditingTimeEntry] = useState<number | null>(null)
  const [editedStart, setEditedStart] = useState("")
  const [editedEnd, setEditedEnd] = useState("")

  useEffect(() => {
    if (selectedTask) {
      setLocalTitle(selectedTask.title)
      setLocalDetails(selectedTask.details)
      setLocalTags(selectedTask.tags)
    }
  }, [selectedTask])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value)
  }, [])

  const handleTitleUpdate = useCallback(() => {
    if (selectedTask) {
      updateTaskTitle(selectedTask.id, localTitle)
    }
  }, [selectedTask, localTitle, updateTaskTitle])

  const handleTitleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleUpdate()
    }
  }, [handleTitleUpdate])

  const handleDetailsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalDetails(e.target.value)
  }, [])

  const handleDetailsUpdate = useCallback(() => {
    if (selectedTask) {
      updateTaskDetails(selectedTask.id, localDetails)
    }
  }, [selectedTask, localDetails, updateTaskDetails])

  const handleDetailsKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleDetailsUpdate()
    }
  }, [handleDetailsUpdate])

  const formatDate = (date: Date | null) => {
    return date ? format(date, "yyyy年MM月dd日", { locale: ja }) : ''
  }

  const handleAddTag = useCallback(() => {
    if (selectedTask && newTag && !localTags.includes(newTag)) {
      const updatedTags = [...localTags, newTag]
      setLocalTags(updatedTags)
      addTag(selectedTask.id, newTag)
      if (!allTags.includes(newTag)) {
        updateAllTags(newTag)
      }
      setNewTag("")
    }
  }, [selectedTask, newTag, localTags, addTag, allTags, updateAllTags])

  const handleRemoveTag = useCallback((tag: string) => {
    if (selectedTask) {
      removeTag(selectedTask.id, tag)
      setLocalTags(prevTags => prevTags.filter(t => t !== tag))
    }
  }, [selectedTask, removeTag])

  const handleDateSelect = useCallback((field: 'startDate' | 'endDate') => (date: Date | undefined) => {
    if (selectedTask && date) {
      updateTaskDate(selectedTask.id, field, date)
    }
  }, [selectedTask, updateTaskDate])

  const handleEpicChange = useCallback((epicId: string) => {
    if (selectedTask) {
      updateTaskEpic(selectedTask.id, epicId === 'none' ? null : epicId)
    }
  }, [selectedTask, updateTaskEpic])

  const handleAddTimeEntry = useCallback(() => {
    if (selectedTask) {
      addTimeEntry(selectedTask.id)
    }
  }, [selectedTask, addTimeEntry])

  const handleRemoveTimeEntry = useCallback((index: number) => {
    if (selectedTask) {
      removeTimeEntry(selectedTask.id, index)
    }
  }, [selectedTask, removeTimeEntry])

  const handleEditTimeEntry = useCallback((index: number) => {
    if (selectedTask) {
      const entry = selectedTask.timeEntries[index]
      setEditingTimeEntry(index)
      setEditedStart(format(new Date(entry.start), "yyyy-MM-dd'T'HH:mm:ss"))
      setEditedEnd(entry.end ? format(new Date(entry.end), "yyyy-MM-dd'T'HH:mm:ss") : "")
    }
  }, [selectedTask])

  const handleSaveTimeEntry = useCallback(() => {
    if (selectedTask && editingTimeEntry !== null) {
      updateTimeEntry(selectedTask.id, editingTimeEntry, 'start', editedStart)
      updateTimeEntry(selectedTask.id, editingTimeEntry, 'end', editedEnd)
      setEditingTimeEntry(null)
    }
  }, [selectedTask, editingTimeEntry, editedStart, editedEnd, updateTimeEntry])

  const handleCancelEdit = useCallback(() => {
    setEditingTimeEntry(null)
  }, [])

  if (!selectedTask) {
    return (
      <div className="bg-white p-4 shadow overflow-y-auto relative h-full">
        <p className="text-center text-gray-500">タスクを選択してください</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 shadow overflow-y-auto relative h-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2 right-2"
      >
        <X className="h-4 w-4" />
      </Button>
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
        <Select
          onValueChange={handleEpicChange}
          defaultValue={selectedTask.epic?.id || 'none'}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="エピックを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">なし</SelectItem>
            {epics.map((epic) => (
              <SelectItem key={epic.id} value={epic.id}>
                {epic.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                {selectedTask.startDate ? format(selectedTask.startDate, "yyyy年MM月dd日", { locale: ja }) : <span>開始日を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedTask.startDate}
                onSelect={handleDateSelect('startDate')}
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
                {selectedTask.endDate ? format(selectedTask.endDate, "yyyy年MM月dd日", { locale: ja }) : <span>終了日を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedTask.endDate}
                onSelect={handleDateSelect('endDate')}
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
          {localTags.map((tag, index) => (
            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTag(tag)}
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
          <Button onClick={handleAddTag}>
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
        <p className="mt-1">{formatTime(calculateTotalTime(selectedTask), true)}</p>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">時間エントリー</label>
        <div className="space-y-2">
          {selectedTask.timeEntries.map((entry, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded-lg shadow-sm">
              {editingTimeEntry === index ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="datetime-local"
                      value={editedStart}
                      onChange={(e) => setEditedStart(e.target.value)}
                      className="flex-1 text-xs"
                      step="1"
                    />
                    <span>-</span>
                    <Input
                      type="datetime-local"
                      value={editedEnd}
                      onChange={(e) => setEditedEnd(e.target.value)}
                      className="flex-1 text-xs"
                      step="1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleSaveTimeEntry}>
                      保存
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex-1 mr-2">
                    <span className="font-medium">{format(new Date(entry.start), "yyyy-MM-dd HH:mm:ss")}</span>
                    <span className="mx-1">-</span>
                    <span className="font-medium">{entry.end ? format(new Date(entry.end), "yyyy-MM-dd HH:mm:ss") : "進行中"}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-gray-500">
                      {formatTime(calculateTotalTime(selectedTask), true)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTimeEntry(index)}
                      className="p-1"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTimeEntry(index)}
                      className="text-red-500 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTimeEntry}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          時間エントリーを追加
        </Button>
      </div>
    </div>
  )
}

export default TaskDetails