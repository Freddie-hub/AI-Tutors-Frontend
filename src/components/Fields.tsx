"use client";

export default function Fields() {
  const cards = [
    {
      title: "CBC Curriculum",
      desc: "Master Kenya’s Competency-Based Curriculum with AI-personalized lessons. Choose Autopilot Mode for full AI guidance or Mentor Mode to learn with AI alongside a verified human mentor. Structured lessons, assessments, and projects aligned to CBC standards.",
      tagline: "Aligned with CBC. Powered by AI.",
    },
    {
      title: "British Curriculum",
      desc: "Learn under Cambridge and Edexcel frameworks with adaptive AI lessons. Personalized revision paths, assessments, and mentor support to help you excel in IGCSE or A-Levels.",
      tagline: "Global standards. Personal pace.",
    },
    {
      title: "Corporate & Individual Learning",
      desc: "Upskill or explore new fields — from AI and coding to leadership and design. Set your goal, and the AI creates a custom study roadmap with adaptive challenges and feedback.",
      tagline: "Learn anything. Anytime.",
    },
    {
      title: "Schools & NGOs",
      desc: "Empower learning at scale with AI-assisted teaching tools, analytics, and lesson generation. Enable teachers to review AI lessons, monitor progress, and personalize learning for every student. Perfect for schools, NGOs, and education partners.",
      tagline: "AI for classrooms and communities.",
    },
  ];

  return (
    <section className="relative min-h-screen bg-[#0b0b0f] flex flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Headline */}
      <div className="max-w-2xl mb-10">
        <h1 className="text-2xl md:text-4xl font-semibold text-white leading-snug">
          Learn at the speed of{" "}
          <span className="italic text-gray-300">thought</span>
        </h1>
        <p className="text-gray-400 mt-3 text-sm md:text-base">
          AI-personalized courses, gamified lessons, and real-time feedback to
          elevate your skills.
        </p>
      </div>

      {/* Register Button */}
      <button className="mb-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-6 py-2 rounded-full transition">
        Register Now →
        </button>


      {/* Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group relative w-64 h-80 rounded-3xl overflow-hidden 
                       bg-gradient-to-br from-white/10 via-white/5 to-transparent
                       border border-white/15 backdrop-blur-2xl 
                       shadow-[0_4px_60px_rgba(255,255,255,0.05)]
                       hover:scale-[1.02] transition duration-700 ease-out
                       flex flex-col justify-between p-5"
          >
            {/* Glass effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.25),0_0_25px_rgba(255,255,255,0.05)] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 text-left flex flex-col justify-between h-full">
              <div>
                <h3 className="text-white text-sm md:text-base font-semibold mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <p className="text-gray-400 text-[0.7rem] mt-3 italic">
                {card.tagline}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[20rem] bg-gradient-radial from-white/10 to-transparent blur-3xl pointer-events-none" />
    </section>
  );
}
