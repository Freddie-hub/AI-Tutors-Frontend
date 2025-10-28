"use client";

interface CourseHeaderProps {
  title: string;
  subtitle?: string;
  backgroundUrl?: string;
}

export function CourseHeader({
  title,
  subtitle,
  backgroundUrl,
}: CourseHeaderProps) {
  return (
    <div
      className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 flex items-center justify-center text-center"
      style={{
        backgroundImage: backgroundUrl
          ? `url(${backgroundUrl})`
          : "linear-gradient(to right, #3b82f6, #06b6d4)",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-white">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-sm opacity-90 mt-1 max-w-lg mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
