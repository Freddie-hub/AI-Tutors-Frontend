"use client";

import { useEffect, useState, useRef } from "react";
import CurriculumOverviewSequence from "./CurriculumOverviewSequence";

export default function Fields() {
  const [isVisible, setIsVisible] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [dots, setDots] = useState("");
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          setShowThinking(true);

          // Show "thinking..." animation for 2 seconds before headline
          setTimeout(() => {
            setShowThinking(false);
            setShowHeadline(true);
          }, 2000);
        }
      },
      { threshold: 0.3 }
    );

    if (headlineRef.current) observer.observe(headlineRef.current);

    return () => {
      if (headlineRef.current) observer.unobserve(headlineRef.current);
    };
  }, [isVisible]);

  useEffect(() => {
    if (showThinking) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        const cycle = count % 4;
        if (cycle === 1) setDots(".");
        else if (cycle === 2) setDots("..");
        else if (cycle === 3) setDots("...");
        else setDots("");
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showThinking]);

  return (
    <section className="min-h-screen bg-white flex flex-col items-center justify-start px-6 py-20 text-center">
      {/* Headline at the top */}
      <div
        ref={headlineRef}
        className="max-w-4xl mb-6 min-h-[80px] flex items-center justify-center"
      >
        {showThinking && !showHeadline && (
          <p className="text-3xl md:text-4xl text-gray-700 italic animate-fade-in">
            thinking{dots}
          </p>
        )}

        {showHeadline && (
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 whitespace-nowrap">
              Learn at the speed of{" "}
              <span className="italic text-gray-600">thought</span>
            </h1>
          </div>
        )}
      </div>

      <p className="text-gray-500 mt-2 text-sm md:text-base max-w-2xl mb-12">
        AI-personalized courses, gamified lessons, and real-time feedback to
        elevate your skills.
      </p>

      {/* Curriculum Overview Sequence: CBC → Teacher → Upskill → Cambridge */}
      <div className="w-full">
        <CurriculumOverviewSequence />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
}