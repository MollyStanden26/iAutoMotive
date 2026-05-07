"use client";

const values = [
  {
    src: "/images/More-money-guaranteed%20.png",
    alt: "More money, guaranteed — sellers earn £1,800 more than instant-cash buyers",
  },
  {
    src: "/images/Completely-transparent%20.png",
    alt: "Completely transparent — no commission fee, no hidden charges",
  },
  {
    src: "/images/Zero-effort-for-sellers%20.png",
    alt: "Zero effort for sellers — we collect, recondition, list, and sell",
  },
];

export function ValuesSection() {
  return (
    <section className="w-full" style={{ backgroundColor: "#E0FAF5", padding: "48px 0" }}>
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8">
        <h2
          className="font-heading"
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#006058",
          }}
        >
          Why sellers choose iAutoMotive
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {values.map((item) => (
            <div key={item.src} className="overflow-hidden rounded-[20px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                className="block w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
