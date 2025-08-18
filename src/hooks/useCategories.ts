import { db } from "../db/categoriesDexie";
import { type Category } from "../db/categoriesDexie";

// Add multiple categories
export const addCategoriesToDexie = async (categories: Category[]) => {
  await db.categories.bulkPut(categories);
};

// Get all categories
export const getCategoriesFromDexie = async (): Promise<Category[]> => {
  return await db.categories.toArray();
};

// Update single category
export const updateCategoryInDexie = async (category: Category) => {
  await db.categories.put(category);
};

// Delete single category
export const deleteCategoryFromDexie = async (categoryId: number) => {
  await db.categories.delete(categoryId);
};

// Clear old data if more than limit
export const clearOldCategories = async (max: number = 100) => {
  const count = await db.categories.count();
  if (count > max) {
    const toDelete = await db.categories
      .orderBy("createdAt")
      .limit(count - max)
      .toArray();
    const idsToDelete = toDelete.map((c) => c.categoryId);
    await db.categories.bulkDelete(idsToDelete);
  }
};
