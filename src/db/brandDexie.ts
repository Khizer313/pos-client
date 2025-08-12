import Dexie, { type Table } from "dexie";

export interface Brand {
  brandId: number;
  name: string;
  createdAt: string;
  status: string;
}

export class BrandDexieDB extends Dexie {
  brands!: Table<Brand>;

  constructor() {
    super("BrandDB");
    this.version(1).stores({
      brands: "brandId, name, createdAt, status",
    });
  }
}

export const db = new BrandDexieDB();
