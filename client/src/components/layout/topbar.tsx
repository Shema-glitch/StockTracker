import { Search, Bell, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/auth";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface TopbarProps {
  title: string;
}

interface SearchResult {
  type: "product" | "sale" | "purchase" | "employee";
  data: any;
}

export function Topbar({ title }: TopbarProps) {
  const { selectedDepartmentId } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [, navigate] = useLocation();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const headers = getAuthHeader();
      if (!headers?.Authorization) return [];
      
      const res = await fetch('/api/departments', {
        headers: {
          Authorization: headers.Authorization,
        },
      });
      return res.json();
    },
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery<SearchResult[]>({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];
      const headers = getAuthHeader();
      if (!headers?.Authorization) return [];

      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch.trim())}`, {
        headers: {
          Authorization: headers.Authorization,
        },
      });
      return res.json();
    },
    enabled: !!debouncedSearch.trim(),
  });

  const selectedDepartment = departments.find((d: any) => d.id === selectedDepartmentId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    
    switch (result.type) {
      case "product":
        navigate(`/products/${result.data.id}`);
        break;
      case "sale":
        navigate(`/sales/${result.data.id}`);
        break;
      case "purchase":
        navigate(`/purchases/${result.data.id}`);
        break;
      case "employee":
        navigate(`/employees/${result.data.id}`);
        break;
    }
  };

  const getResultLabel = (result: SearchResult) => {
    switch (result.type) {
      case "product":
        return `${result.data.name} (${result.data.sku})`;
      case "sale":
        return `Sale: ${result.data.product.name} - ${new Date(result.data.date).toLocaleDateString()}`;
      case "purchase":
        return `Purchase: ${result.data.product.name} from ${result.data.supplier.name}`;
      case "employee":
        return `${result.data.name} (${result.data.email})`;
      default:
        return "";
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Department:</span>
            <Badge variant="outline">
              {selectedDepartment?.name || "All Departments"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div ref={searchRef} className="relative w-64">
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Search products, sales, purchases..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
              />
              {isSearchOpen && (
                <CommandList>
                  <CommandEmpty>
                    {isSearching ? "Searching..." : "No results found."}
                  </CommandEmpty>
                  {searchResults.length > 0 && (
                    <>
                      <CommandGroup heading="Products">
                        {searchResults
                          .filter(r => r.type === "product")
                          .map((result) => (
                            <CommandItem
                              key={`${result.type}-${result.data.id}`}
                              onSelect={() => handleSelect(result)}
                            >
                              {getResultLabel(result)}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                      <CommandGroup heading="Sales">
                        {searchResults
                          .filter(r => r.type === "sale")
                          .map((result) => (
                            <CommandItem
                              key={`${result.type}-${result.data.id}`}
                              onSelect={() => handleSelect(result)}
                            >
                              {getResultLabel(result)}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                      <CommandGroup heading="Purchases">
                        {searchResults
                          .filter(r => r.type === "purchase")
                          .map((result) => (
                            <CommandItem
                              key={`${result.type}-${result.data.id}`}
                              onSelect={() => handleSelect(result)}
                            >
                              {getResultLabel(result)}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                      <CommandGroup heading="Employees">
                        {searchResults
                          .filter(r => r.type === "employee")
                          .map((result) => (
                            <CommandItem
                              key={`${result.type}-${result.data.id}`}
                              onSelect={() => handleSelect(result)}
                            >
                              {getResultLabel(result)}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              )}
            </Command>
          </div>
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
