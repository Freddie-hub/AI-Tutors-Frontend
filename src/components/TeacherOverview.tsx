import React from "react";

const TeacherOverview = () => {
  const features = [
    "Create structured schemes of work and lesson plans in minutes.",
    "Auto-generate assessments with rubrics and mastery insights.",
    "Differentiate tasks by ability and track progress at a glance.",
    "Collaborate with co-teachers and reuse shared templates.",
    "Export to PDF/Google Classroom and sync to class rosters.",
  ];

  return (
    <div className="relative w-full max-w-[1200px] mx-auto bg-gradient-to-br from-[#0a1410] via-[#0d1912] to-[#080f0c] overflow-visible rounded-xl">
      <div className="relative min-h-[500px] md:min-h-[450px] p-8 md:p-16">
        {/* Left Content */}
        <div className="relative z-10 md:w-[55%] space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Teacher Tools — <span className="text-[#00E18A]">Plan Faster</span>
          </h2>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed">
            Streamline planning, assessment, and differentiation with AI support.
            Focus on teaching — we handle the repetitive setup and tracking.
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

        {/* Image - No animation, positioned */}
        <div className="absolute bottom-[-3%] right-[-3%] w-[45%] md:w-[42%] lg:w-[40%] h-auto">
          <img
            src="/Teacher.jpeg"
            alt="Teacher Overview"
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

export default TeacherOverview;
