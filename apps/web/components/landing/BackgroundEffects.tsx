'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-viewport animated background for the landing page.
 * Layers (bottom to top): base -> aurora blobs -> dot grid -> grain -> cursor glow.
 * All CSS; the only JS is for the desktop-only cursor glow and will-change cleanup.
 */
export function BackgroundEffects() {
  const glowRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  // Cursor-reactive glow (desktop only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = glowRef.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
          raf = 0;
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Remove will-change from blobs after 30s (longest animation cycle)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!blobsRef.current) return;
      blobsRef.current.querySelectorAll<HTMLElement>('[data-blob]').forEach((b) => {
        b.style.willChange = 'auto';
      });
    }, 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Layer 0: base */}
      <div className="fixed inset-0 z-0 bg-[#fafaf9]" aria-hidden />

      {/* Layer 1: aurora blobs */}
      <div ref={blobsRef} className="fixed inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden>
        <div
          data-blob
          className="absolute w-[600px] h-[600px] rounded-full animate-blob-a"
          style={{
            top: '-10%',
            left: '-10%',
            // Brand purple — matches the parent-signup auth gradient (#824ef2).
            background: 'radial-gradient(circle, rgba(130,78,242,0.32) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
        <div
          data-blob
          className="absolute w-[600px] h-[600px] rounded-full animate-blob-b"
          style={{
            bottom: '-10%',
            right: '-10%',
            // Deeper brand shade (#5228a8 end of the gradient), kept cooler so
            // the landing doesn't feel flat.
            background: 'radial-gradient(circle, rgba(82,40,168,0.28) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
        <div
          data-blob
          className="absolute w-[600px] h-[600px] rounded-full animate-blob-c hidden sm:block"
          style={{
            top: '30%',
            right: '20%',
            // Soft lavender accent (violet-300) — keeps three hues on screen
            // without introducing green/amber warmth that clashed with the brand.
            background: 'radial-gradient(circle, rgba(196,181,253,0.30) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Layer 2: dot grid */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Layer 3: grain overlay */}
      <div
        className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Layer 4: cursor-reactive glow (desktop only, hidden on touch) */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[400px] h-[400px] z-[4] pointer-events-none [@media(pointer:coarse)]:hidden"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle, rgba(130,78,242,0.14) 0%, transparent 70%)',
          transform: 'translate(50%, 50%)',
          transition: 'transform 120ms linear',
        }}
      />
    </>
  );
}
