import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | iAutoMotive",
  description:
    "iAutoMotive Privacy Policy — how we collect, use, and protect your personal data.",
};

/* ------------------------------------------------------------------ */
/*  Reusable sub-components for the policy layout                     */
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-heading"
      style={{
        fontSize: "17px",
        fontWeight: 600,
        color: "#0F1724",
        margin: "32px 0 12px",
      }}
    >
      {children}
    </h3>
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

function PolicyTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto" style={{ margin: "16px 0 24px" }}>
      <table
        className="w-full font-body"
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          borderCollapse: "collapse",
          minWidth: "540px",
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  backgroundColor: "#F7F8F9",
                  color: "#0F1724",
                  fontWeight: 600,
                  borderBottom: "2px solid #EAECEF",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "12px 16px",
                    color: "#4A556B",
                    borderBottom: "1px solid #EAECEF",
                    verticalAlign: "top",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

/* ------------------------------------------------------------------ */
/*  Table of Contents links                                           */
/* ------------------------------------------------------------------ */

const tocItems = [
  { id: "who-we-are", number: "1", title: "Who We Are" },
  { id: "what-data", number: "2", title: "What Personal Data We Collect" },
  { id: "how-why", number: "3", title: "How and Why We Use Your Data" },
  { id: "sharing", number: "4", title: "Sharing Your Personal Data" },
  { id: "international", number: "5", title: "International Data Transfers" },
  { id: "retention", number: "6", title: "How Long We Keep Your Data" },
  { id: "your-rights", number: "7", title: "Your Rights" },
  { id: "cookies", number: "8", title: "Cookies and Tracking Technologies" },
  { id: "security", number: "9", title: "Security" },
  { id: "specific", number: "10", title: "Specific Processing Activities" },
  { id: "children", number: "11", title: "Children\u2019s Privacy" },
  { id: "changes", number: "12", title: "Changes to This Privacy Policy" },
  { id: "contact", number: "13", title: "Contact Us" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function PrivacyPolicyPage() {
  return (
    <main
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
      }}
    >
      {/* Hero banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #008C7C 0%, #006058 100%)",
          padding: "64px 0 48px",
        }}
      >
        <div className="mx-auto max-w-[800px] px-6">
          <h1
            className="font-heading text-white"
            style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Privacy Policy
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
            <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}>
              privacy@iautomotive.co.uk
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-12">
        {/* Important notice */}
        <div
          style={{
            backgroundColor: "#FFF8E6",
            border: "1px solid #FFE9A0",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "40px",
          }}
        >
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: 0 }}>
            <strong>Important notice:</strong> This Privacy Policy applies to all personal data
            processed by iAutoMotive Ltd in connection with our vehicle consignment platform and
            services. Please read this policy carefully. If you have any questions, contact our Data
            Protection contact at{" "}
            <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#B87209", textDecoration: "underline" }}>
              privacy@iautomotive.co.uk
            </a>
            .
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
        {/* 1. Who We Are                                            */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="who-we-are" number="1" title="Who We Are" />
        <P>
          iAutoMotive Ltd (&ldquo;iAutoMotive&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) is a vehicle consignment platform registered in England and Wales. We
          operate the iAutoMotive platform at iautomotive.co.uk, which connects private vehicle
          sellers with buyers by managing the end-to-end consignment of used vehicles.
        </P>
        <P>
          iAutoMotive Ltd is the data controller for personal data processed through our platform.
          This means we are responsible for deciding how and why your personal data is used.
        </P>

        <SubHeading>Our contact details</SubHeading>
        <PolicyTable
          headers={["", ""]}
          rows={[
            ["Company", "iAutoMotive Ltd"],
            ["Registered address", "[Registered office address \u2014 to be confirmed]"],
            ["ICO registration number", "[ICO registration number \u2014 to be obtained before launch]"],
            ["Data Protection contact", "privacy@iautomotive.co.uk"],
            ["General enquiries", "hello@iautomotive.co.uk"],
            ["Telephone", "[Phone number \u2014 to be confirmed]"],
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* 2. What Personal Data We Collect                         */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="what-data" number="2" title="What Personal Data We Collect" />
        <P>
          We collect and process different categories of personal data depending on how you use our
          platform. The tables below set out what we collect, from whom, and why.
        </P>

        <SubHeading>2.1 Data collected from sellers (vehicle consignors)</SubHeading>
        <PolicyTable
          headers={["Category of data", "Specific data points", "How collected"]}
          rows={[
            [
              "Identity",
              "Full name, date of birth (if required for identity verification), gender (if provided)",
              "Account registration; consignment agreement",
            ],
            [
              "Contact",
              "Email address, telephone number(s), home address",
              "Account registration; collection scheduling",
            ],
            [
              "Vehicle",
              "Vehicle registration, VIN/chassis number, make, model, mileage, condition, service history, V5C details, HPI check results, outstanding finance information",
              "Intake process; DVLA and HPI lookups",
            ],
            [
              "Financial",
              "Bank account name and number (for payouts), sort code, net proceeds figures, outstanding finance amounts",
              "Consignment onboarding; payout processing",
            ],
            [
              "Communications",
              "Messages sent through our platform, call recordings (where consent is given), email and SMS communications",
              "Platform messaging; telephone contact",
            ],
            [
              "Identity verification",
              "Government-issued ID document details, selfie/liveness check data (where required)",
              "Identity verification process for high-value transactions",
            ],
            [
              "Technical",
              "IP address, device type, browser type, session data, page views, platform activity logs",
              "Automatic collection via cookies and server logs",
            ],
          ]}
        />

        <SubHeading>2.2 Data collected from buyers</SubHeading>
        <PolicyTable
          headers={["Category of data", "Specific data points", "How collected"]}
          rows={[
            ["Identity", "Full name, date of birth", "Account registration; checkout process"],
            [
              "Contact",
              "Email address, telephone number, delivery address",
              "Account registration; delivery scheduling",
            ],
            [
              "Financial",
              "Payment card details (processed by Stripe \u2014 not stored by us), pre-qualification data (soft credit search), finance application data where applicable",
              "Checkout; finance introduction process",
            ],
            [
              "Trade-in vehicle",
              "Registration, VIN, condition, outstanding finance (if any) for trade-in vehicles",
              "Trade-in tool",
            ],
            [
              "Identity verification",
              "Government-issued ID (for fraud prevention on high-value purchases)",
              "Identity verification at checkout",
            ],
            [
              "Transaction history",
              "Vehicles reserved, purchased, returned; order history",
              "Platform transaction records",
            ],
            [
              "Preferences",
              "Saved searches, saved vehicles, notification preferences",
              "Platform activity",
            ],
            [
              "Technical",
              "IP address, device type, browser type, session data, platform activity",
              "Automatic collection via cookies and server logs",
            ],
          ]}
        />

        <SubHeading>2.3 Data collected from third parties</SubHeading>
        <P>
          In addition to data you provide directly, we receive personal data from the following third
          parties:
        </P>
        <BulletList
          items={[
            <>
              <strong>DVLA:</strong> vehicle registration details and keeper history, used to verify
              seller authority and populate vehicle specifications.
            </>,
            <>
              <strong>HPI Check / Experian:</strong> vehicle history data including outstanding
              finance, theft, write-off status, and mileage history.
            </>,
            <>
              <strong>Identity verification providers (Stripe Identity):</strong> ID document
              authentication and liveness verification results.
            </>,
            <>
              <strong>Credit reference agencies:</strong> soft-pull pre-qualification results for
              buyers seeking finance introductions (where FCA-authorised activity applies).
            </>,
            <>
              <strong>Fraud prevention services (Point Predictive, Experian CrossCore):</strong>{" "}
              synthetic identity scores and fraud risk indicators.
            </>,
            <>
              <strong>PEP and sanctions screening services:</strong> politically exposed person
              status and sanctions list matches, as required under the Money Laundering Regulations
              2017.
            </>,
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* 3. How and Why We Use Your Data                          */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="how-why" number="3" title="How and Why We Use Your Data" />
        <P>
          We must have a lawful basis to process your personal data under the UK General Data
          Protection Regulation (UK GDPR) and the Data Protection Act 2018. The table below sets out
          each purpose for which we process personal data, our lawful basis, and the data categories
          involved.
        </P>
        <PolicyTable
          headers={["Purpose", "Lawful basis", "Applies to", "Data categories"]}
          rows={[
            [
              "Providing our consignment service \u2014 managing vehicle intake, listing, sale, and payout",
              "Performance of a contract (Article 6(1)(b) UK GDPR)",
              "Sellers",
              "Identity, contact, vehicle, financial",
            ],
            [
              "Facilitating vehicle purchases \u2014 checkout, payment processing, delivery, title transfer",
              "Performance of a contract",
              "Buyers",
              "Identity, contact, financial, transaction",
            ],
            [
              "Identity verification and fraud prevention",
              "Legitimate interests (protecting our business and customers from fraud); legal obligation (AML regulations)",
              "Sellers and buyers",
              "Identity, identity verification, financial",
            ],
            [
              "Anti-money laundering and sanctions screening",
              "Legal obligation (MLR 2017; Proceeds of Crime Act 2002)",
              "Sellers and buyers",
              "Identity, financial, PEP/sanctions data",
            ],
            [
              "Communicating about your transaction \u2014 status updates, notifications, payout confirmations",
              "Performance of a contract; legitimate interests",
              "Sellers and buyers",
              "Contact, communications, transaction",
            ],
            [
              "Processing payments and managing payouts (via Stripe)",
              "Performance of a contract",
              "Sellers and buyers",
              "Financial, identity",
            ],
            [
              "Finance introductions \u2014 introducing buyers to FCA-authorised lenders",
              "Performance of a contract; legitimate interests; consent where required by CONC",
              "Buyers",
              "Identity, financial",
            ],
            [
              "Handling complaints and disputes",
              "Legal obligation (Consumer Rights Act 2015); legitimate interests",
              "Sellers and buyers",
              "Identity, contact, transaction, communications",
            ],
            [
              "Improving our platform \u2014 analytics, A/B testing, user behaviour analysis",
              "Legitimate interests",
              "All users",
              "Technical, usage, preferences",
            ],
            [
              "Marketing communications \u2014 where you have opted in or where we rely on the soft opt-in",
              "Consent; legitimate interests (soft opt-in for existing customers under PECR)",
              "All users",
              "Contact, preferences",
            ],
            [
              "Regulatory compliance \u2014 maintaining records required by law, responding to regulatory requests",
              "Legal obligation",
              "Sellers and buyers",
              "All categories as required",
            ],
            [
              "Tax reporting \u2014 1099-K equivalent reporting where required; TIN/UTR verification",
              "Legal obligation (HMRC requirements)",
              "Sellers",
              "Identity, financial",
            ],
          ]}
        />
        <SubHeading>Legitimate interests</SubHeading>
        <P>
          Where we rely on legitimate interests as our lawful basis, we have carried out a Legitimate
          Interests Assessment (LIA) to ensure that our interests are not overridden by your rights
          and interests. You have the right to object to processing based on legitimate interests at
          any time. Contact us at{" "}
          <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
            privacy@iautomotive.co.uk
          </a>
          .
        </P>

        {/* -------------------------------------------------------- */}
        {/* 4. Sharing Your Personal Data                            */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="sharing" number="4" title="Sharing Your Personal Data" />
        <P>
          We share personal data with third parties only where necessary for our services, required
          by law, or with your consent. We do not sell your personal data to third parties for their
          own marketing purposes.
        </P>

        <SubHeading>4.1 Our service providers (data processors)</SubHeading>
        <P>
          We share personal data with the following categories of service provider, who process it on
          our behalf and under our instructions:
        </P>
        <PolicyTable
          headers={["Service provider category", "Specific providers", "Purpose"]}
          rows={[
            ["Payment processing", "Stripe, Inc.", "Buyer card payments; seller Faster Payments disbursements; escrow management"],
            ["Electronic signatures", "DocuSign, Inc.", "E-signing of consignment agreements, purchase contracts, and all deal documents"],
            ["Identity verification", "Stripe Identity; Point Predictive", "Government ID verification; synthetic identity and fraud risk scoring"],
            ["Vehicle data", "HPI Check / Experian; DVLA; Cazana; Glass\u2019s Guide", "HPI checks; vehicle history; market valuation"],
            ["Communications", "Twilio, Inc. (SMS); SendGrid / Twilio (email)", "Transactional SMS and email notifications to sellers and buyers"],
            ["Cloud hosting and infrastructure", "Amazon Web Services (AWS); Vercel", "Secure hosting of our platform and data"],
            ["Analytics and monitoring", "Datadog; Sentry", "Platform performance monitoring; error tracking"],
            ["Photography and imaging", "Spyne or equivalent", "AI-enhanced vehicle photography processing"],
            ["Finance introductions", "RouteOne or equivalent (where FCA-authorised)", "Introduction to FCA-authorised lenders for vehicle finance"],
          ]}
        />

        <SubHeading>4.2 Other parties we may share data with</SubHeading>
        <BulletList
          items={[
            <>
              <strong>Regulated lenders:</strong> where a buyer applies for vehicle finance, we share
              their application data with lenders in the RouteOne network for the purpose of credit
              assessment. Each lender is an independent data controller for their own processing.
            </>,
            <>
              <strong>DVLA:</strong> we notify the DVLA of vehicle keeper changes within 5 working
              days of a sale as required by law.
            </>,
            <>
              <strong>HM Revenue &amp; Customs:</strong> we may be required to report certain seller
              transaction data to HMRC in accordance with our tax reporting obligations.
            </>,
            <>
              <strong>Law enforcement and regulatory authorities:</strong> we will disclose personal
              data to the police, FCA, HMRC, or other authorities where we are legally required to
              do so, or where we reasonably believe disclosure is necessary to prevent or detect
              crime.
            </>,
            <>
              <strong>Fraud prevention agencies:</strong> we share information with fraud prevention
              agencies as part of our AML and fraud screening obligations. This information may be
              used by those agencies to prevent fraud and money laundering and to verify your
              identity.
            </>,
            <>
              <strong>Professional advisers:</strong> our solicitors, accountants, and insurers may
              receive personal data where necessary for their professional services.
            </>,
            <>
              <strong>Business transfers:</strong> in the event of a merger, acquisition, or sale of
              all or part of our business, personal data may be transferred to the acquiring entity.
              We will notify you before your data is transferred and becomes subject to a different
              privacy policy.
            </>,
          ]}
        />

        <div
          style={{
            backgroundColor: "#E0FAF5",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "24px 0",
          }}
        >
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#00332E", margin: 0 }}>
            <strong>We do not sell your data.</strong> iAutoMotive does not sell, rent, or trade
            personal data with third parties for marketing purposes. We do not share your data with
            advertisers for the purpose of serving you targeted advertising on other platforms.
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/* 5. International Data Transfers                          */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="international" number="5" title="International Data Transfers" />
        <P>
          Some of our third-party service providers are based outside the United Kingdom (UK). When
          we transfer personal data to countries outside the UK, we ensure that appropriate
          safeguards are in place to protect your data, in accordance with the UK GDPR.
        </P>
        <P>The safeguards we rely on include:</P>
        <BulletList
          items={[
            <>
              <strong>UK adequacy regulations:</strong> transfers to countries that the UK government
              has determined provide an adequate level of data protection.
            </>,
            <>
              <strong>UK International Data Transfer Agreements (IDTAs):</strong> standard
              contractual clauses approved by the ICO for transfers to countries without an adequacy
              decision.
            </>,
            <>
              <strong>UK Addendum to EU Standard Contractual Clauses:</strong> where we use the EU
              SCCs as a transfer mechanism with a UK Addendum.
            </>,
          ]}
        />

        <P>Key international transfers include:</P>
        <PolicyTable
          headers={["Recipient", "Country", "Transfer mechanism"]}
          rows={[
            ["Stripe, Inc.", "United States", "UK IDTA / SCCs with UK Addendum"],
            ["DocuSign, Inc.", "United States", "UK IDTA / SCCs with UK Addendum"],
            ["Amazon Web Services", "United States / EU", "SCCs with UK Addendum; AWS EU regions used where possible"],
            ["Twilio, Inc.", "United States", "UK IDTA / SCCs with UK Addendum"],
            ["Point Predictive", "United States", "UK IDTA / SCCs with UK Addendum"],
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* 6. How Long We Keep Your Data                            */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="retention" number="6" title="How Long We Keep Your Data" />
        <P>
          We retain personal data only for as long as necessary for the purposes for which it was
          collected, or as required by law. The table below sets out our standard retention periods.
        </P>
        <PolicyTable
          headers={["Data category", "Retention period", "Reason for retention"]}
          rows={[
            [
              "Consignment agreement and deal documents",
              "7 years from the date of the transaction",
              "Companies Act 2006; HMRC record-keeping requirements; potential contractual disputes",
            ],
            [
              "Financial transaction records (payouts, invoices)",
              "7 years from end of financial year",
              "HMRC and tax reporting obligations",
            ],
            [
              "AML and sanctions screening records",
              "5 years from the end of the business relationship",
              "Money Laundering Regulations 2017",
            ],
            [
              "Identity verification records",
              "5 years from the end of the business relationship (or longer if required by law)",
              "MLR 2017; fraud prevention",
            ],
            [
              "Complaints records",
              "6 years from resolution",
              "Limitation Act 1980 (potential legal claims); FCA requirements",
            ],
            [
              "Consumer contract records",
              "6 years from the date of the transaction",
              "Limitation Act 1980; Consumer Rights Act 2015",
            ],
            [
              "Account data (active accounts)",
              "For the duration of your account plus 2 years after account closure",
              "Legitimate interests in handling post-closure queries",
            ],
            [
              "Platform analytics and technical logs",
              "13 months",
              "ICO guidance on analytics data retention",
            ],
            [
              "Marketing preferences",
              "Until you withdraw consent or object, plus 1 year",
              "PECR; UK GDPR consent requirements",
            ],
            [
              "Call recordings (where applicable)",
              "12 months",
              "Quality assurance and dispute resolution",
            ],
            [
              "CCTV footage at our lots",
              "31 days",
              "ICO CCTV code of practice",
            ],
          ]}
        />
        <P>
          When personal data is no longer required, we securely delete or anonymise it. Where
          anonymisation is not possible, we restrict access to the data until deletion is possible.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 7. Your Rights                                           */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="your-rights" number="7" title="Your Rights" />
        <P>
          Under the UK GDPR and the Data Protection Act 2018, you have the following rights in
          relation to your personal data. These rights are not absolute and may be subject to
          exemptions, but we will always consider your request carefully and respond within the
          required timeframe.
        </P>
        <PolicyTable
          headers={["Your right", "What it means"]}
          rows={[
            [
              "Right of access",
              "You have the right to request a copy of the personal data we hold about you (a Subject Access Request or SAR). We will respond within one month. There is no charge unless the request is manifestly unfounded, excessive, or repetitive.",
            ],
            [
              "Right to rectification",
              "You have the right to ask us to correct inaccurate personal data or complete incomplete data. We will act within one month.",
            ],
            [
              "Right to erasure",
              "You have the right to ask us to delete your personal data in certain circumstances \u2014 for example, where it is no longer necessary for the purpose it was collected, or where you withdraw consent. This right does not apply where we have a legal obligation to retain data.",
            ],
            [
              "Right to restrict processing",
              "You have the right to ask us to pause processing of your data in certain circumstances \u2014 for example, while you contest its accuracy or while we consider your objection.",
            ],
            [
              "Right to data portability",
              "Where we process your data by automated means on the basis of your consent or a contract, you have the right to receive your data in a structured, commonly used, machine-readable format, and to ask us to transfer it to another controller.",
            ],
            [
              "Right to object",
              "You have the right to object to processing based on legitimate interests or for direct marketing purposes. Where you object to direct marketing, we will stop processing immediately.",
            ],
            [
              "Rights related to automated decision-making",
              "You have the right not to be subject to decisions based solely on automated processing (including profiling) that produce legal or similarly significant effects. Our fraud risk scoring involves automated processing but is always subject to human review before any adverse decision is made.",
            ],
            [
              "Right to withdraw consent",
              "Where we rely on your consent to process personal data, you can withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing carried out before the withdrawal.",
            ],
          ]}
        />

        <SubHeading>7.1 How to exercise your rights</SubHeading>
        <P>To exercise any of your rights, please contact us at:</P>
        <BulletList
          items={[
            <>
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
                privacy@iautomotive.co.uk
              </a>
            </>,
            <>
              <strong>Post:</strong> iAutoMotive Ltd, [Registered address], Attention: Data
              Protection
            </>,
          ]}
        />
        <P>
          We will respond to your request within one calendar month. In complex cases or where we
          receive multiple requests from the same individual, we may extend this period by a further
          two months and will notify you accordingly. We may need to verify your identity before
          processing your request.
        </P>

        <SubHeading>7.2 Right to complain</SubHeading>
        <P>
          If you are not satisfied with how we have handled your personal data or responded to your
          rights request, you have the right to complain to the Information Commissioner&rsquo;s
          Office (ICO):
        </P>
        <BulletList
          items={[
            <>
              <strong>ICO website:</strong>{" "}
              <a
                href="https://www.ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#008C7C" }}
              >
                www.ico.org.uk
              </a>
            </>,
            <>
              <strong>ICO helpline:</strong> 0303 123 1113
            </>,
            <>
              <strong>ICO address:</strong> Information Commissioner&rsquo;s Office, Wycliffe House,
              Water Lane, Wilmslow, Cheshire, SK9 5AF
            </>,
          ]}
        />
        <P>
          We would always prefer to resolve concerns directly before you approach the ICO, so please
          contact us first at{" "}
          <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
            privacy@iautomotive.co.uk
          </a>
          .
        </P>

        {/* -------------------------------------------------------- */}
        {/* 8. Cookies                                               */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="cookies" number="8" title="Cookies and Tracking Technologies" />
        <P>
          Our website uses cookies and similar technologies to make the platform work, to improve
          your experience, and &mdash; where you have consented &mdash; to show you relevant content
          and measure our marketing performance.
        </P>

        <SubHeading>8.1 What are cookies?</SubHeading>
        <P>
          Cookies are small text files placed on your device when you visit a website. They help the
          site remember information about your visit, such as your preferred settings or your login
          status. Some cookies are placed by us; others are placed by third parties whose services we
          use.
        </P>

        <SubHeading>8.2 Categories of cookies we use</SubHeading>
        <PolicyTable
          headers={["Category", "Purpose", "Lawful basis", "Examples"]}
          rows={[
            [
              "Strictly necessary",
              "Essential for the website to function \u2014 login sessions, security, the checkout process. Cannot be disabled.",
              "No consent required (legitimate interests / contract)",
              "Session cookies; CSRF protection; authentication tokens",
            ],
            [
              "Functional",
              "Remember your preferences \u2014 saved searches, notification settings, language.",
              "Legitimate interests",
              "Preference cookies; saved search data",
            ],
            [
              "Analytics",
              "Measure how our platform is used \u2014 which pages are visited, how users navigate. Data is aggregated and anonymised where possible.",
              "Consent",
              "Google Analytics; Datadog RUM",
            ],
            [
              "Marketing",
              "Track the effectiveness of our advertising on third-party platforms. Only set where you have consented.",
              "Consent",
              "Meta Pixel; Google Ads tags (if used)",
            ],
          ]}
        />

        <SubHeading>8.3 Managing your cookies</SubHeading>
        <P>
          When you first visit our website, we will show you a cookie banner asking for your consent
          to non-essential cookies. You can change your cookie preferences at any time by visiting
          our Cookie Preferences page at{" "}
          <a href="/legal/cookies" style={{ color: "#008C7C" }}>
            iautomotive.co.uk/legal/cookies
          </a>
          . You can also control cookies through your browser settings. Please note that disabling
          certain cookies may affect your ability to use some features of our platform.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 9. Security                                              */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="security" number="9" title="Security" />
        <P>
          We take the security of your personal data seriously and implement appropriate technical
          and organisational measures to protect it against unauthorised access, accidental loss,
          destruction, or damage. Our security measures include:
        </P>
        <BulletList
          items={[
            "Encryption of all personal data in transit using TLS 1.3 and at rest using AES-256 encryption.",
            "Strict role-based access controls ensuring staff can only access data they need for their role.",
            "Multi-factor authentication required for all staff accessing personal data.",
            "Regular security assessments and vulnerability scanning as part of our CI/CD pipeline.",
            "Annual third-party penetration testing.",
            "Physical security at our vehicle lots including CCTV and access controls.",
            "Staff training on data protection, information security, and phishing awareness.",
            "Documented incident response procedures.",
          ]}
        />
        <P>
          We are working towards achieving SOC 2 Type II certification within 18 months of launch.
        </P>

        <SubHeading>9.1 Data breaches</SubHeading>
        <P>
          In the event of a personal data breach that is likely to result in a risk to your rights
          and freedoms, we will notify the ICO within 72 hours of becoming aware of it, as required
          by Article 33 of the UK GDPR. Where the breach is likely to result in a high risk to your
          rights and freedoms, we will also notify you directly without undue delay, as required by
          Article 34.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 10. Specific Processing Activities                       */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="specific" number="10" title="Specific Processing Activities" />

        <SubHeading>10.1 Vehicle valuations and market data</SubHeading>
        <P>
          When you request a valuation for your vehicle, we use your vehicle registration number and
          mileage to query third-party valuation services (including Cazana, Glass&rsquo;s Guide,
          and AutoTrader pricing data). This processing is necessary to perform our contract with
          you. The results are used to generate your consignment offer and to price your vehicle on
          the platform.
        </P>

        <SubHeading>10.2 Fraud detection and identity verification</SubHeading>
        <P>
          We use automated fraud detection tools to assess the risk of fraudulent activity in
          connection with vehicle transactions. This includes assessing identity documents,
          cross-referencing against fraud databases, and generating a risk score. Where our automated
          systems flag a high risk, a human member of our team will review the case before any
          decision is made. You have the right to request human review of any automated decision.
        </P>
        <P>
          Identity verification is conducted where required by our AML obligations, for high-value
          transactions, or where our fraud detection systems indicate a need for enhanced
          verification. This processing is based on legal obligation and legitimate interests.
        </P>

        <SubHeading>10.3 Financial information and bank account data</SubHeading>
        <P>
          We collect bank account details from sellers solely for the purpose of making consignment
          payouts. This data is stored securely and is not used for any other purpose. Bank account
          details are never displayed in full on our platform &mdash; only the last four digits are
          shown for confirmation purposes.
        </P>
        <P>
          We do not store payment card details. All card payments are handled by Stripe, who is PCI
          DSS compliant. We receive only a tokenised reference from Stripe, not the card number
          itself.
        </P>

        <SubHeading>10.4 Call recording</SubHeading>
        <P>
          Where our cold-calling CRM team contacts sellers by telephone, calls may be recorded for
          quality assurance, training, and dispute resolution purposes. You will be informed at the
          start of any recorded call. If you prefer not to be recorded, you may decline and the call
          will proceed unrecorded. Recordings are retained for 12 months and then securely deleted.
        </P>

        <SubHeading>10.5 CCTV at our vehicle lots</SubHeading>
        <P>
          We operate CCTV at our vehicle storage lots for the purpose of security and theft
          prevention. CCTV is operated in accordance with the ICO&rsquo;s CCTV code of practice.
          Footage is retained for 31 days and then automatically overwritten unless required for an
          investigation. Signage is displayed at all lot entrances informing visitors that CCTV is in
          operation.
        </P>

        <SubHeading>10.6 Marketing communications</SubHeading>
        <P>
          We may send you marketing communications about our services, new vehicles on our platform,
          or relevant automotive news. We will only send marketing communications where:
        </P>
        <BulletList
          items={[
            "You have given us your explicit consent; or",
            "You are an existing customer and we are marketing similar products or services to those you have previously used with us (the \u201Csoft opt-in\u201D under PECR), and you have not objected to receiving marketing.",
          ]}
        />
        <P>
          You can opt out of marketing communications at any time by clicking
          &ldquo;unsubscribe&rdquo; in any marketing email, by replying STOP to any marketing SMS,
          or by updating your preferences in your account settings. Opting out of marketing does not
          affect transactional communications related to your active consignment or purchase.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 11. Children's Privacy                                   */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="children" number="11" title="Children&rsquo;s Privacy" />
        <P>
          Our platform is not intended for use by individuals under the age of 18. We do not
          knowingly collect personal data from children. If you believe we have inadvertently
          collected data from a child, please contact us immediately at{" "}
          <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
            privacy@iautomotive.co.uk
          </a>{" "}
          and we will delete it promptly.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 12. Changes to This Privacy Policy                       */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="changes" number="12" title="Changes to This Privacy Policy" />
        <P>
          We may update this Privacy Policy from time to time to reflect changes in our practices,
          our services, or applicable law. When we make material changes, we will:
        </P>
        <BulletList
          items={[
            <>Update the &ldquo;Last updated&rdquo; date at the top of this policy.</>,
            "Notify registered users by email where the changes are significant.",
            "Display a prominent notice on our website for a period of 30 days following a material update.",
          ]}
        />
        <P>
          We encourage you to review this policy periodically. Continued use of our platform after a
          policy update constitutes acceptance of the revised policy. Previous versions of this
          Privacy Policy are available on request by contacting{" "}
          <a href="mailto:privacy@iautomotive.co.uk" style={{ color: "#008C7C" }}>
            privacy@iautomotive.co.uk
          </a>
          .
        </P>

        {/* -------------------------------------------------------- */}
        {/* 13. Contact Us                                           */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="contact" number="13" title="Contact Us" />
        <P>
          If you have any questions, concerns, or requests relating to this Privacy Policy or our
          processing of your personal data, please contact us using the details below:
        </P>
        <PolicyTable
          headers={["", ""]}
          rows={[
            ["Data Protection contact", "privacy@iautomotive.co.uk"],
            ["General enquiries", "hello@iautomotive.co.uk"],
            ["Post", "iAutoMotive Ltd, [Registered address], marked: Data Protection"],
            ["ICO (to complain)", "www.ico.org.uk  |  0303 123 1113"],
          ]}
        />

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
            iAutoMotive Ltd &middot; Privacy Policy v1.0 &middot; March 2026
          </p>
        </div>
      </div>
    </main>
  );
}
