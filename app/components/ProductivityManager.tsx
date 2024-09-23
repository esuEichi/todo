import React from 'react'
import { Task } from '~/types/task'
import DateRangePicker from './DateRangePicker'
import TimeReport from './TimeReport'

interface ProductivityManagerProps {
  tasks: Task[]
  startDate: Date
  endDate: Date
}

const ProductivityManager: React.FC<ProductivityManagerProps> = ({ tasks, startDate, endDate }) => {
  return (
    <div>
      <h2>生産性管理</h2>
      <DateRangePicker startDate={startDate} endDate={endDate} onChange={() => {}} />
      <TimeReport tasks={tasks} startDate={startDate} endDate={endDate} />
    </div>
  )
}

export default ProductivityManager