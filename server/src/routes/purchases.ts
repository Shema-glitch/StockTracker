import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { checkPermission } from "../middleware/permissions";

const router = Router();
const prisma = new PrismaClient();

// Get all purchases
router.get("/", authenticateToken, checkPermission("view_purchases"), async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        product: true,
        supplier: true,
      },
      orderBy: {
        date: "desc",
      },
    });
    res.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Error fetching purchases" });
  }
});

// Create a new purchase
router.post("/", authenticateToken, checkPermission("edit_purchases"), async (req, res) => {
  try {
    const { productId, supplierId, quantity, price, date } = req.body;

    const purchase = await prisma.purchase.create({
      data: {
        productId: Number(productId),
        supplierId: Number(supplierId),
        quantity: Number(quantity),
        price: Number(price),
        date: new Date(date),
      },
      include: {
        product: true,
        supplier: true,
      },
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(500).json({ message: "Error creating purchase" });
  }
});

// Update a purchase
router.put("/:id", authenticateToken, checkPermission("edit_purchases"), async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, supplierId, quantity, price, date } = req.body;

    const purchase = await prisma.purchase.update({
      where: { id: Number(id) },
      data: {
        productId: Number(productId),
        supplierId: Number(supplierId),
        quantity: Number(quantity),
        price: Number(price),
        date: new Date(date),
      },
      include: {
        product: true,
        supplier: true,
      },
    });

    res.json(purchase);
  } catch (error) {
    console.error("Error updating purchase:", error);
    res.status(500).json({ message: "Error updating purchase" });
  }
});

// Delete a purchase
router.delete("/:id", authenticateToken, checkPermission("edit_purchases"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.purchase.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ message: "Error deleting purchase" });
  }
});

export default router; 