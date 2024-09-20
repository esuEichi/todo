import { useState, useMemo, useCallback, useRef, useEffect, KeyboardEvent, CompositionEvent } from 'react'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Plus } from "lucide-react"
import Sidebar from '~/components/Sidebar'
import TaskList from '~/components/TaskList'
import TaskDetails from '~/components/TaskDetails'
import PinnedTasks from '~/components/PinnedTasks'
import { sortTasks, calculateTotalTime, formatTime } from '~/utils/taskUtils'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Epic } from '~/types/task'

import type { LoaderFunction } from '@remix-run/node'
import type { Task } from '~/types/task'

export const loader: LoaderFunction = async () => {
  // epicのダミーデータを返す
  const epics: Epic[] = [
    { id: '1', title: "生活", description: "" },
    { id: '2', title: "仕事", description: "" },
    { id: '3', title: "健康", description: "" },
  ]

  // ダミーデータを返す
  const tasks: Task[] = [
    { id: '1', title: "買い物に行く", completed: false, important: false, tags: ["日用品", "食料"], epic: epics[0], details: "", startDate: null, endDate: null, pinned: false, timeEntries: [], isRunning: false },
    { id: '2', title: "レポートを書く", completed: false, important: true, tags: ["仕事"], epic: epics[1], details: "", startDate: null, endDate: null, pinned: false, timeEntries: [], isRunning: false },
    { id: '3', title: "運動する", completed: true, important: false, tags: ["健康"], epic: epics[2], details: "", startDate: null, endDate: null, pinned: false, timeEntries: [], isRunning: false },
  ]
  
  return json({ tasks, epics })
}

