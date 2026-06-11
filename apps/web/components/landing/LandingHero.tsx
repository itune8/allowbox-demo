'use client';

/**
 * Top of the landing page: logo, headline, value prop.
 * All entrance animations use existing Tailwind keyframes from tailwind.config.cjs.
 */
export function LandingHero() {
  return (
    <div className="relative z-10 text-center px-6 animate-fade-in-up">
      <div className="flex items-center justify-center gap-2 mb-3">
        {/* AllowBox graduation-cap mark */}
        <svg
          className="w-9 h-9 text-[#824ef2]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          AllowBox
        </h1>
      </div>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
        Experience AllowBox
      </h2>
      <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
        Pick a role and explore the platform — no signup, no data saved, just tap and play.
      </p>
    </div>
  );
}
