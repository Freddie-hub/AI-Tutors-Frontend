"use client";

export default function Fields() {
  const cards = [
    {
      title: "Screenwriting Mastery",
      desc: "Learn how to craft compelling stories and characters with cinematic depth.",
    },
    {
      title: "Photo Prompting 101",
      desc: "Master the art of prompting AI for stunning, realistic portraits.",
    },
    {
      title: "Language Learning",
      desc: "Accelerate fluency with adaptive, gamified learning tools powered by AI.",
    },
    {
      title: "Creative Coding",
      desc: "Blend art and logic as you learn to code visually stunning interactive experiences.",
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
      <button className="mb-12 bg-white/10 backdrop-blur-md text-white font-medium text-sm px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition">
        Register Now →
      </button>

      {/* Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group relative w-64 h-72 rounded-3xl overflow-hidden 
                       bg-gradient-to-br from-white/10 via-white/5 to-transparent
                       border border-white/15 backdrop-blur-2xl 
                       shadow-[0_4px_60px_rgba(255,255,255,0.05)]
                       hover:scale-[1.02] transition duration-700 ease-out
                       flex flex-col justify-end p-5"
          >
            {/* Glass effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.25),0_0_25px_rgba(255,255,255,0.05)] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-white text-sm md:text-base font-semibold mb-2">
                {card.title}
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[20rem] bg-gradient-radial from-white/10 to-transparent blur-3xl pointer-events-none" />
    </section>
  );
}
