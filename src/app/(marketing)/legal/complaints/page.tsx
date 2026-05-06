import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaints Policy | iAutoMotive",
  description:
    "How to make a complaint about iAutoMotive's services and how we handle complaints.",
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

function StepCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "24px 0",
        borderBottom: "1px solid #EAECEF",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "#E0FAF5",
          color: "#008C7C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 700,
          flexShrink: 0,
        }}
        className="font-heading"
      >
        {step}
      </div>
      <div style={{ flex: 1 }}>
        <h3
          className="font-heading"
          style={{ fontSize: "17px", fontWeight: 600, color: "#0F1724", margin: "0 0 8px" }}
        >
          {title}
        </h3>
        <div
          className="font-body"
          style={{ fontSize: "15px", lineHeight: 1.75, color: "#4A556B" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table of Contents                                                 */
/* ------------------------------------------------------------------ */

const tocItems = [
  { id: "introduction", number: "1", title: "Introduction" },
  { id: "how-to-complain", number: "2", title: "How to Make a Complaint" },
  { id: "what-to-include", number: "3", title: "What to Include in Your Complaint" },
  { id: "our-process", number: "4", title: "Our Complaints Process" },
  { id: "timescales", number: "5", title: "Timescales" },
  { id: "escalation", number: "6", title: "If You\u2019re Not Satisfied" },
  { id: "adr", number: "7", title: "Alternative Dispute Resolution" },
  { id: "fca", number: "8", title: "FCA-Regulated Activities" },
  { id: "vulnerable", number: "9", title: "Vulnerable Customers" },
  { id: "learning", number: "10", title: "How We Learn from Complaints" },
  { id: "contact", number: "11", title: "Contact Us" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ComplaintsPolicyPage() {
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
          <h1
            className="font-heading text-white"
            style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Complaints Policy
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
              href="mailto:complaints@iautomotive.co.uk"
              style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}
            >
              complaints@iautomotive.co.uk
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-6 py-12">
        {/* Commitment callout */}
        <div
          style={{
            backgroundColor: "#E0FAF5",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "40px",
          }}
        >
          <p
            className="font-body"
            style={{ fontSize: "14px", lineHeight: 1.7, color: "#00332E", margin: 0 }}
          >
            <strong>Our commitment:</strong> We take every complaint seriously. If something has gone
            wrong, we want to know about it so we can put it right and improve our service. We aim to
            resolve all complaints fairly, promptly, and transparently.
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
        {/* 1. Introduction                                          */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="introduction" number="1" title="Introduction" />
        <P>
          iAutoMotive Ltd (&ldquo;iAutoMotive&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) is committed to providing an excellent service to every customer. We
          recognise, however, that things can occasionally go wrong. When they do, we want to hear
          about it.
        </P>
        <P>
          This Complaints Policy explains how you can make a complaint about any aspect of our
          vehicle consignment service, how we will handle your complaint, and what you can do if
          you&rsquo;re not satisfied with our response.
        </P>
        <P>
          This policy applies to all customers of iAutoMotive, including sellers (vehicle
          consignors), buyers, and any other individual who has interacted with our platform or
          services.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 2. How to Make a Complaint                               */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="how-to-complain" number="2" title="How to Make a Complaint" />
        <P>You can make a complaint through any of the following channels:</P>

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
              icon: "\u2709\uFE0F",
              label: "Email",
              value: "complaints@iautomotive.co.uk",
              href: "mailto:complaints@iautomotive.co.uk",
            },
            {
              icon: "\uD83D\uDCDE",
              label: "Telephone",
              value: "[Phone number \u2014 TBC]",
              href: undefined,
            },
            {
              icon: "\u270F\uFE0F",
              label: "Post",
              value: "iAutoMotive Ltd, [Registered address], marked: Complaints",
              href: undefined,
            },
            {
              icon: "\uD83D\uDCAC",
              label: "In person",
              value: "At any iAutoMotive lot during operating hours",
              href: undefined,
            },
          ].map((ch) => (
            <div
              key={ch.label}
              style={{
                backgroundColor: "#F7F8F9",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <p
                className="font-heading"
                style={{ fontSize: "14px", fontWeight: 600, color: "#0F1724", margin: "0 0 6px" }}
              >
                {ch.label}
              </p>
              {ch.href ? (
                <a
                  href={ch.href}
                  className="font-body"
                  style={{ fontSize: "14px", color: "#008C7C", textDecoration: "none" }}
                >
                  {ch.value}
                </a>
              ) : (
                <p
                  className="font-body"
                  style={{ fontSize: "14px", color: "#4A556B", margin: 0, lineHeight: 1.5 }}
                >
                  {ch.value}
                </p>
              )}
            </div>
          ))}
        </div>

        <P>
          We will accept complaints made verbally (by telephone or in person) as well as in writing.
          If you make a verbal complaint, we will record the details and send you a written summary
          within 2 working days so you can confirm we&rsquo;ve understood the issue correctly.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 3. What to Include                                       */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="what-to-include" number="3" title="What to Include in Your Complaint" />
        <P>To help us investigate and resolve your complaint as quickly as possible, please include:</P>
        <BulletList
          items={[
            "Your full name and contact details",
            "Your iAutoMotive account email address or consignment reference number (if applicable)",
            "The vehicle registration number (if your complaint relates to a specific vehicle)",
            "A clear description of what went wrong and when it happened",
            "Any relevant documentation, photographs, or correspondence",
            "What outcome you are seeking \u2014 for example, an apology, an explanation, a specific action, or financial redress",
          ]}
        />
        <P>
          If you are unable to provide all of this information, please don&rsquo;t let that stop you
          from contacting us. We will work with you to gather the information we need.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 4. Our Complaints Process                                */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="our-process" number="4" title="Our Complaints Process" />
        <P>
          When we receive your complaint, we will follow the process below:
        </P>

        <div style={{ margin: "8px 0 24px" }}>
          <StepCard step="1" title="Acknowledgement">
            <p style={{ margin: 0 }}>
              We will acknowledge your complaint within <strong>2 working days</strong> of receiving
              it. Our acknowledgement will confirm who is handling your complaint, how to contact
              them, and the next steps.
            </p>
          </StepCard>
          <StepCard step="2" title="Investigation">
            <p style={{ margin: 0 }}>
              Your complaint will be assigned to a member of our team who was not directly involved
              in the issue. They will investigate the circumstances thoroughly, reviewing all
              relevant records, communications, and evidence.
            </p>
          </StepCard>
          <StepCard step="3" title="Resolution">
            <p style={{ margin: 0 }}>
              We will contact you with our findings and proposed resolution. If the complaint is
              straightforward, we may be able to resolve it at the acknowledgement stage. For more
              complex issues, we will keep you informed of progress throughout our investigation.
            </p>
          </StepCard>
          <StepCard step="4" title="Final Response">
            <p style={{ margin: 0 }}>
              We will issue a final written response setting out our findings, whether we uphold your
              complaint (in full or in part), the reasons for our decision, and any remedy we are
              offering. We will also explain your right to escalate the matter if you remain
              dissatisfied.
            </p>
          </StepCard>
        </div>

        {/* -------------------------------------------------------- */}
        {/* 5. Timescales                                            */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="timescales" number="5" title="Timescales" />
        <P>We are committed to handling complaints promptly:</P>

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
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    backgroundColor: "#F7F8F9",
                    color: "#0F1724",
                    fontWeight: 600,
                    borderBottom: "2px solid #EAECEF",
                  }}
                >
                  Stage
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    backgroundColor: "#F7F8F9",
                    color: "#0F1724",
                    fontWeight: 600,
                    borderBottom: "2px solid #EAECEF",
                  }}
                >
                  Timescale
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Acknowledgement", "Within 2 working days of receipt"],
                ["Progress update (if not yet resolved)", "Every 10 working days"],
                ["Simple complaints", "Resolved within 5 working days where possible"],
                ["Complex complaints", "Resolved within 4 weeks where possible"],
                ["Final response (maximum)", "Within 8 weeks of receipt"],
              ].map(([stage, time]) => (
                <tr key={stage}>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#0F1724",
                      fontWeight: 500,
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                    }}
                  >
                    {stage}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4A556B",
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                    }}
                  >
                    {time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <P>
          If we are unable to provide a final response within 8 weeks, we will write to you
          explaining the reasons for the delay and give you an expected date for our response. We
          will also inform you of your right to refer the complaint to an Alternative Dispute
          Resolution provider at that point.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 6. If You're Not Satisfied                               */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="escalation" number="6" title="If You&rsquo;re Not Satisfied" />
        <P>
          If you are not satisfied with our final response, or if 8 weeks have passed since you
          first made your complaint and you have not received a final response, you have the right to
          escalate your complaint.
        </P>
        <P>
          You may refer your complaint to an Alternative Dispute Resolution (ADR) provider (see
          Section 7 below). You may also seek independent legal advice or take court action if you
          wish, though we would always encourage you to use the ADR process first as it is free and
          less formal.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 7. Alternative Dispute Resolution                        */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="adr" number="7" title="Alternative Dispute Resolution" />
        <P>
          Under the Alternative Dispute Resolution for Consumer Disputes (Competent Authorities and
          Information) Regulations 2015, we are required to inform you about ADR. iAutoMotive is
          committed to participating in ADR where appropriate.
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
            The Motor Ombudsman
          </p>
          <p className="font-body" style={{ fontSize: "14px", color: "#4A556B", margin: "0 0 4px", lineHeight: 1.6 }}>
            The Motor Ombudsman is the automotive dispute resolution body. If your complaint relates
            to the sale, condition, or servicing of a vehicle, you may be able to refer it to:
          </p>
          <BulletList
            items={[
              <>
                <strong>Website:</strong>{" "}
                <a
                  href="https://www.themotorombudsman.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#008C7C" }}
                >
                  www.themotorombudsman.org
                </a>
              </>,
              <>
                <strong>Telephone:</strong> 0345 241 3008
              </>,
              <>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@themotorombudsman.org" style={{ color: "#008C7C" }}>
                  info@themotorombudsman.org
                </a>
              </>,
            ]}
          />
        </div>

        <P>
          If your complaint relates to finance introductions or other FCA-regulated activities, you
          may be able to refer it to the Financial Ombudsman Service (see Section 8 below).
        </P>
        <P>
          You may also use the EU/UK Online Dispute Resolution platform at{" "}
          <a
            href="https://www.legislation.gov.uk/uksi/2015/1392/contents/made"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#008C7C" }}
          >
            ec.europa.eu/odr
          </a>{" "}
          to submit a complaint online, although this platform may redirect you to the relevant ADR
          body.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 8. FCA-Regulated Activities                              */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="fca" number="8" title="FCA-Regulated Activities" />
        <P>
          Where iAutoMotive carries out activities that are regulated by the Financial Conduct
          Authority (FCA) &mdash; such as introducing buyers to FCA-authorised lenders for vehicle
          finance &mdash; complaints about those activities will be handled in accordance with the
          FCA&rsquo;s Dispute Resolution rules (DISP).
        </P>
        <P>
          If you are not satisfied with our response to a complaint about an FCA-regulated activity,
          you have the right to refer your complaint to the Financial Ombudsman Service (FOS):
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
                <a href="mailto:complaint.info@financial-ombudsman.org.uk" style={{ color: "#008C7C" }}>
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
          The FOS will not normally consider a complaint if you refer it after this deadline, unless
          there are exceptional circumstances.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 9. Vulnerable Customers                                  */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="vulnerable" number="9" title="Vulnerable Customers" />
        <P>
          We recognise that some customers may be in vulnerable circumstances that make it harder for
          them to make a complaint or engage with our complaints process. If you consider yourself to
          be in a vulnerable situation &mdash; for example, due to health conditions, life events,
          financial difficulty, or limited capability &mdash; please let us know and we will make
          reasonable adjustments to our process to support you.
        </P>
        <P>Adjustments may include:</P>
        <BulletList
          items={[
            "Allowing a trusted friend, family member, or adviser to act on your behalf",
            "Providing information in alternative formats (large print, email instead of post)",
            "Allowing additional time to respond or provide information",
            "Assigning a dedicated point of contact for the duration of your complaint",
            "Communicating by your preferred method (telephone, email, or post)",
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* 10. How We Learn from Complaints                         */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="learning" number="10" title="How We Learn from Complaints" />
        <P>
          Every complaint is an opportunity to improve. We record and analyse all complaints to
          identify recurring issues, systemic problems, and areas where our service can be improved.
        </P>
        <P>Our senior management team reviews complaint data on a monthly basis, including:</P>
        <BulletList
          items={[
            "Total number of complaints received and resolved",
            "Average resolution time",
            "Complaint categories and root causes",
            "Outcomes and remedies offered",
            "Trends and patterns over time",
          ]}
        />
        <P>
          Where we identify a systemic issue, we will take prompt corrective action and may contact
          affected customers proactively, even if they have not complained.
        </P>

        {/* -------------------------------------------------------- */}
        {/* 11. Contact Us                                           */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="contact" number="11" title="Contact Us" />
        <P>
          If you have any questions about this Complaints Policy or need help making a complaint,
          please contact us:
        </P>

        <div className="overflow-x-auto" style={{ margin: "16px 0 24px" }}>
          <table
            className="w-full font-body"
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              borderCollapse: "collapse",
            }}
          >
            <tbody>
              {[
                ["Complaints email", "complaints@iautomotive.co.uk"],
                ["General enquiries", "hello@iautomotive.co.uk"],
                ["Telephone", "[Phone number \u2014 to be confirmed]"],
                ["Post", "iAutoMotive Ltd, [Registered address], marked: Complaints"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#0F1724",
                      fontWeight: 500,
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                      width: "200px",
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#4A556B",
                      borderBottom: "1px solid #EAECEF",
                      verticalAlign: "top",
                    }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Consumer rights callout */}
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
            Your statutory rights
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: 0 }}>
            This complaints policy does not affect your statutory rights under the Consumer Rights
            Act 2015, the Consumer Contracts Regulations 2013, or any other applicable consumer
            protection legislation. If you are unsure about your rights, contact{" "}
            <strong>Citizens Advice</strong> on <strong>0808 223 1133</strong> or visit{" "}
            <a
              href="https://www.citizensadvice.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#B87209", textDecoration: "underline" }}
            >
              www.citizensadvice.org.uk
            </a>
            .
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
            iAutoMotive Ltd &middot; Complaints Policy v1.0 &middot; March 2026
          </p>
        </div>
      </div>
    </main>
  );
}
