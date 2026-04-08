'use client';

/**
 * Top of the landing page: logo, headline, value prop.
 * All entrance animations use existing Tailwind keyframes from tailwind.config.cjs.
 */
export function LandingHero() {
  return (
    <div className="relative z-10 text-center px-6 animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3">
        AllowBox
      </h1>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
        Experience AllowBox
      </h2>
      <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
        Pick a role and explore the platform — no signup, no data saved, just tap and play.
      </p>
    </div>
  );
}
