"use client"

import React, { useState } from "react"
import Link from "next/link"
import FlappyBird from "@/components/flappy-bird"
import MarioQuiz from "@/components/mario-quiz"

export default function KidModePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [searchTopic, setSearchTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  const kidProfile = {
    name: "Alex",
    avatar: "🦄",
    level: 12,
    totalPoints: 2450,
    streakDays: 7,
    badges: [
      { id: "1", name: "Quick Learner", icon: "⚡", earned: true },
      { id: "2", name: "Reading Master", icon: "📚", earned: true },
      { id: "3", name: "Math Wizard", icon: "🧙", earned: true },
      { id: "4", name: "Science Explorer", icon: "🔬", earned: false },
      { id: "5", name: "Perfect Week", icon: "🎯", earned: true },
      { id: "6", name: "Super Star", icon: "⭐", earned: false },
    ],
  }

  const games = [
    {
      id: "flappy-bird",
      title: "Flappy Bird Quiz",
      description: "Navigate through pipes and answer questions!",
      icon: "🐦",
      points: "100-250",
      difficulty: "Medium",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "mario-quiz",
      title: "Super Mario Quiz",
      description: "Jump on enemies to answer quiz questions!",
      icon: "🍄",
      points: "100-300",
      difficulty: "Medium",
      color: "from-red-500 to-blue-500",
    },
  ]

  const handleSearchTopic = async () => {
    if (!searchTopic.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma2:2b",
          prompt: `Generate 10 multiple choice quiz questions about "${searchTopic}" suitable for kids aged 8-12. Format as JSON array:
[
  {"question": "Question text?", "options": ["A", "B", "C", "D"], "correct": 0}
]
Return ONLY the JSON array, no other text.`,
          stream: false,
        }),
      })
      
      const data = await response.json()
      const text = data.response
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/)
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0])
        setGeneratedQuestions(questions)
        localStorage.setItem("kidQuizQuestions", JSON.stringify(questions))
        alert(`✅ Generated ${questions.length} questions about ${searchTopic}! Start a game to play with them.`)
      } else {
        alert("Failed to parse questions. Please try again.")
      }
    } catch (error) {
      console.error("Error generating questions:", error)
      alert("Make sure Ollama is running! Run: ollama serve")
    } finally {
      setIsGenerating(false)
    }
  }

  const recentActivities = [
    { activity: "Completed Quiz Race", points: 150, time: "10 min ago", icon: "🧠" },
    { activity: "Earned 'Quick Learner' Badge", points: 100, time: "1 hour ago", icon: "⚡" },
    { activity: "Flashcard Match - Level 5", points: 75, time: "Today", icon: "🎴" },
  ]

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-5xl">{kidProfile.avatar}</span>
            Welcome, {kidProfile.name}!
          </h1>
          <p className="text-gray-400">Let's learn and have fun today!</p>
        </div>
        <Link
          href="/dashboard/kid-mode/avatar"
          className="btn-3d-orange-secondary px-6 py-3 rounded-full font-medium"
        >
          ✏️ Customize Avatar
        </Link>
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dark-card-elevated p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-gradient-neon mb-1">{kidProfile.level}</div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
        <div className="dark-card-elevated p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-gradient-neon mb-1">{kidProfile.totalPoints}</div>
          <div className="text-sm text-gray-400">Total Points</div>
        </div>
        <div className="dark-card-elevated p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-gradient-neon mb-1">{kidProfile.streakDays}</div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
        <div className="dark-card-elevated p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">🎖️</div>
          <div className="text-3xl font-bold text-gradient-neon mb-1">
            {kidProfile.badges.filter((b) => b.earned).length}
          </div>
          <div className="text-sm text-gray-400">Badges</div>
        </div>
      </div>

      
      <div className="dark-card-elevated p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Level {kidProfile.level}</h3>
            <p className="text-sm text-gray-400">350 more points to Level {kidProfile.level + 1}!</p>
          </div>
          <div className="text-2xl">🎯</div>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full gradient-neon-purple-pink" style={{ width: "65%" }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>2450 XP</span>
          <span>2800 XP</span>
        </div>
      </div>

      {/* Topic Search */}
      <div className="dark-card-elevated p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔍</span> Search Quiz Topic
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Search for any topic and AI will generate quiz questions for your games!
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchTopic()}
            placeholder="E.g., Animals, Space, Math, History..."
            className="flex-1 px-4 py-3 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            disabled={isGenerating}
          />
          <button
            onClick={handleSearchTopic}
            disabled={isGenerating || !searchTopic.trim()}
            className="btn-3d-orange px-8 py-3 rounded-full font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⚙️</span>
                Generating...
              </>
            ) : (
              <>
                ✨ Generate Questions
              </>
            )}
          </button>
        </div>
        {generatedQuestions.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-green-400 font-semibold">
              ✅ {generatedQuestions.length} questions ready! Play any game below to use them.
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🎮 Choose Your Game!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="dark-card-elevated p-6 rounded-xl border-2 border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                {game.icon}
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">{game.title}</h3>
              <p className="text-sm text-gray-400 text-center mb-4">{game.description}</p>
              <div className="flex justify-between text-xs">
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  {game.points} pts
                </span>
                <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                  {game.difficulty}
                </span>
              </div>
              <button className="w-full mt-4 btn-3d-orange px-4 py-2 rounded-full text-sm font-semibold">
                Play Now
              </button>
            </div>
          ))}
        </div>
      </div>

      
      {selectedGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50">
            <div className="flex justify-between items-center p-6 border-b border-purple-500/30">
              <h2 className="text-2xl font-bold text-white">
                {games.find((g) => g.id === selectedGame)?.title}
              </h2>
              <button
                onClick={() => setSelectedGame(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {selectedGame === "flappy-bird" && <FlappyBird />}
              {selectedGame === "mario-quiz" && <MarioQuiz />}
            </div>
          </div>
        </div>
      )}

      
      <div className="dark-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎅</span> Badge Collection
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {kidProfile.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl text-center transition-all ${
                badge.earned
                  ? "dark-card-elevated border-2 border-yellow-500/50"
                  : "bg-white/5 opacity-50 grayscale"
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="text-xs text-white font-medium">{badge.name}</div>
              {badge.earned && <div className="text-xs text-green-400 mt-1">✔ Earned</div>}
            </div>
          ))}
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dark-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                <div className="text-3xl">{activity.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{activity.activity}</div>
                  <div className="text-sm text-gray-400">{activity.time}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">+{activity.points}</div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="dark-card-elevated p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>ðŸŽ¯</span> Daily Challenge
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Answer 10 Questions</span>
                <span className="text-purple-400 font-bold">7/10</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: "70%" }} />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Study for 15 minutes</span>
                <span className="text-green-400 font-bold">âœ“ Done!</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Complete 1 Game</span>
                <span className="text-orange-400 font-bold">0/1</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: "0%" }} />
              </div>
            </div>

            <div className="text-center mt-6">
              <div className="text-sm text-gray-400 mb-2">Complete all challenges to earn</div>
              <div className="text-2xl font-bold text-gradient-neon">+500 Bonus Points!</div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="dark-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>ðŸ†</span> Leaderboard
          </h3>
          <Link href="/dashboard/kid-mode/leaderboard" className="text-purple-400 hover:text-purple-300 text-sm">
            View All â†’
          </Link>
        </div>
        <div className="space-y-2">
          {[
            { rank: 1, name: "Emma", points: 3200, avatar: "ðŸ¦„" },
            { rank: 2, name: "Alex", points: 2450, avatar: "ðŸ¦", isYou: true },
            { rank: 3, name: "Max", points: 2150, avatar: "ðŸ»" },
          ].map((player) => (
            <div
              key={player.rank}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                player.isYou ? "bg-purple-500/20 border-2 border-purple-500/50" : "bg-white/5"
              }`}
            >
              <div className="text-2xl font-bold text-gray-400 w-8">#{player.rank}</div>
              <div className="text-3xl">{player.avatar}</div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  {player.name} {player.isYou && <span className="text-purple-400">(You!)</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gradient-neon">{player.points}</div>
                <div className="text-xs text-gray-400">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


