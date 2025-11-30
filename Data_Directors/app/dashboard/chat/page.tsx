"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, User, Loader2, Upload, FileText, Image as ImageIcon, Code, Lightbulb, BookOpen, Calculator, Languages, Paperclip, Square, Mic, Volume2, Copy, Check } from "lucide-react"
import Image from "next/image"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  fileType?: "image" | "code" | "document"
  fileName?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm PadhAI, your AI learning assistant. I can help you with studies, analyze images, explain code, answer questions, and more. Upload files or choose a quick action below!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [input])

  // Cleanup speech recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      let filePrompt = ""
      if (file.type.startsWith("image/")) {
        // Create image preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        filePrompt = `I've uploaded an image: ${file.name}. Please analyze it and help me understand it.`
      } else if (file.name.endsWith(".pdf")) {
        filePrompt = `I've uploaded a PDF document: ${file.name}. Can you help me understand its contents?`
      } else if (file.name.match(/\.(js|ts|py|java|cpp|c|html|css)$/)) {
        filePrompt = `I've uploaded a code file: ${file.name}. Can you explain what this code does?`
      } else {
        filePrompt = `I've uploaded a file: ${file.name}. Can you help me with it?`
      }
      setInput(filePrompt)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setInput(`Analyze this image and tell me what you see.`)
    }
  }

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setIsLoading(false)
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const renderMessageContent = (content: string, messageIndex: number) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/)
        const language = match?.[1] || 'text'
        const code = match?.[2] || part.slice(3, -3)
        const codeId = `${messageIndex}-${index}`
        
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between bg-gray-800/50 px-4 py-2 border-b border-white/10">
              <span className="text-xs text-gray-400 font-mono">{language}</span>
              <button
                onClick={() => handleCopyCode(code, codeId)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                {copiedCode === codeId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto bg-gray-900/30">
              <code className="text-sm font-mono text-gray-200">{code}</code>
            </pre>
          </div>
        )
      }
      
      // Regular text with inline code
      const textParts = part.split(/(`[^`]+`)/g)
      return (
        <span key={index}>
          {textParts.map((textPart, textIndex) => {
            if (textPart.startsWith('`') && textPart.endsWith('`')) {
              return (
                <code
                  key={textIndex}
                  className="px-1.5 py-0.5 rounded bg-gray-800/50 text-orange-400 font-mono text-sm border border-white/10"
                >
                  {textPart.slice(1, -1)}
                </code>
              )
            }
            return textPart
          })}
        </span>
      )
    })
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log('Voice recognition started')
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        console.log('Voice recognition result:', event)
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')
        console.log('Transcript:', transcript)
        setInput(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.')
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, still listening...')
        } else {
          alert(`Voice recognition error: ${event.error}`)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        console.log('Voice recognition ended')
        setIsListening(false)
      }

      console.log('Starting voice recognition...')
      recognition.start()
    } catch (error) {
      console.error('Error starting voice recognition:', error)
      alert('Failed to start voice recognition. Please check browser permissions.')
      setIsListening(false)
    }
  }

  const handleRecite = (text: string, messageIndex: number) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.')
      return
    }

    // Stop any ongoing speech
    if (isSpeaking === messageIndex) {
      window.speechSynthesis.cancel()
      setIsSpeaking(null)
      return
    }

    // Stop any other speech
    window.speechSynthesis.cancel()

    // Load voices if not already loaded
    let voices = window.speechSynthesis.getVoices()
    
    // If voices not loaded yet, wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices()
        startSpeaking(voices)
      }
      // Trigger voice loading
      window.speechSynthesis.getVoices()
    } else {
      startSpeaking(voices)
    }

    function startSpeaking(voices: SpeechSynthesisVoice[]) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure natural high-pitch female voice settings
      utterance.rate = 0.95 // Natural speaking speed
      utterance.pitch = 1.3 // Higher pitch for female voice
      utterance.volume = 1.0
      
      // Try to use a natural-sounding female voice
      const femaleVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (
          voice.name.includes('Female') ||
          voice.name.includes('Zira') || // Windows female voice
          voice.name.includes('Samantha') || // Mac female voice
          voice.name.includes('Google UK English Female') ||
          voice.name.includes('Microsoft Aria') ||
          voice.name.includes('Natural') ||
          voice.name.includes('Premium')
        ) && !voice.name.includes('Male')
      ) || voices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.includes('Male')
      ) || voices.find(voice => voice.lang.startsWith('en'))
      
      if (femaleVoice) {
        utterance.voice = femaleVoice
        console.log('Using voice:', femaleVoice.name)
      }

      utterance.onstart = () => {
        setIsSpeaking(messageIndex)
      }

      utterance.onend = () => {
        setIsSpeaking(null)
      }

      utterance.onerror = () => {
        setIsSpeaking(null)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    textareaRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Prepare message with image if available
    let messageContent = input
    if (imagePreview && uploadedFile?.type.startsWith("image/")) {
      messageContent = `[Image: ${uploadedFile.name}] ${input}`
    }

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      fileName: uploadedFile?.name,
      fileType: uploadedFile?.type.startsWith("image/") ? "image" : uploadedFile?.name.match(/\.(js|ts|py|java|cpp)$/) ? "code" : "document",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setUploadedFile(null)
    setImagePreview(null)
    setIsLoading(true)

    // Create abort controller for stopping generation
    const controller = new AbortController()
    setAbortController(controller)

    // Add placeholder for streaming response
    const assistantMessageIndex = messages.length + 1
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""
      let streamActive = true

      if (reader) {
        while (streamActive) {
          const { done, value } = await reader.read()
          if (done) {
            streamActive = false
            break
          }

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            try {
              const json = JSON.parse(line)
              if (json.content) {
                accumulatedContent += json.content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[assistantMessageIndex] = {
                    role: "assistant",
                    content: accumulatedContent,
                    timestamp: new Date(),
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error)
      if (error.name === "AbortError") {
        // User stopped generation - keep accumulated content
        console.log('Generation stopped, keeping content:', accumulatedContent)
      } else {
        setMessages((prev) => {
          const newMessages = [...prev]
          newMessages[assistantMessageIndex] = {
            role: "assistant",
            content: "I apologize, but I'm having trouble connecting. Please make sure Ollama is running with: `ollama run llama3.2-vision`",
            timestamp: new Date(),
          }
          return newMessages
        })
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const quickActions = [
    { icon: Lightbulb, label: "Explain Concept", prompt: "Can you explain " },
    { icon: Calculator, label: "Solve Problem", prompt: "Help me solve this problem: " },
    { icon: Code, label: "Debug Code", prompt: "Help me debug this code: " },
    { icon: BookOpen, label: "Summarize", prompt: "Can you summarize " },
    { icon: Languages, label: "Translate", prompt: "Translate this to " },
    { icon: FileText, label: "Essay Help", prompt: "Help me write an essay about " },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2">
              <Image src="/logopng.png" alt="PadhAI" width={48} height={48} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">PadhAI Chat</h1>
              <p className="text-gray-400 text-sm">
                Powered by {imagePreview || uploadedFile ? 'Llama 3.2 Vision 🖼️' : 'Gemma 2 ⚡'} • Smart Model Switching
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.txt,.js,.ts,.py,.java,.cpp,.c,.html,.css"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50 text-orange-400"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.prompt)}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 transition-all"
            >
              <action.icon className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-orange-400 transition-colors text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 mt-1 shadow-lg p-1">
                <Image src="/logopng.png" alt="AI" width={24} height={24} className="w-full h-full object-contain" />
              </div>
            )}

            <div
              className={`group relative max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === "user"
                  ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg"
                  : "dark-card border border-white/10"
              }`}
            >
              {message.fileName && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/20">
                  {message.fileType === "image" && <ImageIcon className="w-4 h-4" />}
                  {message.fileType === "code" && <Code className="w-4 h-4" />}
                  {message.fileType === "document" && <FileText className="w-4 h-4" />}
                  <span className="text-xs opacity-90">{message.fileName}</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {renderMessageContent(message.content, index)}
              </div>
              <div className="flex items-center justify-between mt-2 gap-2">
                <div
                  className={`text-xs ${
                    message.role === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {message.role === "assistant" && message.content && (
                  <button
                    onClick={() => handleRecite(message.content, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-gray-400 hover:text-orange-400 px-2 py-1 rounded-lg hover:bg-white/5"
                    title="Recite this message"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeaking === index ? 'animate-pulse text-orange-400' : ''}`} />
                    {isSpeaking === index ? 'Stop' : 'Recite'}
                  </button>
                )}
              </div>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse p-1">
              <Image src="/logopng.png" alt="AI" width={24} height={24} className="w-full h-full object-contain" />
            </div>
            <div className="dark-card border border-orange-500/20 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span className="text-gray-400">Generating response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="relative">
        {uploadedFile && (
          <div className="mb-2 flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-400">{uploadedFile.name}</span>
            <button
              onClick={() => setUploadedFile(null)}
              className="ml-auto text-orange-400 hover:text-orange-300"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative dark-card-elevated rounded-2xl border border-white/20 focus-within:border-orange-500/50 transition-all overflow-hidden shadow-lg">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            <div className="absolute left-3 bottom-3 flex gap-1">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-9 h-9 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center text-gray-400 hover:text-orange-400"
                disabled={isLoading}
                title="Attach image"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`w-9 h-9 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center ${
                  isListening ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-gray-400 hover:text-orange-400'
                }`}
                disabled={isLoading}
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything, upload files, or use quick actions above..."
              rows={1}
              className="w-full bg-transparent text-white placeholder-gray-500 pl-24 pr-28 py-4 focus:outline-none resize-none max-h-32 overflow-y-auto"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                type="button"
                onClick={handleStopGeneration}
                className="absolute right-14 bottom-2 w-10 h-10 rounded-xl p-0 bg-red-500 hover:bg-red-600 transition-all shadow-lg"
              >
                <Square className="w-5 h-5 fill-white" />
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 w-10 h-10 rounded-xl p-0 bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line • Upload images, code, or documents
        </p>
      </div>
    </div>
  )
}
