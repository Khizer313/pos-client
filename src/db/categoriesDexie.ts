import Dexie, { type Table } from "dexie";

export interface Category {
  categoryId: number;
  name: string;
  status: string;
  createdAt: string;
}

export class CategoryDexieDB extends Dexie {
  categories!: Table<Category>;

  constructor() {
    super("CategoryDB");
    this.version(1).stores({
      categories: "categoryId, name, status, createdAt",
    });
  }
}

export const db = new CategoryDexieDB();
