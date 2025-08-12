// /src/db/supplierDexie.ts
import Dexie, { type Table } from "dexie";

export interface Supplier {
  supplierId: number;
  name: string;
  phone: string;
  createdAt: string;
  balance: string;
  status: string;
}

export class SupplierDexieDB extends Dexie {
  suppliers!: Table<Supplier>;

  constructor() {
    super("SupplierDB");
    this.version(1).stores({
      suppliers: "supplierId, phone, name, createdAt, status",
    });
  }
}

export const db = new SupplierDexieDB();
