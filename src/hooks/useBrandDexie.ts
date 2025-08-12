import { db, type Brand } from "../db/brandDexie";

export const addBrandsToDexie = async (brands: Brand[]) => {
  await db.brands.bulkPut(brands);
};

export const getBrandsFromDexie = async (): Promise<Brand[]> => {
  return await db.brands.toArray();
};

export const updateBrandInDexie = async (brand: Brand) => {
  await db.brands.put(brand);
};

export const deleteBrandFromDexie = async (brandId: number) => {
  await db.brands.delete(brandId);
};

export const clearOldBrands = async (max: number = 100) => {
  const count = await db.brands.count();
  if (count > max) {
    const toDelete = await db.brands
      .orderBy("createdAt")
      .limit(count - max)
      .toArray();
    const idsToDelete = toDelete.map((b) => b.brandId);
    await db.brands.bulkDelete(idsToDelete);
  }
};
