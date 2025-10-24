"use client";

import CBCOverview from "./CBCOverview";
import TeacherOverview from "./TeacherOverview";
import UpskillOverview from "./UpskillOverview";
import CambridgeOverview from "./CambridgeOverview";

export default function CurriculumOverviewSequence() {
  return (
    <div className="relative w-full h-screen overflow-y-scroll snap-y snap-mandatory">
      {/* Each section fills the entire viewport and snaps into place */}
      <section className="h-screen w-full flex items-center justify-center snap-start snap-always">
        <CBCOverview />
      </section>
      
      <section className="h-screen w-full flex items-center justify-center snap-start snap-always">
        <TeacherOverview />
      </section>
      
      <section className="h-screen w-full flex items-center justify-center snap-start snap-always">
        <UpskillOverview />
      </section>
      
      <section className="h-screen w-full flex items-center justify-center snap-start snap-always">
        <CambridgeOverview />
      </section>
    </div>
  );
}
