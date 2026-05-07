import { Hero } from "@/components/marketing/hero";
import { ProofStrip } from "@/components/marketing/proof-strip";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ValuesSection } from "@/components/marketing/values-section";
import { FeaturedListings } from "@/components/marketing/featured-listings";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { CtaBand } from "@/components/marketing/cta-band";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <HowItWorks />
      <ValuesSection />
      <FeaturedListings />
      <ComparisonTable />
      <CtaBand />
    </>
  );
}
