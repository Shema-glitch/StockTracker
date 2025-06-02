import { 
  users, departments, categories, products, purchases, sales, stockMovements,
  type User, type InsertUser, type Department, type InsertDepartment,
  type Category, type InsertCategory, type Product, type InsertProduct,
  type Purchase, type InsertPurchase, type Sale, type InsertSale,
  type StockMovement, type InsertStockMovement
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUsers(): Promise<User[]>;

  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;

  // Categories
  getCategories(departmentId?: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Products
  getProducts(departmentId?: number, categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  updateProductStock(id: number, quantity: number): Promise<Product>;

  // Purchases
  getPurchases(departmentId?: number): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;

  // Sales
  getSales(departmentId?: number): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Stock Movements
  getStockMovements(departmentId?: number): Promise<StockMovement[]>;
  getStockMovement(id: number): Promise<StockMovement | undefined>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // Reports
  getDashboardStats(departmentId?: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.isActive, true));
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  async updateDepartment(id: number, updateDepartment: Partial<InsertDepartment>): Promise<Department> {
    const [department] = await db.update(departments).set(updateDepartment).where(eq(departments.id, id)).returning();
    return department;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.update(departments).set({ isActive: false }).where(eq(departments.id, id));
  }

  // Categories
  async getCategories(departmentId?: number): Promise<Category[]> {
    const query = db.select().from(categories).where(eq(categories.isActive, true));
    if (departmentId) {
      return await query.where(and(eq(categories.isActive, true), eq(categories.departmentId, departmentId)));
    }
    return await query;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updateCategory: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db.update(categories).set(updateCategory).where(eq(categories.id, id)).returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  }

  // Products
  async getProducts(departmentId?: number, categoryId?: number): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    if (departmentId && categoryId) {
      return await query.where(and(
        eq(products.isActive, true),
        eq(products.departmentId, departmentId),
        eq(products.categoryId, categoryId)
      ));
    } else if (departmentId) {
      return await query.where(and(eq(products.isActive, true), eq(products.departmentId, departmentId)));
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.code, code));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(updateProduct).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async updateProductStock(id: number, quantity: number): Promise<Product> {
    const [product] = await db.update(products)
      .set({ stockQuantity: quantity })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // Purchases
  async getPurchases(departmentId?: number): Promise<Purchase[]> {
    const query = db.select().from(purchases).orderBy(desc(purchases.createdAt));
    if (departmentId) {
      return await query.where(eq(purchases.departmentId, departmentId));
    }
    return await query;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values(insertPurchase).returning();
    return purchase;
  }

  // Sales
  async getSales(departmentId?: number): Promise<Sale[]> {
    const query = db.select().from(sales).orderBy(desc(sales.createdAt));
    if (departmentId) {
      return await query.where(eq(sales.departmentId, departmentId));
    }
    return await query;
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || undefined;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db.insert(sales).values(insertSale).returning();
    return sale;
  }

  // Stock Movements
  async getStockMovements(departmentId?: number): Promise<StockMovement[]> {
    const query = db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
    if (departmentId) {
      return await query.where(eq(stockMovements.departmentId, departmentId));
    }
    return await query;
  }

  async getStockMovement(id: number): Promise<StockMovement | undefined> {
    const [movement] = await db.select().from(stockMovements).where(eq(stockMovements.id, id));
    return movement || undefined;
  }

  async createStockMovement(insertMovement: InsertStockMovement): Promise<StockMovement> {
    const [movement] = await db.insert(stockMovements).values(insertMovement).returning();
    return movement;
  }

  // Reports
  async getDashboardStats(departmentId?: number): Promise<any> {
    // This would implement various dashboard statistics
    // For now, returning a basic structure
    return {
      totalProducts: 0,
      totalSales: 0,
      totalPurchases: 0,
      lowStockItems: 0,
    };
  }
}

export const storage = new DatabaseStorage();
