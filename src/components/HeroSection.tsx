import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Enhanced Overlay */}
      <Image
        src="/hero.jpg"
        alt="Learning background"
        fill
        className="object-cover scale-105"
        priority
      />
      {/* Consistent gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80" />
      
      <Navbar />

      {/* Centered Content Wrapper */}
      <div className="relative z-10 flex items-center justify-start h-full px-6 md:px-20 lg:px-32">
        {/* Screenshot-style Container */}
        <div className="relative group max-w-3xl">
          {/* Subtle glow effect */}
          <div className="absolute -inset-0.5 bg-slate-700/50 rounded-2xl blur-sm" />
          
          {/* Main screenshot card */}
          <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-10 md:p-14">
            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Empower Your Growth Journey
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
              Step into the future of learning. Explore curated paths designed to
              help you master real-world skills, achieve your goals, and unlock
              your full potential.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="group/btn bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button className="border border-slate-600 text-slate-200 px-8 py-3 rounded-lg font-medium hover:bg-slate-800 hover:border-slate-500 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}