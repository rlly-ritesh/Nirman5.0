"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DyslexicModeProvider, useDyslexicMode } from "@/contexts/DyslexicModeContext"
import {
  LayoutDashboard,
  Upload as UploadIcon,
  FileText,
  CreditCard,
  ClipboardList,
  Gamepad2,
  TrendingUp,
  Settings as SettingsIcon,
  Bell,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MessageSquare
} from "lucide-react"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { isDyslexicMode, toggleDyslexicMode } = useDyslexicMode()

  const navigation = [
    { name: "PadhAI Chat", href: "/dashboard/chat", icon: MessageSquare },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload PDF", href: "/dashboard/upload", icon: UploadIcon },
    { name: "My Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: CreditCard },
    { name: "Quizzes", href: "/dashboard/quizzes", icon: ClipboardList },
    { name: "Kid Mode", href: "/dashboard/kid-mode", icon: Gamepad2 },
    { name: "Progress", href: "/dashboard/progress", icon: TrendingUp },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-[#111111] border-r border-white/10 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}
      >
        
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logopng.png" alt="PadhAI Logo" className="w-full h-full object-contain" />
            </div>
            {isSidebarOpen && <span className="text-gradient-neon text-2xl font-bold">PadhAI</span>}
          </Link>
        </div>

        
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-white/10 text-white neon-border"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-16 w-full rounded-none border-t border-white/10 hover:bg-white/5 transition-all flex items-center justify-center text-gray-400 hover:text-white"
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </aside>

      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : "ml-20"
      }`}>
        
        <header className="h-20 bg-[#111111] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
            <p className="text-sm text-gray-400 mt-1">Let's continue your learning journey</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={toggleDyslexicMode}
              className={`px-5 h-10 rounded-full font-opendyslexic border-white/20 hover:bg-white/10 transition-all ${
                isDyslexicMode ? 'bg-purple-500/20 border-purple-500/50' : ''
              }`}
            >
              {isDyslexicMode ? '✓ ' : ''}Dyslexic Mode
            </Button>
            <button className="relative w-10 h-10 rounded-full hover:bg-white/10 transition-all flex items-center justify-center text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-white/10 transition-all">
              <div className="w-9 h-9 rounded-full gradient-neon-purple-pink flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">Student</div>
                <div className="text-xs text-gray-400">Level 12</div>
              </div>
            </div>
          </div>
        </header>

        
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a] to-[#1a0a1a]">{children}</div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DyslexicModeProvider>
      <DashboardContent>{children}</DashboardContent>
    </DyslexicModeProvider>
  )
}

