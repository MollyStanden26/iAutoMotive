export default function ValueTrackerBanner() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8" style={{ margin: '40px auto' }}>
      <div
        className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between"
        style={{
          backgroundColor: '#F7F8F9',
          borderRadius: '16px',
          padding: '40px',
        }}
      >
        {/* Left: Car illustration placeholder */}
        <div className="hidden shrink-0 lg:block" style={{ width: 160, height: 100 }}>
          <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="160" height="100">
            {/* Simplified car body */}
            <rect x="20" y="45" width="120" height="35" rx="8" fill="#C8CDD6" />
            <path d="M50 45 L65 20 H105 L120 45" fill="#C8CDD6" />
            {/* Windows */}
            <path d="M55 44 L66 24 H84 V44" fill="#E0FAF5" />
            <path d="M88 44 V24 H104 L115 44" fill="#E0FAF5" />
            {/* Wheels */}
            <circle cx="55" cy="80" r="12" fill="#4A556B" />
            <circle cx="55" cy="80" r="5" fill="#F7F8F9" />
            <circle cx="125" cy="80" r="12" fill="#4A556B" />
            <circle cx="125" cy="80" r="5" fill="#F7F8F9" />
            {/* Value tracking lines */}
            <line x1="5" y1="30" x2="35" y2="30" stroke="#008C7C" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="5" y1="40" x2="30" y2="40" stroke="#008C7C" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="5" y1="50" x2="25" y2="50" stroke="#008C7C" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
        </div>

        {/* Center: Content */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          {/* Logo area */}
          <div className="mb-3 flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" fill="#008C7C" />
              <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0F1724',
                fontFamily: 'var(--ac-font-heading)',
              }}
            >
              Value Tracker
            </span>
          </div>

          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#0F1724',
              fontFamily: 'var(--ac-font-heading)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Stay up to speed with your car&apos;s value
          </h2>

          <p
            className="mt-2"
            style={{
              fontSize: '14px',
              color: '#4A556B',
              margin: '8px 0 0',
              lineHeight: 1.5,
            }}
          >
            Not ready to sell yet? Get updates so you always know your car&apos;s value.
          </p>

          <a
            href="#"
            className="mt-3 inline-block"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#008C7C',
              textDecoration: 'none',
            }}
          >
            Learn More
          </a>
        </div>

        {/* Right: Button */}
        <div className="shrink-0">
          <button
            style={{
              border: '1.5px solid #0F1724',
              borderRadius: '99999px',
              height: '48px',
              padding: '0 28px',
              backgroundColor: 'transparent',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0F1724',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Track my value
          </button>
        </div>
      </div>
    </section>
  );
}
