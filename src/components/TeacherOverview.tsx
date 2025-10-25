"use client";

import React from "react";

const TeacherOverview = () => {
	const features = [
		"AI-assisted lesson planning aligned to your curriculum.",
		"Auto-generate exercises, quizzes, and marking guides.",
		"Differentiate instruction with adaptive content for levels.",
		"Track class progress with mastery, XP, and goals.",
		"Share lessons to classroom instantly — no friction.",
		"Build once, reuse and refine with AI co-pilot."
	];

	return (
		<div className="relative w-full max-w-[1200px] mx-auto bg-gradient-to-br from-[#0a1410] via-[#0d1912] to-[#080f0c] overflow-visible rounded-xl">
			<div className="relative min-h-[420px] md:min-h-[380px] p-8 md:p-14">
				{/* Left Content */}
				<div className="relative z-10 md:w-[55%] space-y-6">
					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
						Teacher Workspace —{" "}
						<span className="text-[#00E18A]">AI Lesson Co‑Pilot</span>
					</h1>

					<p className="text-base md:text-lg text-gray-300 leading-relaxed">
						Plan faster, teach smarter. Create engaging lessons, activities,
						and assessments in minutes. Personalize learning paths while AI
						handles structure, objectives, and scaffolding.
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
								<p className="text-base md:text-lg text-white font-medium group-hover:text-[#00E18A] transition-colors">
									{feature}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Image (Standardized Size) */}
				<div className="absolute bottom-[-3%] right-[-3%] w-[40%] md:w-[38%] lg:w-[36%]">
					<img
						src="/teacher.jpeg"
						alt="Teacher Overview"
						className="w-full aspect-[4/3] object-cover shadow-2xl rounded-tl-3xl"
					/>
				</div>

				{/* Subtle Background Glow */}
				<div className="absolute bottom-[-3%] right-[-3%] w-56 h-56 bg-[#00E18A] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
				<div className="absolute top-0 left-0 w-56 h-56 bg-[#00E18A] opacity-10 blur-3xl rounded-full pointer-events-none"></div>
			</div>
		</div>
	);
};

export default TeacherOverview;

