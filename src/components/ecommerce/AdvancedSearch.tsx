"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchSuggestion {
  value: string;
  count: number;
}

interface FilterOptions {
  brands: SearchSuggestion[];
  materials: SearchSuggestion[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface AdvancedSearchProps {
  locale: string;
}

export default function AdvancedSearch({ locale }: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Search state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    brand: searchParams.get("brand") || "",
    material: searchParams.get("material") || "",
    inStock: searchParams.get("inStock") || "",
    featured: searchParams.get("featured") || "",
    rating: searchParams.get("rating") || ""
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    materials: [],
    priceRange: { min: 0, max: 1000000 }
  });
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`search-history-${locale}`);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, [locale]);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        suggestions: "true",
        limit: "8"
      });

      const response = await fetch(`/api/products/search/advanced?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        
        // Update filter options
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
    }
  }, []);

  // Debounced search handler with timeout
  const debouncedSearchHandler = useCallback((searchQuery: string) => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [debouncedSearch]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
    
    if (value.trim()) {
      debouncedSearchHandler(value);
    } else {
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // Add to search history
    const newHistory = [finalQuery, ...searchHistory.filter(h => h !== finalQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem(`search-history-${locale}`, JSON.stringify(newHistory));

    // Hide suggestions
    setShowSuggestions(false);

    // Update URL with search parameters
    const params = new URLSearchParams();
    params.set("q", finalQuery);
    
    // Add filters to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Navigate to search results
    router.push(`/${locale}/search?${params.toString()}`);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Persist filters to localStorage
    localStorage.setItem(`search-filters-${locale}`, JSON.stringify(newFilters));
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      brand: "",
      material: "",
      inStock: "",
      featured: "",
      rating: ""
    };
    setFilters(clearedFilters);
    localStorage.setItem(`search-filters-${locale}`, JSON.stringify(clearedFilters));
  };

  // Load filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem(`search-filters-${locale}`);
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, [locale]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="جستجو در محصولات..."
          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-lg"
        />
        
        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
        </button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-3">پیشنهادات جستجو</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-right p-3 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">تاریخچه جستجو</h3>
              <div className="space-y-2">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(historyItem)}
                    className="w-full text-right p-3 text-white hover:bg-white/10 rounded-xl transition-colors duration-200 text-sm flex items-center justify-between"
                  >
                    <span>{historyItem}</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">فیلترهای پیشرفته</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              پاک کردن همه
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">دسته‌بندی</label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange("categoryId", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">همه دسته‌ها</option>
                {/* Categories would be loaded from API */}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">محدوده قیمت</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="از"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                />
                <input
                  type="number"
                  placeholder="تا"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                />
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">برند</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">همه برندها</option>
                {filterOptions.brands.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.value} ({brand.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Material Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">جنس</label>
              <select
                value={filters.material}
                onChange={(e) => handleFilterChange("material", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">همه جنس‌ها</option>
                {filterOptions.materials.map((material) => (
                  <option key={material.value} value={material.value}>
                    {material.value} ({material.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">وضعیت موجودی</label>
              <select
                value={filters.inStock}
                onChange={(e) => handleFilterChange("inStock", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">همه</option>
                <option value="true">موجود</option>
                <option value="false">ناموجود</option>
              </select>
            </div>

            {/* Featured Products */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">محصولات ویژه</label>
              <select
                value={filters.featured}
                onChange={(e) => handleFilterChange("featured", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">همه</option>
                <option value="true">فقط ویژه</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حداقل امتیاز</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
              >
                <option value="">همه</option>
                <option value="5">5 ستاره</option>
                <option value="4">4 ستاره و بالاتر</option>
                <option value="3">3 ستاره و بالاتر</option>
                <option value="2">2 ستاره و بالاتر</option>
                <option value="1">1 ستاره و بالاتر</option>
              </select>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => handleSearch()}
              className="px-8 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:shadow-glass-orange hover:scale-105 transition-all duration-300"
            >
              اعمال فیلترها
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
