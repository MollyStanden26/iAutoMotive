import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FCA Disclosure | iAutoMotive",
  description:
    "iAutoMotive FCA regulatory disclosure — our regulatory status, the services we provide, and how we are remunerated.",
};

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */

function SectionHeading({ id, number, title }: { id: string; number: string; title: string }) {
  return (
    <h2
      id={id}
      className="font-heading"
      style={{
        fontSize: "22px",
        fontWeight: 700,
        color: "#0F1724",
        margin: "48px 0 16px",
        scrollMarginTop: "100px",
      }}
    >
      {number}. {title}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-body"
      style={{
        fontSize: "15px",
        lineHeight: 1.75,
        color: "#4A556B",
        margin: "0 0 16px",
      }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul
      className="font-body"
      style={{
        fontSize: "15px",
        lineHeight: 1.75,
        color: "#4A556B",
        margin: "0 0 16px",
        paddingLeft: "24px",
      }}
    >
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: "6px" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td
        className="font-body"
        style={{
          padding: "12px 16px",
          color: "#0F1724",
          fontWeight: 500,
          borderBottom: "1px solid #EAECEF",
          verticalAlign: "top",
          width: "240px",
        }}
      >
        {label}
      </td>
      <td
        className="font-body"
        style={{
          padding: "12px 16px",
          color: "#4A556B",
          borderBottom: "1px solid #EAECEF",
          verticalAlign: "top",
        }}
      >
        {children}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                 */
/* ------------------------------------------------------------------ */

const tocItems = [
  { id: "regulatory-status", number: "1", title: "Our Regulatory Status" },
  { id: "firm-details", number: "2", title: "Firm Details" },
  { id: "services", number: "3", title: "Services We Provide" },
  { id: "finance-introductions", number: "4", title: "Finance Introductions" },
  { id: "remuneration", number: "5", title: "How We Are Remunerated" },
  { id: "your-rights", number: "6", title: "Your Rights" },
  { id: "complaints", number: "7", title: "Complaints" },
  { id: "fos", number: "8", title: "Financial Ombudsman Service" },
  { id: "fscs", number: "9", title: "Financial Services Compensation Scheme" },
  { id: "data-protection", number: "10", title: "Data Protection" },
  { id: "contact", number: "11", title: "Contact Us" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function FcaDisclosurePage() {
  return (
    <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #008C7C 0%, #006058 100%)",
          padding: "64px 0 48px",
        }}
      >
        <div className="mx-auto max-w-[800px] px-6">
          <p
            className="font-body"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "8px",
            }}
          >
            Regulatory Information
          </p>
          <h1
            className="font-heading text-white"
            style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            FCA Disclosure
          </h1>
          <p
            className="font-body"
            style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", marginTop: "12px" }}
          >
            Version 1.0 &middot; Last updated: March 2026
          </p>
          <p
            className="font-body"
            style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", marginTop: "4px" }}
          >
            iAutoMotive Ltd &middot; Registered in England &amp; Wales &middot;{" "}
            <a
              href="mailto:hello@iautomotive.co.uk"
              style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}
            >
              hello@iautomotive.co.uk
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-12">
        {/* Regulatory notice */}
        <div
          style={{
            backgroundColor: "#FFF8E6",
            border: "1px solid #FFE9A0",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "40px",
          }}
        >
          <p
            className="font-body"
            style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: 0 }}
          >
            <strong>Important regulatory information:</strong> This page contains information about
            iAutoMotive Ltd&rsquo;s regulatory status in accordance with the requirements of the
            Financial Conduct Authority (FCA). You should read this information before using our
            finance introduction services.
          </p>
        </div>

        {/* Table of Contents */}
        <nav
          style={{
            backgroundColor: "#F7F8F9",
            borderRadius: "12px",
            padding: "24px 28px",
            marginBottom: "40px",
          }}
        >
          <h2
            className="font-heading"
            style={{ fontSize: "16px", fontWeight: 700, color: "#0F1724", margin: "0 0 14px" }}
          >
            Contents
          </h2>
          <ol
            className="font-body"
            style={{
              fontSize: "14px",
              lineHeight: 2,
              color: "#008C7C",
              margin: 0,
              paddingLeft: "20px",
            }}
          >
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: "#008C7C", textDecoration: "none" }}>
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* -------------------------------------------------------- */}
        {/* 1. Our Regulatory Status                                 */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="regulatory-status" number="1" title="Our Regulatory Status" />
        <P>
          iAutoMotive Ltd is authorised and regulated by the Financial Conduct Authority (FCA) for
          credit broking activities. Our FCA permissions allow us to introduce buyers to
          FCA-authorised lenders for the purpose of vehicle finance.
        </P>
        <P>
          We act as a <strong>credit broker</strong>, not a lender. This means we introduce you to
          finance providers who may be able to offer you a finance agreement to fund your vehicle
          purchase. We do not provide credit or make lending decisions ourselves.
        </P>

        <div
          style={{
            backgroundColor: "#E0FAF5",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "16px 0 24px",
          }}
        >
          <p
            className="font-body"
            style={{ fontSize: "14px", lineHeight: 1.7, color: "#00332E", margin: 0 }}
          >
            <strong>FCA authorisation status:</strong> [Authorised and regulated by the Financial
            Conduct Authority &mdash; FCA registration number to be obtained before launch. This
            page will be updated with the firm reference number once authorisation is granted.]
          </p>
        </div>

        <P>
          You can verify our FCA registration status on the Financial Services Register at{" "}
          <a
            href="https://register.fca.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#008C7C" }}
          >
            register.fca.org.uk
          </a>
          .
        </P>

        {/* -------------------------------------------------------- */}
        {/* 2. Firm Details                                          */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="firm-details" number="2" title="Firm Details" />

        <div className="overflow-x-auto" style={{ margin: "16px 0 24px" }}>
          <table
            className="w-full font-body"
            style={{ fontSize: "14px", lineHeight: 1.6, borderCollapse: "collapse" }}
          >
            <tbody>
              <InfoRow label="Registered name">iAutoMotive Ltd</InfoRow>
              <InfoRow label="Trading name">iAutoMotive</InfoRow>
              <InfoRow label="Company registration number">[To be inserted]</InfoRow>
              <InfoRow label="Registered address">[Registered office address &mdash; to be confirmed]</InfoRow>
              <InfoRow label="FCA firm reference number">[FCA FRN &mdash; to be obtained before launch]</InfoRow>
              <InfoRow label="FCA permissions">Credit broking (introducing)</InfoRow>
              <InfoRow label="FCA register">
                <a
                  href="https://register.fca.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#008C7C" }}
                >
                  register.fca.org.uk
                </a>
              </InfoRow>
              <InfoRow label="ICO registration number">[ICO registration number &mdash; to be obtained]</InfoRow>
              <InfoRow label="Data Protection contact">
                <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
                  privacy@iautomotive.co.uk
                </a>
              </InfoRow>
            </tbody>
          </table>
        </div>

        {/* -------------------------------------------------------- */}
        {/* 3. Services We Provide                                   */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="services" number="3" title="Services We Provide" />
        <P>iAutoMotive provides the following services:</P>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            margin: "16px 0 24px",
          }}
        >
          {[
            {
              title: "Vehicle consignment",
              desc: "We act as your agent to sell your vehicle at the best available retail market price. This is not an FCA-regulated activity.",
            },
            {
              title: "Finance introductions",
              desc: "We introduce buyers to FCA-authorised lenders who may offer vehicle finance. This is an FCA-regulated activity.",
            },
            {
              title: "Insurance introductions",
              desc: "We may introduce buyers to warranty and GAP insurance providers. Any insurance introductions are made on a non-advised basis.",
            },
          ].map((s) => (
            <div
              key={s.title}
              style={{
                backgroundColor: "#F7F8F9",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <p
                className="font-heading"
                style={{ fontSize: "15px", fontWeight: 600, color: "#0F1724", margin: "0 0 8px" }}
              >
                {s.title}
              </p>
              <p
                className="font-body"
                style={{ fontSize: "14px", color: "#4A556B", margin: 0, lineHeight: 1.6 }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* -------------------------------------------------------- */}
        {/* 4. Finance Introductions                                 */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="finance-introductions" number="4" title="Finance Introductions" />
        <P>
          When you express interest in financing your vehicle purchase, iAutoMotive will introduce you
          to one or more FCA-authorised lenders from our panel. We do not provide financial advice.
          Our role is limited to introducing you to lenders who may be able to offer you a finance
          agreement.
        </P>

        <h3
          className="font-heading"
          style={{ fontSize: "17px", fontWeight: 600, color: "#0F1724", margin: "32px 0 12px" }}
        >
          What this means for you
        </h3>
        <BulletList
          items={[
            <>
              <strong>Non-advised service:</strong> We do not assess your individual circumstances or
              recommend a specific finance product. You are responsible for deciding whether a finance
              agreement is right for you.
            </>,
            <>
              <strong>Limited panel:</strong> We work with a limited number of lenders. We do not
              search the whole market. The finance offers you receive through iAutoMotive may not be
              the cheapest or most suitable available to you.
            </>,
            <>
              <strong>Soft credit search:</strong> Where we offer a pre-qualification check, this
              uses a soft credit search that does not affect your credit score. A full credit search
              will only be carried out by the lender if you choose to proceed with a finance
              application.
            </>,
            <>
              <strong>No obligation:</strong> You are under no obligation to accept any finance offer
              presented to you. You are free to arrange your own finance independently.
            </>,
            <>
              <strong>Cooling-off period:</strong> If you enter into a regulated credit agreement,
              you have a 14-day cooling-off period during which you can withdraw from the agreement
              without giving a reason.
            </>,
          ]}
        />

        <h3
          className="font-heading"
          style={{ fontSize: "17px", fontWeight: 600, color: "#0F1724", margin: "32px 0 12px" }}
        >
          Our lender panel
        </h3>
        <P>
          iAutoMotive works with the following FCA-authorised lenders (this list will be updated as
          new lender relationships are established):
        </P>
        <P>
          <em>[Lender panel to be confirmed before launch and listed here with their FCA firm
          reference numbers.]</em>
        </P>

        {/* -------------------------------------------------------- */}
        {/* 5. How We Are Remunerated                                */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="remuneration" number="5" title="How We Are Remunerated" />
        <P>
          It is important that you understand how iAutoMotive earns money from its services. We
          believe in full transparency about our remuneration.
        </P>

        <div className="overflow-x-auto" style={{ margin: "16px 0 24px" }}>
          <table
            className="w-full font-body"
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              borderCollapse: "collapse",
              minWidth: "480px",
            }}
          >
            <thead>
              <tr>
                {["Service", "How we are paid", "Who pays us"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      backgroundColor: "#F7F8F9",
                      color: "#0F1724",
                      fontWeight: 600,
                      borderBottom: "2px solid #EAECEF",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Vehicle consignment",
                  "No commission fee charged",
                  "N/A",
                ],
                [
                  "Finance introduction",
                  "Commission paid by the lender on completion of a finance agreement",
                  "The lender (not the buyer)",
                ],
                [
                  "Warranty introduction",
                  "Commission paid by the warranty provider",
                  "The warranty provider (not the buyer)",
                ],
                [
                  "GAP insurance introduction",
                  "Commission paid by the insurance provider",
                  "The insurance provider (not the buyer)",
                ],
              ].map(([service, how, who]) => (
                <tr key={service}>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#0F1724",
                      fontWeight: 500,
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                    }}
                  >
                    {service}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4A556B",
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                    }}
                  >
                    {how}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4A556B",
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                    }}
                  >
                    {who}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <P>
          The commission we receive from lenders may vary depending on the lender, the type of
          finance product, and the terms of the agreement. This means we may receive more commission
          from some lenders or products than others. You have the right to ask us about the
          commission we receive in connection with your specific finance introduction.
        </P>

        <div
          style={{
            backgroundColor: "#E0FAF5",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "16px 0 24px",
          }}
        >
          <p
            className="font-body"
            style={{ fontSize: "14px", lineHeight: 1.7, color: "#00332E", margin: 0 }}
          >
            <strong>Important:</strong> The commission iAutoMotive receives from lenders does not
            affect the Seller&rsquo;s Minimum Return. iAutoMotive does not charge a commission fee
            on vehicle consignment sales. Finance commissions do not reduce the amount the Seller
            receives from the sale of their vehicle.
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/* 6. Your Rights                                           */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="your-rights" number="6" title="Your Rights" />
        <P>When using our finance introduction service, you have the right to:</P>
        <BulletList
          items={[
            <>
              <strong>Request disclosure of commission:</strong> You can ask us to tell you how much
              commission we will receive from a lender in connection with your finance introduction,
              before you decide whether to proceed.
            </>,
            <>
              <strong>Shop around:</strong> You are not obliged to use our finance introduction
              service. You are free to arrange finance independently from any lender of your choice.
            </>,
            <>
              <strong>Cancel:</strong> If you enter into a regulated credit agreement, you have a
              statutory 14-day cooling-off period during which you can withdraw without penalty.
            </>,
            <>
              <strong>Complain:</strong> If you are unhappy with any aspect of our finance
              introduction service, you can make a complaint (see Section 7 below).
            </>,
            <>
              <strong>Refer to the Financial Ombudsman:</strong> If we cannot resolve your complaint
              to your satisfaction, you may be able to refer it to the Financial Ombudsman Service
              (see Section 8 below).
            </>,
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* 7. Complaints                                            */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="complaints" number="7" title="Complaints" />
        <P>
          If you wish to make a complaint about iAutoMotive&rsquo;s finance introduction service or
          any other FCA-regulated activity, please contact us:
        </P>
        <BulletList
          items={[
            <>
              <strong>Email:</strong>{" "}
              <a href="mailto:complaints@iautomotive.co.uk" style={{ color: "#008C7C" }}>
                complaints@iautomotive.co.uk
              </a>
            </>,
            <>
              <strong>Post:</strong> iAutoMotive Ltd, [Registered address], marked: Complaints
            </>,
            <>
              <strong>Telephone:</strong> [Phone number &mdash; to be confirmed]
            </>,
          ]}
        />
        <P>
          We will handle your complaint in accordance with the FCA&rsquo;s Dispute Resolution rules
          (DISP). We will acknowledge your complaint within 5 working days and aim to provide a
          final response within 8 weeks.
        </P>
        <P>
          For full details of our complaints process, please see our{" "}
          <a href="/legal/complaints" style={{ color: "#008C7C", textDecoration: "underline" }}>
            Complaints Policy
          </a>
          .
        </P>

        {/* -------------------------------------------------------- */}
        {/* 8. Financial Ombudsman Service                           */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="fos" number="8" title="Financial Ombudsman Service" />
        <P>
          If you are not satisfied with our final response to your complaint, or if 8 weeks have
          passed since you first complained and you have not received a final response, you may be
          entitled to refer your complaint to the Financial Ombudsman Service (FOS).
        </P>
        <P>
          The FOS is a free, independent service for resolving disputes between consumers and
          financial services firms.
        </P>

        <div
          style={{
            backgroundColor: "#F7F8F9",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "16px 0 24px",
          }}
        >
          <p
            className="font-heading"
            style={{ fontSize: "15px", fontWeight: 600, color: "#0F1724", margin: "0 0 8px" }}
          >
            Financial Ombudsman Service
          </p>
          <BulletList
            items={[
              <>
                <strong>Website:</strong>{" "}
                <a
                  href="https://www.financial-ombudsman.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#008C7C" }}
                >
                  www.financial-ombudsman.org.uk
                </a>
              </>,
              <>
                <strong>Telephone:</strong> 0800 023 4567 (free from mobiles and landlines)
              </>,
              <>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:complaint.info@financial-ombudsman.org.uk"
                  style={{ color: "#008C7C" }}
                >
                  complaint.info@financial-ombudsman.org.uk
                </a>
              </>,
              <>
                <strong>Post:</strong> Financial Ombudsman Service, Exchange Tower, London, E14 9SR
              </>,
            ]}
          />
        </div>

        <P>
          You must refer your complaint to the FOS within 6 months of receiving our final response.
          The FOS will not normally consider your complaint if it is referred after this deadline,
          unless there are exceptional circumstances.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 9. FSCS                                                  */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="fscs" number="9" title="Financial Services Compensation Scheme" />
        <P>
          The Financial Services Compensation Scheme (FSCS) is the UK&rsquo;s statutory compensation
          scheme for customers of authorised financial services firms. It provides protection if an
          authorised firm is unable to pay claims against it.
        </P>
        <P>
          As a credit broker, iAutoMotive&rsquo;s activities may be covered by the FSCS. If you
          believe you have a claim, you can contact the FSCS:
        </P>

        <div
          style={{
            backgroundColor: "#F7F8F9",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "16px 0 24px",
          }}
        >
          <p
            className="font-heading"
            style={{ fontSize: "15px", fontWeight: 600, color: "#0F1724", margin: "0 0 8px" }}
          >
            Financial Services Compensation Scheme
          </p>
          <BulletList
            items={[
              <>
                <strong>Website:</strong>{" "}
                <a
                  href="https://www.fscs.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#008C7C" }}
                >
                  www.fscs.org.uk
                </a>
              </>,
              <>
                <strong>Telephone:</strong> 0800 678 1100 (free) or 020 7741 4100
              </>,
              <>
                <strong>Email:</strong>{" "}
                <a href="mailto:enquiries@fscs.org.uk" style={{ color: "#008C7C" }}>
                  enquiries@fscs.org.uk
                </a>
              </>,
              <>
                <strong>Post:</strong> FSCS, PO Box 300, Mitcheldean, GL17 1DY
              </>,
            ]}
          />
        </div>

        {/* -------------------------------------------------------- */}
        {/* 10. Data Protection                                      */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="data-protection" number="10" title="Data Protection" />
        <P>
          When you use our finance introduction service, we will share your personal data with
          lenders on our panel for the purpose of processing your finance application. This sharing
          is necessary to perform the service you have requested.
        </P>
        <P>
          We process your personal data in accordance with the UK General Data Protection Regulation
          (UK GDPR) and the Data Protection Act 2018. For full details of how we collect, use, and
          protect your personal data, please see our{" "}
          <a href="/legal/privacy" style={{ color: "#008C7C", textDecoration: "underline" }}>
            Privacy Policy
          </a>
          .
        </P>
        <P>The data we share with lenders typically includes:</P>
        <BulletList
          items={[
            "Your name, date of birth, and contact details",
            "Your address and address history",
            "Your employment status and income",
            "The vehicle you wish to finance and the amount of credit requested",
            "The results of any soft credit pre-qualification check",
          ]}
        />
        <P>
          Each lender on our panel is an independent data controller for the personal data they
          receive from us. You should read the lender&rsquo;s own privacy policy before proceeding
          with a finance application.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 11. Contact Us                                           */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="contact" number="11" title="Contact Us" />
        <P>
          If you have any questions about iAutoMotive&rsquo;s regulatory status or the information
          on this page, please contact us:
        </P>

        <div className="overflow-x-auto" style={{ margin: "16px 0 24px" }}>
          <table
            className="w-full font-body"
            style={{ fontSize: "14px", lineHeight: 1.6, borderCollapse: "collapse" }}
          >
            <tbody>
              <InfoRow label="General enquiries">
                <a href="mailto:hello@iautomotive.co.uk" style={{ color: "#008C7C" }}>
                  hello@iautomotive.co.uk
                </a>
              </InfoRow>
              <InfoRow label="Complaints">
                <a href="mailto:complaints@iautomotive.co.uk" style={{ color: "#008C7C" }}>
                  complaints@iautomotive.co.uk
                </a>
              </InfoRow>
              <InfoRow label="Data Protection">
                <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
                  privacy@iautomotive.co.uk
                </a>
              </InfoRow>
              <InfoRow label="Telephone">[Phone number &mdash; to be confirmed]</InfoRow>
              <InfoRow label="Post">
                iAutoMotive Ltd, [Registered address]
              </InfoRow>
              <InfoRow label="FCA Register">
                <a
                  href="https://register.fca.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#008C7C" }}
                >
                  register.fca.org.uk
                </a>
              </InfoRow>
            </tbody>
          </table>
        </div>

        {/* Statutory notice */}
        <div
          style={{
            backgroundColor: "#FFF8E6",
            border: "1px solid #FFE9A0",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "32px 0 24px",
          }}
        >
          <p
            className="font-heading"
            style={{ fontSize: "15px", fontWeight: 600, color: "#7A4A00", margin: "0 0 8px" }}
          >
            Regulatory notice
          </p>
          <p
            className="font-body"
            style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: 0 }}
          >
            iAutoMotive Ltd is authorised and regulated by the Financial Conduct Authority for credit
            broking activities. FCA firm reference number: [to be obtained]. Registered in England
            and Wales. Company number: [to be inserted]. Registered office: [to be confirmed].
          </p>
        </div>

        {/* Footer note */}
        <div
          style={{
            borderTop: "1px solid #EAECEF",
            marginTop: "48px",
            paddingTop: "24px",
          }}
        >
          <p
            className="font-body"
            style={{ fontSize: "13px", color: "#8492A8", lineHeight: 1.6, margin: 0 }}
          >
            iAutoMotive Ltd &middot; FCA Disclosure v1.0 &middot; March 2026
          </p>
        </div>
      </div>
    </main>
  );
}
