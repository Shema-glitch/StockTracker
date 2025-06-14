import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { checkPermission } from "../middleware/permissions";
import { hash } from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

// Get all employees
router.get("/", authenticateToken, checkPermission("view_employees"), async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        permissions: true,
        created_at: true,
      },
    });

    // Transform the data to match the frontend expectations
    const transformedEmployees = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      isActive: emp.is_active,
      permissions: emp.permissions as string[],
      createdAt: emp.created_at,
    }));

    res.json(transformedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Error fetching employees" });
  }
});

// Create a new employee
router.post("/", authenticateToken, checkPermission("edit_employees"), async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (!["admin", "manager", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
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
        permissions: permissions || [],
        is_active: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Error creating employee" });
  }
});

// Update an employee
router.put("/:id", authenticateToken, checkPermission("edit_employees"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, permissions, isActive } = req.body;

    // Validate role
    if (!["admin", "manager", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        permissions,
        is_active: isActive,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Error updating employee" });
  }
});

// Delete an employee
router.delete("/:id", authenticateToken, checkPermission("edit_employees"), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await prisma.user.count({
        where: { role: "admin" },
      });

      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin" });
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Error deleting employee" });
  }
});

export default router; 