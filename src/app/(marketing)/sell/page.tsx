import SellHero from "@/components/sell/sell-hero";
import ValueTrackerBanner from "@/components/sell/value-tracker-banner";
import HowItWorksSell from "@/components/sell/how-it-works-sell";
import CustomerReviewsSell from "@/components/sell/customer-reviews-sell";
import SellFaq from "@/components/sell/sell-faq";
import SellCtaBanner from "@/components/sell/sell-cta-banner";

export default function SellPage() {
  return (
    <>
      <SellHero />
      <ValueTrackerBanner />
      <HowItWorksSell />
      <CustomerReviewsSell />
      <SellFaq />
      <SellCtaBanner />
    </>
  );
}
