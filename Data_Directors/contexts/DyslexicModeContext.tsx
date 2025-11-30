"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface DyslexicModeContextType {
  isDyslexicMode: boolean
  toggleDyslexicMode: () => void
}

const DyslexicModeContext = createContext<DyslexicModeContextType | undefined>(undefined)

export function DyslexicModeProvider({ children }: { children: React.ReactNode }) {
  const [isDyslexicMode, setIsDyslexicMode] = useState(false)

  useEffect(() => {
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('dyslexicMode')
    if (savedPreference === 'true') {
      setIsDyslexicMode(true)
      document.documentElement.classList.add('dyslexic-mode')
    }
  }, [])

  const toggleDyslexicMode = () => {
    setIsDyslexicMode((prev) => {
      const newValue = !prev
      localStorage.setItem('dyslexicMode', String(newValue))
      
      if (newValue) {
        document.documentElement.classList.add('dyslexic-mode')
      } else {
        document.documentElement.classList.remove('dyslexic-mode')
      }
      
      return newValue
    })
  }

  return (
    <DyslexicModeContext.Provider value={{ isDyslexicMode, toggleDyslexicMode }}>
      {children}
    </DyslexicModeContext.Provider>
  )
}

export function useDyslexicMode() {
  const context = useContext(DyslexicModeContext)
  if (context === undefined) {
    throw new Error('useDyslexicMode must be used within a DyslexicModeProvider')
  }
  return context
}
