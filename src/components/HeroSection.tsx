import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero.jpg"
        alt="Restaurant background"
        fill
        className="object-cover"
        priority
      />

      {/* Darker overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Navbar */}
      <Navbar />

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl leading-tight">
          learn anything, anytime, anywhere.
        </h1>
      </div>
    </section>
  );
}