export default function Index() {
  const { tasks: initialTasks, epics: initialEpics } = useLoaderData<typeof loader>()
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem('tasks')
      return storedTasks ? JSON.parse(storedTasks) : initialTasks
    }
    return initialTasks
  })
  const [newTask, setNewTask] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tagSearch, setTagSearch] = useState("")
  const [taskListFilter, setTaskListFilter] = useState("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [epics, setEpics] = useState<Epic[]>([])
  const [newEpicTitle, setNewEpicTitle] = useState("")
  const [allTags, setAllTags] = useState<Set<string>>(new Set())
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTasks = localStorage.getItem('tasks')
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks))
      }
    }
  }, [])

  useEffect(() => {
    const tagSet = new Set(tasks.flatMap(task => task.tags))
    setAllTags(tagSet)
  }, [tasks])

  const addTask = () => {
    if (newTask.trim() !== "") {
      const newTaskObject: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        important: false,
        tags: selectedTags,
        epic: selectedEpic || null,
        details: "",
        startDate: null,
        endDate: null,
        pinned: false,
        timeEntries: [],
        isRunning: false
      }
      setTasks(prevTasks => [newTaskObject, ...prevTasks])
      setNewTask("") // フォームを空にする
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      addTask()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const toggleComplete = useCallback((id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
      return sortTasks(updatedTasks)
    })
  }, [])

  const toggleImportant = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, important: !task.important } : task
    ))
  }

  const updateTaskTitle = (id: string, newTitle: string) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === id ? { ...task, title: newTitle } : task
    ))
  }

  const updateTaskDetails = (id: string, newDetails: string) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === id ? { ...task, details: newDetails } : task
    ))
  }

  const updateTaskDate = (id: string, field: 'startDate' | 'endDate', date: Date | null) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === id ? { ...task, [field]: date ? date.toISOString() : null } : task
    ))
  }

  const removeTag = (taskId: string, tagToRemove: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId ? { ...task, tags: task.tags.filter(tag => tag !== tagToRemove) } : task
      )
      const isTagUsed = updatedTasks.some(task => task.tags.includes(tagToRemove))
      if (!isTagUsed) {
        setAllTags(prevTags => {
          const newTags = new Set(prevTags)
          newTags.delete(tagToRemove)
          return newTags
        })
      }
      return updatedTasks
    })
  }

  const addTag = (taskId: string, newTag: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId ? { ...task, tags: [...new Set([...task.tags, newTag])] } : task
      )
      return updatedTasks
    })
    setAllTags(prevTags => new Set(prevTags).add(newTag))
  }

  const updateAllTags = (newTag: string) => {
    setAllTags(prevTags => new Set(prevTags).add(newTag))
  }

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter(t => t !== tag)
      } else {
        return [...prevSelectedTags, tag]
      }
    })
  }

  const assignedEpics = useMemo(() => {
    const epicSet = new Set(tasks.map(task => task.epic).filter(Boolean))
    return Array.from(epicSet)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      (selectedTags.length === 0 || selectedTags.every(tag => task.tags.includes(tag))) &&
      (!selectedEpic || task.epic?.id === selectedEpic.id) &&
      (taskListFilter === "all" ||
       (taskListFilter === "important" && task.important) ||
       (taskListFilter === "completed" && task.completed))
    )
  }, [tasks, selectedTags, selectedEpic, taskListFilter])

  const filteredTags = useMemo(() => {
    return Array.from(allTags).filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
  }, [allTags, tagSearch])

  const getTaskListTitle = () => {
    if (selectedEpic) {
      return `${selectedEpic.title}のタスク`
    } else if (selectedTags.length > 0) {
      return selectedTags.length === 1
        ? `${selectedTags[0]}のタスク`
        : `${selectedTags.join('・')}のタスク`
    } else {
      switch (taskListFilter) {
        case "important":
          return "重要なタスク"
        case "completed":
          return "完済みのタスク"
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
          const now = new Date()
          const lastEntry = task.timeEntries[task.timeEntries.length - 1]
          if (lastEntry) {
            lastEntry.end = now.toISOString()
          }
          return { ...task, isRunning: false, timeEntries: [...task.timeEntries] }
        } else {
          const now = new Date()
          return { ...task, isRunning: true, timeEntries: [...task.timeEntries, { start: now.toISOString(), end: null }] }
        }
      }
      return task
    }))
  }

  const updateTimeEntry = (taskId: string, entryIndex: number, field: 'start' | 'end', value: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const newTimeEntries = [...task.timeEntries]
        newTimeEntries[entryIndex] = { ...newTimeEntries[entryIndex], [field]: value }
        return { ...task, timeEntries: newTimeEntries }
      }
      return task
    }))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newTasks = Array.from(tasks)
    const [reorderedItem] = newTasks.splice(result.source.index, 1)
    newTasks.splice(result.destination.index, 0, reorderedItem)

    setTasks(sortTasks(newTasks))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.isRunning) {
          const lastEntry = task.timeEntries[task.timeEntries.length - 1]
          const now = new Date()
          if (lastEntry) {
            lastEntry.end = now.toISOString()
          }
          return { ...task, timeEntries: [...task.timeEntries] }
        }
        return task
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleAddEpic = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newEpicTitle.trim() !== "") {
      const newEpic: Epic = {
        id: Date.now().toString(),
        title: newEpicTitle.trim(),
        description: ""
      }
      setEpics(prevEpics => [...prevEpics, newEpic])
      setNewEpicTitle("")
    }
  }

  // タスクが変更されたときにローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          taskListFilter={taskListFilter}
          setTaskListFilter={setTaskListFilter}
          selectedEpic={selectedEpic}
          setSelectedEpic={setSelectedEpic}
          tagSearch={tagSearch}
          setTagSearch={setTagSearch}
          filteredTags={filteredTags}
          selectedTags={selectedTags}
          toggleTagSelection={toggleTagSelection}
          epics={initialEpics}
          newEpicTitle={newEpicTitle}
          setNewEpicTitle={setNewEpicTitle}
          handleAddEpic={handleAddEpic}
        />
        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">{getTaskListTitle()}</h1>
          <div className="flex mb-4">
            <Input
              type="text"
              placeholder="新しいタスクを追加"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="flex-1 mr-2"
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              追加
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <TaskList
              filteredTasks={filteredTasks}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              toggleComplete={toggleComplete}
              updateTaskTitle={updateTaskTitle}
              toggleImportant={toggleImportant}
              togglePin={togglePin}
              removeTag={removeTag}
              addTag={addTag}
              setSelectedTask={setSelectedTask}
            />
          </DragDropContext>
        </div>
        {selectedTask && (
          <TaskDetails
            selectedTask={selectedTask}
            updateTaskTitle={updateTaskTitle}
            updateTaskDetails={updateTaskDetails}
            updateTaskDate={updateTaskDate}
            removeTag={removeTag}
            addTag={addTag}
            updateTimeEntry={updateTimeEntry}
            calculateTotalTime={calculateTotalTime}
            formatTime={formatTime}
            allTags={Array.from(allTags)}
            updateAllTags={updateAllTags}
          />
        )}
      </div>
      <PinnedTasks
        tasks={tasks.filter(task => task.pinned)}
        togglePin={togglePin}
        toggleTaskRunning={toggleTaskRunning}
        calculateTotalTime={calculateTotalTime}
        formatTime={formatTime}
      />
    </div>
  )
}