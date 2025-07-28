"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// ... existing code ... <other imports>

interface Club {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  athletes: number;
  trainers: number;
  achievements: string[];
  established: number;
  categories: string[];
  rating: number;
  verified: boolean;
}

// Move mock data outside component to avoid dependency issues
const mockClubs: Club[] = [
  {
    id: "1",
    name: "Динамо Київ",
    description: "Провідний спортивний клуб України з багаторічною історією та високими досягненнями у спортивній аеробіці.",
    city: "Київ",
    address: "вул. Грушевського, 1А",
    phone: "+38 (044) 123-45-67",
    email: "info@dynamo-aerobics.ua",
    website: "dynamo-aerobics.ua",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100",
    athletes: 85,
    trainers: 12,
    achievements: ["Чемпіон України 2023", "Призер Кубка Європи", "Кращий клуб року"],
    established: 1995,
    categories: ["Дитяча", "Юніорська", "Доросла", "Професійна"],
    rating: 4.9,
    verified: true
  }
  // ... rest of mock data ...
];

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляція завантаження
    setTimeout(() => {
      setClubs(mockClubs);
      setFilteredClubs(mockClubs);
      setLoading(false);
    }, 1000);
  }, []); // Empty dependency array is now safe since mockClubs is outside component

  useEffect(() => {
    let filtered = clubs;

    // Фільтр за містом
    if (selectedCity !== "all") {
      filtered = filtered.filter(club => club.city === selectedCity);
    }

    // Фільтр за категорією
    if (selectedCategory !== "all") {
      filtered = filtered.filter(club =>
        club.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }

    // Пошук
    if (searchQuery) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClubs(filtered);
  }, [clubs, selectedCity, selectedCategory, searchQuery]);

  // ... existing code ... <rest of the component>
}
