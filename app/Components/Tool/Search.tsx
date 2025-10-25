"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search as SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface SearchProps {
  setEmployees: React.Dispatch<React.SetStateAction<any[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const Search: React.FC<SearchProps> = ({
  setEmployees,
  setLoading,
  setHasSearched,
  setSearch,
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchEmployees(query);
      } else {
        setEmployees([]);
        setHasSearched(false);
        setResultCount(0);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchEmployees = async (search: string) => {
    setIsLoading(true);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setEmployees(data);
      setSearch(search);
      setResultCount(data?.length || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-6 flex justify-center">
      <div className="relative w-full max-w-2xl">
        <InputGroup className="w-full shadow-md rounded-xl py-6 border border-input bg-background focus-within:ring-2 focus-within:ring-primary/60 transition-all">
          <InputGroupAddon align="inline-start" className="pl-3">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </InputGroupAddon>

          <InputGroupInput
            placeholder="Search employee..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base py-3 pl-2 rounded-xl focus-visible:ring-0 focus-visible:outline-none capitalize"
          />

          {isLoading ? (
            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-sm text-muted-foreground">
                Searching...
              </InputGroupText>
            </InputGroupAddon>
          ) : resultCount > 0 ? (
            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-sm text-muted-foreground">
                {resultCount} found
              </InputGroupText>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>
    </div>
  );
};

export default Search;
