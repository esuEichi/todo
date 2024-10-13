import React, { useState } from 'react'
import type { Task } from '~/types/task'
import DateRangePicker from './DateRangePicker'
import TimeReport from './TimeReport'

interface ProductivityManagerProps {
  tasks: Task[]
  onSelectTask: (task: Task | null) => void
}

const ProductivityManager: React.FC<ProductivityManagerProps> = ({ tasks, onSelectTask }) => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const filteredTasks = tasks.filter(task => {
    if (!startDate || !endDate) return true
    return (task.startDate && task.startDate >= startDate && task.startDate <= endDate) ||
           (task.endDate && task.endDate >= startDate && task.endDate <= endDate)
  })

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div>
      <h2>生産性管理</h2>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateRangeChange}
      />
      <TimeReport
        tasks={filteredTasks}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  )
}

export default ProductivityManager
