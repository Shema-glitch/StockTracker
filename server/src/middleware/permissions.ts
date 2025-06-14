import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, permissions: true },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Admins have all permissions
      if (user.role === "admin") {
        return next();
      }

      // Check if user has the required permission
      if (!user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
}; 