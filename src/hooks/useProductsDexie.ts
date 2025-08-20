import { db } from "../db/productDexie";
import { type Product } from "../db/productDexie";

// Add multiple products
export const addProductsToDexie = async (products: Product[]) => {
  await db.products.bulkPut(products);
};

// Get all products
export const getProductsFromDexie = async (): Promise<Product[]> => {
  return await db.products.toArray();
};

// Update single product
export const updateProductInDexie = async (product: Product) => {
  await db.products.put(product);
};

// Delete single product
export const deleteProductFromDexie = async (productId: number) => {
  await db.products.delete(productId);
};

// Clear old data if more than limit
export const clearOldProducts = async (max: number = 100) => {
  const count = await db.products.count();
  if (count > max) {
    const toDelete = await db.products
      .orderBy("createdAt")
      .limit(count - max)
      .toArray();
    const idsToDelete = toDelete.map((p) => p.productId);
    await db.products.bulkDelete(idsToDelete);
  }
};
