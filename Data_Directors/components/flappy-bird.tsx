"use client"

import React, { useEffect, useRef, useState } from "react"

const QUESTIONS = [
  { question: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], correct: 1 },
  { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { question: "Who wrote Romeo and Juliet?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1 },
  { question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
  { question: "Which country has the most population?", options: ["India", "USA", "Indonesia", "Pakistan"], correct: 0 },
  { question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 },
  { question: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Carbon", "Oxygen"], correct: 1 },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 },
  { question: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Gazelle", "Antelope"], correct: 1 },
  { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 },
  { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"], correct: 2 },
  { question: "What is the tallest mountain?", options: ["K2", "Kilimanjaro", "Mount Everest", "Denali"], correct: 2 },
  { question: "How many strings does a guitar have?", options: ["4", "5", "6", "7"], correct: 2 },
]

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState("")

  const gameStateRef = useRef({
    boardWidth: 360,
    boardHeight: 640,
    birdWidth: 34,
    birdHeight: 24,
    birdX: 0,
    birdY: 0,
    bird: { x: 0, y: 0, width: 34, height: 24 },
    pipeArray: [] as any[],
    pipeWidth: 64,
    pipeHeight: 512,
    pipeX: 0,
    pipeY: 0,
    velocityX: -1,
    velocityY: 0,
    gravity: 0.2,
    gameOver: false,
    quizScore: 0,
    questionActive: false,
    currentQuestion: null,
    currentQuestionPipe: null,
    collisionHandled: false,
    askedQuestions: [] as any[],
    lastPipeTime: 0,
    context: null as any,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current
    state.context = ctx
    state.birdX = state.boardWidth / 8
    state.birdY = state.boardHeight / 2
    state.bird.x = state.birdX
    state.bird.y = state.birdY
    state.pipeX = state.boardWidth

    // Load images
    const birdImg = new Image()
    birdImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 24'%3E%3Ccircle cx='17' cy='12' r='10' fill='yellow' stroke='orange' stroke-width='2'/%3E%3C/svg%3E"

    const topPipeImg = new Image()
    topPipeImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 512'%3E%3Crect width='64' height='512' fill='%2322c55e'/%3E%3C/svg%3E"

    const bottomPipeImg = new Image()
    bottomPipeImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 512'%3E%3Crect width='64' height='512' fill='%2322c55e'/%3E%3C/svg%3E"

    const placePipes = () => {
      if (state.gameOver || state.questionActive) return
      if (state.pipeArray.length > 0) {
        const lastPipe = state.pipeArray[state.pipeArray.length - 1]
        if (lastPipe.x > state.boardWidth - 150) return
      }

      const randomPipeY = state.pipeY - state.pipeHeight / 4 - Math.random() * (state.pipeHeight / 2)
      const openingSpace = state.boardHeight / 4
      const pipeQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
      const pipeId = Date.now() + Math.random()

      const topPipe = {
        img: topPipeImg,
        x: state.pipeX,
        y: randomPipeY,
        width: state.pipeWidth,
        height: state.pipeHeight,
        passed: false,
        question: pipeQuestion,
        id: pipeId,
      }
      state.pipeArray.push(topPipe)

      const bottomPipe = {
        img: bottomPipeImg,
        x: state.pipeX,
        y: randomPipeY + state.pipeHeight + openingSpace,
        width: state.pipeWidth,
        height: state.pipeHeight,
        passed: false,
        question: pipeQuestion,
        id: pipeId,
      }
      state.pipeArray.push(bottomPipe)
    }

    const detectCollision = (a: any, b: any) => {
      return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    }

    const showQuestionModal = (pipe: any) => {
      state.questionActive = true
      state.currentQuestion = pipe.question
      state.currentQuestionPipe = pipe
      setCurrentQuestion(pipe.question)
      setShowQuestion(true)
      setFeedbackMessage("")
      setFeedbackType("")
    }

    const update = () => {
      if (state.gameOver) return

      const currentTime = Date.now()
      if (currentTime - state.lastPipeTime > 2000) {
        placePipes()
        state.lastPipeTime = currentTime
      }

      ctx.clearRect(0, 0, state.boardWidth, state.boardHeight)

      // Draw bird
      state.velocityY += state.gravity
      state.bird.y = Math.max(state.bird.y + state.velocityY, 0)
      ctx.drawImage(birdImg, state.bird.x, state.bird.y, state.birdWidth, state.birdHeight)

      if (state.bird.y > state.boardHeight) {
        state.gameOver = true
        setGameOver(true)
      }

      // Draw pipes
      for (let i = 0; i < state.pipeArray.length; i++) {
        const pipe = state.pipeArray[i]
        pipe.x += state.velocityX
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if (detectCollision(state.bird, pipe)) {
          if (!state.collisionHandled && !state.askedQuestions.includes(pipe.id)) {
            showQuestionModal(pipe)
            state.collisionHandled = true
            state.askedQuestions.push(pipe.id)
          }
          return
        }
      }

      // Clear pipes
      while (state.pipeArray.length > 0 && state.pipeArray[0].x < -state.pipeWidth) {
        state.pipeArray.shift()
      }

      // Draw score
      ctx.fillStyle = "white"
      ctx.font = "bold 24px Arial"
      ctx.fillText("Score: " + Math.floor(state.quizScore), 10, 40)

      if (!state.gameOver) {
        requestAnimationFrame(update)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        e.preventDefault()
        if (!state.questionActive) {
          state.velocityY = -6
        }

        if (state.gameOver) {
          state.bird.x = state.birdX
          state.bird.y = state.birdY
          state.pipeArray = []
          state.quizScore = 0
          state.gameOver = false
          state.questionActive = false
          state.collisionHandled = false
          state.askedQuestions = []
          state.lastPipeTime = 0
          setGameOver(false)
          setQuizScore(0)
          setShowQuestion(false)
          update()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    update()

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleAnswer = (selectedIndex: number) => {
    if (!currentQuestion) return

    if (selectedIndex === currentQuestion.correct) {
      const newScore = quizScore + 1
      setQuizScore(newScore)
      gameStateRef.current.quizScore = newScore
      setFeedbackMessage("✓ Correct! +1 Point")
      setFeedbackType("correct")

      setTimeout(() => {
        setShowQuestion(false)
        gameStateRef.current.questionActive = false
        gameStateRef.current.collisionHandled = false
        setCurrentQuestion(null)
        setFeedbackMessage("")
      }, 800)
    } else {
      setFeedbackMessage("✗ Incorrect! Game Over!")
      setFeedbackType("incorrect")

      setTimeout(() => {
        setShowQuestion(false)
        setGameOver(true)
        gameStateRef.current.gameOver = true
        gameStateRef.current.questionActive = false
        gameStateRef.current.collisionHandled = false
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          className="border-4 border-purple-500 rounded-lg bg-sky-400 cursor-pointer"
        />
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h1>
              <p className="text-2xl text-white mb-4">Quiz Score: {Math.floor(quizScore)}</p>
              <p className="text-gray-300">Press SPACE to restart</p>
            </div>
          </div>
        )}
      </div>

      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full border-2 border-purple-500">
            <h2 className="text-xl font-bold text-white mb-6">{currentQuestion.question}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
            {feedbackMessage && (
              <div className={`mt-4 p-3 rounded text-center font-bold ${feedbackType === "correct" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                {feedbackMessage}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center text-gray-300 text-sm">
        <p>Press <kbd className="bg-gray-700 px-2 py-1 rounded">SPACE</kbd> to jump • Answer quiz questions to gain points!</p>
      </div>
    </div>
  )
}
