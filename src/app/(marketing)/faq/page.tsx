"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                          */
/* ------------------------------------------------------------------ */

interface FaqItem {
  q: string;
  a: ReactNode;
}

interface FaqCategory {
  id: string;
  label: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    id: "selling",
    label: "Selling",
    items: [
      {
        q: "How do I sell my car with iAutoMotive?",
        a: "Simply enter your registration number on our homepage or the Sell page. We\u2019ll pull your vehicle details automatically and provide a real market valuation in just 2 minutes. If you\u2019re happy with the offer, we\u2019ll arrange collection and handle the entire sale process on your behalf.",
      },
      {
        q: "What is consignment and how is it different from a part-exchange?",
        a: "Consignment means we sell your car on your behalf at full retail market price, rather than buying it from you at a discounted trade price. You retain ownership until a buyer is found. This typically means you earn significantly more than you would through a part-exchange or instant sale.",
      },
      {
        q: "How does iAutoMotive determine the value of my vehicle?",
        a: "We use live UK market data from AutoTrader, Cazana, and Glass\u2019s Guide, combined with your vehicle\u2019s specific condition, mileage, service history, MOT status, and current demand. Our valuation algorithm provides a fair and competitive price based on what similar vehicles are actually selling for.",
      },
      {
        q: "How much does it cost to sell my car with iAutoMotive?",
        a: "There is no commission fee. We do not charge a percentage of the sale price. Any additional costs (such as collection or reconditioning) are agreed with you in advance and deducted from the sale proceeds. There are no hidden fees.",
      },
      {
        q: "What documents do I need to sell my car?",
        a: (
          <>
            You&rsquo;ll need your <strong>V5C logbook</strong>, a valid{" "}
            <strong>MOT certificate</strong> (if applicable), <strong>all keys</strong>, proof of
            your identity, and any <strong>service history</strong> you have. If there is outstanding
            finance on the vehicle, you&rsquo;ll need the lender details and a recent settlement
            figure. We&rsquo;ll guide you through everything step by step.
          </>
        ),
      },
      {
        q: "How and when will I be paid?",
        a: "You\u2019ll receive your Minimum Return (the guaranteed amount stated in your consignment agreement) within 48 hours of all sale conditions being met \u2014 including the buyer\u2019s 7-day return window expiring and funds clearing. Payment is made by Faster Payments bank transfer to the account you provide.",
      },
      {
        q: "Can I sell my car if I still have finance on it?",
        a: "Yes. We\u2019ll obtain a settlement figure from your lender and settle the outstanding finance directly from the sale proceeds on your behalf. The remaining balance after settlement is paid to you. If the finance exceeds the expected proceeds (negative equity), you\u2019ll need to cover the shortfall before we can list the vehicle.",
      },
      {
        q: "Will my offer ever change?",
        a: "Your initial valuation is valid for 7 days. After that, market conditions may have changed, so we\u2019d provide an updated figure. If the vehicle\u2019s condition differs from what was described \u2014 for example, undisclosed damage found during our inspection \u2014 the offer may also be adjusted. Any changes are discussed with you before proceeding.",
      },
      {
        q: "Can I withdraw my car from consignment?",
        a: "Yes. You can withdraw at any time by giving us 7 days\u2019 written notice. If you withdraw within the first 30 days (the Minimum Period), a \u00a3399 termination fee applies, plus any costs already incurred (such as collection or HPI check). After the Minimum Period, no termination fee is charged.",
      },
      {
        q: "What happens during the inspection?",
        a: "After we collect your vehicle, we conduct an HPI check (verifying finance, theft, and write-off status) and a full pre-delivery inspection (PDI) covering mechanical, electrical, and cosmetic condition. If any work is needed before listing, we\u2019ll send you a quote for approval \u2014 we never carry out work without your written consent.",
      },
      {
        q: "Do I need to be present for collection?",
        a: "You or an authorised person must be present to hand over the vehicle, keys, and documents. Collections are arranged at a date and time that suits you, and we\u2019ll confirm everything in writing beforehand.",
      },
    ],
  },
  {
    id: "buying",
    label: "Buying",
    items: [
      {
        q: "How do I buy a car from iAutoMotive?",
        a: "Browse our inventory online, save your favourites, and when you find the right car, you can reserve it or proceed to checkout directly. We handle all the paperwork, title transfer, and delivery. Every vehicle comes with a full history check and has been inspected before listing.",
      },
      {
        q: "Can I finance my purchase?",
        a: "Yes. We work with a panel of FCA-authorised lenders who may be able to offer you vehicle finance. You can get a quick pre-qualification check (soft credit search \u2014 no impact on your credit score) to see indicative rates before committing. We act as a credit broker, not a lender. You\u2019re under no obligation to use our finance and are free to arrange your own.",
      },
      {
        q: "Is there a return policy?",
        a: "Yes. You have a 7-day return period from the date of delivery. If you\u2019re not completely happy with your vehicle, you can return it within this period for a full refund. The vehicle must be returned in the same condition it was delivered, with no additional damage or excessive mileage. You also have statutory rights under the Consumer Rights Act 2015.",
      },
      {
        q: "Can I trade in my current car?",
        a: "Absolutely. You can use our trade-in tool to get an instant valuation for your current vehicle. The trade-in value can be applied to your purchase, reducing the amount you need to pay or finance. Alternatively, you can consign your current car with us for a potentially higher return.",
      },
      {
        q: "How is delivery arranged?",
        a: "We offer delivery across the UK. Once your purchase is complete and all checks have cleared, we\u2019ll arrange delivery to your door at a date and time that suits you. Delivery timescales depend on your location but are typically within 5\u201310 working days.",
      },
      {
        q: "What checks are done on each vehicle?",
        a: (
          <>
            Every vehicle listed on iAutoMotive has been through our rigorous preparation process,
            including:
            <br />
            <br />
            &bull; Full HPI check (finance, theft, write-off, mileage verification)
            <br />
            &bull; Pre-delivery inspection (mechanical, electrical, cosmetic)
            <br />
            &bull; Professional photography
            <br />
            &bull; Any necessary reconditioning (approved by the seller)
            <br />
            <br />
            We aim to give you complete confidence in every vehicle we list.
          </>
        ),
      },
      {
        q: "Are the prices negotiable?",
        a: "Our pricing is based on live market data and is set to be competitive from the start. However, iAutoMotive manages pricing on behalf of sellers and may adjust prices over time using our dynamic pricing strategy. If you\u2019re interested in a vehicle, get in touch \u2014 we\u2019re always happy to discuss.",
      },
    ],
  },
  {
    id: "general",
    label: "General",
    items: [
      {
        q: "What is iAutoMotive?",
        a: "iAutoMotive is a UK vehicle consignment platform. We connect private sellers with buyers by managing the end-to-end sale of used vehicles at full retail market price. Think of us as your dedicated sales team \u2014 we handle collection, inspection, photography, listing, buyer enquiries, negotiation, and the legal transfer, so you don\u2019t have to.",
      },
      {
        q: "Is iAutoMotive regulated?",
        a: "Yes. iAutoMotive Ltd is registered in England and Wales and is authorised by the Financial Conduct Authority (FCA) for credit broking activities. We also comply with the Money Laundering Regulations 2017, the Consumer Rights Act 2015, and the UK GDPR. You can verify our FCA status on the Financial Services Register at register.fca.org.uk.",
      },
      {
        q: "How is my money protected?",
        a: "All buyer funds are held in a designated client account, completely separate from iAutoMotive\u2019s operating accounts. Your money is never commingled with our business funds. Seller payouts are made from this protected client account once all sale conditions are met.",
      },
      {
        q: "Is my personal data safe?",
        a: (
          <>
            Yes. We take data protection seriously. All personal data is encrypted in transit (TLS
            1.3) and at rest (AES-256). We comply with the UK GDPR and the Data Protection Act 2018.
            For full details, see our{" "}
            <a href="/legal/privacy" style={{ color: "#008C7C", textDecoration: "underline" }}>
              Privacy Policy
            </a>
            .
          </>
        ),
      },
      {
        q: "Where are you based?",
        a: "iAutoMotive is based in England and operates vehicle lots across the UK. We offer nationwide collection and delivery services, so you don\u2019t need to be near one of our lots to use our platform.",
      },
      {
        q: "How do I make a complaint?",
        a: (
          <>
            We take complaints seriously. You can email us at{" "}
            <a
              href="mailto:complaints@iautomotive.co.uk"
              style={{ color: "#008C7C", textDecoration: "underline" }}
            >
              complaints@iautomotive.co.uk
            </a>
            , call us, or write to us. We\u2019ll acknowledge your complaint within 2 working days
            and aim to resolve it within 8 weeks. Full details are in our{" "}
            <a href="/legal/complaints" style={{ color: "#008C7C", textDecoration: "underline" }}>
              Complaints Policy
            </a>
            .
          </>
        ),
      },
      {
        q: "Do you buy cars outright?",
        a: "iAutoMotive is a consignment platform \u2014 we sell your car on your behalf rather than buying it from you. This means you typically earn more because your vehicle is sold at full retail market price, not at a discounted trade price. If you need an instant sale, we can discuss options with you.",
      },
      {
        q: "Can I sell a van, motorbike, or commercial vehicle?",
        a: "At launch, iAutoMotive focuses on cars and SUVs. We plan to expand into vans and light commercial vehicles in the future. If you have a specific enquiry, please contact us at hello@iautomotive.co.uk and we\u2019ll see what we can do.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Accordion Item                                                    */
/* ------------------------------------------------------------------ */

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid #EAECEF" }}>
      <button
        onClick={onToggle}
        className="font-body w-full text-left"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "20px 0",
          fontSize: "16px",
          fontWeight: 500,
          color: "#0F1724",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span>{question}</span>
        <span
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: isOpen ? "#008C7C" : "#F7F8F9",
            color: isOpen ? "#FFFFFF" : "#4A556B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 300,
            transition: "all 0.2s ease",
          }}
        >
          {isOpen ? "\u2212" : "+"}
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div
          className="font-body"
          style={{
            fontSize: "15px",
            lineHeight: 1.75,
            color: "#4A556B",
            paddingBottom: "20px",
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("selling");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = faqCategories.find((c) => c.id === activeCategory)!;

  // Filter items by search query
  const filteredItems = searchQuery.trim()
    ? faqCategories.flatMap((cat) =>
        cat.items.filter((item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : currentCategory.items;

  const isSearching = searchQuery.trim().length > 0;

  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #008C7C 0%, #006058 100%)",
          padding: "64px 0 48px",
        }}
      >
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <h1
            className="font-heading text-white"
            style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Frequently Asked Questions
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.8)",
              marginTop: "12px",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Everything you need to know about selling and buying with iAutoMotive.
          </p>

          {/* Search bar */}
          <div
            style={{
              maxWidth: "520px",
              margin: "28px auto 0",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: "100px",
                padding: "0 20px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* Search icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8492A8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search for a question..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenIndex(null);
                }}
                className="font-body"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "16px 12px",
                  fontSize: "15px",
                  color: "#0F1724",
                  backgroundColor: "transparent",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setOpenIndex(0);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8492A8",
                    fontSize: "18px",
                    padding: "4px",
                  }}
                  aria-label="Clear search"
                >
                  \u2715
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-12">
        {/* Category tabs */}
        {!isSearching && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "32px",
              flexWrap: "wrap",
            }}
          >
            {faqCategories.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenIndex(0);
                  }}
                  className="font-body"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "100px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: isActive ? "#008C7C" : "#F7F8F9",
                    color: isActive ? "#FFFFFF" : "#4A556B",
                  }}
                >
                  {cat.label}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search results label */}
        {isSearching && (
          <div style={{ marginBottom: "24px" }}>
            <p
              className="font-body"
              style={{ fontSize: "14px", color: "#8492A8", margin: 0 }}
            >
              {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for &ldquo;
              {searchQuery}&rdquo;
            </p>
          </div>
        )}

        {/* Accordion */}
        {filteredItems.length > 0 ? (
          <div style={{ borderTop: "1px solid #EAECEF" }}>
            {filteredItems.map((item, i) => (
              <AccordionItem
                key={item.q}
                question={item.q}
                answer={item.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#F7F8F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "28px",
              }}
            >
              ?
            </div>
            <p
              className="font-heading"
              style={{ fontSize: "18px", fontWeight: 600, color: "#0F1724", margin: "0 0 8px" }}
            >
              No results found
            </p>
            <p
              className="font-body"
              style={{ fontSize: "15px", color: "#8492A8", margin: "0 0 20px" }}
            >
              We couldn&rsquo;t find any questions matching your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setOpenIndex(0);
              }}
              className="font-body"
              style={{
                padding: "10px 24px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                backgroundColor: "#008C7C",
                color: "#FFFFFF",
              }}
            >
              Clear search
            </button>
          </div>
        )}

        {/* Still have questions CTA */}
        <div
          style={{
            backgroundColor: "#F7F8F9",
            borderRadius: "20px",
            padding: "40px",
            marginTop: "60px",
            textAlign: "center",
          }}
        >
          <h2
            className="font-heading"
            style={{ fontSize: "24px", fontWeight: 700, color: "#0F1724", margin: "0 0 8px" }}
          >
            Still have questions?
          </h2>
          <p
            className="font-body"
            style={{
              fontSize: "15px",
              color: "#4A556B",
              margin: "0 0 24px",
              maxWidth: "440px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Our team is here to help. Get in touch and we&rsquo;ll get back to you as soon as
            possible.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="mailto:hello@iautomotive.co.uk"
              className="font-body"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#008C7C",
                color: "#FFFFFF",
                textDecoration: "none",
                transition: "background-color 0.2s ease",
              }}
            >
              Email us
            </a>
            <a
              href="/contact"
              className="font-body"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#FFFFFF",
                color: "#008C7C",
                textDecoration: "none",
                border: "2px solid #008C7C",
                transition: "all 0.2s ease",
              }}
            >
              Contact page
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
