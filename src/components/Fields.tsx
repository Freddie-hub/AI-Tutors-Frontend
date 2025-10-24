"use client";

import { useEffect, useState, useRef } from "react";
import CBCOverview from "./CBCOverview";
import GCSEOverview from "./GCSEOverview";

export default function Fields() {
  const [isVisible, setIsVisible] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [dots, setDots] = useState("");
  const [gcseTransform, setGcseTransform] = useState(100);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [overlayProgress, setOverlayProgress] = useState(0); // 0 -> CBC only, 1 -> GCSE fully covering
  const [gcseOpacity, setGcseOpacity] = useState(0); // Control GCSE visibility
  
  const headlineRef = useRef<HTMLDivElement>(null);
  const cbcRef = useRef<HTMLDivElement>(null);
  const gcseRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastUnlockRef = useRef<number>(0);

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

  // 1) Detect when CBC is fully in view -> lock page scroll and start overlay phase
  useEffect(() => {
    const onScrollCheckFullView = () => {
      if (scrollLocked) return;
      if (!cbcRef.current) return;

      const rect = cbcRef.current.getBoundingClientRect();
      const fullyInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      const cooldownPassed = Date.now() - lastUnlockRef.current > 250;
      if (fullyInView) {
        if (cooldownPassed) {
          // Lock body scroll and prepare overlay
          setScrollLocked(true);
          setOverlayProgress(0);
          setGcseTransform(100);
          setGcseOpacity(0); // Start with GCSE invisible
          document.body.style.overflow = "hidden";
        }
      }
    };

    window.addEventListener("scroll", onScrollCheckFullView, { passive: true });
    onScrollCheckFullView();
    return () => window.removeEventListener("scroll", onScrollCheckFullView);
  }, [scrollLocked]);

  // 2) While locked, capture wheel/touch and drive GCSE slide. Unlock when done.
  useEffect(() => {
    if (!scrollLocked) return;

    const advance = (delta: number) => {
      setOverlayProgress((prev) => {
        const next = Math.min(1, Math.max(0, prev + delta));
        setGcseTransform(100 - next * 100);
        
        // Fade in GCSE as it slides up, fade out when sliding down
        // Only show GCSE when it's more than 10% into the viewport
        if (next > 0.1) {
          setGcseOpacity(1);
        } else {
          setGcseOpacity(0);
        }
        
        if (next >= 1 || next <= 0) {
          // Completed overlay (either direction): unlock scroll
          setTimeout(() => {
            document.body.style.overflow = "auto";
            setScrollLocked(false);
            lastUnlockRef.current = Date.now();
          }, 0);
        }
        return next;
      });
    };

    const onWheel = (e: WheelEvent) => {
      // Prevent page scroll and use delta to animate
      e.preventDefault();
      const sensitivity = 0.0008; // Much slower, smoother wheel sensitivity
      advance(e.deltaY * sensitivity);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const startY = touchStartYRef.current;
      if (startY == null) return;
      const currentY = e.touches[0].clientY;
      const dy = startY - currentY; // swipe up -> positive
      const sensitivity = 0.004; // Slower touch sensitivity
      advance(dy * sensitivity);
      touchStartYRef.current = currentY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [scrollLocked]);

  return (
    <section 
      ref={scrollContainerRef}
      className="min-h-screen bg-white flex flex-col items-center justify-start px-6 py-20 text-center"
    >
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

      {/* Curriculum Overview Sequence with Stacking Effect */}
      <div className="w-full relative">
        {/* Spacer to allow scroll room for the stacking effect */}
        <div style={{ height: "150vh" }}>
          
          {/* CBC Overview - Pins visually by stopping body scroll when fully visible */}
          <div 
            ref={cbcRef}
            className="sticky top-0 z-10"
          >
            <CBCOverview />
          </div>

          {/* GCSE Overview - Slides up to cover CBC */}
          <div 
            ref={gcseRef}
            className={`${scrollLocked ? "fixed inset-0" : "absolute top-0 left-0 right-0"} z-20`}
            style={{ 
              transform: `translateY(${gcseTransform}vh)`,
              opacity: gcseOpacity,
              transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
              willChange: 'transform, opacity',
              pointerEvents: gcseOpacity === 0 ? 'none' : 'auto'
            }}
          >
            <GCSEOverview />
          </div>

        </div>
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