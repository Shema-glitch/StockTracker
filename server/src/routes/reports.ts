import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { checkPermission } from "../middleware/permissions";
import ExcelJS from "exceljs";

const router = Router();
const prisma = new PrismaClient();

// Get sales report
router.get("/sales", authenticateToken, checkPermission("view_reports"), async (req, res) => {
  try {
    const { from, to } = req.query;
    const where: any = {};

    if (from && to) {
      where.date = {
        gte: new Date(from as string),
        lte: new Date(to as string),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group sales by date
    const salesByDate = sales.reduce((acc: any, sale) => {
      const date = sale.date.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += sale.quantity * sale.price;
      return acc;
    }, {});

    const report = Object.entries(salesByDate).map(([date, total]) => ({
      date,
      total,
    }));

    res.json(report);
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Error generating sales report" });
  }
});

// Get stock report
router.get("/stock", authenticateToken, checkPermission("view_reports"), async (req, res) => {
  try {
    const stock = await prisma.product.findMany({
      select: {
        name: true,
        quantity: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const report = stock.map((item) => ({
      product: item.name,
      quantity: item.quantity,
    }));

    res.json(report);
  } catch (error) {
    console.error("Error generating stock report:", error);
    res.status(500).json({ message: "Error generating stock report" });
  }
});

// Download sales report
router.get("/sales/download", authenticateToken, checkPermission("view_reports"), async (req, res) => {
  try {
    const { from, to } = req.query;
    const where: any = {};

    if (from && to) {
      where.date = {
        gte: new Date(from as string),
        lte: new Date(to as string),
      };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Product", key: "product", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Price", key: "price", width: 10 },
      { header: "Total", key: "total", width: 15 },
    ];

    sales.forEach((sale) => {
      worksheet.addRow({
        date: sale.date.toLocaleDateString(),
        product: sale.product.name,
        quantity: sale.quantity,
        price: sale.price,
        total: sale.quantity * sale.price,
      });
    });

    // Add summary row
    const totalSales = sales.reduce((sum, sale) => sum + sale.quantity * sale.price, 0);
    worksheet.addRow({
      date: "Total",
      product: "",
      quantity: "",
      price: "",
      total: totalSales,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading sales report:", error);
    res.status(500).json({ message: "Error downloading sales report" });
  }
});

// Download stock report
router.get("/stock/download", authenticateToken, checkPermission("view_reports"), async (req, res) => {
  try {
    const stock = await prisma.product.findMany({
      select: {
        name: true,
        quantity: true,
        price: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");

    worksheet.columns = [
      { header: "Product", key: "product", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Price", key: "price", width: 10 },
      { header: "Total Value", key: "totalValue", width: 15 },
    ];

    stock.forEach((item) => {
      worksheet.addRow({
        product: item.name,
        quantity: item.quantity,
        price: item.price,
        totalValue: item.quantity * item.price,
      });
    });

    // Add summary row
    const totalValue = stock.reduce((sum, item) => sum + item.quantity * item.price, 0);
    worksheet.addRow({
      product: "Total Value",
      quantity: "",
      price: "",
      totalValue,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading stock report:", error);
    res.status(500).json({ message: "Error downloading stock report" });
  }
});

export default router; 