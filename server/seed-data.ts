import { storage } from "./storage";

async function seedData() {
  try {
    console.log("Starting to seed data...");

    // Check if admin user exists, if not create it
    let adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      adminUser = await storage.createUser({
        username: "admin",
        email: "admin@tristatelabs.com",
        password: "$2b$10$8K1p/a0drtNNiVQY3Yr2VO.nTJRdcT0h8qJ8HdO8VYO1O.nC4P8vG", // password: "admin123"
        name: "Admin User",
        role: "admin",
        permissions: ["all"],
        isActive: true
      });
      console.log("Created admin user:", adminUser.username);
    } else {
      console.log("Admin user already exists:", adminUser.username);
    }

    // Create a test employee user
    let employeeUser = await storage.getUserByUsername("employee");
    if (!employeeUser) {
      employeeUser = await storage.createUser({
        username: "employee",
        email: "employee@tristatelabs.com",
        password: "$2b$10$8K1p/a0drtNNiVQY3Yr2VO.nTJRdcT0h8qJ8HdO8VYO1O.nC4P8vG", // password: "employee123"
        name: "Test Employee",
        role: "employee",
        permissions: ["view", "create", "edit"],
        isActive: true
      });
      console.log("Created employee user:", employeeUser.username);
    } else {
      console.log("Employee user already exists:", employeeUser.username);
    }

    // Create departments
    const electronics = await storage.createDepartment({
      name: "Electronics",
      description: "Electronic devices and components",
      isActive: true
    });

    const clothing = await storage.createDepartment({
      name: "Clothing",
      description: "Apparel and accessories",
      isActive: true
    });

    console.log("Created departments:", electronics.name, clothing.name);

    // Create categories
    const phones = await storage.createCategory({
      name: "Mobile Phones",
      code: "PHN",
      departmentId: electronics.id,
      isActive: true
    });

    const laptops = await storage.createCategory({
      name: "Laptops",
      code: "LAP",
      departmentId: electronics.id,
      isActive: true
    });

    const shirts = await storage.createCategory({
      name: "T-Shirts",
      code: "TSH",
      departmentId: clothing.id,
      isActive: true
    });

    console.log("Created categories:", phones.name, laptops.name, shirts.name);

    // Create products
    const product1 = await storage.createProduct({
      name: "iPhone 15 Pro",
      code: "IPH15P",
      categoryId: phones.id,
      departmentId: electronics.id,
      price: "999.99",
      stockQuantity: 50,
      minStockLevel: 10,
      isActive: true
    });

    const product2 = await storage.createProduct({
      name: "MacBook Air M3",
      code: "MBA-M3",
      categoryId: laptops.id,
      departmentId: electronics.id,
      price: "1299.99",
      stockQuantity: 25,
      minStockLevel: 5,
      isActive: true
    });

    const product3 = await storage.createProduct({
      name: "Cotton T-Shirt",
      code: "CTSH001",
      categoryId: shirts.id,
      departmentId: clothing.id,
      price: "29.99",
      stockQuantity: 100,
      minStockLevel: 20,
      isActive: true
    });

    console.log("Created products:", product1.name, product2.name, product3.name);
    console.log("Data seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedData();