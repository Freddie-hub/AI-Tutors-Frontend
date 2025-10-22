import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero.jpg"
        alt="Learning background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" /> {/* Slight overlay */}
      <Navbar />

      {/* Content Section */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 md:px-16 text-center md:text-left">
        <div className="max-w-2xl">
          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-bold text-[#3B82F6] leading-tight mb-4">
            Learn anything, anytime, anywhere.
          </h1>

          {/* Subtext */}
          <p className="text-gray-200 text-base md:text-lg mb-8">
            Unlock potential. Whether you're a student, a teacher, or a
            professional, our platform helps you grow with tailored learning
            paths and real-world skills.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <button className="bg-[#3B82F6] text-white px-6 py-2 rounded-full hover:bg-[#2563EB] transition">
              Get Started
            </button>
            <button className="border border-[#FDBA74] text-[#FDBA74] px-6 py-2 rounded-full hover:bg-[#FDBA74] hover:text-[#1E1E1E] transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
