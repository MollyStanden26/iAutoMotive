export type ReconStage =
  | "arrived"
  | "inspecting"
  | "mechanical"
  | "body-paint"
  | "detail-valet"
  | "photography"
  | "listing-ready"
  | "front-line-live";

export type ConditionGrade = "excellent" | "good" | "fair" | "below-average";

export interface Vehicle {
  vin: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  mileage: number;
  fuelType: string;
  gearbox: string;
  bodyStyle: string;
  conditionGrade: ConditionGrade;
  reconStage: ReconStage;
  listingPrice: number;
  floorPrice: number;
  daysOnLot: number;
  siteId: string;
  hpiClear: boolean;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListing extends Vehicle {
  slug: string;
  description: string;
  features: string[];
  priceHistory: PriceChange[];
  marketPosition: "below" | "at" | "above";
  viewCount: number;
}

export interface PriceChange {
  date: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
}
