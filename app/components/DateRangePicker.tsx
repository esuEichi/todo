import React from 'react'
import { DayPicker, SelectRangeEventHandler } from 'react-day-picker'
import { ja } from 'date-fns/locale'
import { format } from 'date-fns'
import { Button } from "~/components/ui/button"
import { X } from "lucide-react"

interface DateRangePickerProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const handleRangeSelect: SelectRangeEventHandler = (range) => {
    if (range?.from) onStartDateChange(range.from)
    if (range?.to) onEndDateChange(range.to)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">日付範囲の選択</h2>
        <Button variant="ghost" size="icon" onClick={() => {
          onStartDateChange(undefined)
          onEndDateChange(undefined)
        }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <DayPicker
        mode="range"
        selected={{ from: startDate, to: endDate }}
        onSelect={handleRangeSelect}
        locale={ja}
        className="border rounded-md p-4"
      />
      <div className="mt-4 space-y-2">
        <p>
          <span className="font-semibold">開始日:</span> {startDate ? format(startDate, 'yyyy/MM/dd') : '未選択'}
        </p>
        <p>
          <span className="font-semibold">終了日:</span> {endDate ? format(endDate, 'yyyy/MM/dd') : '未選択'}
        </p>
      </div>
    </div>
  )
}

export default DateRangePicker