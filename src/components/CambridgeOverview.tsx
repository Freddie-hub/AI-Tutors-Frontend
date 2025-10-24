"use client";

import React, { useEffect, useState } from "react";

const CambridgeOverview = () => {
  const [imageVisible, setImageVisible] = useState(false);

  const features = [
    "AI-personalized study plans for IGCSE/GCSE.",
    "Exam-style questions with step-by-step solutions.",
    "Topic mastery tracking with spaced repetition.",
    "Past paper practice with instant marking.",
    "Smart hints and revision summaries per syllabus code.",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setImageVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[1200px] mx-auto bg-gradient-to-br from-[#0a1410] via-[#0d1912] to-[#080f0c] overflow-visible rounded-xl">
      <div className="relative min-h-[500px] md:min-h-[450px] p-8 md:p-16">
        {/* Left Content */}
        <div className="relative z-10 md:w-[55%] space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Cambridge — <span className="text-[#00E18A]">Exam Readiness</span>
          </h2>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed">
            Master the Cambridge syllabus with targeted practice, timely
            feedback, and adaptive revision powered by AI.
          </p>

        <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    className="w-6 h-6 text-[#00E18A] group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-base md:text-lg text-white font-medium group-hover:text-[#00E18A] transition-colors">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image - Smooth slide-in from right */}
        <div
          className={`absolute bottom-[-3%] right-[-3%] w-[45%] md:w-[42%] lg:w-[40%] h-auto transition-transform duration-1000 ease-out ${
            imageVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <img
            src="/gcseoverview.jpeg"
            alt="Cambridge Overview"
            className="w-full h-auto object-cover shadow-2xl rounded-tl-3xl"
          />
        </div>

        {/* Background Glow */}
        <div className="absolute bottom-[-3%] right-[-3%] w-56 h-56 bg-[#00E18A] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-56 h-56 bg-[#00E18A] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
};

export default CambridgeOverview;
