"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
// ... existing code ... <other imports>

interface CompetitionResult {
  id: string;
  competitionTitle: string;
  date: string;
  location: string;
  category: string;
  participants: number;
  results: {
    place: number;
    athleteName: string;
    club: string;
    score: number;
    city: string;
  }[];
}

// Mock data для результатів - moved outside component to avoid dependency issues
const mockResults: CompetitionResult[] = [
    // ... existing mock data ...
  ];

export default function CompetitionResultsPage() {
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<CompetitionResult[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    // Симуляція запиту до API
    setTimeout(() => {
      setResults(mockResults);
      setFilteredResults(mockResults);
      setLoading(false);
    }, 1000);
  }, []);

  const filterResults = useCallback(() => {
    let filtered = results;

    // Фільтр за змаганням
    if (selectedCompetition !== "all") {
      filtered = filtered.filter(result => result.id === selectedCompetition);
    }

    // Фільтр за категорією
    if (categoryFilter !== "all") {
      filtered = filtered.filter(result => result.category === categoryFilter);
    }

    // Пошук
    if (searchQuery) {
      filtered = filtered.filter(result =>
        result.competitionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.results.some(r =>
          r.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.club.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredResults(filtered);
  }, [results, selectedCompetition, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    filterResults();
  }, [filterResults]);

  // ... existing code ... <rest of the component>
}
