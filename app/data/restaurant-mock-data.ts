import type { CompanyGroup } from "@/app/types/restaurant";

export const MOCK_COMPANY_GROUPS: CompanyGroup[] = [
  {
    company: { id: "co1", name: "Baan Rim Naam Group" },
    restaurants: [
      {
        id: "r1",
        name: "Baan Rim Naam Thai Kitchen",
        branches: [
          {
            id: "b1",
            name: "Sukhumvit",
            location: "Sukhumvit, Bangkok",
            restaurantId: "r1",
            ownerId: "s1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "b2",
            name: "Thonglor",
            location: "Thonglor, Bangkok",
            restaurantId: "r1",
            ownerId: "s1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "b3",
            name: "Ari",
            location: "Ari, Bangkok",
            restaurantId: "r1",
            ownerId: "s1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: "r2",
        name: "Rim Naam Cafe",
        branches: [
          {
            id: "b4",
            name: "Ekkamai",
            location: "Ekkamai, Bangkok",
            restaurantId: "r2",
            ownerId: "s1",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
  },
];
