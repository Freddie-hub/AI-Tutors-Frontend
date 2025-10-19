"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/CBCStudent/shared/Card';
import AgentWorking from './AgentWorking';
import { useLessonGenerator } from '@/hooks/useLessonGenerator';
import type { PlanResponsePayload } from '@/lib/ai/types';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LessonFormModal({ open, onClose }: Props) {
  const { setLesson, setGenerationStatus, setCurrentAgent: setCtxAgent, setGenerationProgress } = useLesson();
  const {
    status,
    error,
    progress,
    currentAgent,
    toc,
    final,
    lessonId,
    generateTOC,
    acceptTOC,
    splitWorkload,
    startGeneration,
    cancelGeneration,
    replanTOC,
    adoptLesson,
  } = useLessonGenerator({
    onProgress: (evt) => {
      if (evt.agent) setCtxAgent(evt.agent);
      if (evt.type === 'subtask_complete') {
        setGenerationProgress({ current: evt.data?.order || 0, total: evt.data?.totalSubtasks || 0 });
      }
    },
    onComplete: () => {
      setCtxAgent(null);
      setGenerationStatus('completed');
    },
    onError: () => {
      setGenerationStatus('error');
      setCtxAgent(null);
    }
  });
  // Hardcoded curriculum (grades -> subjects -> topics -> subtopics names only)
  const CURRICULUM = useMemo(() => ({
    'Grade 1': {
      'English Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures and Functions': [],
      },
      'Kiswahili Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Matumizi ya Lugha': [],
      },
      'Mathematical Activities': {
        'Numbers': [],
        'Measurement': [],
        'Geometry': [],
        'Data Handling': [],
      },
      'Environmental Activities': {
        'Environment and its Resources': [],
        'Social Environment': [],
        'Care for the Environment': [],
      },
      'Creative Activities': {
        'Art and Craft': [],
        'Music': [],
        'Movement': [],
      },
      'Religious Education Activities (CRE Example)': {
        'Creation': [],
        'The Holy Bible': [],
        'Christian Values': [],
        'The Church': [],
      },
      'Indigenous Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures': [],
      },
    },
    'Grade 2': {
      'English Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures and Functions': [],
      },
      'Kiswahili Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Matumizi ya Lugha': [],
      },
      'Mathematical Activities': {
        'Numbers': [],
        'Measurement': [],
        'Geometry': [],
        'Data Handling': [],
      },
      'Environmental Activities': {
        'Environment and its Resources': [],
        'Social Environment': [],
        'Care for the Environment': [],
      },
      'Creative Activities': {
        'Art and Craft': [],
        'Music': [],
        'Movement': [],
      },
      'Religious Education Activities (CRE Example)': {
        'Creation': [],
        'The Holy Bible': [],
        'Christian Values': [],
        'The Church': [],
      },
      'Indigenous Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures': [],
      },
    },
    'Grade 3': {
      'English Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures and Functions': [],
      },
      'Kiswahili Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Matumizi ya Lugha': [],
      },
      'Mathematical Activities': {
        'Numbers': [],
        'Measurement': [],
        'Geometry': [],
        'Data Handling': [],
      },
      'Environmental Activities': {
        'Environment and its Resources': [],
        'Social Environment': [],
        'Care for the Environment': [],
      },
      'Creative Activities': {
        'Art and Craft': [],
        'Music': [],
        'Movement': [],
      },
      'Religious Education Activities (CRE Example)': {
        'Creation': [],
        'The Holy Bible': [],
        'Christian Values': [],
        'The Church': [],
      },
      'Indigenous Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures': [],
      },
    },
    'Grade 4': {
      'English Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures and Functions': [],
      },
      'Kiswahili Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Matumizi ya Lugha': [],
      },
      'Mathematical Activities': {
        'Numbers': [],
        'Measurement': [],
        'Geometry': [],
        'Data Handling': [],
      },
      'Science and Technology Activities': {
        'Living Things': [],
        'Matter': [],
        'Energy and Forces': [],
        'Earth and Space': [],
        'Technology': [],
      },
      'Social Studies Activities': {
        'Our Environment': [],
        'People and Communities': [],
        'Citizenship': [],
      },
      'Religious Education Activities (CRE Example)': {
        'Creation and the Bible': [],
        'Life and Ministry of Jesus': [],
        'Christian Values': [],
        'Church and Sacraments': [],
      },
      'Home Science Activities': {
        'Growth and Development': [],
        'Clothing and Textiles': [],
        'Food and Nutrition': [],
        'Environmental Care': [],
      },
      'Physical and Health Education Activities': {
        'Physical Fitness': [],
        'Health Education': [],
        'Safety and First Aid': [],
      },
      'Creative Arts Activities': {
        'Visual Arts': [],
        'Performing Arts': [],
        'Integrated Arts': [],
      },
      'Indigenous Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi': [],
      },
    },
    'Grade 5': {
      'English Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures and Functions': [],
      },
      'Kiswahili Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Matumizi ya Lugha': [],
      },
      'Mathematical Activities': {
        'Numbers': [],
        'Measurement': [],
        'Geometry': [],
        'Data Handling': [],
      },
      'Science and Technology Activities': {
        'Living Things': [],
        'Matter': [],
        'Energy and Forces': [],
        'Earth and Space': [],
        'Technology': [],
      },
      'Social Studies Activities': {
        'Our Environment': [],
        'People and Communities': [],
        'Citizenship': [],
      },
      'Religious Education Activities (CRE Example)': {
        'Creation and the Bible': [],
        'Life and Ministry of Jesus': [],
        'Christian Values': [],
        'Church and Sacraments': [],
      },
      'Home Science Activities': {
        'Growth and Development': [],
        'Clothing and Textiles': [],
        'Food and Nutrition': [],
        'Environmental Care': [],
      },
      'Physical and Health Education Activities': {
        'Physical Fitness': [],
        'Health Education': [],
        'Safety and First Aid': [],
      },
      'Creative Arts Activities': {
        'Visual Arts': [],
        'Performing Arts': [],
        'Integrated Arts': [],
      },
      'Indigenous Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi': [],
      },
    },
    'Grade 6': {
      'English Language Activities': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Language Structures and Functions': [],
      },
      'Kiswahili Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Matumizi ya Lugha': [],
      },
      'Mathematical Activities': {
        'Numbers': [],
        'Measurement': [],
        'Geometry': [],
        'Data Handling': [],
      },
      'Science and Technology Activities': {
        'Living Things': [],
        'Matter': [],
        'Energy and Forces': [],
        'Earth and Space': [],
        'Technology': [],
      },
      'Social Studies Activities': {
        'Our Environment': [],
        'People and Communities': [],
        'Citizenship': [],
      },
      'Religious Education Activities (CRE Example)': {
        'Creation and the Bible': [],
        'Life and Ministry of Jesus': [],
        'Christian Values': [],
        'Church and Sacraments': [],
      },
      'Home Science Activities': {
        'Growth and Development': [],
        'Clothing and Textiles': [],
        'Food and Nutrition': [],
        'Environmental Care': [],
      },
      'Physical and Health Education Activities': {
        'Physical Fitness': [],
        'Health Education': [],
        'Safety and First Aid': [],
      },
      'Creative Arts Activities': {
        'Visual Arts': [],
        'Performing Arts': [],
        'Integrated Arts': [],
      },
      'Indigenous Language Activities': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi': [],
      },
    },
    'Grade 7': {
      'English': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar and Vocabulary': [],
      },
      'Kiswahili': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Msamiati': [],
      },
      'Mathematics': {
        'Numbers': [],
        'Algebra': [],
        'Geometry': [],
        'Measurement': [],
        'Data Handling and Probability': [],
      },
      'Integrated Science': {
        'Scientific Skills': [],
        'Biology': [],
        'Chemistry': [],
        'Physics': [],
        'Earth and Space': [],
      },
      'Social Studies': {
        'History': [],
        'Geography': [],
        'Civics': [],
        'Economics': [],
      },
      'Religious Education (CRE Example)': {
        'The Bible': [],
        'Christian Living': [],
        'Church History': [],
        'Contemporary Issues': [],
      },
      'Pre-Technical and Pre-Career Education': {
        'Technical Skills': [],
        'Technology': [],
        'Career Education': [],
        'Project Work': [],
      },
      'Health Education': {
        'Personal Health': [],
        'Disease Prevention': [],
        'Safety Education': [],
        'Substance Abuse': [],
      },
      'Creative Arts and Sports': {
        'Visual Arts': [],
        'Performing Arts': [],
        'Sports': [],
      },
      'Agriculture': {
        'Crop Production': [],
        'Animal Production': [],
        'Agricultural Technology': [],
        'Agri-business': [],
      },
      'Business Studies': {
        'Business Concepts': [],
        'Financial Literacy': [],
        'Economics': [],
        'Business Technology': [],
      },
      'Indigenous Language or Foreign Language (French Example)': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar': [],
      },
    },
    'Grade 8': {
      'English': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar and Vocabulary': [],
      },
      'Kiswahili': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Msamiati': [],
      },
      'Mathematics': {
        'Numbers': [],
        'Algebra': [],
        'Geometry': [],
        'Measurement': [],
        'Data Handling and Probability': [],
      },
      'Integrated Science': {
        'Scientific Skills': [],
        'Biology': [],
        'Chemistry': [],
        'Physics': [],
        'Earth and Space': [],
      },
      'Social Studies': {
        'History': [],
        'Geography': [],
        'Civics': [],
        'Economics': [],
      },
      'Religious Education (CRE Example)': {
        'The Bible': [],
        'Christian Living': [],
        'Church History': [],
        'Contemporary Issues': [],
      },
      'Pre-Technical and Pre-Career Education': {
        'Technical Skills': [],
        'Technology': [],
        'Career Education': [],
        'Project Work': [],
      },
      'Health Education': {
        'Personal Health': [],
        'Disease Prevention': [],
        'Safety Education': [],
        'Substance Abuse': [],
      },
      'Creative Arts and Sports': {
        'Visual Arts': [],
        'Performing Arts': [],
        'Sports': [],
      },
      'Agriculture': {
        'Crop Production': [],
        'Animal Production': [],
        'Agricultural Technology': [],
        'Agri-business': [],
      },
      'Business Studies': {
        'Business Concepts': [],
        'Financial Literacy': [],
        'Economics': [],
        'Business Technology': [],
      },
      'Indigenous Language or Foreign Language (French Example)': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar': [],
      },
    },
    'Grade 9': {
      'English': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar and Vocabulary': [],
      },
      'Kiswahili': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Msamiati': [],
      },
      'Mathematics': {
        'Numbers': [],
        'Algebra': [],
        'Geometry': [],
        'Measurement': [],
        'Data Handling and Probability': [],
      },
      'Integrated Science': {
        'Scientific Skills': [],
        'Biology': [],
        'Chemistry': [],
        'Physics': [],
        'Earth and Space': [],
      },
      'Social Studies': {
        'History': [],
        'Geography': [],
        'Civics': [],
        'Economics': [],
      },
      'Religious Education (CRE Example)': {
        'The Bible': [],
        'Christian Living': [],
        'Church History': [],
        'Contemporary Issues': [],
      },
      'Pre-Technical and Pre-Career Education': {
        'Technical Skills': [],
        'Technology': [],
        'Career Education': [],
        'Project Work': [],
      },
      'Health Education': {
        'Personal Health': [],
        'Disease Prevention': [],
        'Safety Education': [],
        'Substance Abuse': [],
      },
      'Creative Arts and Sports': {
        'Visual Arts': [],
        'Performing Arts': [],
        'Sports': [],
      },
      'Agriculture': {
        'Crop Production': [],
        'Animal Production': [],
        'Agricultural Technology': [],
        'Agri-business': [],
      },
      'Business Studies': {
        'Business Concepts': [],
        'Financial Literacy': [],
        'Economics': [],
        'Business Technology': [],
      },
      'Indigenous Language or Foreign Language (French Example)': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar': [],
      },
    },
    'Grade 10': {
      'Community Service Learning': {
        'Community Engagement': [],
        'Leadership and Ethics': [],
        'Sustainable Development': [],
      },
      'Mathematics': {
        'Numbers and Algebra': [],
        'Geometry and Measurement': [],
        'Statistics and Probability': [],
        'Financial Maths': [],
      },
      'English Language': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Grammar and Literature': [],
      },
      'Kiswahili Language': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
        'Sarufi na Fasihi': [],
      },
      'Indigenous Language or Foreign Language (French Example)': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Cultural Studies': [],
      },
      'Biology (STEM)': {
        'Cell Biology': [],
        'Genetics and Evolution': [],
        'Ecology': [],
        'Human Physiology': [],
      },
      'Chemistry (STEM)': {
        'Atomic Structure': [],
        'Chemical Bonding': [],
        'Organic Chemistry': [],
        'Stoichiometry': [],
      },
      'Physics (STEM)': {
        'Mechanics': [],
        'Waves and Optics': [],
        'Electricity': [],
        'Thermal Physics': [],
      },
      'History and Citizenship (Social Sciences)': {
        'Kenyan History': [],
        'World History': [],
        'Citizenship': [],
      },
      'Geography (Social Sciences)': {
        'Physical Geography': [],
        'Human Geography': [],
        'Environmental Management': [],
      },
      'Economics (Social Sciences)': {
        'Microeconomics': [],
        'Macroeconomics': [],
        'Development Economics': [],
      },
      'Performing Arts (Arts and Sports)': {
        'Music': [],
        'Drama': [],
        'Dance': [],
      },
      'Visual Arts (Arts and Sports)': {
        'Drawing and Painting': [],
        'Sculpture and Ceramics': [],
        'Digital Arts': [],
      },
      'Sports Science (Arts and Sports)': {
        'Anatomy and Physiology': [],
        'Skills and Techniques': [],
        'Management': [],
      },
      'Religious Education (CRE Example, Optional)': {
        'The Bible': [],
        'Christian Living': [],
        'Contemporary Issues': [],
      },
    },
    'Grade 11': {
      'Community Service Learning': {
        'Advanced Engagement': [],
        'Global Citizenship': [],
      },
      'Mathematics': {
        'Advanced Algebra': [],
        'Calculus Intro': [],
        'Vectors and Transformations': [],
        'Statistics': [],
      },
      'English Language': {
        'Advanced Communication': [],
        'Literary Studies': [],
        'Research Writing': [],
      },
      'Kiswahili Language': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
        'Kuandika': [],
      },
      'Indigenous Language or Foreign Language (French Example)': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Cultural Studies': [],
      },
      'Biology (STEM)': {
        'Molecular Biology': [],
        'Evolution and Diversity': [],
        'Applied Physiology': [],
      },
      'Chemistry (STEM)': {
        'Thermodynamics': [],
        'Electrochemistry': [],
        'Analytical Chemistry': [],
      },
      'Physics (STEM)': {
        'Modern Physics': [],
        'Electromagnetism': [],
        'Applied Mechanics': [],
      },
      'History and Citizenship (Social Sciences)': {
        'Contemporary History': [],
        'Political Systems': [],
      },
      'Geography (Social Sciences)': {
        'Advanced Physical Geography': [],
        'Human and Economic Geography': [],
        'Environmental Management': [],
      },
      'Economics (Social Sciences)': {
        'International Economics': [],
        'Economic Development': [],
      },
      'Performing Arts (Arts and Sports)': {
        'Advanced Music': [],
        'Theatre Production': [],
      },
      'Visual Arts (Arts and Sports)': {
        'Advanced Drawing and Painting': [],
        'Sculpture and Mixed Media': [],
        'Digital Arts': [],
      },
      'Sports Science (Arts and Sports)': {
        'Advanced Training': [],
        'Biomechanics': [],
      },
      'Religious Education (CRE Example, Optional)': {
        'The Bible': [],
        'Christian Living': [],
        'Contemporary Issues': [],
      },
    },
    'Grade 12': {
      'Community Service Learning': {
        'Capstone Projects': [],
      },
      'Mathematics': {
        'Advanced Calculus': [],
        'Probability and Statistics': [],
        'Discrete Maths': [],
      },
      'English Language': {
        'Professional Communication': [],
        'Advanced Literature': [],
      },
      'Kiswahili Language': {
        'Kusikiliza na Kuzungumza': [],
        'Kusoma': [],
      },
      'Indigenous Language or Foreign Language (French Example)': {
        'Listening and Speaking': [],
        'Reading': [],
        'Writing': [],
        'Cultural Studies': [],
      },
      'Biology (STEM)': {
        'Advanced Genetics': [],
        'Applied Ecology': [],
      },
      'Chemistry (STEM)': {
        'Industrial Chemistry': [],
        'Advanced Organic/Inorganic': [],
      },
      'Physics (STEM)': {
        'Astrophysics/Electronics': [],
        'Quantum and Relativity': [],
      },
      'History and Citizenship (Social Sciences)': {
        'Global Challenges': [],
      },
      'Geography (Social Sciences)': {
        'Global Geography': [],
        'Research Projects': [],
      },
      'Economics (Social Sciences)': {
        'Econometrics': [],
      },
      'Performing Arts (Arts and Sports)': {
        'Professional Production': [],
      },
      'Visual Arts (Arts and Sports)': {
        'Professional Art': [],
      },
      'Sports Science (Arts and Sports)': {
        'Elite Performance': [],
      },
      'Religious Education (CRE Example, Optional)': {
        'The Bible': [],
        'Christian Living': [],
        'Contemporary Issues': [],
      },
    },
  }) as Record<string, Record<string, Record<string, string[]>>>, []);

  // derive lists for selectors
  const gradeOptions = useMemo(() => Object.keys(CURRICULUM), [CURRICULUM]);
  const [grade, setGrade] = useState<string>('Grade 7');
  const subjectOptions = useMemo(
    () => (CURRICULUM[grade] ? Object.keys(CURRICULUM[grade]) : []),
    [CURRICULUM, grade]
  );
  const [subject, setSubject] = useState<string>('Mathematics');
  const topicOptions = useMemo(
    () => (CURRICULUM[grade]?.[subject] ? Object.keys(CURRICULUM[grade][subject]) : []),
    [CURRICULUM, grade, subject]
  );
  const [topic, setTopic] = useState<string>('');
  // specification free text instead of subtopic
  const [specification, setSpecification] = useState<string>('');
  const [replanNotes, setReplanNotes] = useState<string>('');
  const [totalTokens, setTotalTokens] = useState<number>(12000);
  const [editableTOC, setEditableTOC] = useState<PlanResponsePayload['toc'] | null>(null);

  // Ensure defaults are valid and cascade resets
  useEffect(() => {
    // If current subject not in grade, reset to first
    if (!subjectOptions.includes(subject)) {
      const nextSubject = subjectOptions[0] || '';
      setSubject(nextSubject);
      return; // will re-run for topics on subject change
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grade, subjectOptions.length]);

  useEffect(() => {
    if (!topicOptions.includes(topic)) {
      const nextTopic = topicOptions[0] || '';
      setTopic(nextTopic);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, topicOptions.length]);

  // No subtopic cascading required
  

  // When generation completes, persist lesson into context and close
  useEffect(() => {
    if (status === 'completed' && final && lessonId) {
      setLesson({
        id: lessonId,
        grade,
        subject,
        topic,
        specification,
        content: final.content,
      });
      onClose();
    }
  }, [status, final, lessonId, setLesson, grade, subject, topic, specification, onClose]);

  // Mirror status/agent to context so other components can react
  useEffect(() => {
    setGenerationStatus(status);
  }, [status, setGenerationStatus]);
  useEffect(() => {
    setCtxAgent(currentAgent ?? null);
  }, [currentAgent, setCtxAgent]);

  const handleGenerateTOC = async () => {
    try {
      const data = await generateTOC({ grade, subject, topic, specification });
      setEditableTOC(data.toc);
    } catch (e) {
      // noop, error shown below
    }
  };

  const handleAcceptAndGenerate = async () => {
    try {
      // If user edited the TOC, send that to the new accept endpoint
      if (editableTOC && editableTOC.length > 0) {
        const token = await (await import('@/lib/firebase')).auth.currentUser?.getIdToken();
        await fetch('/api/tutor/plan/toc/accept', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grade, subject, topic, specification, toc: editableTOC }),
        }).then(async (r) => {
          if (!r.ok) throw new Error((await r.json()).message || 'Accept failed');
          return r.json();
        }).then((res) => {
          if (res.lessonId) {
            adoptLesson(res.lessonId);
          }
        });
      } else {
        await acceptTOC();
      }
      await splitWorkload(totalTokens);
      await startGeneration();
    } catch (e) {
      // noop, error shown below
    }
  };

  const handleReplan = async () => {
    try {
      await replanTOC(replanNotes || undefined, undefined);
      setReplanNotes('');
    } catch (e) {
      // noop
    }
  };

  const safeClose = async () => {
    // If generation is active, cancel it before closing
    if (status === 'generating') {
      try { await cancelGeneration(); } catch { /* ignore */ }
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-2xl rounded-2xl bg-[#111113]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Lesson</h3>
          <button onClick={safeClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {/* Step 1: Input Form */}
        {status === 'idle' && !toc && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Grade</label>
                <select
                  className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {gradeOptions.map((g: string) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Subject</label>
                <select
                  className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {subjectOptions.map((s: string) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Topic</label>
              <select
                className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {topicOptions.length === 0 ? (
                  <option value="" disabled>
                    No topics available
                  </option>
                ) : (
                  topicOptions.map((t: string) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Specification</label>
              <textarea
                className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2 min-h-24 resize-y"
                placeholder="Describe specifics: focus area, level, goals, constraints (e.g., exam board, duration)."
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <label htmlFor="tokens">Total tokens</label>
                <input
                  id="tokens"
                  type="number"
                  min={4000}
                  step={1000}
                  className="w-28 bg-[#0E0E10] border border-white/10 rounded-lg px-2 py-1"
                  value={totalTokens}
                  onChange={(e) => setTotalTokens(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">
                  Cancel
                </Button>
                <Button onClick={handleGenerateTOC} className="bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                  Generate Table of Contents
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Planning / Splitting indicators */}
        {(status === 'planning' || status === 'accepting' || status === 'splitting') && (
          <div className="space-y-3">
            <AgentWorking agent={currentAgent ?? undefined} />
            <p className="text-center text-white/70 text-sm capitalize">{status}...</p>
            <div className="flex items-center justify-end gap-3">
              <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: TOC Review */}
        {editableTOC && toc && status === 'idle' && !final && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Review Table of Contents</h4>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {editableTOC.map((chapter: PlanResponsePayload['toc'][number], idx: number) => (
                <div key={chapter.chapterId} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm">Chapter {idx + 1}:</span>
                    <input
                      className="flex-1 bg-[#0E0E10] border border-white/10 rounded px-2 py-1 text-white text-sm"
                      value={chapter.title}
                      onChange={(e) => {
                        const next = [...editableTOC];
                        next[idx] = { ...chapter, title: e.target.value };
                        setEditableTOC(next);
                      }}
                    />
                  </div>
                  <ul className="list-disc list-inside text-sm text-white/70 mt-1">
                    {chapter.subtopics.map((s: string, i: number) => (
                      <li key={i}>
                        <input
                          className="w-full bg-transparent border-b border-white/10 focus:outline-none focus:border-white/20 text-white/80"
                          value={s}
                          onChange={(e) => {
                            const next = [...editableTOC];
                            const subs = [...chapter.subtopics];
                            subs[i] = e.target.value;
                            next[idx] = { ...chapter, subtopics: subs };
                            setEditableTOC(next);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Replan notes (optional)</label>
              <input
                type="text"
                value={replanNotes}
                onChange={(e) => setReplanNotes(e.target.value)}
                placeholder="e.g., Make it more concise, add more examples"
                className="w-full bg-[#0E0E10] border border-white/10 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button onClick={handleReplan} className="bg-transparent border border-white/10 hover:bg-white/5">
                Replan
              </Button>
              <Button onClick={handleAcceptAndGenerate} className="bg-green-600 hover:bg-green-700 text-white">
                Accept & Generate
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generation */}
        {status === 'generating' && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Generating Lesson</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Progress</span>
                <span>{progress.current} / {progress.total} sections</span>
              </div>
              <div className="w-full bg-[#0E0E10] rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-white/80">
              Active agent: <span className="font-medium">{currentAgent ?? '...'}</span>
            </div>
            <AgentWorking agent={currentAgent ?? undefined} />
            <div className="flex items-center justify-end gap-3">
              <Button onClick={async () => { await cancelGeneration(); onClose(); }} className="bg-red-600 hover:bg-red-700 text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
