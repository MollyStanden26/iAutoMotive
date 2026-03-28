import { Hero } from "@/components/marketing/hero";
import { ProofStrip } from "@/components/marketing/proof-strip";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ValuesSection } from "@/components/marketing/values-section";
import { ExploreCards } from "@/components/marketing/explore-cards";
import { FeaturedListings } from "@/components/marketing/featured-listings";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { CtaBand } from "@/components/marketing/cta-band";

// Homepage — follows Brand Identity v2.0 Section 7.1 mandatory order:
// 1. Nav (in layout) → 2. Hero → 3. Proof strip → 4. How it works →
// 5. Values/proof → 6. Featured listings → 7. CTA band → 8. Footer (in layout)
// + Explore cards and Comparison table added between sections
export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <HowItWorks />
      <ValuesSection />
      <ExploreCards />
      <FeaturedListings />
      <ComparisonTable />
      <CtaBand />
    </>
  );
}
