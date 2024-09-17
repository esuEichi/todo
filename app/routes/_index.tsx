import { useState, useMemo, useCallback, useRef, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal} from 'react'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Checkbox } from "~/components/ui/checkbox"
import { Textarea } from "~/components/ui/textarea"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Switch } from "~/components/ui/switch"
import { format, differenceInSeconds, parseISO } from "date-fns"
import { CalendarIcon, Star, Plus, MoreVertical, X, GripVertical, Search, PinIcon } from "lucide-react"

import type { LoaderFunction } from '@remix-run/node';
import type { Task, TimeEntry } from '~/types/task';
import type { LoaderData } from '~/types/loader';

// ローダー関数を定義
export const loader = async () => {
  // ここでデータベースからタスク取得する処理を実装します
  // 今回はダミーデータを返します
  const tasks: Task[] = [
    { id: '1', title: "買い物に行く", completed: false, important: false, tags: ["日用品", "食料"], epic: "生活", details: "", startDate: null, endDate: null, pinned: false, timeEntries: [], isRunning: false },
    { id: '2', title: "レポートを書く", completed: false, important: true, tags: ["仕事"], epic: "仕事", details: "", startDate: null, endDate: null, pinned: false, timeEntries: [], isRunning: false },
    { id: '3', title: "運動する", completed: true, important: false, tags: ["健康"], epic: "健康", details: "", startDate: null, endDate: null, pinned: false, timeEntries: [], isRunning: false },
  ]
  return json({ tasks })
}

