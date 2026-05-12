import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// bcrypt hash of "demo" (generated with bcryptjs v3)
const PASSWORD_HASH =
  "$2b$10$H3XXJg/ZxB0eU0zba0Su8eQCkkLk2hC4hpbQjSizkb9DHVRR3Cate";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Returns a date N days ago from now */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** Returns a date N hours ago */
function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

// ─────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    throw new Error(
      "Refusing to seed in production. The seed creates demo users with password 'demo'. " +
      "Set ALLOW_SEED=true only on a dedicated demo/staging database."
    );
  }
  console.log("Seeding iAutoMotive database...\n");

  // Using prisma directly (no transaction) — MongoDB Atlas M0 has a 1min tx limit
  const tx = prisma;
  {
    // ─── 1. USERS ────────────────────────────────────────────
    console.log("  Creating users...");

    const jamesThornton = await tx.user.create({
      data: {
        email: "james.thornton@iautomotive.co.uk",
        phone: "+447700900001",
        passwordHash: PASSWORD_HASH,
        role: "super_admin",
        isActive: true,
        emailVerifiedAt: daysAgo(90),
        lastLoginAt: hoursAgo(2),
        mfaEnabled: true,
      },
    });

    const sarahWhitfield = await tx.user.create({
      data: {
        email: "sarah.whitfield@iautomotive.co.uk",
        phone: "+447700900002",
        passwordHash: PASSWORD_HASH,
        role: "site_manager",
        isActive: true,
        emailVerifiedAt: daysAgo(85),
        lastLoginAt: hoursAgo(1),
      },
    });

    const danielOkoye = await tx.user.create({
      data: {
        email: "daniel.okoye@iautomotive.co.uk",
        phone: "+447700900003",
        passwordHash: PASSWORD_HASH,
        role: "finance",
        isActive: true,
        emailVerifiedAt: daysAgo(80),
        lastLoginAt: hoursAgo(4),
      },
    });

    const emmaRichardson = await tx.user.create({
      data: {
        email: "emma.richardson@iautomotive.co.uk",
        phone: "+447700900004",
        passwordHash: PASSWORD_HASH,
        role: "sales",
        isActive: true,
        emailVerifiedAt: daysAgo(60),
        lastLoginAt: hoursAgo(1),
      },
    });

    const liamPatel = await tx.user.create({
      data: {
        email: "liam.patel@iautomotive.co.uk",
        phone: "+447700900005",
        passwordHash: PASSWORD_HASH,
        role: "recon_tech",
        isActive: true,
        emailVerifiedAt: daysAgo(70),
        lastLoginAt: hoursAgo(3),
      },
    });

    const oliviaCampbell = await tx.user.create({
      data: {
        email: "olivia.campbell@iautomotive.co.uk",
        phone: "+447700900006",
        passwordHash: PASSWORD_HASH,
        role: "compliance",
        isActive: true,
        emailVerifiedAt: daysAgo(88),
        lastLoginAt: hoursAgo(5),
        mfaEnabled: true,
      },
    });

    const hassanMirza = await tx.user.create({
      data: {
        email: "hassan.mirza@iautomotive.co.uk",
        phone: "+447700900007",
        passwordHash: PASSWORD_HASH,
        role: "read_only",
        isActive: true,
        emailVerifiedAt: daysAgo(75),
        lastLoginAt: hoursAgo(6),
      },
    });

    const charlotteEvans = await tx.user.create({
      data: {
        email: "charlotte.evans@iautomotive.co.uk",
        phone: "+447700900008",
        passwordHash: PASSWORD_HASH,
        role: "seller",
        isActive: true,
        emailVerifiedAt: daysAgo(30),
        lastLoginAt: hoursAgo(12),
      },
    });

    const ryanMcgregor = await tx.user.create({
      data: {
        email: "ryan.mcgregor@iautomotive.co.uk",
        phone: "+447700900009",
        passwordHash: PASSWORD_HASH,
        role: "buyer",
        isActive: true,
        emailVerifiedAt: daysAgo(14),
        lastLoginAt: hoursAgo(8),
      },
    });

    const priyaSharma = await tx.user.create({
      data: {
        email: "priya.sharma@iautomotive.co.uk",
        phone: "+447700900010",
        passwordHash: PASSWORD_HASH,
        role: "dealer",
        isActive: true,
        emailVerifiedAt: daysAgo(65),
        lastLoginAt: hoursAgo(3),
      },
    });

    console.log("    10 users created");

    // ─── 2. LOTS (created before profiles so we can reference lot IDs) ───

    console.log("  Creating lots...");

    // Variable name kept as `lotBirmingham` for git history continuity —
    // it just refers to "the first lot". Underlying row is now the
    // iAutoMotive Beaumont House facility in Banbury.
    const lotBirmingham = await tx.lot.create({
      data: {
        name: "Lot 1 — Beaumont House",
        addressLine1: "310 Beaumont House, Beaumont Road",
        city: "Banbury",
        postcode: "OX16 1RH",
        phone: "+441211234567",
        capacityVehicles: 60,
        managerId: sarahWhitfield.id,
        status: "active",
        lat: 52.0612,
        lng: -1.3463,
      },
    });

    const lotManchester = await tx.lot.create({
      data: {
        name: "Lot 2 — Manchester",
        addressLine1: "Trafford Wharf Road",
        city: "Manchester",
        postcode: "M1 2JQ",
        phone: "+441611234567",
        capacityVehicles: 30,
        status: "active",
        lat: 53.4631,
        lng: -2.2913,
      },
    });

    const lotBristol = await tx.lot.create({
      data: {
        name: "Lot 3 — Bristol",
        addressLine1: "Temple Gate Industrial Estate",
        city: "Bristol",
        postcode: "BS1 3DP",
        phone: "+441171234567",
        capacityVehicles: 25,
        status: "active",
        lat: 51.449,
        lng: -2.581,
      },
    });

    console.log("    3 lots created");

    // ─── 3. PROFILES ─────────────────────────────────────────

    console.log("  Creating profiles...");

    // Seller profile for Charlotte
    const sellerProfile = await tx.sellerProfile.create({
      data: {
        userId: charlotteEvans.id,
        firstName: "Charlotte",
        lastName: "Evans",
        addressLine1: "42 Moseley Road",
        city: "Birmingham",
        postcode: "B12 9AH",
        payoutMethod: "faster_payments",
        bankAccountName: "Charlotte Evans",
        bankSortCode: "04-00-04",
        bankAccountNumber: "31926819",
        preferredContact: "email",
        source: "autotrader",
      },
    });

    // Buyer profile for Ryan
    const buyerProfile = await tx.buyerProfile.create({
      data: {
        userId: ryanMcgregor.id,
        firstName: "Ryan",
        lastName: "McGregor",
        addressLine1: "18 Piccadilly Gardens",
        postcode: "M1 1RG",
        identityVerified: true,
        identityVerifiedAt: daysAgo(10),
        preQualStatus: "pre_qualified",
        preQualAmountGbp: 3500000, // 35,000 GBP in pence
        preQualExpiresAt: new Date("2026-07-01"),
        marketingConsent: true,
      },
    });

    // Staff profiles for all staff users
    await tx.staffProfile.create({
      data: {
        userId: jamesThornton.id,
        firstName: "James",
        lastName: "Thornton",
        lotId: lotBirmingham.id,
        hireDate: new Date("2023-01-15"),
        isRemote: false,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: sarahWhitfield.id,
        firstName: "Sarah",
        lastName: "Whitfield",
        lotId: lotBirmingham.id,
        hireDate: new Date("2023-03-01"),
        isRemote: false,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: danielOkoye.id,
        firstName: "Daniel",
        lastName: "Okoye",
        lotId: lotBirmingham.id,
        hireDate: new Date("2023-06-15"),
        isRemote: true,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: emmaRichardson.id,
        firstName: "Emma",
        lastName: "Richardson",
        lotId: lotBirmingham.id,
        hireDate: new Date("2023-09-01"),
        isRemote: false,
        dailyCallTarget: 40,
        weeklyConversionTarget: 5,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: liamPatel.id,
        firstName: "Liam",
        lastName: "Patel",
        lotId: lotBirmingham.id,
        hireDate: new Date("2024-01-08"),
        isRemote: false,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: oliviaCampbell.id,
        firstName: "Olivia",
        lastName: "Campbell",
        lotId: lotManchester.id,
        hireDate: new Date("2023-02-20"),
        isRemote: false,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: hassanMirza.id,
        firstName: "Hassan",
        lastName: "Mirza",
        lotId: lotBristol.id,
        hireDate: new Date("2023-04-10"),
        isRemote: false,
      },
    });

    await tx.staffProfile.create({
      data: {
        userId: priyaSharma.id,
        firstName: "Priya",
        lastName: "Sharma",
        lotId: lotManchester.id,
        hireDate: new Date("2023-07-01"),
        isRemote: true,
      },
    });

    console.log(
      "    1 seller profile, 1 buyer profile, 8 staff profiles created"
    );

    // ─── 4. LOT SLOTS ────────────────────────────────────────

    console.log("  Creating lot slots...");

    const slotLabels = [
      "A-01",
      "A-02",
      "A-03",
      "A-04",
      "A-05",
      "A-06",
      "A-07",
      "A-08",
      "A-09",
      "A-10",
    ];

    let slotCount = 0;
    for (const lotId of [lotBirmingham.id, lotManchester.id, lotBristol.id]) {
      for (const ref of slotLabels) {
        await tx.lotSlot.create({
          data: {
            lotId,
            slotReference: ref,
          },
        });
        slotCount++;
      }
    }

    console.log(`    ${slotCount} lot slots created`);

    // ─── 5. VEHICLES ─────────────────────────────────────────

    console.log("  Creating vehicles...");

    const golfGti = await tx.vehicle.create({
      data: {
        registration: "AB21GTI",
        make: "Volkswagen",
        model: "Golf GTI",
        trim: "Clubsport",
        year: 2021,
        mileageAtIntake: 28500,
        fuelType: "petrol",
        transmission: "automatic",
        bodyType: "hatchback",
        engineSizeCc: 1984,
        doors: 5,
        seats: 5,
        exteriorColour: "Pure White",
        interiorColour: "Black Cloth/Microfibre",
        keysCount: 2,
        motExpiry: new Date("2026-09-14"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 1,
        conditionGrade: "excellent",
        currentStage: "live",
        lotId: lotBirmingham.id,
        listingPriceGbp: 2899500,
        floorPriceGbp: 2650000,
        hasHpiClear: true,
        collectedAt: daysAgo(21),
        listedAt: daysAgo(5),
      },
    });

    const bmw320i = await tx.vehicle.create({
      data: {
        registration: "CD20BMW",
        make: "BMW",
        model: "320i",
        trim: "M Sport",
        year: 2020,
        mileageAtIntake: 42000,
        fuelType: "petrol",
        transmission: "automatic",
        bodyType: "saloon",
        engineSizeCc: 1998,
        doors: 4,
        seats: 5,
        exteriorColour: "Mineral Grey Metallic",
        interiorColour: "Black Dakota Leather",
        keysCount: 2,
        motExpiry: new Date("2026-06-20"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 2,
        conditionGrade: "good",
        currentStage: "live",
        lotId: lotBirmingham.id,
        listingPriceGbp: 2449500,
        floorPriceGbp: 2200000,
        hasHpiClear: true,
        collectedAt: daysAgo(28),
        listedAt: daysAgo(7),
      },
    });

    const audiA3 = await tx.vehicle.create({
      data: {
        registration: "EF22AUD",
        make: "Audi",
        model: "A3",
        trim: "S Line",
        year: 2022,
        mileageAtIntake: 18200,
        fuelType: "petrol",
        transmission: "semi_automatic",
        bodyType: "hatchback",
        engineSizeCc: 1498,
        doors: 5,
        seats: 5,
        exteriorColour: "Navarra Blue Metallic",
        interiorColour: "Black Fine Nappa Leather",
        keysCount: 2,
        motExpiry: new Date("2027-03-10"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 1,
        conditionGrade: "excellent",
        currentStage: "in_mechanical",
        lotId: lotBirmingham.id,
        listingPriceGbp: null,
        floorPriceGbp: null,
        hasHpiClear: true,
        collectedAt: daysAgo(10),
        listedAt: null,
      },
    });

    const mercA200 = await tx.vehicle.create({
      data: {
        registration: "GH21MER",
        make: "Mercedes-Benz",
        model: "A200",
        trim: "AMG Line",
        year: 2021,
        mileageAtIntake: 31500,
        fuelType: "petrol",
        transmission: "automatic",
        bodyType: "hatchback",
        engineSizeCc: 1332,
        doors: 5,
        seats: 5,
        exteriorColour: "Cosmos Black Metallic",
        interiorColour: "ARTICO/DINAMICA Black",
        keysCount: 2,
        motExpiry: new Date("2026-11-05"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 1,
        conditionGrade: "good",
        currentStage: "in_detail",
        lotId: lotBirmingham.id,
        listingPriceGbp: null,
        floorPriceGbp: null,
        hasHpiClear: true,
        collectedAt: daysAgo(14),
        listedAt: null,
      },
    });

    const focusSt = await tx.vehicle.create({
      data: {
        registration: "JK19FOR",
        make: "Ford",
        model: "Focus ST",
        trim: "ST-3",
        year: 2019,
        mileageAtIntake: 55000,
        fuelType: "petrol",
        transmission: "manual",
        bodyType: "hatchback",
        engineSizeCc: 2261,
        doors: 5,
        seats: 5,
        exteriorColour: "Ford Performance Blue",
        interiorColour: "Partial Leather Recaro",
        keysCount: 2,
        motExpiry: new Date("2026-07-30"),
        serviceHistoryType: "partial",
        ownersCountAtIntake: 3,
        conditionGrade: "good",
        currentStage: "collected",
        lotId: lotBirmingham.id,
        listingPriceGbp: null,
        floorPriceGbp: null,
        hasHpiClear: true,
        collectedAt: daysAgo(3),
        listedAt: null,
      },
    });

    const volvoXc40 = await tx.vehicle.create({
      data: {
        registration: "LM22VOL",
        make: "Volvo",
        model: "XC40",
        trim: "R-Design",
        year: 2022,
        mileageAtIntake: 22000,
        fuelType: "mild_hybrid",
        transmission: "automatic",
        bodyType: "suv",
        engineSizeCc: 1969,
        doors: 5,
        seats: 5,
        exteriorColour: "Crystal White Pearl",
        interiorColour: "Charcoal Leather",
        keysCount: 2,
        motExpiry: new Date("2027-01-18"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 1,
        conditionGrade: "excellent",
        currentStage: "sold",
        lotId: lotBirmingham.id,
        listingPriceGbp: 3199500,
        floorPriceGbp: 2900000,
        hasHpiClear: true,
        collectedAt: daysAgo(45),
        listedAt: daysAgo(30),
        soldAt: daysAgo(8),
      },
    });

    const rrEvoque = await tx.vehicle.create({
      data: {
        registration: "NP21RRE",
        make: "Land Rover",
        model: "Range Rover Evoque",
        trim: "R-Dynamic S",
        year: 2021,
        mileageAtIntake: 35000,
        fuelType: "diesel",
        transmission: "automatic",
        bodyType: "suv",
        engineSizeCc: 1999,
        doors: 5,
        seats: 5,
        exteriorColour: "Santorini Black Metallic",
        interiorColour: "Ebony Grained Leather",
        keysCount: 2,
        motExpiry: new Date("2026-08-22"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 2,
        conditionGrade: "good",
        currentStage: "offer_accepted",
        lotId: null,
        listingPriceGbp: null,
        floorPriceGbp: null,
        hasHpiClear: false,
        collectedAt: null,
        listedAt: null,
      },
    });

    const mazda3 = await tx.vehicle.create({
      data: {
        registration: "QR23MAZ",
        make: "Mazda",
        model: "Mazda3",
        trim: "GT Sport Tech",
        year: 2023,
        mileageAtIntake: 9500,
        fuelType: "hybrid",
        transmission: "automatic",
        bodyType: "hatchback",
        engineSizeCc: 1998,
        doors: 5,
        seats: 5,
        exteriorColour: "Soul Red Crystal Metallic",
        interiorColour: "Black Leather",
        keysCount: 2,
        motExpiry: new Date("2028-02-15"),
        serviceHistoryType: "full",
        ownersCountAtIntake: 1,
        conditionGrade: "excellent",
        currentStage: "in_photography",
        lotId: lotBirmingham.id,
        listingPriceGbp: null,
        floorPriceGbp: null,
        hasHpiClear: true,
        collectedAt: daysAgo(18),
        listedAt: null,
      },
    });

    console.log("    8 vehicles created");

    // ─── 6. VEHICLE SPECS ────────────────────────────────────

    console.log("  Creating vehicle specs...");

    await tx.vehicleSpec.create({
      data: {
        vehicleId: golfGti.id,
        acceleration0To60: 5.6,
        topSpeedMph: 155,
        fuelEconomyUrban: 32.1,
        fuelEconomyExtraUrban: 48.7,
        fuelEconomyCombined: 40.4,
        co2EmissionsGkm: 158,
        euroEmissionsStandard: "Euro 6d",
        bhp: 300,
        torqueNm: 400,
        driveType: "FWD",
        kerbWeightKg: 1430,
      },
    });

    await tx.vehicleSpec.create({
      data: {
        vehicleId: bmw320i.id,
        acceleration0To60: 6.8,
        topSpeedMph: 145,
        fuelEconomyUrban: 35.3,
        fuelEconomyExtraUrban: 52.3,
        fuelEconomyCombined: 44.1,
        co2EmissionsGkm: 145,
        euroEmissionsStandard: "Euro 6d",
        bhp: 184,
        torqueNm: 300,
        driveType: "RWD",
        kerbWeightKg: 1520,
      },
    });

    await tx.vehicleSpec.create({
      data: {
        vehicleId: volvoXc40.id,
        acceleration0To60: 6.4,
        topSpeedMph: 130,
        fuelEconomyUrban: 30.4,
        fuelEconomyExtraUrban: 44.1,
        fuelEconomyCombined: 37.7,
        co2EmissionsGkm: 170,
        euroEmissionsStandard: "Euro 6d",
        bhp: 197,
        torqueNm: 300,
        driveType: "AWD",
        kerbWeightKg: 1710,
      },
    });

    console.log("    3 vehicle specs created");

    // ─── 7. VEHICLE FEATURES ─────────────────────────────────

    console.log("  Creating vehicle features...");

    const featureMap: Array<{
      vehicleId: string;
      features: Array<{ category: string; name: string }>;
    }> = [
      {
        vehicleId: golfGti.id,
        features: [
          { category: "technology", name: "Apple CarPlay" },
          { category: "technology", name: "Android Auto" },
          { category: "comfort", name: "Heated Front Seats" },
          { category: "performance", name: "Adaptive Chassis Control (DCC)" },
          { category: "safety", name: "Adaptive Cruise Control" },
        ],
      },
      {
        vehicleId: bmw320i.id,
        features: [
          { category: "technology", name: "Apple CarPlay" },
          { category: "technology", name: "BMW Live Cockpit Professional" },
          { category: "comfort", name: "Heated Front Seats" },
          { category: "exterior", name: "M Sport Body Kit" },
          { category: "safety", name: "Parking Assistant Plus" },
        ],
      },
      {
        vehicleId: audiA3.id,
        features: [
          { category: "technology", name: "MMI Navigation Plus" },
          { category: "technology", name: "Audi Virtual Cockpit" },
          { category: "comfort", name: "Dual Zone Climate Control" },
          { category: "safety", name: "Lane Departure Warning" },
        ],
      },
      {
        vehicleId: mercA200.id,
        features: [
          { category: "technology", name: "MBUX Infotainment" },
          { category: "technology", name: "Wireless Charging" },
          { category: "comfort", name: "Heated Front Seats" },
          { category: "exterior", name: "AMG Body Styling" },
          { category: "safety", name: "Active Brake Assist" },
        ],
      },
      {
        vehicleId: focusSt.id,
        features: [
          { category: "performance", name: "LSD (eLSD)" },
          { category: "comfort", name: "Recaro Sport Seats" },
          { category: "technology", name: "SYNC 3 with Navigation" },
          { category: "safety", name: "Blind Spot Information System" },
        ],
      },
      {
        vehicleId: volvoXc40.id,
        features: [
          { category: "technology", name: "Google Built-In Infotainment" },
          {
            category: "safety",
            name: "Pilot Assist Semi-Autonomous Driving",
          },
          { category: "comfort", name: "Heated Steering Wheel" },
          { category: "comfort", name: "Heated Front Seats" },
          { category: "exterior", name: "Contrast Roof" },
        ],
      },
      {
        vehicleId: rrEvoque.id,
        features: [
          { category: "technology", name: "Pivi Pro Navigation" },
          { category: "technology", name: "Meridian Sound System" },
          { category: "comfort", name: "Heated Front Seats" },
          { category: "safety", name: "360-Degree Camera" },
        ],
      },
      {
        vehicleId: mazda3.id,
        features: [
          { category: "technology", name: "Mazda Connect with Navigation" },
          { category: "technology", name: "Head-Up Display" },
          { category: "comfort", name: "Heated Front Seats" },
          { category: "safety", name: "i-Activsense Safety Suite" },
          { category: "interior", name: "Bose Premium Sound System" },
        ],
      },
    ];

    let featureCount = 0;
    for (const { vehicleId, features } of featureMap) {
      for (const f of features) {
        await tx.vehicleFeature.create({
          data: {
            vehicleId,
            category: f.category as any,
            featureName: f.name,
          },
        });
        featureCount++;
      }
    }

    console.log(`    ${featureCount} vehicle features created`);

    // ─── 8. VEHICLE PRICE HISTORY ────────────────────────────

    console.log("  Creating vehicle price history...");

    // Golf GTI price history
    await tx.vehiclePriceHistory.create({
      data: {
        vehicleId: golfGti.id,
        priceGbp: 2999500,
        previousPriceGbp: null,
        changeReason: "initial_listing",
        changedBy: sarahWhitfield.id,
        changedAt: daysAgo(5),
      },
    });

    await tx.vehiclePriceHistory.create({
      data: {
        vehicleId: golfGti.id,
        priceGbp: 2899500,
        previousPriceGbp: 2999500,
        changeReason: "ai_pricing",
        changedBy: sarahWhitfield.id,
        changedAt: daysAgo(2),
      },
    });

    // BMW 320i price history
    await tx.vehiclePriceHistory.create({
      data: {
        vehicleId: bmw320i.id,
        priceGbp: 2549500,
        previousPriceGbp: null,
        changeReason: "initial_listing",
        changedBy: sarahWhitfield.id,
        changedAt: daysAgo(7),
      },
    });

    await tx.vehiclePriceHistory.create({
      data: {
        vehicleId: bmw320i.id,
        priceGbp: 2449500,
        previousPriceGbp: 2549500,
        changeReason: "market_adjustment",
        changedBy: sarahWhitfield.id,
        changedAt: daysAgo(3),
      },
    });

    // Volvo XC40 price history (sold vehicle)
    await tx.vehiclePriceHistory.create({
      data: {
        vehicleId: volvoXc40.id,
        priceGbp: 3299500,
        previousPriceGbp: null,
        changeReason: "initial_listing",
        changedBy: sarahWhitfield.id,
        changedAt: daysAgo(30),
      },
    });

    await tx.vehiclePriceHistory.create({
      data: {
        vehicleId: volvoXc40.id,
        priceGbp: 3199500,
        previousPriceGbp: 3299500,
        changeReason: "manual_override",
        changedBy: sarahWhitfield.id,
        changedAt: daysAgo(18),
      },
    });

    console.log("    6 price history entries created");

    // ─── 9. VEHICLE STATUS HISTORY ───────────────────────────

    console.log("  Creating vehicle status history...");

    // Golf GTI — full progression to live
    const golfHistory = [
      { from: null, to: "offer_accepted", daysAgo: 25 },
      { from: "offer_accepted", to: "collected", daysAgo: 21 },
      { from: "collected", to: "inspecting", daysAgo: 20 },
      { from: "inspecting", to: "in_mechanical", daysAgo: 18 },
      { from: "in_mechanical", to: "in_body_paint", daysAgo: 15 },
      { from: "in_body_paint", to: "in_detail", daysAgo: 12 },
      { from: "in_detail", to: "in_photography", daysAgo: 9 },
      { from: "in_photography", to: "listing_ready", daysAgo: 7 },
      { from: "listing_ready", to: "live", daysAgo: 5 },
    ];

    // BMW 320i — full progression to live
    const bmwHistory = [
      { from: null, to: "offer_accepted", daysAgo: 35 },
      { from: "offer_accepted", to: "collected", daysAgo: 28 },
      { from: "collected", to: "inspecting", daysAgo: 27 },
      { from: "inspecting", to: "in_mechanical", daysAgo: 24 },
      { from: "in_mechanical", to: "in_body_paint", daysAgo: 20 },
      { from: "in_body_paint", to: "in_detail", daysAgo: 16 },
      { from: "in_detail", to: "in_photography", daysAgo: 12 },
      { from: "in_photography", to: "listing_ready", daysAgo: 9 },
      { from: "listing_ready", to: "live", daysAgo: 7 },
    ];

    // Audi A3 — in_mechanical
    const audiHistory = [
      { from: null, to: "offer_accepted", daysAgo: 15 },
      { from: "offer_accepted", to: "collected", daysAgo: 10 },
      { from: "collected", to: "inspecting", daysAgo: 9 },
      { from: "inspecting", to: "in_mechanical", daysAgo: 7 },
    ];

    // Merc A200 — in_detail
    const mercHistory = [
      { from: null, to: "offer_accepted", daysAgo: 20 },
      { from: "offer_accepted", to: "collected", daysAgo: 14 },
      { from: "collected", to: "inspecting", daysAgo: 13 },
      { from: "inspecting", to: "in_mechanical", daysAgo: 11 },
      { from: "in_mechanical", to: "in_body_paint", daysAgo: 8 },
      { from: "in_body_paint", to: "in_detail", daysAgo: 5 },
    ];

    // Focus ST — collected
    const focusHistory = [
      { from: null, to: "offer_accepted", daysAgo: 5 },
      { from: "offer_accepted", to: "collected", daysAgo: 3 },
    ];

    // Volvo XC40 — sold (full progression)
    const volvoHistory = [
      { from: null, to: "offer_accepted", daysAgo: 50 },
      { from: "offer_accepted", to: "collected", daysAgo: 45 },
      { from: "collected", to: "inspecting", daysAgo: 44 },
      { from: "inspecting", to: "in_mechanical", daysAgo: 42 },
      { from: "in_mechanical", to: "in_body_paint", daysAgo: 39 },
      { from: "in_body_paint", to: "in_detail", daysAgo: 36 },
      { from: "in_detail", to: "in_photography", daysAgo: 34 },
      { from: "in_photography", to: "listing_ready", daysAgo: 32 },
      { from: "listing_ready", to: "live", daysAgo: 30 },
      { from: "live", to: "sale_agreed", daysAgo: 10 },
      { from: "sale_agreed", to: "sold", daysAgo: 8 },
    ];

    // RR Evoque — offer_accepted
    const evoqueHistory = [
      { from: null, to: "offer_accepted", daysAgo: 2 },
    ];

    // Mazda 3 — in_photography
    const mazdaHistory = [
      { from: null, to: "offer_accepted", daysAgo: 22 },
      { from: "offer_accepted", to: "collected", daysAgo: 18 },
      { from: "collected", to: "inspecting", daysAgo: 17 },
      { from: "inspecting", to: "in_mechanical", daysAgo: 15 },
      { from: "in_mechanical", to: "in_body_paint", daysAgo: 12 },
      { from: "in_body_paint", to: "in_detail", daysAgo: 9 },
      { from: "in_detail", to: "in_photography", daysAgo: 6 },
    ];

    const statusHistories: Array<{
      vehicleId: string;
      entries: typeof golfHistory;
    }> = [
      { vehicleId: golfGti.id, entries: golfHistory },
      { vehicleId: bmw320i.id, entries: bmwHistory },
      { vehicleId: audiA3.id, entries: audiHistory },
      { vehicleId: mercA200.id, entries: mercHistory },
      { vehicleId: focusSt.id, entries: focusHistory },
      { vehicleId: volvoXc40.id, entries: volvoHistory },
      { vehicleId: rrEvoque.id, entries: evoqueHistory },
      { vehicleId: mazda3.id, entries: mazdaHistory },
    ];

    let statusCount = 0;
    for (const { vehicleId, entries } of statusHistories) {
      for (const entry of entries) {
        await tx.vehicleStatusHistory.create({
          data: {
            vehicleId,
            fromStage: entry.from,
            toStage: entry.to,
            changedBy: sarahWhitfield.id,
            changedAt: daysAgo(entry.daysAgo),
          },
        });
        statusCount++;
      }
    }

    console.log(`    ${statusCount} status history entries created`);

    // ─── 10. CONSIGNMENTS ────────────────────────────────────

    console.log("  Creating consignments...");

    const consignmentGolfGti = await tx.consignment.create({
      data: {
        vehicleId: golfGti.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 2999500,
        agreedFloorPriceGbp: 2650000,
        status: "listed",
        collectedAt: daysAgo(21),
        listedAt: daysAgo(5),
        maxReconSpendGbp: 150000,
        sellerNotes: "Garaged since new, ceramic coated at purchase.",
      },
    });

    const consignmentBmw320i = await tx.consignment.create({
      data: {
        vehicleId: bmw320i.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 2549500,
        agreedFloorPriceGbp: 2200000,
        status: "listed",
        collectedAt: daysAgo(28),
        listedAt: daysAgo(7),
        maxReconSpendGbp: 200000,
        sellerNotes: "Minor kerb rash on nearside alloy.",
      },
    });

    const consignmentAudiA3 = await tx.consignment.create({
      data: {
        vehicleId: audiA3.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 2699500,
        agreedFloorPriceGbp: 2400000,
        status: "in_recon",
        collectedAt: daysAgo(10),
        maxReconSpendGbp: 120000,
        sellerNotes:
          "Part-exchange for family SUV, just want a fair price.",
      },
    });

    const consignmentMercA200 = await tx.consignment.create({
      data: {
        vehicleId: mercA200.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 2399500,
        agreedFloorPriceGbp: 2100000,
        status: "in_recon",
        collectedAt: daysAgo(14),
        maxReconSpendGbp: 180000,
        sellerNotes:
          "All dealer-serviced, MBSH digital records available.",
      },
    });

    const consignmentFocusSt = await tx.consignment.create({
      data: {
        vehicleId: focusSt.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 1899500,
        agreedFloorPriceGbp: 1650000,
        status: "collected",
        collectedAt: daysAgo(3),
        maxReconSpendGbp: 100000,
        sellerNotes:
          "Mountune exhaust fitted, original exhaust included.",
      },
    });

    const consignmentVolvoXc40 = await tx.consignment.create({
      data: {
        vehicleId: volvoXc40.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 3299500,
        agreedFloorPriceGbp: 2900000,
        status: "sold",
        collectedAt: daysAgo(45),
        listedAt: daysAgo(30),
        soldAt: daysAgo(8),
        maxReconSpendGbp: 100000,
        sellerNotes: "Moving abroad, need quick sale.",
      },
    });

    const consignmentRrEvoque = await tx.consignment.create({
      data: {
        vehicleId: rrEvoque.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 3499500,
        agreedFloorPriceGbp: 3100000,
        status: "pending_collection",
        collectionScheduledAt: new Date("2026-04-10T09:00:00Z"),
        maxReconSpendGbp: 250000,
        sellerNotes:
          "Service due at 36k, included in agreed recon spend.",
      },
    });

    const consignmentMazda3 = await tx.consignment.create({
      data: {
        vehicleId: mazda3.id,
        sellerId: sellerProfile.id,
        lotId: lotBirmingham.id,
        agreedListingPriceGbp: 2599500,
        agreedFloorPriceGbp: 2300000,
        status: "in_recon",
        collectedAt: daysAgo(18),
        maxReconSpendGbp: 80000,
        sellerNotes: "Immaculate condition, no mechanical issues.",
      },
    });

    console.log("    8 consignments created");

    // ─── 11. LEADS ───────────────────────────────────────────

    console.log("  Creating leads...");

    const lead1 = await tx.lead.create({
      data: {
        autotraderListingId: "AT-20260320-001",
        listingUrl:
          "https://www.autotrader.co.uk/car-details/202603200001",
        sellerFirstName: "Michael",
        sellerLastName: "Thompson",
        sellerPhone: "+447700800001",
        sellerEmail: "m.thompson@email.co.uk",
        vehicleReg: "DF21THO",
        vehicleYear: 2021,
        vehicleMake: "Toyota",
        vehicleModel: "GR Yaris",
        vehicleTrim: "Circuit Pack",
        vehicleMileage: 12500,
        vehicleBodyType: "hatchback",
        vehicleFuelType: "petrol",
        vehicleTransmission: "manual",
        askingPriceGbp: 3200000,
        locationPostcode: "B5 7TJ",
        scoutScore: 92,
        scoutTier: "hot",
        status: "new",
        assignedTo: emmaRichardson.id,
        importedAt: daysAgo(1),
      },
    });

    const lead2 = await tx.lead.create({
      data: {
        autotraderListingId: "AT-20260318-002",
        listingUrl:
          "https://www.autotrader.co.uk/car-details/202603180002",
        sellerFirstName: "Sophie",
        sellerLastName: "Williams",
        sellerPhone: "+447700800002",
        sellerEmail: "s.williams@email.co.uk",
        vehicleReg: "EG20SOF",
        vehicleYear: 2020,
        vehicleMake: "BMW",
        vehicleModel: "M140i",
        vehicleTrim: "Shadow Edition",
        vehicleMileage: 38000,
        vehicleBodyType: "hatchback",
        vehicleFuelType: "petrol",
        vehicleTransmission: "automatic",
        askingPriceGbp: 2650000,
        locationPostcode: "M4 1HQ",
        scoutScore: 78,
        scoutTier: "warm",
        status: "contacted",
        assignedTo: emmaRichardson.id,
        importedAt: daysAgo(3),
      },
    });

    const lead3 = await tx.lead.create({
      data: {
        autotraderListingId: "AT-20260315-003",
        listingUrl:
          "https://www.autotrader.co.uk/car-details/202603150003",
        sellerFirstName: "James",
        sellerLastName: "Murray",
        sellerPhone: "+447700800003",
        sellerEmail: "j.murray@email.co.uk",
        vehicleReg: "HJ19JAM",
        vehicleYear: 2019,
        vehicleMake: "Audi",
        vehicleModel: "RS3",
        vehicleTrim: "Sportback",
        vehicleMileage: 45000,
        vehicleBodyType: "hatchback",
        vehicleFuelType: "petrol",
        vehicleTransmission: "automatic",
        askingPriceGbp: 3400000,
        locationPostcode: "BS2 0QR",
        scoutScore: 85,
        scoutTier: "hot",
        status: "negotiating",
        assignedTo: emmaRichardson.id,
        importedAt: daysAgo(7),
      },
    });

    const lead4 = await tx.lead.create({
      data: {
        autotraderListingId: "AT-20260310-004",
        listingUrl:
          "https://www.autotrader.co.uk/car-details/202603100004",
        sellerFirstName: "Rebecca",
        sellerLastName: "Chen",
        sellerPhone: "+447700800004",
        sellerEmail: "r.chen@email.co.uk",
        vehicleReg: "KL22REB",
        vehicleYear: 2022,
        vehicleMake: "Mercedes-Benz",
        vehicleModel: "A35 AMG",
        vehicleTrim: "Premium Plus",
        vehicleMileage: 15000,
        vehicleBodyType: "hatchback",
        vehicleFuelType: "petrol",
        vehicleTransmission: "automatic",
        askingPriceGbp: 3800000,
        locationPostcode: "B16 8PE",
        scoutScore: 88,
        scoutTier: "hot",
        status: "offer_made",
        assignedTo: emmaRichardson.id,
        importedAt: daysAgo(10),
      },
    });

    const lead5 = await tx.lead.create({
      data: {
        autotraderListingId: "AT-20260305-005",
        listingUrl:
          "https://www.autotrader.co.uk/car-details/202603050005",
        sellerFirstName: "David",
        sellerLastName: "O'Brien",
        sellerPhone: "+447700800005",
        sellerEmail: "d.obrien@email.co.uk",
        vehicleReg: "MN20DAV",
        vehicleYear: 2020,
        vehicleMake: "Volkswagen",
        vehicleModel: "Golf R",
        vehicleTrim: "Performance Pack",
        vehicleMileage: 30000,
        vehicleBodyType: "hatchback",
        vehicleFuelType: "petrol",
        vehicleTransmission: "automatic",
        askingPriceGbp: 2900000,
        locationPostcode: "M20 3BN",
        scoutScore: 65,
        scoutTier: "warm",
        status: "converted",
        assignedTo: emmaRichardson.id,
        convertedToVehicleId: focusSt.id,
        convertedToConsignmentId: consignmentFocusSt.id,
        importedAt: daysAgo(14),
      },
    });

    console.log("    5 leads created");

    // ─── 12. LEAD OFFERS ─────────────────────────────────────

    console.log("  Creating lead offers...");

    // Negotiating lead — initial offer from iAutoMotive
    await tx.leadOffer.create({
      data: {
        leadId: lead3.id,
        staffId: emmaRichardson.id,
        offerType: "initial",
        offeredPriceGbp: 2800000,
        status: "countered",
        notes:
          "Strong vehicle, good mileage for age. Starting offer based on CAP data.",
        offeredAt: daysAgo(5),
        respondedAt: daysAgo(4),
      },
    });

    // Counter from seller
    await tx.leadOffer.create({
      data: {
        leadId: lead3.id,
        staffId: null,
        offerType: "counter_seller",
        offeredPriceGbp: 3200000,
        status: "countered",
        notes:
          "Seller wants closer to asking price, citing low mileage.",
        offeredAt: daysAgo(4),
        respondedAt: daysAgo(3),
      },
    });

    // Offer made lead — final offer pending response
    await tx.leadOffer.create({
      data: {
        leadId: lead4.id,
        staffId: emmaRichardson.id,
        offerType: "initial",
        offeredPriceGbp: 3300000,
        status: "countered",
        offeredAt: daysAgo(8),
        respondedAt: daysAgo(7),
      },
    });

    await tx.leadOffer.create({
      data: {
        leadId: lead4.id,
        staffId: emmaRichardson.id,
        offerType: "counter_iauto",
        offeredPriceGbp: 3500000,
        status: "pending",
        notes:
          "Increased offer to close. Vehicle in high demand with low mileage.",
        offeredAt: daysAgo(6),
      },
    });

    console.log("    4 lead offers created");

    // ─── 13. DEALS ───────────────────────────────────────────

    console.log("  Creating deals...");

    // Sold deal for Volvo XC40
    const soldDeal = await tx.deal.create({
      data: {
        vehicleId: volvoXc40.id,
        consignmentId: consignmentVolvoXc40.id,
        buyerId: buyerProfile.id,
        salePriceGbp: 3199500,
        status: "closed",
        reservationFeeGbp: 49900,
        reservationPaidAt: daysAgo(12),
        identityVerifiedAt: daysAgo(11),
        documentsSentAt: daysAgo(11),
        documentsSignedAt: daysAgo(10),
        fundedAt: daysAgo(9),
        deliveredAt: daysAgo(8),
        returnWindowExpiresAt: daysAgo(1),
        closedAt: daysAgo(1),
        assignedTo: emmaRichardson.id,
      },
    });

    // Reserved deal for Golf GTI
    const reservedDeal = await tx.deal.create({
      data: {
        vehicleId: golfGti.id,
        consignmentId: consignmentGolfGti.id,
        buyerId: buyerProfile.id,
        salePriceGbp: 2899500,
        status: "reserved",
        reservationFeeGbp: 49900,
        reservationPaidAt: hoursAgo(6),
        assignedTo: emmaRichardson.id,
      },
    });

    console.log("    2 deals created");

    // ─── 14. ESCROW CONDITIONS ───────────────────────────────

    console.log("  Creating escrow conditions...");

    const conditionTypes = [
      "v5c_notified",
      "return_window_expired",
      "no_open_disputes",
      "finance_confirmed",
      "compliance_passed",
    ] as const;

    // Sold deal — all conditions met
    for (const ct of conditionTypes) {
      await tx.escrowCondition.create({
        data: {
          dealId: soldDeal.id,
          conditionType: ct,
          isMet: true,
          metAt: daysAgo(2),
          metBy: danielOkoye.id,
          notes: "Verified and confirmed by finance team.",
        },
      });
    }

    // Reserved deal — only some conditions met
    const reservedConditions: Array<{
      type: (typeof conditionTypes)[number];
      met: boolean;
    }> = [
      { type: "v5c_notified", met: false },
      { type: "return_window_expired", met: false },
      { type: "no_open_disputes", met: true },
      { type: "finance_confirmed", met: false },
      { type: "compliance_passed", met: true },
    ];

    for (const rc of reservedConditions) {
      await tx.escrowCondition.create({
        data: {
          dealId: reservedDeal.id,
          conditionType: rc.type,
          isMet: rc.met,
          metAt: rc.met ? hoursAgo(4) : null,
          metBy: rc.met ? danielOkoye.id : null,
        },
      });
    }

    console.log("    10 escrow conditions created");

    // ─── 15. PAYOUTS ─────────────────────────────────────────

    console.log("  Creating payouts...");

    await tx.payout.create({
      data: {
        consignmentId: consignmentVolvoXc40.id,
        dealId: soldDeal.id,
        sellerId: sellerProfile.id,
        grossSalePriceGbp: 3199500,
        reconCostsGbp: 85000,
        transportCostsGbp: 15000,
        financePayoffGbp: 0,
        otherDeductionsGbp: 0,
        netPayoutGbp: 3099500,
        payoutMethod: "faster_payments",
        bankAccountName: "Charlotte Evans",
        paymentReference: "PAYOUT-XC40-001",
        status: "confirmed",
        approvedBy: danielOkoye.id,
        approvedAt: daysAgo(2),
        sentAt: daysAgo(1),
        confirmedAt: hoursAgo(18),
      },
    });

    console.log("    1 payout created");

    // ─── 16. CONVERSATIONS ───────────────────────────────────

    console.log("  Creating conversations...");

    // Seller-lot-manager conversation about the Golf GTI consignment
    const sellerLotManagerConvo = await tx.conversation.create({
      data: {
        conversationType: "seller_lot_manager",
        entityType: "consignment",
        entityId: consignmentGolfGti.id,
        subject: "VW Golf GTI — Consignment Update",
        participants: {
          create: [
            {
              userId: charlotteEvans.id,
              lastReadAt: hoursAgo(6),
            },
            {
              userId: sarahWhitfield.id,
              lastReadAt: hoursAgo(2),
            },
          ],
        },
      },
    });

    // Buyer-sales conversation about the reserved deal
    const buyerSalesConvo = await tx.conversation.create({
      data: {
        conversationType: "buyer_sales",
        entityType: "deal",
        entityId: reservedDeal.id,
        subject: "VW Golf GTI — Reservation Query",
        participants: {
          create: [
            {
              userId: ryanMcgregor.id,
              lastReadAt: hoursAgo(3),
            },
            {
              userId: emmaRichardson.id,
              lastReadAt: hoursAgo(1),
            },
          ],
        },
      },
    });

    console.log("    2 conversations created");

    // ─── 17. MESSAGES ────────────────────────────────────────

    console.log("  Creating messages...");

    // Seller-lot-manager messages
    await tx.message.create({
      data: {
        conversationId: sellerLotManagerConvo.id,
        senderId: charlotteEvans.id,
        body: "Hi Sarah, just wanted to check how the Golf GTI is getting on? Has the photography been completed yet?",
        messageType: "text",
        createdAt: daysAgo(3),
      },
    });

    await tx.message.create({
      data: {
        conversationId: sellerLotManagerConvo.id,
        senderId: sarahWhitfield.id,
        body: "Hi Charlotte! Yes, the car went through photography last week and is now live on the site. Had a few enquiries already. The initial listing price is set at the top end as we discussed, but our AI pricing tool may suggest a small adjustment based on market movement.",
        messageType: "text",
        createdAt: daysAgo(2),
      },
    });

    await tx.message.create({
      data: {
        conversationId: sellerLotManagerConvo.id,
        senderId: charlotteEvans.id,
        body: "That's great to hear! I saw the price was adjusted slightly on the portal. Looks like the AI tool did its thing. Happy with that. Any viewings booked?",
        messageType: "text",
        createdAt: daysAgo(1),
      },
    });

    await tx.message.create({
      data: {
        conversationId: sellerLotManagerConvo.id,
        senderId: sarahWhitfield.id,
        body: "Yes! We actually have a reservation placed on it as of this morning. The buyer is going through our identity verification now. I'll keep you posted on progress.",
        messageType: "text",
        createdAt: hoursAgo(8),
      },
    });

    // Buyer-sales messages
    await tx.message.create({
      data: {
        conversationId: buyerSalesConvo.id,
        senderId: ryanMcgregor.id,
        body: "Hi, I've just reserved the Golf GTI. Could you let me know what the next steps are and roughly how long the whole process takes?",
        messageType: "text",
        createdAt: hoursAgo(5),
      },
    });

    await tx.message.create({
      data: {
        conversationId: buyerSalesConvo.id,
        senderId: emmaRichardson.id,
        body: "Hi Ryan, thanks for your reservation! The next step is identity verification — you should have received a link via email. Once that's done, we'll send across the purchase documents for e-signature. The whole process typically takes 2-3 business days.",
        messageType: "text",
        createdAt: hoursAgo(4),
      },
    });

    await tx.message.create({
      data: {
        conversationId: buyerSalesConvo.id,
        senderId: ryanMcgregor.id,
        body: "Perfect, I've completed the ID check. Will you send the docs today?",
        messageType: "text",
        createdAt: hoursAgo(3),
      },
    });

    await tx.message.create({
      data: {
        conversationId: buyerSalesConvo.id,
        senderId: emmaRichardson.id,
        body: "Brilliant, I can see that's come through. I'll prepare the purchase agreement now and you should receive it within the hour. Let me know if you have any questions about the finance options too.",
        messageType: "text",
        createdAt: hoursAgo(2),
      },
    });

    console.log("    8 messages created");

    // ─── 18. HPI CHECKS ─────────────────────────────────────

    console.log("  Creating HPI checks...");

    // HPI checks for vehicles that are collected or further along
    const hpiVehicles = [
      { vehicle: golfGti, keepers: 1, plates: 0, checkedDaysAgo: 20 },
      { vehicle: bmw320i, keepers: 2, plates: 1, checkedDaysAgo: 27 },
      { vehicle: audiA3, keepers: 1, plates: 0, checkedDaysAgo: 10 },
      { vehicle: mercA200, keepers: 1, plates: 0, checkedDaysAgo: 10 },
      { vehicle: focusSt, keepers: 3, plates: 0, checkedDaysAgo: 10 },
      { vehicle: volvoXc40, keepers: 1, plates: 0, checkedDaysAgo: 44 },
      { vehicle: mazda3, keepers: 1, plates: 0, checkedDaysAgo: 10 },
    ];

    for (const hpi of hpiVehicles) {
      await tx.hpiCheck.create({
        data: {
          vehicleId: hpi.vehicle.id,
          checkReference: `HPI-${hpi.vehicle.id.substring(0, 8).toUpperCase()}`,
          isClear: true,
          hasOutstandingFinance: false,
          isStolen: false,
          isWrittenOff: false,
          plateChangesCount: hpi.plates,
          previousKeepersCount: hpi.keepers,
          performedBy: sarahWhitfield.id,
          checkedAt: daysAgo(hpi.checkedDaysAgo),
        },
      });
    }

    console.log(`    ${hpiVehicles.length} HPI checks created`);

    // ─── 19. RECON STAGES ────────────────────────────────────

    console.log("  Creating recon stages...");

    const reconStageNames = [
      "intake",
      "inspection",
      "mechanical",
      "body_paint",
      "detail_valet",
      "photography",
      "listing_ready",
    ] as const;

    // Helper to create 7 recon stages for a consignment
    async function createReconStages(
      vehicleId: string,
      consignmentId: string,
      completedUpTo: number // index in reconStageNames that is in_progress (-1 = all complete)
    ) {
      for (let i = 0; i < reconStageNames.length; i++) {
        let status: "complete" | "in_progress" | "pending";
        let startedAt: Date | null = null;
        let completedAt: Date | null = null;

        if (completedUpTo === -1) {
          // All stages complete
          status = "complete";
          startedAt = daysAgo(44 - i * 3);
          completedAt = daysAgo(43 - i * 3);
        } else if (i < completedUpTo) {
          status = "complete";
          startedAt = daysAgo(20 - i * 2);
          completedAt = daysAgo(19 - i * 2);
        } else if (i === completedUpTo) {
          status = "in_progress";
          startedAt = daysAgo(2);
        } else {
          status = "pending";
        }

        await tx.reconStage.create({
          data: {
            vehicleId,
            consignmentId,
            stageName: reconStageNames[i],
            status,
            estimatedCostGbp: [0, 0, 45000, 35000, 25000, 15000, 0][i],
            actualCostGbp:
              status === "complete"
                ? [0, 0, 42000, 32000, 22000, 12000, 0][i]
                : null,
            startedAt,
            completedAt,
            createdBy: liamPatel.id,
            updatedBy: liamPatel.id,
          },
        });
      }
    }

    // Vehicles past collection get recon stages
    // Golf GTI — all complete (live)
    await createReconStages(golfGti.id, consignmentGolfGti.id, -1);
    // BMW 320i — all complete (live)
    await createReconStages(bmw320i.id, consignmentBmw320i.id, -1);
    // Audi A3 — in_mechanical (index 2)
    await createReconStages(audiA3.id, consignmentAudiA3.id, 2);
    // Merc A200 — in_detail (detail_valet is index 4)
    await createReconStages(mercA200.id, consignmentMercA200.id, 4);
    // Volvo XC40 — all complete (sold)
    await createReconStages(volvoXc40.id, consignmentVolvoXc40.id, -1);
    // Mazda 3 — in_photography (index 5)
    await createReconStages(mazda3.id, consignmentMazda3.id, 5);

    console.log("    42 recon stages created (7 per vehicle, 6 vehicles)");
  }

  console.log("\nSeed completed successfully.");
}

// ─────────────────────────────────────────────────────────────
// Execute
// ─────────────────────────────────────────────────────────────

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
