"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import CBCOverview from "./CBCOverview";
import GCSEOverview from "./GCSEOverview";
import TeacherOverview from "./TeacherOverview";
import UpskillOverview from "./UpskillOverview";

export default function Fields() {
  // Optional intro text
  const [showThinking, setShowThinking] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [dots, setDots] = useState("");
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShowThinking(true);
          setTimeout(() => {
            setShowThinking(false);
            setShowHeadline(true);
          }, 2000);
        }
      },
      { threshold: 0.3 }
    );
    if (headlineRef.current) obs.observe(headlineRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!showThinking) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % 4;
      setDots(["", ".", "..", "..."][i]);
    }, 250);
    return () => clearInterval(id);
  }, [showThinking]);

  // Fixed-deck stacking with shared scroll progress
  const cards = [CBCOverview, GCSEOverview, TeacherOverview, UpskillOverview];
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Convert 100vh to pixels for framer y translate
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const set = () => setVh(window.innerHeight);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  return (
    <>
      <section className="min-h-[50vh] bg-white flex flex-col items-center justify-center px-6 py-20 text-center">
        <div ref={headlineRef} className="max-w-4xl mb-6 min-h-[80px] flex items-center justify-center">
          {showThinking && !showHeadline && (
            <p className="text-3xl md:text-4xl text-gray-700 italic animate-fade-in">thinking{dots}</p>
          )}
          {showHeadline && (
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 whitespace-nowrap">
                Learn at the speed of <span className="italic text-gray-600">thought</span>
              </h1>
            </div>
          )}
        </div>
        <p className="text-gray-500 mt-2 text-sm md:text-base max-w-2xl">
          AI-personalized courses, gamified lessons, and real-time feedback to elevate your skills.
        </p>
      </section>

      <main
        ref={containerRef}
        className="relative bg-white"
        style={{ height: `${cards.length * 100 + 20}vh` }}
      >
        {cards.map((Comp, i) => {
          const start = i / cards.length;
          const end = (i + 1) / cards.length;
          const targetScale = 1 - (cards.length - i) * 0.05;
          const scale = useTransform(scrollYProgress, [start, 1], [1, targetScale]);
          // First card should appear almost immediately below the Fields heading
          const enterFrom = i === 0 ? Math.round(vh * 0.10) : vh;
          const y = useTransform(scrollYProgress, [start, end], [enterFrom, 0]);
          const opacity = useTransform(scrollYProgress, [start - 0.08, start], [0, 1]);
          // Hide entire deck outside its section so it doesn't cover Hero/Footer
          const deckVisibility = useTransform(
            scrollYProgress,
            [-0.001, 0, 1, 1.001],
            [0, 1, 1, 0]
          );

          // Combine opacities with explicit typing to satisfy TS
          const combinedOpacity = useTransform<number, number>(
            [opacity, deckVisibility] as unknown as MotionValue<number>[],
            (latest: number[]) => (latest[0] ?? 0) * (latest[1] ?? 0)
          );

          return (
            <motion.div
              key={i}
              className="fixed inset-0 flex items-start justify-center pointer-events-none"
              style={{ zIndex: 20 + i, y, opacity: combinedOpacity }}
            >
              <motion.div
                style={{ scale, transformOrigin: "top center", top: `calc(-6vh + ${i * 28}px)` }}
                className="relative w-full max-w-[1200px] mx-auto px-6 pointer-events-auto"
              >
                <Comp />
              </motion.div>
            </motion.div>
          );
        })}
      </main>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `}</style>
    </>
  );
}