"use client"

import * as React from "react"
import { CalendarIcon, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from "date-fns"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DateRangeProps {
  startDate: string
  endDate: string
  setStartDateAction: React.Dispatch<React.SetStateAction<string>>
  setEndDateAction: React.Dispatch<React.SetStateAction<string>>
}

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return format(date, "MMMM dd, yyyy")
}

function toLocalISO(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().split("T")[0]
}

export default function DateRange({
  startDate,
  endDate,
  setStartDateAction,
  setEndDateAction,
}: DateRangeProps) {
  const [openPicker, setOpenPicker] = React.useState<"start" | "end" | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false) // drawer state

  const start = startDate ? new Date(startDate) : undefined
  const end = endDate ? new Date(endDate) : undefined

  // Load saved from localStorage
  React.useEffect(() => {
    const savedStart = localStorage.getItem("startDate")
    const savedEnd = localStorage.getItem("endDate")
    if (savedStart) setStartDateAction(savedStart)
    if (savedEnd) setEndDateAction(savedEnd)
  }, [setStartDateAction, setEndDateAction])

  // Save to localStorage & show toast on selection
  React.useEffect(() => {
    if (startDate) localStorage.setItem("startDate", startDate)
    if (endDate) localStorage.setItem("endDate", endDate)

    if (startDate && endDate) {
      toast(`✅ Date range applied`, {
        description: `${formatDate(new Date(startDate))} – ${formatDate(new Date(endDate))}`,
      })
    }
  }, [startDate, endDate])

  const resetDates = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStartDateAction("")
    setEndDateAction("")
    localStorage.removeItem("startDate")
    localStorage.removeItem("endDate")
    setLoading(false)
    toast.success("✅ Dates reset successfully")
  }

  // Quick select ranges
  const setThisWeek = () => {
    const s = startOfWeek(new Date(), { weekStartsOn: 1 })
    const e = endOfWeek(new Date(), { weekStartsOn: 1 })
    setStartDateAction(toLocalISO(s))
    setEndDateAction(toLocalISO(e))
  }

  const setThisMonth = () => {
    const s = startOfMonth(new Date())
    const e = endOfMonth(new Date())
    setStartDateAction(toLocalISO(s))
    setEndDateAction(toLocalISO(e))
  }

  const setLast30Days = () => {
    const e = new Date()
    const s = subDays(e, 30)
    setStartDateAction(toLocalISO(s))
    setEndDateAction(toLocalISO(e))
  }

  return (
    <>
      {/* Hamburger button on mobile */}
      <Button
        className="fixed top-4 left-4 z-50 sm:hidden"
        onClick={() => setIsOpen(true)}
      >
        ☰
      </Button>

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card/90 backdrop-blur-md shadow-lg p-6 flex flex-col gap-4 overflow-auto z-50
          w-64 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          sm:translate-x-0 sm:w-80
        `}
      >
        {/* Close button for mobile */}
        <Button
          className="self-end sm:hidden mb-2"
          variant="ghost"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Start Date</Label>
          <Popover open={openPicker === "start"} onOpenChange={(o) => setOpenPicker(o ? "start" : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-10 text-sm">
                {startDate ? formatDate(start) : "Select date"}
                <CalendarIcon className="h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Calendar
                mode="single"
                selected={start}
                onSelect={(date) => {
                  if (date) setStartDateAction(toLocalISO(date))
                  setOpenPicker(null)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">End Date</Label>
          <Popover open={openPicker === "end"} onOpenChange={(o) => setOpenPicker(o ? "end" : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-10 text-sm">
                {endDate ? formatDate(end) : "Select date"}
                <CalendarIcon className="h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Calendar
                mode="single"
                selected={end}
                onSelect={(date) => {
                  if (date) setEndDateAction(toLocalISO(date))
                  setOpenPicker(null)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Quick Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full h-10 text-sm">
              Quick Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full" align="start">
            <DropdownMenuItem onClick={setThisWeek}>This Week</DropdownMenuItem>
            <DropdownMenuItem onClick={setThisMonth}>This Month</DropdownMenuItem>
            <DropdownMenuItem onClick={setLast30Days}>Last 30 Days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset */}
        <Button
          variant="secondary"
          onClick={resetDates}
          disabled={loading}
          className="w-full h-10 flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              Reset
            </>
          )}
        </Button>
      </aside>
    </>
  )
}
