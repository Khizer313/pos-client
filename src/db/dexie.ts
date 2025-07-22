// /src/db/customerDexie.ts
import Dexie, { type Table } from "dexie";

export interface Customer {
  customerId: number;
  name: string;
  phone: string;
  createdAt: string;
  balance: string;
  status: string;
}

export class CustomerDexieDB extends Dexie {
  customers!: Table<Customer>;

  constructor() {
    super("CustomerDB");
    this.version(1).stores({
      customers: "customerId, phone, name, createdAt, status",
    });
  }
}

export const db = new CustomerDexieDB();
