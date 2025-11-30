"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface Question {
  question: string
  options: string[]
  correct: number
}

const sampleQuestions: Question[] = [
  {
    question: "What is 5 + 3?",
    options: ["6", "7", "8", "9"],
    correct: 2
  },
  {
    question: "Which planet is red?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    correct: 1
  },
  {
    question: "What is 10 × 2?",
    options: ["15", "18", "20", "25"],
    correct: 2
  },
  {
    question: "How many continents?",
    options: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    question: "What is H2O?",
    options: ["Air", "Water", "Fire", "Earth"],
    correct: 1
  }
]

export default function MarioQuiz() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<"playing" | "question" | "gameover">("playing")
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [lives, setLives] = useState(3)
  const [enemiesDefeated, setEnemiesDefeated] = useState(0)
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions)
  
  // Mario character state
  const [mario, setMario] = useState({ x: 50, y: 300, velocityY: 0, isJumping: false })
  const [enemies, setEnemies] = useState<{x: number, y: number, defeated: boolean}[]>([])
  const [platforms] = useState([
    { x: 0, y: 380, width: 800, height: 20 },      // Ground
    { x: 150, y: 280, width: 120, height: 15 },   // Platform 1
    { x: 350, y: 230, width: 120, height: 15 },   // Platform 2  
    { x: 550, y: 280, width: 120, height: 15 }    // Platform 3
  ])
  
  // Keyboard controls
  const keys = useRef<{[key: string]: boolean}>({})

  useEffect(() => {
    // Load questions from localStorage if available
    const storedQuestions = localStorage.getItem("kidQuizQuestions")
    if (storedQuestions) {
      try {
        const parsed = JSON.parse(storedQuestions)
        if (parsed && parsed.length > 0) {
          setQuestions(parsed)
        }
      } catch (e) {
        console.error("Failed to parse questions from localStorage")
      }
    }
    
    // Spawn initial enemies
    setEnemies([
      { x: 200, y: 265, defeated: false },   // On platform 1
      { x: 400, y: 215, defeated: false },   // On platform 2
      { x: 600, y: 265, defeated: false }    // On platform 3
    ])

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true
      if (e.key === " " && !mario.isJumping && gameState === "playing") {
        setMario(prev => ({ ...prev, velocityY: -12, isJumping: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [mario.isJumping, gameState])

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return

    const gameLoop = setInterval(() => {
      setMario(prev => {
        let newX = prev.x
        let newY = prev.y + prev.velocityY
        let newVelocityY = prev.velocityY + 0.6 // gravity
        let newIsJumping = prev.isJumping

        // Horizontal movement
        if (keys.current["ArrowLeft"]) newX -= 5
        if (keys.current["ArrowRight"]) newX += 5

        // Boundary checks
        newX = Math.max(0, Math.min(750, newX))

        // Platform collision
        let onPlatform = false
        platforms.forEach(platform => {
          if (
            newX + 30 > platform.x &&
            newX < platform.x + platform.width &&
            prev.y + 30 <= platform.y &&
            newY + 30 >= platform.y
          ) {
            newY = platform.y - 30
            newVelocityY = 0
            newIsJumping = false
            onPlatform = true
          }
        })

        // Ground collision
        if (newY >= 350) {
          newY = 350
          newVelocityY = 0
          newIsJumping = false
          onPlatform = true
        }

        // Check enemy collisions
        enemies.forEach((enemy, index) => {
          if (!enemy.defeated) {
            const enemyWidth = 30
            const enemyHeight = 30
            const marioWidth = 30
            const marioHeight = 30
            
            // Check overlap
            const isOverlapping = 
              newX < enemy.x + enemyWidth &&
              newX + marioWidth > enemy.x &&
              newY < enemy.y + enemyHeight &&
              newY + marioHeight > enemy.y
            
            if (isOverlapping) {
              // Check if Mario is falling and above enemy (jumping on top)
              const isFallingOnTop = prev.velocityY > 2 && prev.y + marioHeight <= enemy.y + 15
              
              if (isFallingOnTop) {
                // Defeat enemy
                setEnemies(prevEnemies => {
                  const newEnemies = [...prevEnemies]
                  newEnemies[index] = { ...newEnemies[index], defeated: true }
                  return newEnemies
                })
                setEnemiesDefeated(prev => prev + 1)
                
                // Show random question from available questions
                setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)])
                setGameState("question")
                
                // Bounce up
                newVelocityY = -10
              } else {
                // Hit enemy from side - lose life
                setLives(prevLives => {
                  const newLives = prevLives - 1
                  if (newLives <= 0) {
                    setGameState("gameover")
                  }
                  return newLives
                })
                // Respawn at start
                newX = 50
                newY = 300
                newVelocityY = 0
              }
            }
          }
        })

        return { x: newX, y: newY, velocityY: newVelocityY, isJumping: newIsJumping }
      })
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(gameLoop)
  }, [gameState, enemies, platforms])

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#87CEEB" // Sky blue
    ctx.fillRect(0, 0, 800, 400)

    // Draw platforms
    platforms.forEach(platform => {
      ctx.fillStyle = "#8B4513"
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
      // Platform outline
      ctx.strokeStyle = "#654321"
      ctx.lineWidth = 2
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height)
    })

    // Draw enemies
    enemies.forEach(enemy => {
      if (!enemy.defeated) {
        // Enemy body (Goomba style)
        ctx.fillStyle = "#8B4513"
        ctx.fillRect(enemy.x, enemy.y, 30, 30)
        // Eyes
        ctx.fillStyle = "#000"
        ctx.fillRect(enemy.x + 8, enemy.y + 10, 5, 5)
        ctx.fillRect(enemy.x + 17, enemy.y + 10, 5, 5)
        // Angry eyebrows
        ctx.fillRect(enemy.x + 6, enemy.y + 8, 7, 2)
        ctx.fillRect(enemy.x + 17, enemy.y + 8, 7, 2)
      } else {
        // Defeated enemy (flat)
        ctx.fillStyle = "#666"
        ctx.fillRect(enemy.x, enemy.y + 20, 30, 10)
      }
    })

    // Draw Mario
    ctx.fillStyle = "#FF0000" // Red cap/shirt
    ctx.fillRect(mario.x, mario.y, 30, 30)
    // Face
    ctx.fillStyle = "#FFDBAC"
    ctx.fillRect(mario.x + 5, mario.y + 10, 20, 15)
    // Eyes
    ctx.fillStyle = "#000"
    ctx.fillRect(mario.x + 10, mario.y + 15, 4, 4)
    ctx.fillRect(mario.x + 16, mario.y + 15, 4, 4)
    // Mustache
    ctx.fillStyle = "#000"
    ctx.fillRect(mario.x + 8, mario.y + 20, 14, 3)
    
    // Draw score and lives
    ctx.fillStyle = "#000"
    ctx.font = "bold 16px Arial"
    ctx.fillText(`Score: ${score}`, 10, 25)
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 10, 50)
    ctx.fillText(`Enemies: ${enemiesDefeated}`, 10, 75)
    
    // Controls hint
    ctx.fillStyle = "#333"
    ctx.font = "12px Arial"
    ctx.fillText("Arrow Keys: Move  |  Space: Jump", 550, 25)

  }, [mario, enemies, score, lives, enemiesDefeated, platforms])

  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion) return

    if (optionIndex === currentQuestion.correct) {
      setScore(prev => prev + 100)
    } else {
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameState("gameover")
        }
        return newLives
      })
    }

    setCurrentQuestion(null)
    setGameState("playing")
  }

  const handleRestart = () => {
    setScore(0)
    setLives(3)
    setEnemiesDefeated(0)
    setMario({ x: 50, y: 300, velocityY: 0, isJumping: false })
    setEnemies([
      { x: 200, y: 265, defeated: false },
      { x: 400, y: 215, defeated: false },
      { x: 600, y: 265, defeated: false }
    ])
    setGameState("playing")
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg">
        <h3 className="text-white font-bold text-xl mb-2">🍄 Super Mario Quiz Adventure!</h3>
        <p className="text-white/90 text-sm">
          Jump on enemies to answer quiz questions! Use Arrow Keys to move and Spacebar to jump.
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full border-4 border-orange-500 rounded-lg bg-sky-300"
      />

      {/* Question Modal */}
      {gameState === "question" && currentQuestion && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-2xl max-w-md w-full mx-4 border-4 border-orange-600 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              ⭐ Quiz Time! ⭐
            </h3>
            <p className="text-xl text-white font-semibold mb-6 text-center">
              {currentQuestion.question}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="bg-white text-black hover:bg-green-400 hover:text-white font-bold py-4 text-lg transition-all transform hover:scale-105 rounded-xl"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-500 to-purple-600 p-8 rounded-2xl max-w-md w-full mx-4 border-4 border-red-700 shadow-2xl text-center">
            <h3 className="text-4xl font-bold text-white mb-4">
              Game Over!
            </h3>
            <p className="text-2xl text-white mb-2">Final Score: {score}</p>
            <p className="text-xl text-white/90 mb-6">
              Enemies Defeated: {enemiesDefeated}
            </p>
            <Button
              onClick={handleRestart}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 text-xl rounded-full transform hover:scale-110 transition-all"
            >
              🔄 Play Again
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white/5 p-4 rounded-lg">
        <h4 className="text-white font-semibold mb-2">🎮 How to Play:</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Use <strong>Arrow Keys</strong> (← →) to move Mario left and right</li>
          <li>• Press <strong>Spacebar</strong> to jump</li>
          <li>• Jump on enemies from above to defeat them</li>
          <li>• Answer quiz questions correctly to earn 100 points!</li>
          <li>• Don't touch enemies from the side or you'll lose a life!</li>
        </ul>
      </div>
    </div>
  )
}
