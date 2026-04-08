import { User, Seller, Buyer } from "@/types/user";

interface MockUser extends User {
  password: string;
}

interface MockSeller extends Seller {
  password: string;
}

interface MockBuyer extends Buyer {
  password: string;
}

export const MOCK_USERS: (MockUser | MockSeller | MockBuyer)[] = [
  {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    email: "james.thornton@iautosale.co.uk",
    name: "James Thornton",
    phone: "+44 7700 900100",
    role: "super-admin",
    emailVerified: true,
    createdAt: "2025-01-15T09:00:00.000Z",
    password: "demo",
  },
  {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    email: "sarah.whitfield@iautosale.co.uk",
    name: "Sarah Whitfield",
    phone: "+44 7700 900101",
    role: "site-manager",
    emailVerified: true,
    createdAt: "2025-02-01T10:30:00.000Z",
    password: "demo",
  },
  {
    id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    email: "daniel.okoye@iautosale.co.uk",
    name: "Daniel Okoye",
    phone: "+44 7700 900102",
    role: "finance",
    emailVerified: true,
    createdAt: "2025-02-10T08:15:00.000Z",
    password: "demo",
  },
  {
    id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80",
    email: "emma.richardson@iautosale.co.uk",
    name: "Emma Richardson",
    phone: "+44 7700 900103",
    role: "sales",
    emailVerified: true,
    createdAt: "2025-03-05T11:00:00.000Z",
    password: "demo",
  },
  {
    id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091",
    email: "liam.patel@iautosale.co.uk",
    name: "Liam Patel",
    phone: "+44 7700 900104",
    role: "recon-tech",
    emailVerified: true,
    createdAt: "2025-03-12T14:45:00.000Z",
    password: "demo",
  },
  {
    id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102",
    email: "olivia.campbell@iautosale.co.uk",
    name: "Olivia Campbell",
    phone: "+44 7700 900105",
    role: "compliance",
    emailVerified: true,
    createdAt: "2025-04-01T09:30:00.000Z",
    password: "demo",
  },
  {
    id: "07b8c9d0-e1f2-4a3b-4c5d-6e7f80910213",
    email: "hassan.mirza@iautosale.co.uk",
    name: "Hassan Mirza",
    phone: "+44 7700 900106",
    role: "read-only",
    emailVerified: true,
    createdAt: "2025-04-15T16:00:00.000Z",
    password: "demo",
  },
  {
    id: "18c9d0e1-f2a3-4b4c-5d6e-7f8091021324",
    email: "charlotte.evans@iautosale.co.uk",
    name: "Charlotte Evans",
    phone: "+44 7700 900107",
    role: "seller",
    emailVerified: true,
    createdAt: "2025-05-20T12:00:00.000Z",
    vehicles: ["WBAWB52040PG12345"],
    password: "demo",
  } as MockSeller,
  {
    id: "29d0e1f2-a3b4-4c5d-6e7f-809102132435",
    email: "ryan.mcgregor@iautosale.co.uk",
    name: "Ryan McGregor",
    phone: "+44 7700 900108",
    role: "buyer",
    emailVerified: true,
    createdAt: "2025-06-10T15:30:00.000Z",
    savedCars: [],
    orders: [],
    password: "demo",
  } as MockBuyer,
  {
    id: "3ae1f2a3-b4c5-4d6e-7f80-910213243546",
    email: "priya.sharma@iautosale.co.uk",
    name: "Priya Sharma",
    phone: "+44 7700 900109",
    role: "dealer",
    emailVerified: true,
    createdAt: "2025-07-01T10:00:00.000Z",
    password: "demo",
  },
];
