import { db } from "../db/supplierDexie";
import { type Supplier } from "../db/supplierDexie";

// Add multiple suppliers
export const addSuppliersToDexie = async (suppliers: Supplier[]) => {
  await db.suppliers.bulkPut(suppliers);
};

// Get all suppliers from Dexie
export const getSuppliersFromDexie = async (): Promise<Supplier[]> => {
  return await db.suppliers.toArray();
};

// Update one supplier
export const updateSupplierInDexie = async (supplier: Supplier) => {
  await db.suppliers.put(supplier);
};

// Delete supplier
export const deleteSupplierFromDexie = async (supplierId: number) => {
  await db.suppliers.delete(supplierId);
};

// Clear old data if more than limit
export const clearOldSuppliers = async (max: number = 100) => {
  const count = await db.suppliers.count();
  if (count > max) {
    const toDelete = await db.suppliers
      .orderBy("createdAt")
      .limit(count - max)
      .toArray();
    const idsToDelete = toDelete.map((s) => s.supplierId);
    await db.suppliers.bulkDelete(idsToDelete);
  }
};
