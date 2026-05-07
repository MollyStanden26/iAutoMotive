import { Hero } from "@/components/marketing/hero";
import { ProofStrip } from "@/components/marketing/proof-strip";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ValuesSection } from "@/components/marketing/values-section";
import { FeaturedListings } from "@/components/marketing/featured-listings";
import { CtaBand } from "@/components/marketing/cta-band";
import CustomerReviewsSell from "@/components/sell/customer-reviews-sell";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <HowItWorks />
      <ValuesSection />
      <FeaturedListings />
      <CustomerReviewsSell />
      <CtaBand />
    </>
  );
}
