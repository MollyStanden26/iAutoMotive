export default function SellCtaBanner() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8" style={{ marginBottom: '80px' }}>
      <div
        className="flex flex-col overflow-hidden lg:flex-row"
        style={{
          borderRadius: '16px',
          minHeight: '300px',
        }}
      >
        {/* Left side: Dark content */}
        <div
          className="flex flex-1 flex-col justify-center"
          style={{
            backgroundColor: '#0F1724',
            padding: '48px 40px',
          }}
        >
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'var(--ac-font-heading)',
              margin: '0 0 12px',
              lineHeight: 1.3,
            }}
          >
            Consign and earn more from your sale
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 28px',
              lineHeight: 1.6,
              maxWidth: '420px',
            }}
          >
            Earn more when you consign your car with us. It&apos;s easy and all online.
          </p>
          <div>
            <button
              style={{
                border: '1.5px solid #FFFFFF',
                borderRadius: '99999px',
                height: '48px',
                padding: '0 28px',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              Get started
            </button>
          </div>
        </div>

        {/* Right side: Placeholder image area */}
        <div
          className="hidden flex-1 items-center justify-center lg:flex"
          style={{
            backgroundColor: '#E8DDD3',
            minHeight: '300px',
          }}
        >
          {/* Subtle car/lifestyle illustration placeholder */}
          <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Road */}
            <rect x="0" y="85" width="200" height="4" rx="2" fill="rgba(15,23,36,0.12)" />
            {/* Car body */}
            <rect x="50" y="55" width="100" height="30" rx="6" fill="rgba(15,23,36,0.15)" />
            <path d="M70 55L82 35H128L140 55" fill="rgba(15,23,36,0.15)" />
            {/* Windows */}
            <path d="M76 54L85 38H105V54" fill="rgba(255,255,255,0.5)" />
            <path d="M109 54V38H125L134 54" fill="rgba(255,255,255,0.5)" />
            {/* Wheels */}
            <circle cx="78" cy="85" r="10" fill="rgba(15,23,36,0.2)" />
            <circle cx="78" cy="85" r="4" fill="#E8DDD3" />
            <circle cx="132" cy="85" r="10" fill="rgba(15,23,36,0.2)" />
            <circle cx="132" cy="85" r="4" fill="#E8DDD3" />
            {/* People silhouettes */}
            <circle cx="30" cy="65" r="8" fill="rgba(15,23,36,0.1)" />
            <rect x="24" y="75" width="12" height="15" rx="4" fill="rgba(15,23,36,0.1)" />
            <circle cx="170" cy="60" r="7" fill="rgba(15,23,36,0.1)" />
            <rect x="164" y="69" width="12" height="18" rx="4" fill="rgba(15,23,36,0.1)" />
          </svg>
        </div>
      </div>
    </section>
  );
}