export default function Index() {
  const { tasks: initialTasks } = useLoaderData<typeof loader>()
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tagSearch, setTagSearch] = useState("")
  const [taskListFilter, setTaskListFilter] = useState("all")
  const [newTag, setNewTag] = useState("")
  const scrollContainerRef = useRef(null)

  const addTask = () => {
    if (newTask.trim() !== "") {
      const newTaskObject = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        important: false,
        tags: selectedTags ? selectedTags : [],
        epic: selectedEpic || "",
        details: "",
        startDate: null,
        endDate: null,
        pinned: false,
        timeEntries: [],
        isRunning: false
      } 
      setTasks(prevTasks => [newTaskObject, ...prevTasks])
      setNewTask("")
    }
  }

  const toggleComplete = useCallback((id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      return sortTasks(updatedTasks)
    })
  }, [])

  const sortTasks = useCallback((tasksToSort: any[]) => {
    return tasksToSort.sort((a: { completed: any }, b: { completed: any }) => {
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      return 0
    })
  }, [])

  const toggleImportant = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, important: !task.important } : task
    ))
  }

  const updateTaskTitle = (id: string, newTitle: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title: newTitle } : task
    ))
    setEditingTaskId(null)
  }

  const addTag = (taskId: string, newTag: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, tags: [...task.tags, newTag] } : task
    ))
  }

  const removeTag = (taskId: string, tagToRemove: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, tags: task.tags.filter(tag => tag !== tagToRemove) } : task
    ))
  }
  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter((t) => t !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  }

  const allTags = useMemo(() => {
    const tagSet = new Set(tasks.flatMap(task => task.tags))
    return Array.from(tagSet)
  }, [tasks])

  const allEpics = useMemo(() => {
    const epicSet = new Set(tasks.map(task => task.epic).filter(Boolean))
    return Array.from(epicSet)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      (selectedTags === null || selectedTags.length === 0 || selectedTags.every((tag: string) => task.tags.includes(tag))) &&
      (!selectedEpic || task.epic === selectedEpic) &&
      (taskListFilter === "all" ||
       (taskListFilter === "important" && task.important) ||
       (taskListFilter === "completed" && task.completed))
    )
  }, [tasks, selectedTags, selectedEpic, taskListFilter])

  const filteredTags = useMemo(() => {
    return allTags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
  }, [allTags, tagSearch])

  const updateTaskDetails = (id: string, newDetails: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, details: newDetails } : task
    ))
  }

  const updateTaskDate = (id: string, field: string, date: Date | undefined) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, [field]: date } : task
    ))
  }

  const getTaskListTitle = () => {
    if (selectedEpic) {
      return `${selectedEpic}のタスク`
    } else if (selectedTags.length > 0) {
      return selectedTags.length === 1
        ? `${selectedTags[0]}のタスク`
        : `${selectedTags.join('・')}のタスク`
    } else {
      switch (taskListFilter) {
        case "important":
          return "重要なタスク"
        case "completed":
          return "完了済みのタスク"
        default:
          return "すべてのタスク"
      }
    }
  }

  const togglePin = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, pinned: !task.pinned } : task
    ))
  }

  const toggleTaskRunning = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        if (task.isRunning) {
          // タスクを停止する
          const now = new Date()
          const lastEntry = task.timeEntries[task.timeEntries.length - 1]
          lastEntry.end = now.toISOString()
          return { ...task, isRunning: false, timeEntries: [...task.timeEntries] }
        } else {
          // タスクを開始する
          const now = new Date()
          return { ...task, isRunning: true, timeEntries: [...task.timeEntries, { start: now.toISOString(), end: null }] }
        }
      }
      return task
    }))
  }

  const updateTimeEntry = (taskId: string, entryIndex: number, field: keyof TimeEntry, value: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newTimeEntries = [...task.timeEntries] as TimeEntry[];
        newTimeEntries[entryIndex][field] = value;
        return { ...task, timeEntries: newTimeEntries };
      }
      return task;
    }));
  }

  const calculateTotalTime = (timeEntries: any[]) => {
    return timeEntries.reduce((total: number, entry: { start: string; end: string }) => {
      if (entry.start && entry.end) {
        return total + differenceInSeconds(parseISO(entry.end), parseISO(entry.start))
      }
      return total
    }, 0)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.isRunning) {
          const lastEntry = task.timeEntries[task.timeEntries.length - 1]
          const now = new Date()
          lastEntry.end = now.toISOString()
          return { ...task, timeEntries: [...task.timeEntries] }
        }
        return task
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="w-64 bg-white p-4 shadow overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">タスクリスト</h2>
        <ul className="mb-4">
          {/* これらのリスト項目にkeyを追加 */}
          <li key="all" className="mb-2">
            <Button
              variant={taskListFilter === "all" ? "secondary" : "ghost"}
              onClick={() => setTaskListFilter("all")}
              className="w-full justify-start"
            >
              すべてのタスク
            </Button>
          </li>
          <li key="important" className="mb-2">
            <Button
              variant={taskListFilter === "important" ? "secondary" : "ghost"}
              onClick={() => setTaskListFilter("important")}
              className="w-full justify-start text-yellow-500"
            >
              重要
            </Button>
          </li>
          <li key="completed" className="mb-2">
            <Button
              variant={taskListFilter === "completed" ? "secondary" : "ghost"}
              onClick={() => setTaskListFilter("completed")}
              className="w-full justify-start"
            >
              完了済み
            </Button>
          </li>
        </ul>
        <h3 className="font-bold mb-2">エピックで絞り込む</h3>
        <ul className="mb-4">
          {allEpics.map(epic => (
            <li key={epic} className="mb-2">
              <Button
                variant={selectedEpic === epic ? "secondary" : "ghost"}
                onClick={() => setSelectedEpic(selectedEpic === epic ? null : epic)}
                className="w-full justify-start"
              >
                {epic}
              </Button>
            </li>
          ))}
        </ul>
        <h3 className="font-bold mb-2">タグで絞り込む</h3>
        <div className="mb-2">
          <Input
            type="text"
            placeholder="タグを検索"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <ul>
          {filteredTags.map(tag => (
            <li key={tag} className="mb-2">
              <Button
                variant={selectedTags.includes(tag) ? "secondary" : "ghost"}
                onClick={() => toggleTagSelection(tag)}
                className="w-full justify-start"
              >
                {tag}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{getTaskListTitle()}</h1>
        
        {/* 新しいタスクの入力フィールド */}
        <div className="flex mb-4">
          <Input
            type="text"
            placeholder="新しいタスクを追加"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 mr-2"
          />
          <Button onClick={addTask}>
            <Plus className="h-4 w-4 mr-2" />
            追加
          </Button>
        </div>
        <ul>
          {filteredTasks.map((task) => (
            <li key={task.id} className="mb-4 bg-white p-3 rounded shadow">
              <div className="flex items-center mb-2">
                <div className="mr-2 cursor-move">
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
                      setSelectedTask(task as Task);
                    }}
                  >
                    {task.title}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleImportant(task.id)}
                  className={task.important ? 'text-yellow-500' : ''}
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePin(task.id)}
                  className={task.pinned ? 'text-blue-500' : ''}
                >
                  <PinIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              {/* タグ表示エリア */}
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
              {/* タグ追加フォーム */}
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
          ))}
        </ul>
      </div>

      {/* 右ペイン（タスク詳細） */}
      {selectedTask && (
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
              onChange={(e) => setTasks(tasks.map(task =>
                task.id === selectedTask.id ? { ...task, epic: e.target.value } : task
              ))}
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
              {selectedTask.tags.map((tag: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, index: Key | null | undefined) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm flex items-center">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTag(selectedTask.id, tag as string)}
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
            {selectedTask.timeEntries.map((entry: TimeEntry, index: Key | null | undefined) => (
              <div key={index} className="flex items-center mt-2">
                <Input
                  type="datetime-local"
                  value={entry.start ? format(parseISO(entry.start), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => updateTimeEntry(selectedTask.id, index as number, 'start', e.target.value)}
                  className="mr-2"
                />
                <Input
                  type="datetime-local"
                  value={entry.end ? format(parseISO(entry.end), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => updateTimeEntry(selectedTask.id, index as number, 'end', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}