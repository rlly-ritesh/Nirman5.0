"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Trash2, Plus, BookOpen } from "lucide-react";

interface Note {
  id: string;
  tags: string[];
}

interface NotesManagerProps {
  backendUrl?: string;
}

export function NotesManager({
  backendUrl = "http://localhost:5000",
}: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Load saved notes files on mount
  useEffect(() => {
    loadSavedFiles();
  }, []);

  const loadSavedFiles = async () => {
    try {
      const res = await fetch("/api/notes/list");
      const data = await res.json();
      if (data.status === "success") {
        setSavedFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to load saved files:", error);
    }
  };

  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setNotes(data.notes || []);
        setTopic("");
        // Refresh saved files
        loadSavedFiles();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Failed to generate notes: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFile = async (filepath: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filepath }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setNotes(data.notes || []);
        setSelectedFile(filepath);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Failed to load notes: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNotes([]);
    setSelectedFile(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Notes Manager</h2>
        </div>
        <p className="text-green-100">Generate or load study notes with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate New Notes */}
        <Card className="p-6 bg-slate-800 border-slate-700 lg:col-span-1">
          <h3 className="text-white font-semibold mb-4">Generate New</h3>

          <form onSubmit={handleGenerateNotes} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis"
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Number of Notes ({count})
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                disabled={loading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={!topic.trim() || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Load Saved Notes */}
        <Card className="p-6 bg-slate-800 border-slate-700 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Saved Notes</h3>

          {savedFiles.length === 0 ? (
            <p className="text-slate-400 text-sm">No saved notes yet</p>
          ) : (
            <div className="space-y-2">
              {savedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{file}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoadFile(file)}
                    disabled={loading}
                    className="border-slate-600 ml-2"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Display Notes */}
      {notes.length > 0 && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">
              {selectedFile ? "Loaded Notes" : "Generated Notes"} (
              {notes.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, idx) => (
              <Card
                key={idx}
                className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-slate-500 transition"
              >
                <h4 className="text-white font-medium mb-3">{note.id}</h4>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, tagIdx) => (
                    <Badge
                      key={tagIdx}
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
