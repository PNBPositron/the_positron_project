"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#f43f5e",
  "#ec4899",
  "#8b5cf6",
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#84cc16",
  "#f59e0b",
  "#ef4444",
]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [inputColor, setInputColor] = useState(color)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value)
  }

  const handleInputBlur = () => {
    onChange(inputColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-gray-800 border-gray-700">
        <div className="grid gap-2">
          <div className="grid grid-cols-5 gap-1">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className="w-8 h-8 rounded-full border border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setInputColor(presetColor)
                }}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Input
              type="color"
              value={inputColor}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-8 h-8 p-0 border-0"
            />
            <Input
              type="text"
              value={inputColor}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="flex-1 h-8 bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
