'use client';

import { useEffect, useState } from 'react';
import {
  REVIEWS,
  AVERAGE_RATING_LABEL,
  TOTAL_COUNT,
  type Review,
} from '@/lib/data/sell-reviews';

const FEATURED_COUNT = 6;

function StarIcon({ filled = true, size = 20 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? '#F59E0B' : '#E2E8F0'} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.5L12.47 6.97L18.5 7.64L13.97 11.76L15.18 17.72L10 14.77L4.82 17.72L6.03 11.76L1.5 7.64L7.53 6.97L10 1.5Z" />
    </svg>
  );
}

function StarRow({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= count} size={size} />)}
    </div>
  );
}

/* ───── Slide-in drawer with the full review list ──────────────────────── */

function ReviewsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => setMounted(true));
    return () => {
      window.removeEventListener('keydown', onKey);
      setMounted(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 36, 0.55)', backdropFilter: 'blur(2px)',
          zIndex: 60, opacity: mounted ? 1 : 0, transition: 'opacity 200ms ease',
        }}
      />
      <aside
        role="dialog"
        aria-label="Customer reviews"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 560, maxWidth: '100vw',
          background: '#FFFFFF', borderLeft: '1px solid #E2E8F0',
          zIndex: 61, display: 'flex', flexDirection: 'column',
          transform: mounted ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(.25,.46,.45,.94)',
          boxShadow: '-20px 0 40px rgba(0,0,0,0.18)',
        }}
      >
        <header
          className="flex items-start justify-between"
          style={{ padding: '20px 24px', borderBottom: '1px solid #EAECEF', flexShrink: 0 }}
        >
          <div>
            <div style={{ fontFamily: 'var(--ac-font-heading)', fontSize: 18, fontWeight: 700, color: '#0F1724' }}>
              Customer reviews
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StarRow count={5} size={16} />
              <span style={{ fontFamily: 'var(--ac-font-heading)', fontSize: 22, fontWeight: 800, color: '#0F1724', lineHeight: 1 }}>
                {AVERAGE_RATING_LABEL}
              </span>
              <span style={{ fontFamily: 'var(--ac-font-body)', fontSize: 13, color: '#4A556B' }}>
                from {TOTAL_COUNT.toLocaleString()} reviews
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:opacity-80"
            style={{
              width: 32, height: 32,
              background: '#F7F8F9', border: '1px solid #E2E8F0',
              borderRadius: 8, color: '#4A556B', fontSize: 18, lineHeight: 1,
              cursor: 'pointer',
            }}
          >×</button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {REVIEWS.map((r, i) => <ReviewRow key={i} review={r} />)}
          </div>
        </div>
      </aside>
    </>
  );
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #EAECEF',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <StarRow count={review.stars} size={14} />
        <span style={{ fontFamily: 'var(--ac-font-body)', fontSize: 12, color: '#8492A8' }}>
          {review.date}
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--ac-font-body)',
          fontSize: 13.5, color: '#0F1724', lineHeight: 1.6, margin: 0,
        }}
      >
        “{review.quote}”
      </p>
      <p
        style={{
          fontFamily: 'var(--ac-font-body)',
          fontSize: 12.5, color: '#4A556B',
          margin: '10px 0 0',
        }}
      >
        <span style={{ fontWeight: 700, color: '#0F1724' }}>{review.name}</span>
        {' '}from {review.city}
      </p>
    </div>
  );
}

/* ───── Top-level reviews section (carousel + drawer trigger) ──────────── */

export default function CustomerReviewsSell() {
  const [position, setPosition] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const featured = REVIEWS.slice(0, FEATURED_COUNT);
  const maxPosition = Math.max(0, featured.length - 3);

  const handlePrev = () => setPosition(prev => Math.max(0, prev - 1));
  const handleNext = () => setPosition(prev => Math.min(maxPosition, prev + 1));

  return (
    <section style={{ backgroundColor: '#F7F8F9', padding: '50px 0' }}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2
            style={{
              fontSize: '28px', fontWeight: 600, color: '#0F1724',
              fontFamily: 'var(--ac-font-heading)', margin: '0 0 16px',
            }}
          >
            What our customers are saying
          </h2>

          {/* Stars + rating */}
          <div className="flex items-center justify-center gap-3">
            <StarRow count={5} size={20} />
            <span
              style={{
                fontSize: 36, fontWeight: 700, color: '#0F1724',
                fontFamily: 'var(--ac-font-heading)', lineHeight: 1,
              }}
            >
              {AVERAGE_RATING_LABEL}
            </span>
            <span style={{ fontSize: 14, color: '#4A556B' }}>
              stars · {TOTAL_COUNT.toLocaleString()} reviews
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mt-2 inline-block bg-transparent border-none cursor-pointer p-0"
            style={{
              fontSize: 14, fontWeight: 600,
              color: '#008C7C', textDecoration: 'none',
            }}
          >
            See all reviews
          </button>
        </div>

        {/* Carousel — featured 6 */}
        <div className="relative">
          <button
            onClick={handlePrev}
            disabled={position === 0}
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center lg:flex"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
              cursor: position === 0 ? 'default' : 'pointer',
              opacity: position === 0 ? 0.4 : 1,
            }}
            aria-label="Previous reviews"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="#0F1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={position >= maxPosition}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center lg:flex"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
              cursor: position >= maxPosition ? 'default' : 'pointer',
              opacity: position >= maxPosition ? 0.4 : 1,
            }}
            aria-label="Next reviews"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#0F1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${position * (100 / 3 + 1.5)}%)` }}
            >
              {featured.map((review, idx) => (
                <div
                  key={idx}
                  className="w-full shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                  style={{
                    backgroundColor: '#FFFFFF', borderRadius: 12,
                    padding: 32, border: '1px solid #E2E8F0',
                  }}
                >
                  <div className="mb-4">
                    <StarRow count={review.stars} size={20} />
                  </div>
                  <p style={{ fontSize: 14, color: '#0F1724', lineHeight: 1.7, margin: '0 0 12px' }}>
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    style={{
                      fontSize: 14, fontWeight: 600, color: '#008C7C',
                      textDecoration: 'none', background: 'transparent',
                      border: 'none', padding: 0, cursor: 'pointer',
                    }}
                  >
                    Read more
                  </button>
                  <div className="mt-5" style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
                    <p style={{ fontSize: 14, color: '#0F1724', margin: 0 }}>
                      <span style={{ fontWeight: 700 }}>{review.name}</span>{' '}
                      <span style={{ color: '#4A556B' }}>from {review.city}</span>
                    </p>
                    <p style={{ fontSize: 12, color: '#8492A8', margin: '4px 0 0' }}>{review.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPosition(idx)}
                style={{
                  width: position === idx ? 24 : 8, height: 8,
                  borderRadius: 4,
                  backgroundColor: position === idx ? '#008C7C' : '#C8CDD6',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease', padding: 0,
                }}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <ReviewsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
