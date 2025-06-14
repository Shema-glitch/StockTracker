import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Upload, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getAuthHeader } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  code: z.string().min(1, "Product code is required"),
  category_id: z.number().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  stock_quantity: z.number().min(0, "Stock quantity must be non-negative"),
  min_stock_level: z.number().min(0, "Minimum stock level must be non-negative"),
  image: z.string().optional(),
  department_id: z.number().min(1, "Department is required"),
  is_active: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductModal({ open, onOpenChange }: ProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedDepartmentId } = useAuthStore();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", selectedDepartmentId],
    queryFn: async () => {
      const headers = getAuthHeader();
      if (!headers?.Authorization) {
        console.error('No auth headers available');
        return [];
      }

      console.log('Fetching categories for department:', selectedDepartmentId);
      console.log('Auth headers:', headers);
      
      try {
        const url = `/api/categories?department_id=${selectedDepartmentId}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: headers.Authorization,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          console.error('Failed to fetch categories:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        console.log('Raw categories response:', data);
        
        if (!Array.isArray(data)) {
          console.error('Categories data is not an array:', data);
          return [];
        }

        // Sort categories by name
        const sortedCategories = [...data].sort((a, b) => {
          // First sort by department_id
          if (a.department_id !== b.department_id) {
            return a.department_id - b.department_id;
          }
          // Then sort by name
          return a.name.localeCompare(b.name);
        });

        console.log('Sorted categories:', sortedCategories);
        return sortedCategories;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    enabled: !!selectedDepartmentId && !!getAuthHeader()?.Authorization,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      code: "",
      price: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      image: "",
      is_active: true,
    },
  });

  // Debug logging after form initialization
  useEffect(() => {
    console.log('Current categories state:', categories);
    console.log('Selected department:', selectedDepartmentId);
    console.log('Is loading categories:', isLoadingCategories);
    console.log('Form values:', form.getValues());
    console.log('Auth header:', getAuthHeader());
    console.log('Query enabled:', !!selectedDepartmentId && !!getAuthHeader()?.Authorization);
  }, [categories, selectedDepartmentId, isLoadingCategories, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      console.log('Mutation started with data:', data);
      
      // Prepare the product data
      const productData = {
        name: data.name,
        code: data.code,
        price: data.price.toString(),
        stock_quantity: data.stock_quantity,
        min_stock_level: data.min_stock_level,
        category_id: data.category_id,
        department_id: selectedDepartmentId,
        image: data.image || '',
        is_active: data.is_active
      };

      console.log('Prepared product data:', productData);
      console.log('Auth header:', getAuthHeader());

      try {
        console.log('Sending request to /api/products');
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()?.Authorization || ''
          },
          body: JSON.stringify(productData)
        });

        console.log('Response received:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.message || 'Failed to create product');
        }

        const result = await response.json();
        console.log('Product created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('Mutation successful:', response);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Mutation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductForm) => {
    console.log('Form submitted with data:', data);
    if (!data.category_id) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }
    console.log('Starting mutation with data:', data);
    mutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url);
    form.setValue('image', url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              console.log('Form submitted');
              const formData = form.getValues();
              console.log('Form data:', formData);
              
              if (!formData.category_id) {
                toast({
                  title: "Error",
                  description: "Please select a category",
                  variant: "destructive",
                });
                return;
              }

              try {
                console.log('Starting mutation');
                await mutation.mutateAsync(formData);
              } catch (error) {
                console.error('Mutation error:', error);
              }
            }} 
            className="space-y-4 animate-fade-in-up"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product code (e.g., PHC001)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      console.log('Category selected:', value);
                      field.onChange(Number(value));
                    }}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category">
                          {isLoadingCategories ? (
                            "Loading categories..."
                          ) : categories.find((cat: any) => cat.id === field.value)?.name || "Select a category"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="p-2 text-sm text-gray-500">
                          Loading categories...
                        </div>
                      ) : Array.isArray(categories) && categories.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto">
                          {categories.map((category: any) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              <div className="flex items-center justify-between py-1">
                                <div className="flex items-center">
                                  <span className="font-medium">{category.name}</span>
                                  <span className="ml-2 text-xs text-gray-500">({category.code})</span>
                                </div>
                                {category.department_id === selectedDepartmentId && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    Current Dept
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          Loading categories for department {selectedDepartmentId}...
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (RWF)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Stock Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="min_stock_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Stock Level</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Product Image</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Upload from PC</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Or use URL</Label>
                  <Input
                    placeholder="Enter image URL"
                    onChange={handleImageUrlChange}
                  />
                </div>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log('Cancel button clicked');
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}