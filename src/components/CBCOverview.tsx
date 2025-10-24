import React from 'react';

const CBCOverview = () => {
  const features = [
    "Brand-aligned, compelling design.",
    "Sleek, minimalist design aesthetic.",
    "Enterprise friendly & responsive design.",
    "Resonates with target users."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-teal-900 to-emerald-900 p-8 md:p-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Crafting simple & intuitive user-centric Figma design
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            We design that aligns with your brand identity and convert your visitors to paying customers.
          </p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg 
                    className="w-6 h-6 text-emerald-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" 
                    />
                  </svg>
                </div>
                <p className="text-lg text-white font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Figma Mockup */}
        <div className="relative">
          <div className="relative z-10 space-y-4">
            {/* Figma Toolbar */}
            <div className="bg-slate-900 rounded-lg p-4 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-2 rounded">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
                <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">
                  <div className="w-5 h-5 border-2 border-gray-400 grid grid-cols-2 gap-0.5">
                    <div className="border border-gray-400"></div>
                    <div className="border border-gray-400"></div>
                    <div className="border border-gray-400"></div>
                    <div className="border border-gray-400"></div>
                  </div>
                </div>
                <div className="p-2 hover:bg-slate-800 rounded cursor-pointer">
                  <div className="w-5 h-5 border-2 border-gray-400"></div>
                </div>
              </div>
            </div>

            {/* Design Preview Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-6 shadow-2xl aspect-square flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto"></div>
                  <div className="w-24 h-2 bg-gray-700 rounded mx-auto"></div>
                  <div className="w-32 h-2 bg-gray-700 rounded mx-auto"></div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-2xl aspect-square">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-semibold text-gray-800">Build A Full-Stack</div>
                    <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded">100hrs</div>
                  </div>
                  <div className="text-2xl font-bold">
                    <span className="text-gray-900">Marketing</span>
                    <span className="text-purple-600"> Portal</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Get influencers to consistently promote your brand
                  </div>
                  <button className="w-full bg-purple-600 text-white text-sm py-2 rounded-lg font-medium hover:bg-purple-700 transition">
                    Claim My Free Access →
                  </button>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-slate-900 rounded-lg p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm font-medium">Color styles</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['bg-gray-700', 'bg-gray-600', 'bg-gray-500', 'bg-gray-400', 'bg-gray-300', 'bg-gray-200', 'bg-gray-100', 'bg-purple-500'].map((color, i) => (
                  <div key={i} className={`w-full h-8 ${color} rounded`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default CBCOverview;