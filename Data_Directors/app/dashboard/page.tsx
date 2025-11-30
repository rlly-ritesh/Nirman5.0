"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Upload as UploadIcon,
  Award,
  TrendingUp,
  Brain,
  ClipboardList,
  Gamepad2,
  FileText,
  Target,
  BookOpen,
  Trophy,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      label: "Documents",
      value: "12",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      change: "+3 this week",
    },
    {
      label: "Flashcards",
      value: "248",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      change: "+42 this week",
    },
    {
      label: "Quizzes Taken",
      value: "35",
      icon: ClipboardList,
      color: "from-orange-500 to-red-500",
      change: "+7 this week",
    },
    {
      label: "Average Score",
      value: "85%",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      change: "+5% this month",
    },
  ];

  const recentActivity = [
    {
      type: "upload",
      title: "Uploaded Introduction to Physics",
      time: "2 hours ago",
      icon: UploadIcon,
      color: "text-blue-400",
    },
    {
      type: "quiz",
      title: "Completed Chemistry Quiz - Scored 92%",
      time: "5 hours ago",
      icon: ClipboardList,
      color: "text-green-400",
    },
    {
      type: "flashcard",
      title: "Practiced 20 Math flashcards",
      time: "Yesterday",
      icon: Brain,
      color: "text-purple-400",
    },
    {
      type: "game",
      title: "Earned 'Quick Learner' badge in Kid Mode",
      time: "2 days ago",
      icon: Trophy,
      color: "text-yellow-400",
    },
  ];

  const recommendations = [
    {
      title: "Complete Daily Quiz",
      description: "Keep your learning streak alive!",
      action: "Start Quiz",
      href: "/dashboard/quizzes",
    },
    {
      title: "Upload New Document",
      description: "Transform your next PDF into flashcards",
      action: "Upload",
      href: "/dashboard/upload",
    },
    {
      title: "Practice Flashcards",
      description: "Review your Biology flashcards",
      action: "Practice",
      href: "/dashboard/flashcards",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden dark-card-elevated p-8 rounded-2xl border border-purple-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to learn something new?
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            Upload a PDF or start a quiz to continue your learning journey
          </p>
          <Button
            asChild
            className="px-8 py-4 rounded-full inline-flex items-center gap-2 font-semibold text-base shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <Link href="/dashboard/upload">
              <UploadIcon className="w-5 h-5" />
              Upload New PDF
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative dark-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  {stat.change}
                </span>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-400">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dark-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${activity.color}`}
                >
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dark-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" /> Recommended
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <h4 className="text-white font-medium mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                <Button
                  asChild
                  className="px-4 py-2 rounded-full text-sm inline-block font-medium"
                >
                  <Link href={rec.href}>{rec.action}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/ai-integration"
          className="group dark-card p-6 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all hover:scale-105 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Chatbot</h3>
            <p className="text-sm text-gray-400">
              Chat & generate notes with AI
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/quizzes"
          className="group dark-card p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all hover:scale-105 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Take a Quiz</h3>
            <p className="text-sm text-gray-400">
              Test your knowledge with AI-generated quizzes
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/flashcards"
          className="group dark-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Practice Flashcards
            </h3>
            <p className="text-sm text-gray-400">
              Review and memorize key concepts
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/kid-mode"
          className="group dark-card p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all hover:scale-105 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Kid Mode</h3>
            <p className="text-sm text-gray-400">
              Fun gamified learning for young learners
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
