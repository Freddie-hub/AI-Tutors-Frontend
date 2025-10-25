"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import CBCOverview from "./CBCOverview";
import GCSEOverview from "./GCSEOverview";
import TeacherOverview from "./TeacherOverview";
import UpskillOverview from "./UpskillOverview";

export default function Fields() {
  const [isVisible, setIsVisible] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [dots, setDots] = useState("");
  const [scrollLocked, setScrollLocked] = useState(false);
  // Multi-overlay sequencer: index indicates which overlay is sliding currently.
  // 0 -> GCSE over CBC, 1 -> Teacher over GCSE, 2 -> Upskill over Teacher
  const [overlay, setOverlay] = useState<{ index: number; progress: number }>({ index: 0, progress: 0 });
  const overlayRef = useRef<{ index: number; progress: number }>({ index: 0, progress: 0 });
  
  const headlineRef = useRef<HTMLDivElement>(null);
  const cbcRef = useRef<HTMLDivElement>(null);
  const gcseRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastUnlockRef = useRef<number>(0);
  // Accumulates attempted scroll beyond edges to decide when to unlock
  const edgeOverscrollRef = useRef<number>(0);

  // Define overlay components in order (top-most last)
  const overlayComponents = useMemo(
    () => [GCSEOverview, TeacherOverview, UpskillOverview],
    []
  );

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

  // 1) Detect when CBC is fully in view -> lock page scroll; do NOT reset stage
  useEffect(() => {
    const onScrollCheckFullView = () => {
      if (scrollLocked) return;
      if (!cbcRef.current) return;

      const rect = cbcRef.current.getBoundingClientRect();
      const fullyInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      const cooldownPassed = Date.now() - lastUnlockRef.current > 250;
      if (fullyInView) {
        if (cooldownPassed) {
          // Lock body scroll; keep current overlay stage (no reset)
          setScrollLocked(true);
          document.body.style.overflow = "hidden";
          edgeOverscrollRef.current = 0;
        }
      }
    };

    window.addEventListener("scroll", onScrollCheckFullView, { passive: true });
    onScrollCheckFullView();
    return () => window.removeEventListener("scroll", onScrollCheckFullView);
  }, [scrollLocked]);

  // 2) While locked, capture wheel/touch and drive multi-overlay slide. Unlock only on continued overscroll beyond edges.
  useEffect(() => {
    if (!scrollLocked) return;

    const advance = (delta: number) => {
      const lastIndex = overlayComponents.length - 1;
      const maxStage = overlayComponents.length; // inclusive end

      const currentStage = overlayRef.current.index + overlayRef.current.progress;
      const rawNextStage = currentStage + delta;
      const clampedNextStage = Math.min(maxStage, Math.max(0, rawNextStage));

      // If we are hitting an edge and trying to go further, accumulate overscroll
      const atStart = clampedNextStage === 0;
      const atEnd = clampedNextStage === maxStage;
      const triedBeyondStart = rawNextStage < 0;
      const triedBeyondEnd = rawNextStage > maxStage;

      if ((atStart && triedBeyondStart) || (atEnd && triedBeyondEnd)) {
        // Accumulate magnitude in stage units
        const over = atStart ? rawNextStage : rawNextStage - maxStage; // negative at start, positive at end
        edgeOverscrollRef.current += over;

        const threshold = 0.15; // stage units (~15% of one card)
        const magnitude = Math.abs(edgeOverscrollRef.current);
        if (magnitude >= threshold) {
          // Unlock in the direction of continued scroll
          document.body.style.overflow = "auto";
          setScrollLocked(false);
          lastUnlockRef.current = Date.now();
          edgeOverscrollRef.current = 0;
        }
        // Do not change stage while at the edge and before unlocking
        return;
      }

      // We are within bounds or moving back from edge -> reset overscroll accumulator
      edgeOverscrollRef.current = 0;

      // Convert clampedNextStage back to index/progress
      let nextIndex: number;
      let nextProgress: number;
      if (clampedNextStage === maxStage) {
        nextIndex = lastIndex;
        nextProgress = 1;
      } else {
        nextIndex = Math.floor(clampedNextStage);
        nextProgress = clampedNextStage - nextIndex;
      }

      const nextState = { index: nextIndex, progress: nextProgress };
      overlayRef.current = nextState;
      setOverlay(nextState);
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

          {/* Overlay stack: GCSE -> Teacher -> Upskill */}
          {overlayComponents.map((Comp, idx) => {
            // Continuous stage ensures symmetric in/out animations per overlay.
            // stage = overlay.index + overlay.progress (monotonic with scroll delta)
            let translateVh = 100; // default hidden below
            let opacity = 0;

            if (!scrollLocked) {
              translateVh = 100;
              opacity = 0;
            } else {
              const stage = overlay.index + overlay.progress; // continuous progress across overlays
              const tRaw = stage - idx; // how far overlay idx has progressed
              const t = Math.min(1, Math.max(0, tRaw)); // clamp to [0,1]

              translateVh = 100 - t * 100; // 1 => 0vh (fully in), 0 => 100vh (off-screen)
              // Keep opacity solid while sliding to avoid double-ghosting; hide only when t ~ 0
              opacity = t > 0.01 ? 1 : 0;
            }

            const z = 20 + idx; // maintain stacking order

            return (
              <div
                key={idx}
                ref={idx === 0 ? gcseRef : undefined}
                className={`${scrollLocked ? "fixed inset-0" : "absolute top-0 left-0 right-0"}`}
                style={{
                  zIndex: z,
                  transform: `translateY(${translateVh}vh)`,
                  opacity,
                  transition: "transform 0.15s ease-in-out, opacity 0.2s ease-in-out",
                  willChange: "transform, opacity",
                  pointerEvents: opacity === 0 ? "none" : "auto",
                }}
              >
                <Comp />
              </div>
            );
          })}

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