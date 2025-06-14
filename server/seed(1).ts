import { db } from "./db";
import { users, departments, categories, products, purchases, sales, stockMovements } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
      permissions: ["all"],
      isActive: true,
    }).returning();

    // Create employee user
    const employeePassword = await bcrypt.hash("emp123", 10);
    const [employee] = await db.insert(users).values({
      username: "employee",
      password: employeePassword,
      name: "John Employee",
      role: "employee",
      permissions: ["view", "create"],
      isActive: true,
    }).returning();

    // Create departments
    const [pharmacy] = await db.insert(departments).values({
      name: "Pharmacy",
      description: "Pharmaceutical products and medications",
      isActive: true,
    }).returning();

    const [cosmetics] = await db.insert(departments).values({
      name: "Cosmetics",
      description: "Beauty and personal care products",
      isActive: true,
    }).returning();

    // Create categories
    const [medicines] = await db.insert(categories).values({
      name: "Medicines",
      code: "MED",
      departmentId: pharmacy.id,
      isActive: true,
    }).returning();

    const [skincare] = await db.insert(categories).values({
      name: "Skincare",
      code: "SKN",
      departmentId: cosmetics.id,
      isActive: true,
    }).returning();

    // Create products
    const [paracetamol] = await db.insert(products).values({
      name: "Paracetamol 500mg",
      code: "MED001",
      price: 5.99,
      stockQuantity: 100,
      minStockLevel: 20,
      departmentId: pharmacy.id,
      categoryId: medicines.id,
      isActive: true,
    }).returning();

    const [moisturizer] = await db.insert(products).values({
      name: "Hydrating Moisturizer",
      code: "SKN001",
      price: 15.99,
      stockQuantity: 50,
      minStockLevel: 10,
      departmentId: cosmetics.id,
      categoryId: skincare.id,
      isActive: true,
    }).returning();

    // Create a purchase
    await db.insert(purchases).values({
      productId: paracetamol.id,
      quantity: 50,
      unitCost: 4.50,
      totalCost: 225.00,
      supplierName: "MedSupply Co.",
      userId: admin.id,
      departmentId: pharmacy.id,
    });

    // Create a sale
    await db.insert(sales).values({
      productId: moisturizer.id,
      quantity: 2,
      unitPrice: 15.99,
      totalPrice: 31.98,
      userId: employee.id,
      departmentId: cosmetics.id,
    });

    // Create stock movement
    await db.insert(stockMovements).values({
      productId: paracetamol.id,
      type: "in",
      quantity: 50,
      reason: "Initial stock",
      notes: "First stock entry",
      userId: admin.id,
      departmentId: pharmacy.id,
    });

    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed(); 