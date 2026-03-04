"use client"

import { useState, useCallback, useRef } from "react"

interface HistoryEntry<T> {
  state: T
  label: string
  timestamp: number
}

interface UseUndoRedoOptions {
  maxHistory?: number
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
) {
  const { maxHistory = 50 } = options
  const [state, setState] = useState<T>(initialState)
  const historyRef = useRef<HistoryEntry<T>[]>([
    { state: initialState, label: "Initial state", timestamp: Date.now() },
  ])
  const currentIndexRef = useRef(0)
  const isUndoRedoRef = useRef(false)

  const pushState = useCallback(
    (newState: T, label = "Edit") => {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false
        return
      }

      // Trim any redo history ahead of current index
      historyRef.current = historyRef.current.slice(
        0,
        currentIndexRef.current + 1
      )

      // Push new state
      historyRef.current.push({
        state: JSON.parse(JSON.stringify(newState)),
        label,
        timestamp: Date.now(),
      })

      // Enforce max history
      if (historyRef.current.length > maxHistory) {
        historyRef.current = historyRef.current.slice(
          historyRef.current.length - maxHistory
        )
      }

      currentIndexRef.current = historyRef.current.length - 1
      setState(newState)
    },
    [maxHistory]
  )

  const undo = useCallback((): T | null => {
    if (currentIndexRef.current <= 0) return null

    currentIndexRef.current -= 1
    const entry = historyRef.current[currentIndexRef.current]
    const restored = JSON.parse(JSON.stringify(entry.state)) as T
    isUndoRedoRef.current = true
    setState(restored)
    return restored
  }, [])

  const redo = useCallback((): T | null => {
    if (currentIndexRef.current >= historyRef.current.length - 1) return null

    currentIndexRef.current += 1
    const entry = historyRef.current[currentIndexRef.current]
    const restored = JSON.parse(JSON.stringify(entry.state)) as T
    isUndoRedoRef.current = true
    setState(restored)
    return restored
  }, [])

  const canUndo = currentIndexRef.current > 0
  const canRedo = currentIndexRef.current < historyRef.current.length - 1
  const historyLength = historyRef.current.length
  const currentIndex = currentIndexRef.current

  return {
    state,
    setState: pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength,
    currentIndex,
  }
}
