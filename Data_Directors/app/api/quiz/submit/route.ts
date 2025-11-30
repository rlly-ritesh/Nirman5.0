import { NextRequest, NextResponse } from "next/server"

interface QuizSubmission {
  quizId: string
  userId: string
  answers: Record<string, number> 
  timeSpent: number 
  documentId?: string
}

interface QuizResult {
  quizId: string
  score: number
  percentage: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  timeSpent: number
  breakdown: Array<{
    questionId: string
    correct: boolean
    userAnswer: number
    correctAnswer: number
    explanation: string
  }>
  passed: boolean
  pointsEarned: number
  achievements?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const submission: QuizSubmission = await request.json()
    const { quizId, userId, answers, timeSpent } = submission

    if (!quizId || !userId || !answers) {
      return NextResponse.json(
        { error: "Quiz ID, User ID, and answers are required" },
        { status: 400 }
      )
    }

    const correctAnswers: Record<string, number> = {
      q_1: 0,
      q_2: 2,
      q_3: 2,
      q_4: 2,
      q_5: 2,
    }

    const explanations: Record<string, string> = {
      q_1: "Newton's Second Law states that F = ma, meaning force is directly proportional to mass and acceleration.",
      q_2: "Using F = ma, we get F = 5 kg Ã— 2 m/sÂ² = 10 N",
      q_3: "Kinetic energy is proportional to velocity squared (KE = Â½mvÂ²). If velocity doubles, KE increases by a factor of 4.",
      q_4: "Speed is a scalar quantity (magnitude only), while velocity, acceleration, and force are vectors (magnitude and direction).",
      q_5: "In an elastic collision, both momentum and kinetic energy are conserved.",
    }

    const breakdown = Object.entries(answers).map(([questionId, userAnswer]) => {
      const correctAnswer = correctAnswers[questionId]
      const isCorrect = userAnswer === correctAnswer
      return {
        questionId,
        correct: isCorrect,
        userAnswer,
        correctAnswer,
        explanation: explanations[questionId] || "",
      }
    })

    const correctCount = breakdown.filter((q) => q.correct).length
    const totalQuestions = Object.keys(correctAnswers).length
    const percentage = Math.round((correctCount / totalQuestions) * 100)
    const passed = percentage >= 60 

    let pointsEarned = correctCount * 10 
    if (passed) pointsEarned += 20 
    if (percentage >= 90) pointsEarned += 30 
    if (timeSpent < 300) pointsEarned += 10 

    const achievements: string[] = []
    if (percentage === 100) achievements.push("Perfect Score! ðŸŽ¯")
    if (percentage >= 90) achievements.push("Quiz Master ðŸ†")
    if (timeSpent < 180) achievements.push("Speed Demon âš¡")

    await new Promise((resolve) => setTimeout(resolve, 500))

    const result: QuizResult = {
      quizId,
      score: correctCount,
      percentage,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      timeSpent,
      breakdown,
      passed,
      pointsEarned,
      achievements: achievements.length > 0 ? achievements : undefined,
    }

    return NextResponse.json(
      {
        success: true,
        result,
        message: passed
          ? "Congratulations! You passed the quiz!"
          : "Keep practicing! You'll do better next time.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Quiz submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit quiz. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const quizId = searchParams.get("quizId")

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    )
  }

  const mockHistory = [
    {
      quizId: "quiz_physics_001",
      title: "Physics - Newton's Laws",
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      passed: true,
    },
    {
      quizId: "quiz_chemistry_001",
      title: "Chemistry - Organic Compounds",
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      passed: true,
    },
  ]

  return NextResponse.json({
    userId,
    history: quizId
      ? mockHistory.filter((h) => h.quizId === quizId)
      : mockHistory,
    totalQuizzes: mockHistory.length,
  })
}


