"use client";

import CBCOverview from "./CBCOverview";
import TeacherOverview from "./TeacherOverview";
import UpskillOverview from "./UpskillOverview";
import CambridgeOverview from "./CambridgeOverview";

export default function CurriculumOverviewSequence() {
  return (
    // Track height equals 4 x 100vh so the sequence is pinned while you scroll through it
    <div className="relative w-full h-[400vh]">
      {/* Sticky stacking cards – later ones overlap earlier ones */}
      <section className="sticky top-0 h-screen flex items-center justify-center z-10">
        <CBCOverview />
      </section>

      <section className="sticky top-0 h-screen flex items-center justify-center z-20">
        <TeacherOverview />
      </section>

      <section className="sticky top-0 h-screen flex items-center justify-center z-30">
        <UpskillOverview />
      </section>

      <section className="sticky top-0 h-screen flex items-center justify-center z-40">
        <CambridgeOverview />
      </section>
    </div>
  );
}
