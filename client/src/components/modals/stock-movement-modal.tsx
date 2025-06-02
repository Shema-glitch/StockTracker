import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import { getAuthHeader } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

const stockMovementSchema = z.object({
  type: z.enum(["in", "out"]),
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type StockMovementForm = z.infer<typeof stockMovementSchema>;

interface StockMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockMovementModal({ open, onOpenChange }: StockMovementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedDepartmentId } = useAuthStore();

  const form = useForm<StockMovementForm>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      type: "in",
      productId: "",
      quantity: 1,
      reason: "",
      notes: "",
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', selectedDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/products?departmentId=${selectedDepartmentId}`, {
        headers: getAuthHeader(),
      });
      return res.json();
    },
    enabled: !!selectedDepartmentId,
  });

  const selectedProduct = products.find((p: any) => p.id.toString() === form.watch("productId"));

  const mutation = useMutation({
    mutationFn: async (data: StockMovementForm) => {
      return apiRequest("POST", "/api/stock-movements", {
        ...data,
        productId: Number(data.productId),
        departmentId: selectedDepartmentId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock movement recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record stock movement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StockMovementForm) => {
    mutation.mutate(data);
  };

  const stockInReasons = [
    { value: "return", label: "Customer return" },
    { value: "manual_addition", label: "Manual addition - forgotten in purchase" },
    { value: "promotional", label: "Promotional/bonus stock" },
    { value: "audit_adjustment", label: "Inventory audit adjustment" },
  ];

  const stockOutReasons = [
    { value: "damaged", label: "Damaged item" },
    { value: "expired", label: "Expired product" },
    { value: "lost", label: "Lost/stolen item" },
    { value: "donation", label: "Donation" },
    { value: "shop_use", label: "Internal shop use" },
  ];

  const reasons = form.watch("type") === "in" ? stockInReasons : stockOutReasons;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Stock Movement</DialogTitle>
          <DialogDescription>
            Track physical inventory changes not tied to purchases or sales
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter quantity" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Current Stock</FormLabel>
                <Input 
                  value={selectedProduct ? `${selectedProduct.stock} units` : "Select a product"} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {mutation.isPending ? "Recording..." : "Record Movement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
