export type Table = {
  id: string;
  tableNumber: string;
  capacity: number;
  status: string;
  qr?: string | null;
  branchId: string;
  zoneId: string;
  zone?: {
    id?: string;
    name?: string;
    branchId?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

export type Branch = {
  id: string;
  name: string;
  location: string | null;
  restaurantId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Restaurant = {
  id: string;
  name: string;
  companyId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  branches: Branch[];
};

export type Company = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  restaurant: Restaurant[];
};

export type CompanyGroup = {
  company: {
    id: string;
    name: string;
  };
  restaurants: {
    id: string;
    name: string;
    branches: Branch[];
  }[];
};
