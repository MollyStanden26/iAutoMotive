"use client";

import Link from "next/link";

const linkMap: Record<string, string> = {
  // Browse
  "Browse cars": "/cars",
  "SUVs": "/cars?type=suv",
  "Saloons": "/cars?type=saloon",
  "Electric": "/cars?type=electric",
  "Under \u00a320k": "/cars?maxPrice=20000",
  // Sell
  "Sell your car": "/sell",
  "How it works": "/sell/how-it-works",
  "Pricing & fees": "/sell/pricing",
  "Get an offer": "/sell",
  // Company
  "About us": "/about",
  "Press": "/press",
  "Careers": "/careers",
  "Contact": "/contact",
  // Legal
  "Terms of service": "/legal/terms",
  "Privacy policy": "/legal/privacy",
  "Complaints": "/legal/complaints",
  "FCA disclosure": "/legal/fca",
  // Support
  "FAQ": "/faq",
  "Contact us": "/contact",
  "support@iautosale.co.uk": "mailto:support@iautosale.co.uk",
};

const footerColumns = [
  {
    heading: "BROWSE",
    links: ["Browse cars", "SUVs", "Saloons", "Electric", "Under \u00a320k"],
  },
  {
    heading: "SELL",
    links: ["Sell your car", "Pricing & fees", "Get an offer"],
  },
  {
    heading: "COMPANY",
    links: ["About us", "Press", "Careers", "Contact"],
  },
  {
    heading: "LEGAL",
    links: ["Terms of service", "Privacy policy", "Complaints", "FCA disclosure"],
  },
  {
    heading: "SUPPORT",
    links: ["FAQ", "Contact us", "support@iautosale.co.uk"],
  },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0F1724", paddingTop: "64px", paddingBottom: "48px" }}>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        {/* Column grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4
                className="font-body"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#8492A8",
                  marginBottom: "16px",
                }}
              >
                {col.heading}
              </h4>
              <ul className="list-none p-0 m-0">
                {col.links.map((link) => {
                  const href = linkMap[link] || "#";
                  const isExternal = href.startsWith("mailto:");
                  const linkStyle = {
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#C8CDD6",
                    lineHeight: 2.2,
                    textDecoration: "none",
                  };
                  const hoverIn = (e: React.MouseEvent) => {
                    (e.currentTarget as HTMLElement).style.color = "#4DD9C7";
                  };
                  const hoverOut = (e: React.MouseEvent) => {
                    (e.currentTarget as HTMLElement).style.color = "#C8CDD6";
                  };
                  return (
                    <li key={link}>
                      {isExternal ? (
                        <a
                          href={href}
                          className="font-body block transition-colors duration-150"
                          style={linkStyle}
                          onMouseEnter={hoverIn}
                          onMouseLeave={hoverOut}
                        >
                          {link}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="font-body block transition-colors duration-150"
                          style={linkStyle}
                          onMouseEnter={hoverIn}
                          onMouseLeave={hoverOut}
                        >
                          {link}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "#222D3F",
            marginTop: "32px",
            marginBottom: "32px",
          }}
        />

        {/* Bottom row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Logo + copyright */}
          <div className="flex flex-col gap-2">
            <div className="font-heading" style={{ fontSize: "20px" }}>
              <span style={{ fontWeight: 300, color: "#8492A8" }}>iAuto</span>
              <span style={{ fontWeight: 900, color: "#4DD9C7" }}>Sale</span>
            </div>
            <p
              className="font-body"
              style={{ fontSize: "13px", fontWeight: 400, color: "#8492A8", margin: 0 }}
            >
              &copy; {new Date().getFullYear()} iAutoSale Ltd. All rights reserved.
            </p>
          </div>

          {/* Right: Social icons */}
          <div className="flex items-center gap-3">
            {["FB", "LI", "IG", "X"].map((label) => (
              <a
                key={label}
                href="#"
                className="flex items-center justify-center transition-colors duration-150"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#222D3F",
                  color: "#8492A8",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#2D3A4F";
                  el.style.color = "#4DD9C7";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#222D3F";
                  el.style.color = "#8492A8";
                }}
                aria-label={label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Legal notice */}
        <p
          className="font-body"
          style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "#8492A8",
            maxWidth: "600px",
            marginTop: "24px",
            lineHeight: 1.6,
          }}
        >
          iAutoSale Ltd is registered in England and Wales. FCA authorisation pending.
        </p>
      </div>
    </footer>
  );
}
