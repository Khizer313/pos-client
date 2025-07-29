import { db } from "../db/dexie";
import { type Customer } from "../db/dexie";

// Add multiple customers
export const addCustomersToDexie = async (customers: Customer[]) => {
  await db.customers.bulkPut(customers);
};

// Get all customers from Dexie
export const getCustomersFromDexie = async (): Promise<Customer[]> => {
  return await db.customers.toArray();
};

// Update one customer
export const updateCustomerInDexie = async (customer: Customer) => {
  await db.customers.put(customer);
};

// Delete customer
export const deleteCustomerFromDexie = async (customerId: number) => {
  await db.customers.delete(customerId);
};

// Clear old data if more than limit
export const clearOldCustomers = async (max: number = 100) => {
  const count = await db.customers.count();
  if (count > max) {
    const toDelete = await db.customers
      .orderBy("createdAt")
      .limit(count - max)
      .toArray();
    const idsToDelete = toDelete.map((c) => c.customerId);
    await db.customers.bulkDelete(idsToDelete);
  }
};
