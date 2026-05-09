/**
 * /sell page contact banner. Was the "Value Tracker" promo block; now a
 * direct WhatsApp contact CTA so sellers can talk to the team without
 * filling a form. The component file is kept at value-tracker-banner.tsx
 * for callsite stability — only the import is shared. The default-exported
 * component name and on-page label both reflect the new purpose.
 */

/** Sales line — kept inline so the Markdown variant of the page can also
 *  reference it without prop drilling. Update both this and the WhatsApp
 *  href together if the number ever changes. */
const PHONE_DISPLAY = "+44 7418 605138";
const WHATSAPP_NUMBER = "447418605138"; // E.164 minus the "+" — wa.me format

const PRESET_MESSAGE = encodeURIComponent(
  "Hi iAutoMotive team — I'd like to chat about selling my car."
);
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${PRESET_MESSAGE}`;

export default function ValueTrackerBanner() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8" style={{ margin: "40px auto" }}>
      <div
        className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between"
        style={{
          backgroundColor: "#F7F8F9",
          borderRadius: "16px",
          padding: "40px",
        }}
      >
        {/* Left: WhatsApp glyph in brand teal — keeps the visual weight the
            old illustration had on wide screens without needing an asset */}
        <div className="hidden shrink-0 lg:block" style={{ width: 120, height: 120 }}>
          <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="#008C7C" />
            {/* Simplified WhatsApp speech-bubble + handset glyph */}
            <path
              d="M60 28c-17.7 0-32 14.3-32 32 0 5.6 1.4 10.9 4 15.5L28 92l16.9-4.4c4.5 2.4 9.6 3.7 15 3.7h.1c17.6 0 32-14.3 32-32S77.7 28 60 28zm17.9 45.9c-.7 2-3.7 3.7-5.1 3.9-1.4.2-2.7.6-9-1.9s-10.4-9-10.7-9.4c-.3-.4-2.5-3.4-2.5-6.4 0-3.1 1.6-4.6 2.2-5.2.6-.6 1.3-.8 1.7-.8s.9 0 1.3.1c.4 0 1 0 1.5 1.1.5 1.2 1.7 4.2 1.9 4.5.1.3.2.7 0 1.1-.2.4-.3.6-.6 1-.3.4-.6.8-.9 1.1-.3.3-.6.6-.3 1.2.3.6 1.3 2.2 2.8 3.6 1.9 1.7 3.5 2.2 4.1 2.5.6.3.9.2 1.2-.1.3-.4 1.4-1.6 1.7-2.1.3-.6.7-.5 1.1-.3.5.2 3 1.4 3.5 1.7.5.2.8.4.9.6.2.2.2 1.3-.5 3.3z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Center: copy */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-3 flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="14" cy="14" r="14" fill="#008C7C" />
              <path d="M8 14.5L12 18.5L20 10.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#0F1724",
                fontFamily: "var(--ac-font-heading)",
              }}
            >
              Talk to a real person
            </span>
          </div>

          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#0F1724",
              fontFamily: "var(--ac-font-heading)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Have a question? Message us on WhatsApp.
          </h2>

          <p
            className="mt-2"
            style={{
              fontSize: "14px",
              color: "#4A556B",
              margin: "8px 0 0",
              lineHeight: 1.5,
            }}
          >
            Our team replies within an hour during UK business hours.
            No bots — every message is read by a person.
          </p>

          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#008C7C",
              textDecoration: "none",
            }}
          >
            {PHONE_DISPLAY}
          </a>
        </div>

        {/* Right: WhatsApp CTA */}
        <div className="shrink-0">
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              borderRadius: "99999px",
              height: "48px",
              padding: "0 24px",
              backgroundColor: "#25D366", // WhatsApp brand green — readable atop the panel
              fontSize: "14px",
              fontWeight: 700,
              color: "#FFFFFF",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.821 11.821 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.41c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
