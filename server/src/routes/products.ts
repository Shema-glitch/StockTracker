import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { checkPermission } from "../middleware/permissions";

const router = Router();
const prisma = new PrismaClient();

// Get all products
router.get("/", authenticateToken, checkPermission("view_products"), async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = departmentId ? { departmentId: String(departmentId) } : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Create a new product
router.post("/", authenticateToken, checkPermission("edit_products"), async (req, res) => {
  try {
    const { name, code, categoryId, price, stockQuantity, minStockLevel, image, departmentId } = req.body;

    // Check if product code already exists
    const existingProduct = await prisma.product.findFirst({
      where: { code },
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product code already exists" });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        code,
        categoryId: Number(categoryId),
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        minStockLevel: Number(minStockLevel),
        image,
        departmentId: String(departmentId),
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
});

// Update a product
router.put("/:id", authenticateToken, checkPermission("edit_products"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, categoryId, price, stockQuantity, minStockLevel, image } = req.body;

    // Check if product code is already taken by another product
    const existingProduct = await prisma.product.findFirst({
      where: {
        code,
        id: { not: id },
      },
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product code already taken" });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        code,
        categoryId: Number(categoryId),
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        minStockLevel: Number(minStockLevel),
        image,
      },
      include: {
        category: true,
      },
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete a product
router.delete("/:id", authenticateToken, checkPermission("edit_products"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

export default router; 