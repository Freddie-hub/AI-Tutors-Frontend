"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCourseGenerator } from "@/hooks/useCourseGenerator";
import type { CourseChapter } from "@/lib/types";
import { CourseTOCReview } from "./CourseTOCReview";

interface CustomCourseFormProps {
  onBack: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomCourseForm({ onBack, onSuccess, onCancel }: CustomCourseFormProps) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goals, setGoals] = useState("");
  const [duration, setDuration] = useState("8 weeks");
  const [showTOC, setShowTOC] = useState(false);

  const { isGenerating, error, generatedTOC, generateCustomCourse, saveCourse, reset } = useCourseGenerator();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    try {
      await generateCustomCourse({
        topic: topic.trim(),
        level,
        goals: goals.trim() || undefined,
        duration: duration || undefined,
      });

      setShowTOC(true);
    } catch (err) {
      console.error('Failed to generate course:', err);
    }
  };

  const handleSaveCourse = async (editedChapters: CourseChapter[]) => {
    if (!generatedTOC) return;

    try {
      // For custom courses, we don't have CBC curriculum context
      // Each chapter's subject is determined by the AI
      const subjectsMap = new Map<string, Set<string>>();
      
      editedChapters.forEach(chapter => {
        if (!subjectsMap.has(chapter.subject)) {
          subjectsMap.set(chapter.subject, new Set());
        }
      });

      const subjects = Array.from(subjectsMap.keys()).map(subjectName => ({
        subject: subjectName,
        strands: [], // Custom courses don't have CBC strands
      }));

      await saveCourse({
        name: generatedTOC.courseName,
        grade: 'Custom', // Custom courses don't have specific grades
        subjects,
        description: generatedTOC.description,
        courseType: 'custom',
        chapters: editedChapters,
        estimatedDuration: generatedTOC.estimatedDuration,
        difficulty: generatedTOC.difficulty,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to save course:', err);
    }
  };

  if (showTOC && generatedTOC) {
    return (
      <CourseTOCReview
        toc={generatedTOC}
        onBack={() => {
          setShowTOC(false);
          reset();
        }}
        onSave={handleSaveCourse}
        onCancel={onCancel}
      />
    );
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </button>
          <DialogTitle className="text-white/95">Create Custom Course</DialogTitle>
        </div>
        <p className="text-[#9aa6b2] text-sm mt-2">
          Tell us what you want to learn and we'll create a personalized course for you
        </p>
      </DialogHeader>

      <div className="space-y-5 mt-4">
        {/* Topic Input */}
        <div>
          <Label htmlFor="topic" className="text-white/90 mb-2 block">
            What do you want to learn? *
          </Label>
          <Input
            id="topic"
            placeholder="e.g., Advanced Calculus, Creative Writing, Web Development"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-[#9aa6b2]/50"
          />
        </div>

        {/* Level Selection */}
        <div>
          <Label htmlFor="level" className="text-white/90 mb-2 block">
            Your Current Level *
          </Label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
          >
            <option value="beginner" className="bg-[#0E0E10]">Beginner - Just starting out</option>
            <option value="intermediate" className="bg-[#0E0E10]">Intermediate - Some experience</option>
            <option value="advanced" className="bg-[#0E0E10]">Advanced - Strong foundation</option>
          </select>
        </div>

        {/* Duration Selection */}
        <div>
          <Label htmlFor="duration" className="text-white/90 mb-2 block">
            Course Duration
          </Label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
          >
            <option value="4 weeks" className="bg-[#0E0E10]">4 weeks</option>
            <option value="8 weeks" className="bg-[#0E0E10]">8 weeks</option>
            <option value="12 weeks" className="bg-[#0E0E10]">12 weeks</option>
            <option value="16 weeks" className="bg-[#0E0E10]">16 weeks</option>
            <option value="Self-paced" className="bg-[#0E0E10]">Self-paced</option>
          </select>
        </div>

        {/* Learning Goals */}
        <div>
          <Label htmlFor="goals" className="text-white/90 mb-2 block">
            Learning Goals (Optional)
          </Label>
          <Textarea
            id="goals"
            placeholder="What do you hope to achieve with this course? What skills do you want to develop?"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={4}
            className="bg-white/5 border-white/10 text-white placeholder:text-[#9aa6b2]/50 resize-none"
          />
          <p className="text-xs text-[#9aa6b2] mt-1">
            Be specific about what you want to learn and accomplish
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Course'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
