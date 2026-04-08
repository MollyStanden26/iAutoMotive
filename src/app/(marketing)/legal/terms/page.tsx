import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | iAutoSale",
  description:
    "iAutoSale Vehicle Consignment Agreement — the terms and conditions governing consignment sales on our platform.",
};

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                           */
/* ------------------------------------------------------------------ */

function SectionHeading({ id, letter, title }: { id: string; letter: string; title: string }) {
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
      {letter}. {title}
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

function Clause({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
      <span
        className="font-body"
        style={{
          fontSize: "15px",
          lineHeight: 1.75,
          color: "#008C7C",
          fontWeight: 600,
          flexShrink: 0,
          minWidth: "28px",
        }}
      >
        ({number})
      </span>
      <p
        className="font-body"
        style={{ fontSize: "15px", lineHeight: 1.75, color: "#4A556B", margin: 0 }}
      >
        {children}
      </p>
    </div>
  );
}

function DefTable({ rows }: { rows: [string, string][] }) {
  return (
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
                width: "200px",
              }}
            >
              Term
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
              Definition
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([term, def]) => (
            <tr key={term}>
              <td
                style={{
                  padding: "12px 16px",
                  color: "#0F1724",
                  fontWeight: 600,
                  borderBottom: "1px solid #EAECEF",
                  verticalAlign: "top",
                }}
              >
                {term}
              </td>
              <td
                style={{
                  padding: "12px 16px",
                  color: "#4A556B",
                  borderBottom: "1px solid #EAECEF",
                  verticalAlign: "top",
                }}
              >
                {def}
              </td>
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
/*  Table of Contents                                                 */
/* ------------------------------------------------------------------ */

const tocItems = [
  { id: "defined-terms", letter: "A", title: "Defined Terms" },
  { id: "summary", letter: "B", title: "Summary of Agreement" },
  { id: "payment", letter: "C", title: "Payment Administration" },
  { id: "liability", letter: "D", title: "iAutoSale Liability and Insurance" },
  { id: "condition", letter: "E", title: "Vehicle Condition Declaration" },
  { id: "handover", letter: "F", title: "Handover Appointment" },
  { id: "collection", letter: "G", title: "Collection and Transportation" },
  { id: "preparation", letter: "H", title: "Preparation Process and Conditions" },
  { id: "terms-conditions", letter: "I", title: "Agreement Terms and Conditions" },
  { id: "warranties", letter: "J", title: "Seller Warranties and Representations" },
  { id: "general", letter: "K", title: "General Terms" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function TermsPage() {
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
            Vehicle Consignment Agreement
          </p>
          <h1
            className="font-heading text-white"
            style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Terms &amp; Conditions
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
            iAutoSale Ltd &middot;{" "}
            <a href="https://iautosale.co.uk" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}>
              iautosale.co.uk
            </a>{" "}
            &middot;{" "}
            <a href="mailto:hello@iautosale.co.uk" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}>
              hello@iautosale.co.uk
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
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: "0 0 12px" }}>
            <strong>Important &mdash; read before signing</strong>
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: "0 0 8px" }}>
            This agreement is between you (the Seller) and iAutoSale Ltd. By signing, you
            authorise iAutoSale to take physical possession of your vehicle, list it for sale at
            full retail market price, negotiate with buyers, and remit the net proceeds to you after
            deducting any pre-authorised costs.
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: "0 0 8px" }}>
            You should read this agreement in full before signing. If you have any questions,
            contact us at{" "}
            <a href="mailto:hello@iautosale.co.uk" style={{ color: "#B87209", textDecoration: "underline" }}>
              hello@iautosale.co.uk
            </a>{" "}
            before you sign.
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#7A4A00", margin: 0 }}>
            You have the right to receive a copy of this signed agreement. We will send you a copy
            by email immediately after signing.
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
              listStyleType: "upper-alpha",
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
        {/* A. DEFINED TERMS                                         */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="defined-terms" letter="A" title="Defined Terms" />
        <P>The following terms apply throughout this agreement:</P>
        <DefTable
          rows={[
            [
              "\u201CiAutoSale\u201D",
              "iAutoSale Ltd, a company registered in England and Wales, operator of the vehicle consignment platform at iautosale.co.uk.",
            ],
            [
              "\u201CSeller\u201D / \u201CVendor\u201D",
              "The individual or entity named in the Seller Details section of this agreement who is the lawful owner of the Vehicle and who has entered into this agreement with iAutoSale.",
            ],
            [
              "\u201CVehicle\u201D",
              "The motor vehicle described in the Vehicle Details section of this agreement, including all keys, documentation, accessories, and any items recorded at Handover.",
            ],
            [
              "\u201CClient\u201D / \u201CBuyer\u201D",
              "The person or entity who purchases the Vehicle from iAutoSale acting as agent for the Seller. The identity of prospective buyers will remain confidential until a sale is agreed.",
            ],
            [
              "\u201CListing Price\u201D",
              "The price at which iAutoSale will advertise the Vehicle for sale, as agreed between iAutoSale and the Seller and stated in the Financial Summary section of this agreement.",
            ],
            [
              "\u201CSale Price\u201D",
              "The final price at which the Vehicle is sold to a Client, as recorded on the sales invoice.",
            ],
            [
              "\u201CPlatform Fee\u201D",
              "No commission fee is charged by iAutoSale for its consignment services under this agreement. iAutoSale may separately earn commissions from warranty or finance products sold to the Buyer \u2014 these do not reduce the Seller\u2019s return.",
            ],
            [
              "\u201CMinimum Return\u201D",
              "The guaranteed net amount to be paid to the Seller on completion of a sale, as stated in the Financial Summary. This figure is the Sale Price minus any agreed Costs. iAutoSale will not pay the Seller less than this amount from a completed sale.",
            ],
            [
              "\u201CPrice Positioning\u201D",
              "The variable percentage of the live AutoTrader retail market valuation at which the Vehicle is advertised under this agreement, used to ensure competitive pricing.",
            ],
            [
              "\u201CEntire Period\u201D",
              "The period commencing on the date both parties sign this agreement and ending on completion of a sale, written withdrawal by the Seller in accordance with this agreement, or termination pursuant to its terms.",
            ],
            [
              "\u201CHandover\u201D",
              "The physical transfer of the Vehicle, all keys, and all documents from the Seller to iAutoSale, which marks the official commencement of the Minimum Period. Handover may take place at the Seller\u2019s address (collection service) or at an iAutoSale lot.",
            ],
            [
              "\u201CMinimum Period\u201D",
              "The period of 30 clear days commencing on the date of Handover during which the Seller agrees to give iAutoSale the exclusive right to market and sell the Vehicle under this agreement.",
            ],
            [
              "\u201CTermination Fee\u201D",
              "A fee of \u00a3399 payable by the Seller to iAutoSale if the Seller gives Notice to withdraw from this agreement within the Minimum Period for any reason other than rejection of an unexpected PDI quote.",
            ],
            [
              "\u201CNotice\u201D",
              "A written notice of no less than 7 clear days provided by the Seller to iAutoSale, expressing the Seller\u2019s intention to withdraw from, terminate, or conclude this agreement. Notice must be sent to hello@iautosale.co.uk.",
            ],
            [
              "\u201CWorks\u201D",
              "Any mechanical, electrical, technical, software, cosmetic or bodywork repairs, replacements, preparation, or restoration work carried out on the Vehicle by iAutoSale or its approved suppliers.",
            ],
            [
              "\u201CCost\u201D",
              "Any sum of money spent or incurred by iAutoSale on behalf of the Seller in connection with the Vehicle under this agreement \u2014 including pre-agreed Works, transportation, preparation costs, and Finance Balance settlement \u2014 that is to be reimbursed to iAutoSale from the sale proceeds or by means of Payment. Cost expressly excludes any expense arising from damage caused by iAutoSale\u2019s own negligence, breach of duty, or acts or omissions whilst the Vehicle is in iAutoSale\u2019s care.",
            ],
            [
              "\u201CPayment\u201D",
              "A transaction in GBP (\u00a3) made by Faster Payments bank transfer, BACS, CHAPS, or debit/credit card.",
            ],
            [
              "\u201CPDI\u201D",
              "A pre-delivery inspection and road test performed by iAutoSale on the Vehicle after Handover to assess its mechanical, electrical, and cosmetic condition.",
            ],
            [
              "\u201CHPI Check\u201D",
              "A vehicle history check conducted by iAutoSale at or shortly after Handover, confirming outstanding finance, theft, write-off status, and registration history. A clear HPI result is required before the Vehicle can be listed for sale.",
            ],
            [
              "\u201CFinance Balance\u201D",
              "Any outstanding loan, finance agreement, or secured charge registered against the Vehicle at the time of Handover.",
            ],
            [
              "\u201CConsumer Rights Act\u201D",
              "The Consumer Rights Act 2015 as amended, which governs the rights of buyers of vehicles sold in the course of a business.",
            ],
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* B. SUMMARY OF AGREEMENT                                  */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="summary" letter="B" title="Summary of Agreement" />
        <P>
          This is a consignment sale agreement between iAutoSale and the Seller. iAutoSale acts
          as the Seller&rsquo;s agent to advertise, market, negotiate, and conclude the sale of the
          Vehicle to a Buyer at the best available retail market price, in accordance with the terms
          of this agreement. iAutoSale does not purchase the Vehicle from the Seller. Title to the
          Vehicle remains with the Seller until such time as a sale to a Buyer is completed and
          funds are received by iAutoSale.
        </P>
        <P>
          iAutoSale will manage the entire sale process on the Seller&rsquo;s behalf, including:
        </P>
        <BulletList
          items={[
            "Vehicle collection (where requested)",
            "HPI check",
            "Pre-delivery inspection",
            "Reconditioning (subject to pre-authorisation)",
            "Professional photography",
            "Listing on AutoTrader and other approved platforms",
            "All buyer enquiries and negotiations",
            "Legal transfer of title and V5C notification to the DVLA",
          ]}
        />
        <P>
          The Seller will receive the Minimum Return as stated in the Financial Summary section,
          paid within 48 hours of the closing conditions being satisfied. The Seller&rsquo;s funds
          are held in a separate client account at all times and are never commingled with
          iAutoSale&rsquo;s operating funds.
        </P>

        {/* -------------------------------------------------------- */}
        {/* C. PAYMENT ADMINISTRATION                                */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="payment" letter="C" title="Payment Administration" />
        <Clause number="1">
          iAutoSale will advertise the Vehicle at the Listing Price stated in the Financial
          Summary section of this agreement, at a Price Positioning determined by iAutoSale based
          on live market data. iAutoSale will work to achieve the highest possible Sale Price.
          iAutoSale does not charge a commission fee on the Sale Price. iAutoSale
          is entitled to earn commissions from warranty and finance products sold to the
          Buyer &mdash; these do not reduce the Seller&rsquo;s
          Minimum Return.
        </Clause>
        <Clause number="2">
          The Seller is entitled to receive Payment of no less than the Minimum Return stated in the
          Financial Summary, after deduction of any pre-agreed Costs, paid to
          the bank account details provided in the Financial Summary section. iAutoSale will not
          adjust or reduce the Minimum Return without the Seller&rsquo;s prior written consent.
        </Clause>
        <Clause number="3">
          Payment of the Minimum Return to the Seller will be made within 48 hours of all of the
          following conditions being satisfied: (i) legal title to the Vehicle has passed to the
          Buyer; (ii) the 7-day buyer return period has expired without a return being initiated;
          (iii) no disputes are open in relation to the transaction; (iv) where the Buyer has
          financed their purchase, the lender has confirmed funding; and (v) all compliance checks
          have been completed. iAutoSale will notify the Seller by SMS and email at each stage of
          this process and when Payment is released.
        </Clause>
        <Clause number="4">
          All funds received from the Buyer are held in a designated client account, separate from
          iAutoSale&rsquo;s operating accounts, pending satisfaction of the conditions in clause
          (3) above. The Seller&rsquo;s funds are protected at all times and may not be used for any
          other purpose by iAutoSale.
        </Clause>
        <Clause number="5">
          Where the Vehicle has an outstanding Finance Balance, iAutoSale will obtain a settlement
          figure from the relevant lender and settle the Finance Balance directly from the sale
          proceeds prior to remitting the balance to the Seller. Where the Finance Balance exceeds
          the expected net proceeds (negative equity), the Seller must pay the shortfall to
          iAutoSale before the Vehicle is listed for sale. This shortfall will be held in the
          client account and applied to the settlement on completion.
        </Clause>
        <Clause number="6">
          Should Payment fall due on a weekend or UK public holiday, Payment will be made on the
          next working day.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* D. LIABILITY AND INSURANCE                               */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="liability" letter="D" title="iAutoSale Liability and Insurance" />
        <P>
          This section is included to provide the Seller with full transparency and legal assurance
          regarding iAutoSale&rsquo;s duty of care over the Vehicle during the Entire Period.
        </P>
        <Clause number="1">
          iAutoSale accepts full responsibility for any damage caused to the Vehicle whilst the
          Vehicle is in iAutoSale&rsquo;s care, custody or control that was not recorded at the
          time of Handover. Any such damage will be repaired by iAutoSale at iAutoSale&rsquo;s
          own expense and shall not constitute a Cost chargeable to the Seller.
        </Clause>
        <Clause number="2">
          The Vehicle will be covered under iAutoSale&rsquo;s motor trade insurance policy at all
          times whilst in iAutoSale&rsquo;s possession, including during transportation, test
          drives conducted by approved staff or buyers, and storage at iAutoSale&rsquo;s premises.
          iAutoSale will provide evidence of this insurance to the Seller upon reasonable request.
        </Clause>
        <Clause number="3">
          iAutoSale will exercise the same standard of care over the Vehicle as a reasonably
          competent motor trader would exercise over their own stock. iAutoSale shall not use the
          Vehicle for any purpose other than those reasonably required to carry out its obligations
          under this agreement.
        </Clause>
        <Clause number="4">
          In the event that iAutoSale identifies damage to the Vehicle not recorded at Handover,
          iAutoSale will notify the Seller in writing within 48 hours of discovery, together with a
          description of the damage and iAutoSale&rsquo;s proposed remedy.
        </Clause>
        <Clause number="5">
          Nothing in this agreement limits or excludes iAutoSale&rsquo;s liability for negligence,
          breach of duty, or wilful misconduct causing loss or damage to the Vehicle, or any other
          liability that cannot lawfully be excluded or limited under the laws of England and Wales.
        </Clause>
        <Clause number="6">
          In the event of theft, fire, or total loss of the Vehicle whilst in iAutoSale&rsquo;s
          possession, iAutoSale will notify the Seller immediately and will process an insurance
          claim on the Seller&rsquo;s behalf. The Seller will be entitled to the insured value of
          the Vehicle less any agreed Costs.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* E. VEHICLE CONDITION DECLARATION                         */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="condition" letter="E" title="Vehicle Condition Declaration" />
        <Clause number="1">
          iAutoSale and the Seller agree to record all known damage, faults, and condition issues
          relating to the Vehicle at the time of Handover. It is the Seller&rsquo;s responsibility
          to disclose all known cosmetic, mechanical, electrical, technical, or historical defects,
          including any previous accident damage, to iAutoSale at or before the time of signing
          this agreement.
        </Clause>
        <Clause number="2">
          The condition notes recorded at Handover represent the Vehicle&rsquo;s condition as
          understood by both parties at the time of signing. Any undisclosed defects or damage
          identified after Handover that are shown to have pre-existed the Handover date may be
          deducted as a Cost from the Seller&rsquo;s proceeds, provided that iAutoSale has
          obtained the Seller&rsquo;s written approval for the cost of remedying such defect before
          any Works are carried out.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* F. HANDOVER APPOINTMENT                                  */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="handover" letter="F" title="Handover Appointment" />
        <Clause number="1">
          The Seller is to deliver or make available the Vehicle to iAutoSale at the agreed date,
          time, and location, which will constitute the commencement of the Minimum Period of this
          agreement.
        </Clause>
        <Clause number="2">
          The Seller is responsible for clearing the Vehicle of all personal effects before Handover.
          iAutoSale is not liable for any personal effects left in the Vehicle after the Handover
          date.
        </Clause>

        <SubHeading>Documents and items required at Handover</SubHeading>
        <P>
          The following documents and items are to be provided to iAutoSale by the Seller at or
          before Handover:
        </P>
        <BulletList
          items={[
            "V5C logbook",
            "All keys (number to be confirmed at Handover)",
            "Outstanding Finance Balance details and lender information (if applicable)",
            "Vehicle manuals",
            "Locking wheel nut key",
            "Service history (full or partial)",
            "MOT certificate",
            "Spare key fob (if applicable)",
            "Parcel shelf / tonneau cover (if applicable)",
          ]}
        />

        {/* -------------------------------------------------------- */}
        {/* G. COLLECTION AND TRANSPORTATION                         */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="collection" letter="G" title="Collection and Transportation" />
        <Clause number="1">
          The Seller may request that iAutoSale collects the Vehicle from the Seller&rsquo;s
          address. Vehicle collection is subject to availability and must be arranged in advance.
          iAutoSale will confirm the collection date and time in writing.
        </Clause>
        <Clause number="2">
          Collection charges are calculated at &pound;0.50 + VAT per mile between the nearest
          iAutoSale lot and the Seller&rsquo;s postcode, with a minimum collection charge of
          &pound;75 for collections of 10 miles or more from the nearest lot. Collections within 10
          miles of a lot carry no minimum charge. Collection charges constitute a Cost under this
          agreement.
        </Clause>
        <Clause number="3">
          The Seller agrees to ensure the Vehicle has sufficient fuel or charge for transportation to
          iAutoSale&rsquo;s premises. If iAutoSale is required to purchase additional fuel or
          arrange charging to return the Vehicle to the lot, the cost of doing so will constitute a
          Cost under this agreement.
        </Clause>
        <Clause number="4">
          iAutoSale will conduct all collection driving under its motor trade insurance policy. The
          Seller&rsquo;s own insurance is not required during transportation by iAutoSale.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* H. PREPARATION PROCESS                                   */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="preparation" letter="H" title="Preparation Process and Conditions" />
        <Clause number="1">
          Following Handover, iAutoSale will conduct an HPI check on the Vehicle. A clear HPI
          result is required before the Vehicle can be listed for sale. If the HPI check reveals
          outstanding finance, a theft marker, a write-off marker, or any other material issue,
          iAutoSale will notify the Seller in writing within 48 hours. iAutoSale cannot list the
          Vehicle until any such issues are resolved.
        </Clause>
        <Clause number="2">
          Following the HPI check, the Vehicle will undergo a PDI to determine its mechanical,
          electrical, technical, and cosmetic condition. Any faults or defects identified during the
          PDI that iAutoSale considers should be remedied before listing will be reported to the
          Seller in writing with a corresponding quote (including parts, labour, and VAT where
          applicable) within 5 working days of Handover.
        </Clause>
        <Clause number="3">
          iAutoSale will not carry out any Works on the Vehicle without the Seller&rsquo;s prior
          written approval. The Seller&rsquo;s pre-authorised maximum spend for Works is stated in
          the Financial Summary section of this agreement. Any Works exceeding this amount require
          separate written approval from the Seller before being carried out.
        </Clause>
        <Clause number="4">
          Should the Seller receive a PDI quote from iAutoSale and wish to withdraw from this
          agreement solely because they do not wish to proceed with the unexpected costs contained in
          that quote, the Seller must provide written refusal within 5 working days of receiving the
          quote. In such circumstances this agreement will cease and the Seller will not be liable
          for a Termination Fee. The Seller must, however, settle any Costs already incurred (for
          example, collection charges or HPI check fees) by means of Payment to iAutoSale.
        </Clause>
        <Clause number="5">
          iAutoSale will arrange professional photography and produce an AI-assisted vehicle
          description for the listing. The Seller may request to review the listing content before it
          goes live by notifying iAutoSale in writing at the time of signing this agreement or
          within 24 hours of Handover.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* I. AGREEMENT TERMS AND CONDITIONS                        */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="terms-conditions" letter="I" title="Agreement Terms and Conditions" />
        <Clause number="1">
          Should the Seller wish to withdraw from this agreement within the Minimum Period for any
          reason (other than rejection of an unexpected PDI quote as described in Section H(4)), the
          Seller is liable for the Termination Fee of &pound;399 as well as settlement of all
          outstanding Costs by means of Payment to iAutoSale. The Vehicle and all its keys and
          documentation will not be released to the Seller until all outstanding amounts have been
          settled.
        </Clause>
        <Clause number="2">
          iAutoSale will list the Vehicle in accordance with its pricing strategy. The agreed
          Listing Price and the Minimum Return to the Seller are as stated in the Financial Summary
          section. iAutoSale may, in its reasonable commercial judgement and with the aim of
          achieving a sale, reduce the Listing Price during the Entire Period. The following
          automatic price reduction schedule applies unless the Seller has provided written
          instructions to the contrary: a reduction of 3% at Day 30 on lot, 6% at Day 45, and 10%
          at Day 60. iAutoSale will notify the Seller in writing before each scheduled price
          reduction. The Minimum Return to the Seller will not fall below the figure stated in the
          Financial Summary without the Seller&rsquo;s express written consent.
        </Clause>
        <Clause number="3">
          From the date of signing this agreement, iAutoSale has full exclusivity over the
          advertisement and sale of the Vehicle. The Seller agrees that no other marketing,
          advertisement, or sales activity will take place in relation to the Vehicle &mdash; whether
          by the Seller personally or by any third party &mdash; during the Entire Period. All
          existing advertisements for the Vehicle on any platform must be removed or deactivated with
          immediate effect upon signing.
        </Clause>
        <Clause number="4">
          Should the Vehicle be sold to a buyer not introduced by iAutoSale during the Entire
          Period, the Seller shall be liable to pay iAutoSale all outstanding Costs before iAutoSale
          will release the Vehicle, its keys, and its documentation.
        </Clause>
        <Clause number="5">
          Should the Vehicle carry or fall into negative equity in relation to any outstanding
          Finance Balance during the Entire Period, iAutoSale will not be able to fund any Works as
          a Cost until the negative equity position is resolved. Any outstanding Costs must be
          settled by the Seller by means of Payment on the date of sale or at point of Notice.
        </Clause>
        <Clause number="6">
          Should the Vehicle be sold and the Buyer subsequently enforce their right to return the
          Vehicle under the Consumer Rights Act 2015 (including the 30-day short-term right to
          reject), this agreement will continue in full force and effect during any return or
          resolution period. iAutoSale will manage the return process on the Seller&rsquo;s behalf,
          including arranging re-collection and relisting the Vehicle if the return is accepted. The
          Seller&rsquo;s Minimum Return will be recalculated accordingly if the Vehicle is relisted
          and sold at a different price.
        </Clause>
        <Clause number="7">
          iAutoSale reserves the right to conduct appropriate identity and fraud verification
          checks on the Seller at any point during the Entire Period in accordance with our
          obligations under the Money Laundering Regulations 2017. iAutoSale may suspend or
          terminate this agreement if satisfactory verification cannot be obtained, in which case no
          Termination Fee will be charged to the Seller.
        </Clause>
        <Clause number="8">
          iAutoSale will notify the DVLA of the change of vehicle keeper within 5 working days of
          a completed sale, as required by law. The Seller authorises iAutoSale to complete the
          relevant sections of the V5C logbook on the Seller&rsquo;s behalf for this purpose.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* J. SELLER WARRANTIES                                     */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="warranties" letter="J" title="Seller Warranties and Representations" />
        <P>
          By signing this agreement, the Seller warrants and represents to iAutoSale that:
        </P>
        <BulletList
          items={[
            "The Seller is the sole legal owner of the Vehicle and has full authority to enter into this agreement and to authorise iAutoSale to sell the Vehicle on their behalf.",
            "The Vehicle is free from any outstanding finance, charge, or encumbrance, save as expressly disclosed in the Handover documentation. Where outstanding finance exists, the Seller warrants that the settlement figure provided is accurate and current.",
            "The Vehicle has not been reported stolen, written off, or subject to any insurance claim that has not been fully disclosed to iAutoSale.",
            "The mileage shown on the Vehicle\u2019s odometer at the time of Handover is accurate and has not been altered or tampered with.",
            "All information provided by the Seller in connection with this agreement is accurate and complete to the best of the Seller\u2019s knowledge.",
            "The Seller has disclosed all known defects, faults, accident damage, or condition issues relating to the Vehicle.",
          ]}
        />
        <P>
          iAutoSale relies on these warranties in entering into this agreement. Any breach of these
          warranties may result in iAutoSale terminating this agreement without liability and
          seeking to recover any losses suffered from the Seller.
        </P>

        {/* -------------------------------------------------------- */}
        {/* K. GENERAL TERMS                                         */}
        {/* -------------------------------------------------------- */}
        <SectionHeading id="general" letter="K" title="General Terms" />
        <Clause number="1">
          This agreement constitutes the entire agreement between the parties relating to its subject
          matter and supersedes all previous agreements, representations, warranties, or
          understandings between the parties, whether written or oral.
        </Clause>
        <Clause number="2">
          No variation to this agreement shall be effective unless made in writing and signed by both
          parties or their authorised representatives. Verbal variations or amendments are not
          binding.
        </Clause>
        <Clause number="3">
          All parties agree to keep the contents of this agreement, including its financial terms,
          confidential, except as required by law, a court of competent jurisdiction, or a
          governmental or regulatory authority.
        </Clause>
        <Clause number="4">
          iAutoSale processes personal data in connection with this agreement in accordance with
          its{" "}
          <a href="/legal/privacy" style={{ color: "#008C7C", textDecoration: "underline" }}>
            Privacy Policy
          </a>
          , available at iautosale.co.uk/legal/privacy, and in accordance with the UK General Data
          Protection Regulation and the Data Protection Act 2018.
        </Clause>
        <Clause number="5">
          This agreement shall be governed by and construed in accordance with the laws of England
          and Wales. Each party irrevocably agrees that the courts of England and Wales shall have
          exclusive jurisdiction to settle any dispute or claim arising out of or in connection with
          this agreement.
        </Clause>
        <Clause number="6">
          If any provision of this agreement is found by a court to be invalid, unenforceable, or
          illegal, the remaining provisions shall continue in full force and effect.
        </Clause>
        <Clause number="7">
          No failure or delay by either party in exercising any right or remedy under this agreement
          shall constitute a waiver of that right or remedy.
        </Clause>
        <Clause number="8">
          <strong>Complaints:</strong> If the Seller has a complaint about iAutoSale&rsquo;s
          service, they should contact iAutoSale in writing at{" "}
          <a href="mailto:complaints@iautosale.co.uk" style={{ color: "#008C7C" }}>
            complaints@iautosale.co.uk
          </a>
          . iAutoSale will acknowledge all complaints within 5 working days and aim to resolve them
          within 8 weeks. If the Seller is not satisfied with iAutoSale&rsquo;s handling of a
          complaint, they may be entitled to refer the matter to an Alternative Dispute Resolution
          (ADR) provider. Details of applicable ADR schemes will be provided in iAutoSale&rsquo;s
          response to any complaint.
        </Clause>

        {/* -------------------------------------------------------- */}
        {/* Consumer Rights notice                                   */}
        {/* -------------------------------------------------------- */}
        <div
          style={{
            backgroundColor: "#E0FAF5",
            borderRadius: "12px",
            padding: "20px 24px",
            margin: "48px 0 24px",
          }}
        >
          <p
            className="font-heading"
            style={{ fontSize: "16px", fontWeight: 700, color: "#00332E", margin: "0 0 10px" }}
          >
            Consumer Rights Act 2015 &mdash; your rights as a consumer
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#006058", margin: "0 0 8px" }}>
            If you are an individual (not a business) entering into this agreement, you may have
            statutory rights under the Consumer Rights Act 2015 and the Consumer Contracts
            Regulations 2013 (including a 14-day right to cancel distance contracts).
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#006058", margin: "0 0 8px" }}>
            Nothing in this agreement is intended to limit or exclude any rights you have under
            applicable consumer protection legislation.
          </p>
          <p className="font-body" style={{ fontSize: "14px", lineHeight: 1.7, color: "#006058", margin: 0 }}>
            If you are unsure about your rights, you can seek independent legal advice or contact
            Citizens Advice on{" "}
            <strong>0808 223 1133</strong>.
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
            iAutoSale Ltd &middot; Vehicle Consignment Agreement v1.0 &middot; March 2026
          </p>
        </div>
      </div>
    </main>
  );
}
