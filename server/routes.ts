import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertDepartmentSchema, insertCategorySchema, 
  insertProductSchema, insertPurchaseSchema, insertSaleSchema, 
  insertStockMovementSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "luxe-system-secret";

// Middleware to verify JWT token
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as any;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name, 
          role: user.role,
          permissions: user.permissions 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Departments
  app.get("/api/departments", authenticateToken, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", authenticateToken, async (req, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ message: "Failed to create department" });
    }
  });

  // Categories
  app.get("/api/categories", authenticateToken, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const categories = await storage.getCategories(departmentId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", authenticateToken, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Products
  app.get("/api/products", authenticateToken, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const products = await storage.getProducts(departmentId, categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const productData = req.body;
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // Purchases
  app.get("/api/purchases", authenticateToken, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const purchases = await storage.getPurchases(departmentId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", authenticateToken, async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Calculate total cost
      purchaseData.totalCost = (Number(purchaseData.unitCost) * purchaseData.quantity).toString();
      
      const purchase = await storage.createPurchase(purchaseData);
      
      // Update product stock
      const product = await storage.getProduct(purchase.productId!);
      if (product) {
        await storage.updateProductStock(product.id, (product.stock || 0) + purchase.quantity);
      }
      
      res.status(201).json(purchase);
    } catch (error) {
      res.status(400).json({ message: "Failed to create purchase" });
    }
  });

  // Sales
  app.get("/api/sales", authenticateToken, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const sales = await storage.getSales(departmentId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", authenticateToken, async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Calculate total price
      saleData.totalPrice = (Number(saleData.unitPrice) * saleData.quantity).toString();
      
      // Check stock availability
      const product = await storage.getProduct(saleData.productId!);
      if (!product || (product.stock || 0) < saleData.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      
      const sale = await storage.createSale(saleData);
      
      // Update product stock
      await storage.updateProductStock(product.id, (product.stock || 0) - sale.quantity);
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Failed to create sale" });
    }
  });

  // Stock Movements
  app.get("/api/stock-movements", authenticateToken, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const movements = await storage.getStockMovements(departmentId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.post("/api/stock-movements", authenticateToken, async (req, res) => {
    try {
      const movementData = insertStockMovementSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const movement = await storage.createStockMovement(movementData);
      
      // Update product stock
      const product = await storage.getProduct(movement.productId!);
      if (product) {
        const newStock = movement.type === 'in' 
          ? (product.stock || 0) + movement.quantity
          : (product.stock || 0) - movement.quantity;
        
        await storage.updateProductStock(product.id, Math.max(0, newStock));
      }
      
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ message: "Failed to create stock movement" });
    }
  });

  // Users/Employees (Admin only)
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
      const stats = await storage.getDashboardStats(departmentId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
