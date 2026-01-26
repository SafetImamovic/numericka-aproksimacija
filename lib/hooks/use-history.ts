'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HistoryEntry } from '@/lib/types'

const HISTORY_KEY = 'numerical-approximation-history'
const MAX_HISTORY_SIZE = 50

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryEntry[]
        setHistory(parsed)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      } catch (error) {
        console.error('Failed to save history:', error)
      }
    }
  }, [history, isLoading])

  // Add a new entry to history
  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    setHistory((prev) => {
      const updated = [newEntry, ...prev]
      // Keep only the most recent entries
      return updated.slice(0, MAX_HISTORY_SIZE)
    })

    return newEntry.id
  }, [])

  // Remove an entry from history
  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Get a specific entry by ID
  const getEntry = useCallback(
    (id: string): HistoryEntry | undefined => {
      return history.find((entry) => entry.id === id)
    },
    [history]
  )

  // Update an entry (e.g., add evaluated points)
  const updateEntry = useCallback(
    (id: string, updates: Partial<Omit<HistoryEntry, 'id' | 'timestamp'>>) => {
      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      )
    },
    []
  )

  return {
    history,
    isLoading,
    addEntry,
    removeEntry,
    clearHistory,
    getEntry,
    updateEntry,
  }
}
