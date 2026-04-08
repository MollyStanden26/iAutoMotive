'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'How do I sell my car online with iAutoSale?',
    answer:
      'Simply enter your registration number and a few details about your vehicle. We\u2019ll provide you with a real offer in just 2 minutes. If you\u2019re happy, you can either sell directly or consign your car with us for a higher price.',
  },
  {
    question: 'Can I sell my vehicle without buying another car?',
    answer:
      'Absolutely. There\u2019s no obligation to purchase a vehicle from us. You can sell or consign your car with iAutoSale regardless of whether you\u2019re looking to buy another one.',
  },
  {
    question: 'How does iAutoSale determine the value of my vehicle?',
    answer:
      'We use live UK market data, recent sale prices, and your vehicle\u2019s specific condition to calculate a fair and competitive valuation. Our algorithm considers mileage, service history, MOT status, and current demand for your model.',
  },
  {
    question: 'What documents do I need to sell my car?',
    answer:
      'You\u2019ll need your V5C logbook, a valid MOT certificate (if applicable), proof of your identity, and any service history you have. We\u2019ll guide you through everything step by step.',
  },
  {
    question: 'How and when will I be paid?',
    answer:
      'If you sell outright, payment is made within 1\u20133 working days via bank transfer. For consignment sales, you\u2019re paid as soon as the buyer\u2019s funds have cleared, typically within 5 working days of the sale completing.',
  },
  {
    question: 'Can I sell my car if I still have finance on it?',
    answer:
      'Yes, you can. We\u2019ll settle any outstanding finance directly with your lender on your behalf. The remaining balance after settlement will be paid to you.',
  },
  {
    question: 'Will the offer I receive ever change?',
    answer:
      'Your offer is valid for 7 days. After that, market conditions may have changed, so we\u2019d need to provide an updated valuation. If the vehicle\u2019s condition differs from what was described, the offer may also be adjusted after inspection.',
  },
];

function PlusMinusIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, transition: 'transform 0.2s ease' }}
    >
      <path d="M12 5V19" stroke="#0F1724" strokeWidth="2" strokeLinecap="round" style={{ opacity: isOpen ? 0 : 1, transition: 'opacity 0.2s ease' }} />
      <path d="M5 12H19" stroke="#0F1724" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SellFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section style={{ backgroundColor: '#FFFFFF', padding: '50px 0' }}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left column */}
          <div className="shrink-0 lg:w-[340px]">
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#0F1724',
                fontFamily: 'var(--ac-font-heading)',
                margin: '0 0 12px',
              }}
            >
              Frequently asked questions
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#4A556B',
                lineHeight: 1.6,
                margin: '0 0 24px',
              }}
            >
              Have questions about selling or consigning your car? We&apos;ve got you covered.
            </p>
            <button
              style={{
                border: '1.5px solid #0F1724',
                borderRadius: '99999px',
                height: '44px',
                padding: '0 24px',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0F1724',
                cursor: 'pointer',
              }}
            >
              View all FAQs
            </button>
          </div>

          {/* Right column: Accordion */}
          <div className="flex-1">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                {idx > 0 && <div style={{ borderTop: '1px solid #E2E8F0' }} />}
                <button
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between text-left"
                  style={{
                    padding: '20px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#0F1724',
                      paddingRight: '16px',
                    }}
                  >
                    {faq.question}
                  </span>
                  <PlusMinusIcon isOpen={openIndex === idx} />
                </button>
                <div
                  style={{
                    maxHeight: openIndex === idx ? '200px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#4A556B',
                      lineHeight: 1.7,
                      margin: '0 0 20px',
                      paddingRight: '40px',
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
