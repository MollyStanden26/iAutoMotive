"use client";

const footerColumns = [
  {
    heading: "BROWSE",
    links: ["Browse cars", "SUVs", "Saloons", "Electric", "Under \u00a320k"],
  },
  {
    heading: "SELL",
    links: ["Sell your car", "How it works", "Pricing & fees", "Get an offer"],
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
    links: ["FAQ", "Contact us", "support@autoconsign.co.uk"],
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
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body block transition-colors duration-150"
                      style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        color: "#C8CDD6",
                        lineHeight: 2.2,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#4DD9C7";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = "#C8CDD6";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
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
              <span style={{ fontWeight: 300, color: "#8492A8" }}>Auto</span>
              <span style={{ fontWeight: 900, color: "#4DD9C7" }}>Consign</span>
            </div>
            <p
              className="font-body"
              style={{ fontSize: "13px", fontWeight: 400, color: "#8492A8", margin: 0 }}
            >
              &copy; {new Date().getFullYear()} AutoConsign Ltd. All rights reserved.
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
          AutoConsign Ltd is registered in England and Wales. FCA authorisation pending.
        </p>
      </div>
    </footer>
  );
}
