"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CBCOverview from "./CBCOverview";
import TeacherOverview from "./TeacherOverview";
import UpskillOverview from "./UpskillOverview";
import CambridgeOverview from "./CambridgeOverview";

// Small helper for reduced motion preference
const useReducedMotionPref = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

const panels = [CBCOverview, TeacherOverview, UpskillOverview, CambridgeOverview];
const imageSrcs = [
  "/cbcoverview1.jpg",
  "/teacheroverview.jpg",
  "/upskill.jpeg",
  "/gcseoverview.jpeg",
];

export default function CurriculumOverviewSequence() {
  // Active index controls which panel is shown. 0 = CBC (default)
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeInView, setActiveInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotionPref();

  const lastIndex = panels.length - 1;

  // Preload images to avoid flash during swaps
  useEffect(() => {
    imageSrcs.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Intersection observer to know when to engage scroll handling
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setActiveInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  const canIntercept = activeInView && index < lastIndex; // lock while not at last

  const throttledStep = useCallback(
    (dir: 1 | -1) => {
      const now = Date.now();
      const cooldown = reducedMotion ? 200 : 800; // shorter if reduced motion
      if (isAnimating || now - lastScrollTimeRef.current < cooldown) return;
      const next = Math.min(lastIndex, Math.max(0, index + dir));
      if (next === index) return;
      lastScrollTimeRef.current = now;
      setIsAnimating(true);
      setIndex(next);
      // release isAnimating after animation window
      const settle = setTimeout(() => setIsAnimating(false), reducedMotion ? 200 : 900);
      return () => clearTimeout(settle);
    },
    [index, isAnimating, lastIndex, reducedMotion]
  );

  // Wheel handling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!activeInView) return;
      const dy = e.deltaY;
      // Intercept only while not at final panel
      if (canIntercept) e.preventDefault();
      if (Math.abs(dy) < 15) return; // ignore tiny deltas
      if (!canIntercept) return; // let normal scroll continue on last panel
      throttledStep(dy > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [activeInView, canIntercept, throttledStep]);

  // Touch handling (basic swipe up/down)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!activeInView) return;
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!activeInView) return;
      if (canIntercept) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!activeInView) return;
      const startY = touchStartYRef.current;
      if (startY == null) return;
      const endY = e.changedTouches[0]?.clientY ?? startY;
      const dy = startY - endY;
      const threshold = 40; // px
      if (!canIntercept) return; // allow normal scroll at last panel
      if (Math.abs(dy) < threshold) return;
      throttledStep(dy > 0 ? 1 : -1);
      touchStartYRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
    };
  }, [activeInView, canIntercept, throttledStep]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeInView) return;
      const keysDown = ["ArrowDown", "PageDown", " "];
      const keysUp = ["ArrowUp", "PageUp"]; 
      if (canIntercept && (keysDown.includes(e.key) || keysUp.includes(e.key))) {
        e.preventDefault();
      }
      if (!canIntercept) return;
      if (keysDown.includes(e.key)) throttledStep(1);
      if (keysUp.includes(e.key)) throttledStep(-1);
    };
    window.addEventListener("keydown", onKey, { passive: false } as any);
    return () => window.removeEventListener("keydown", onKey as any);
  }, [activeInView, canIntercept, throttledStep]);

  const CurrentPanel = useMemo(() => panels[index], [index]);

  // Motion variants for the wrapper (text/content comes from bottom)
  const variants = {
    initial: { y: reducedMotion ? 0 : 24, opacity: reducedMotion ? 1 : 0 },
    animate: { y: 0, opacity: 1, transition: { duration: reducedMotion ? 0.15 : 0.6, ease: "easeOut" } },
    exit: { y: reducedMotion ? 0 : -12, opacity: reducedMotion ? 1 : 0, transition: { duration: reducedMotion ? 0.1 : 0.4, ease: "easeIn" } },
  } as const;

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      {/* Stacking context */}
      <div className="relative h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CurrentPanel />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Optional: simple dots to hint progression */}
      <div className="mt-4 flex items-center justify-center gap-2 select-none">
        {panels.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => !isAnimating && setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-[#00E18A]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="mt-3 text-center text-xs text-gray-500">
        {index < lastIndex ? "Scroll to explore curriculums" : "Continue scrolling to the rest of the page"}
      </div>
    </div>
  );
}
