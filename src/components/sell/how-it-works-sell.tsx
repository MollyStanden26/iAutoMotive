const steps = [
  {
    title: 'Get your offer',
    description:
      'Share a few vehicle details and we\u2019ll give you a real offer in 2 minutes. No haggling. No hassles.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#008C7C" strokeWidth="2" />
        <text
          x="32"
          y="40"
          textAnchor="middle"
          fill="#008C7C"
          fontSize="28"
          fontWeight="600"
          fontFamily="var(--ac-font-heading)"
        >
          £
        </text>
      </svg>
    ),
  },
  {
    title: 'Consign or sell',
    description:
      'Consign your car for the best price, or sell it outright to iAutoMotive.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#008C7C" strokeWidth="2" />
        {/* Car icon */}
        <rect x="16" y="30" width="32" height="12" rx="3" stroke="#008C7C" strokeWidth="2" />
        <path d="M22 30L26 22H38L42 30" stroke="#008C7C" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="23" cy="42" r="3" stroke="#008C7C" strokeWidth="2" />
        <circle cx="41" cy="42" r="3" stroke="#008C7C" strokeWidth="2" />
        {/* Arrows */}
        <path d="M48 26L52 22L48 18" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 18L12 22L16 26" stroke="#008C7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Get paid',
    description:
      'We\u2019ll handle everything \u2014 viewings, paperwork, payment. You get paid when it sells.',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#008C7C" strokeWidth="2" />
        {/* Money/banknote icon */}
        <rect x="14" y="22" width="36" height="20" rx="3" stroke="#008C7C" strokeWidth="2" />
        <circle cx="32" cy="32" r="6" stroke="#008C7C" strokeWidth="2" />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fill="#008C7C"
          fontSize="12"
          fontWeight="600"
          fontFamily="var(--ac-font-heading)"
        >
          £
        </text>
        <circle cx="20" cy="32" r="2" fill="#008C7C" />
        <circle cx="44" cy="32" r="2" fill="#008C7C" />
      </svg>
    ),
  },
];

export default function HowItWorksSell() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8" style={{ padding: '40px 0 60px', backgroundColor: '#FFFFFF' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#0F1724',
              fontFamily: 'var(--ac-font-heading)',
              margin: '0 0 8px',
            }}
          >
            How it works
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#4A556B',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Consign or sell your vehicle to iAutoMotive in just a few easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="mb-5">{step.icon}</div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0F1724',
                  fontFamily: 'var(--ac-font-heading)',
                  margin: '0 0 8px',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#4A556B',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '320px',
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom separator */}
        <div
          className="mt-16"
          style={{
            borderBottom: '1px solid #E2E8F0',
          }}
        />
      </div>
    </section>
  );
}
