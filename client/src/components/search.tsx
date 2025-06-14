import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Package, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore, getAuthHeader } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: number;
  name: string;
  code: string;
  type: 'product';
  departmentId: number;
  categoryId: number;
  price: string;
  stockQuantity: number;
}

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { selectedDepartmentId } = useAuthStore();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", searchTerm, selectedDepartmentId],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const headers = getAuthHeader();
      if (!headers?.Authorization) return [];

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}&departmentId=${selectedDepartmentId}`,
        {
          headers: {
            Authorization: headers.Authorization,
          },
        }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: searchTerm.length > 0 && !!selectedDepartmentId,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'product') {
      navigate(`/products?highlight=${result.id}`);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Search products by name or code..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-[300px] pl-9 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </form>

      {isOpen && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result: SearchResult) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 group"
                >
                  <Package className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="truncate">Code: {result.code}</span>
                      <span>•</span>
                      <span>{Number(result.price).toLocaleString()} RWF</span>
                      <span>•</span>
                      <span>Stock: {result.stockQuantity}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              <div className="px-4 py-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                    setIsOpen(false);
                  }}
                >
                  View all results
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500">
              No products found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 