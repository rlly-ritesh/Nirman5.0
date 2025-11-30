"use client";

import React, { useState } from "react";
import { Chatbot } from "@/components/chatbot";
import { NotesManager } from "@/components/notes-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, BookOpen, Network } from "lucide-react";

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = useState("notes");

  const openGraphViz = () => {
    window.open("http://localhost:8000", "_blank", "width=1200,height=800");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Learning Hub</h1>
              <p className="text-purple-100 mt-1">
                Chatbot • Notes • Visualization
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-lg px-3 py-1 border-white text-white"
            >
              Backend Connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800 border border-slate-700">
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-green-600"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-blue-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <NotesManager />

            <Card className="p-6 bg-slate-800 border-slate-700">
              <h3 className="text-white font-semibold mb-4">Visualization</h3>
              <p className="text-slate-400 text-sm mb-4">
                View your notes as an interactive graph to understand
                connections between concepts.
              </p>
              <Button
                onClick={openGraphViz}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                <Network className="w-4 h-4 mr-2" />
                View Graph Visualization
              </Button>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="h-[700px] bg-slate-800 border-slate-700 overflow-hidden">
              <Chatbot sessionId="main-session" model="gemma2:2b" />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-white font-semibold mb-2">Frontend</h4>
            <code className="text-xs text-blue-300">http://localhost:3000</code>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-white font-semibold mb-2">Backend</h4>
            <code className="text-xs text-purple-300">
              http://localhost:5000
            </code>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-white font-semibold mb-2">Ollama</h4>
            <code className="text-xs text-green-300">
              http://localhost:11434
            </code>
          </Card>
        </div>
      </div>
    </div>
  );
}
