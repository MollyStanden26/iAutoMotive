"use client";

import { usePathname } from "next/navigation";

/**
 * Site-wide floating WhatsApp CTA. Pinned to the bottom-right of every
 * public + portal page so a buyer or seller can ping the team without
 * losing their place. Hidden on the admin/support shells — internal
 * staff don't need a direct line back to themselves.
 *
 * The number + pre-filled message are also used in the /sell page's
 * contact banner. If the line ever changes, update both spots together;
 * a `lib/contact.ts` module would consolidate but isn't worth the
 * extra file for two callsites yet.
 */

const WHATSAPP_NUMBER = "447418605138"; // E.164 minus the "+" — wa.me format
const PRESET_MESSAGE = encodeURIComponent("Hi iAutoMotive — I have a question.");
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${PRESET_MESSAGE}`;

/** Routes where the bubble would just clutter the chrome — internal
 *  workspaces have their own messaging surfaces. */
const HIDDEN_PREFIXES = ["/admin", "/support"];

export function WhatsAppBubble() {
  const pathname = usePathname();
  if (pathname && HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message iAutoMotive on WhatsApp"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        // WhatsApp brand green. Verified contrast vs. the white glyph
        // is well above WCAG AA at this size.
        background: "#25D366",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.10)",
        textDecoration: "none",
        // 90 sits above page content + sticky headers (~50–60) but stays
        // below modals (≥ 100) — the sign-in modal uses 70 for example,
        // so the bubble doesn't fight a Carvana-style takeover.
        zIndex: 90,
        transition: "transform 120ms ease, box-shadow 120ms ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.06)";
        e.currentTarget.style.boxShadow =
          "0 10px 22px rgba(0, 0, 0, 0.22), 0 3px 8px rgba(0, 0, 0, 0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 6px 16px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.10)";
      }}
    >
      {/* Official WhatsApp glyph — same path as the /sell banner CTA */}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.821 11.821 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.41c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    </a>
  );
}
