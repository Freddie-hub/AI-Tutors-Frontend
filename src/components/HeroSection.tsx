import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="/hero.jpg"
        alt="Learning background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/60" />
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-2 mt-10">
        <h1 className="text-2xl md:text-3xl font-light leading-snug mb-2 max-w-3xl">
          Learn anything, anytime, anywhere.
        </h1>

        <div className="relative w-full flex justify-center items-center mt-2 md:mt-10 h-72 md:h-96">
          {/* Left Card */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-[90%] md:-translate-x-[100%] w-60 h-40 md:w-80 md:h-52 rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition duration-300 bg-white/10 backdrop-blur-sm border border-white/20 z-10">
            <Image
              src="/students.jpeg"
              alt="Students learning"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-sm md:text-base font-medium text-white drop-shadow-lg">
                For Students
              </span>
            </div>
          </div>

          {/* Center Card */}
          <div className="absolute top-1/2 -translate-y-1/2 w-72 h-48 md:w-[26rem] md:h-[17rem] rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition duration-300 bg-white/10 backdrop-blur-sm border border-white/20 z-20">
            <Image
              src="/schools.jpeg"
              alt="Schools and NGOs"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-lg font-semibold text-white drop-shadow-lg text-center px-2">
                For Schools / NGOs
              </span>
            </div>
          </div>

          {/* Right Card */}
          <div className="absolute top-1/2 -translate-y-1/2 translate-x-[90%] md:translate-x-[100%] w-60 h-40 md:w-80 md:h-52 rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition duration-300 bg-white/10 backdrop-blur-sm border border-white/20 z-10">
            <Image
              src="/corporate.jpeg"
              alt="Corporate upskilling"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-sm md:text-base font-medium text-white drop-shadow-lg text-center px-2 ml-10">
                Individual / Corporate Upskilling
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
