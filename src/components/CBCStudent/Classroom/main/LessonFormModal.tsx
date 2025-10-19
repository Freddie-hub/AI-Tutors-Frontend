"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/CBCStudent/shared/Card';
import { generateLesson } from '@/lib/api';
import { useAuth } from '@/lib/hooks';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LessonFormModal({ open, onClose }: Props) {
  const { setLesson, setIsGenerating } = useLesson();
  const { user } = useAuth();
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

  if (!open) return null;

  const createLesson = async () => {
    try {
      // show blank main section and working state
      setIsGenerating(true);
      setLesson(null);
      const token = await user?.getIdToken();
      const res = await generateLesson({ grade, subject, topic, specification }, token || undefined);
      setLesson({
        id: res.lessonId,
        grade: res.grade,
        subject: res.subject,
        topic: res.topic,
        specification: res.specification,
        content: res.content,
      });
      onClose();
    } catch (e) {
      // fallback local lesson
      setLesson({
        id: Date.now().toString(),
        grade,
        subject,
        topic,
        specification,
        content: 'We had trouble generating a lesson right now. Try again shortly.',
      });
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-lg rounded-2xl bg-[#111113]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Lesson</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="space-y-4">
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
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">
            Cancel
          </Button>
          <Button onClick={createLesson} className="bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            Create Lesson
          </Button>
        </div>
      </Card>
    </div>
  );
}
