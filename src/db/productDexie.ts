import Dexie, { type Table } from "dexie";

export interface Product {
  productId: number;
  name: string;
  categoryAssigned: string;
  price: number;
  pieces: number;
  status: string;
  createdAt: string;
}

export class ProductDexieDB extends Dexie {
  products!: Table<Product>;

  constructor() {
    super("ProductDB");
    this.version(1).stores({
      products: "productId, name, categoryAssigned, price, stock, status, createdAt",
    });
  }
}

export const db = new ProductDexieDB();
