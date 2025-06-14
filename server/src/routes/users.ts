import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { hash } from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

// Get all users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { departmentId } = req.query;
    const where = departmentId && departmentId !== "all" ? { departmentId: Number(departmentId) } : {};
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        permissions: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Create a new user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, email, password, role, departmentId, permissions } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        departmentId: departmentId ? Number(departmentId) : null,
        permissions: permissions || [],
        isActive: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Update a user
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, departmentId, permissions, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        role,
        departmentId: departmentId ? Number(departmentId) : null,
        permissions,
        isActive,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete a user
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

export default router; 