'use client';

import { useState } from 'react';

const reviews = [
  {
    quote:
      'iAutoMotive made selling my BMW incredibly easy. I got a fair price and the entire process was handled online. Highly recommend to anyone looking to sell their car without the usual hassle.',
    name: 'James T.',
    city: 'Manchester',
    date: '14 Feb 2026',
  },
  {
    quote:
      'I was worried about selling privately but iAutoMotive took care of everything. From the valuation to collecting the car, it was seamless. The team kept me updated throughout.',
    name: 'Sarah K.',
    city: 'Edinburgh',
    date: '28 Jan 2026',
  },
  {
    quote:
      'Brilliant service from start to finish. Got more for my Audi than I expected through their consignment model. The whole thing took less than two weeks.',
    name: 'David M.',
    city: 'Bristol',
    date: '3 Mar 2026',
  },
  {
    quote:
      'I\u2019d tried other online car selling platforms but iAutoMotive was by far the best experience. No hidden fees, no last-minute price drops. Just straightforward and honest.',
    name: 'Emma L.',
    city: 'Birmingham',
    date: '19 Dec 2025',
  },
  {
    quote:
      'Sold my Mercedes through iAutoMotive\u2019s consignment service. They handled all the viewings and paperwork. I literally just handed over the keys and got paid. Fantastic.',
    name: 'Oliver P.',
    city: 'Leeds',
    date: '7 Jan 2026',
  },
  {
    quote:
      'The Value Tracker feature is brilliant \u2014 I monitored my car\u2019s price for a few months before deciding to sell. When I was ready, the process was quick and painless.',
    name: 'Rachel W.',
    city: 'London',
    date: '22 Feb 2026',
  },
];

function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={filled ? '#F59E0B' : '#E2E8F0'} xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.5L12.47 6.97L18.5 7.64L13.97 11.76L15.18 17.72L10 14.77L4.82 17.72L6.03 11.76L1.5 7.64L7.53 6.97L10 1.5Z" />
    </svg>
  );
}

export default function CustomerReviewsSell() {
  const [position, setPosition] = useState(0);

  // Calculate max position based on showing 3 cards
  const maxPosition = Math.max(0, reviews.length - 3);

  const handlePrev = () => {
    setPosition((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setPosition((prev) => Math.min(maxPosition, prev + 1));
  };

  return (
    <section style={{ backgroundColor: '#F7F8F9', padding: '50px 0' }}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#0F1724',
              fontFamily: 'var(--ac-font-heading)',
              margin: '0 0 16px',
            }}
          >
            What our customers are saying
          </h2>

          {/* Stars + rating */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#0F1724',
                fontFamily: 'var(--ac-font-heading)',
                lineHeight: 1,
              }}
            >
              4.9
            </span>
            <span style={{ fontSize: '14px', color: '#4A556B' }}>stars</span>
          </div>

          <a
            href="#"
            className="mt-2 inline-block"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#008C7C',
              textDecoration: 'none',
            }}
          >
            See all reviews
          </a>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            disabled={position === 0}
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center lg:flex"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              cursor: position === 0 ? 'default' : 'pointer',
              opacity: position === 0 ? 0.4 : 1,
            }}
            aria-label="Previous reviews"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="#0F1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={position >= maxPosition}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center lg:flex"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              cursor: position >= maxPosition ? 'default' : 'pointer',
              opacity: position >= maxPosition ? 0.4 : 1,
            }}
            aria-label="Next reviews"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4L10 8L6 12" stroke="#0F1724" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Cards container */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${position * (100 / 3 + 1.5)}%)`,
              }}
            >
              {reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="w-full shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {/* Stars */}
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#0F1724',
                      lineHeight: 1.7,
                      margin: '0 0 12px',
                    }}
                  >
                    &ldquo;{review.quote}&rdquo;
                  </p>

                  <a
                    href="#"
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#008C7C',
                      textDecoration: 'none',
                    }}
                  >
                    Read more
                  </a>

                  {/* Reviewer info */}
                  <div className="mt-5" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#0F1724', margin: 0 }}>
                      <span style={{ fontWeight: 700 }}>{review.name}</span>{' '}
                      <span style={{ color: '#4A556B' }}>from {review.city}</span>
                    </p>
                    <p style={{ fontSize: '12px', color: '#8492A8', margin: '4px 0 0' }}>{review.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile dots indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPosition(idx)}
                style={{
                  width: position === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: position === idx ? '#008C7C' : '#C8CDD6',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                }}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
