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
  "support@iautomotive.co.uk": "mailto:support@iautomotive.co.uk",
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
    // FCA disclosure intentionally omitted from the footer until the
    // /legal/fca page itself is finalised; the route mapping above stays
    // so re-adding is a one-line change.
    links: ["Terms of service", "Privacy policy", "Complaints"],
  },
  {
    heading: "SUPPORT",
    links: ["FAQ", "Contact us", "support@iautomotive.co.uk"],
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

        {/* Bottom row — logo + copyright */}
        <div className="flex flex-col gap-2">
          <div className="font-heading" style={{ fontSize: "20px" }}>
            <span style={{ fontWeight: 300, color: "#8492A8" }}>iAuto</span>
            <span style={{ fontWeight: 900, color: "#4DD9C7" }}>Motive</span>
          </div>
          <p
            className="font-body"
            style={{ fontSize: "13px", fontWeight: 400, color: "#8492A8", margin: 0 }}
          >
            &copy; {new Date().getFullYear()} I Automotive Technologies Limited. All rights reserved.
          </p>
        </div>

        {/* Legal notice — registered company details from Companies House */}
        <p
          className="font-body"
          style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "#8492A8",
            maxWidth: "720px",
            marginTop: "20px",
            lineHeight: 1.6,
          }}
        >
          I Automotive Technologies Limited is a private limited company registered
          in England and Wales (company no. 15388064). Registered office: 310
          Beaumont House, Beaumont Road, Banbury, Oxfordshire, OX16 1RH, United
          Kingdom. Trading as iAutoMotive.
        </p>

        {/* Finance / FCA disclosure — authorised representative status */}
        <p
          className="font-body"
          style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "#8492A8",
            maxWidth: "720px",
            marginTop: "12px",
            lineHeight: 1.6,
          }}
        >
          iAutoMotive Technologies Limited is an authorised representative on
          behalf of various UK finance brokers with access to over 40 different
          lenders providing credit solutions for customers with impaired credit
          profiles to excellent, with typical rates ranging from 8.99% APR to
          49.99% APR representative.
        </p>
      </div>
    </footer>
  );
}
