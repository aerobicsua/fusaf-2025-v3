"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// ... existing code ... <other imports>

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "competition" | "training" | "federation" | "athlete" | "event";
  author: string;
  publishDate: string;
  imageUrl: string;
  views: number;
  comments: number;
  tags: string[];
  featured: boolean;
}

// Move mock data outside component to avoid dependency issues
const mockArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Україна здобула золото на Чемпіонаті Європи з спортивної аеробіки",
    summary: "Збірна команда України показала блискучий результат на змаганнях у Римі, завоювавши 3 золоті медалі.",
    content: "Українські спортсмени продемонстрували високий рівень підготовки...",
    category: "competition",
    author: "Олена Петренко",
    publishDate: "2024-06-20",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    views: 1250,
    comments: 28,
    tags: ["Чемпіонат Європи", "Збірна України", "Золото"],
    featured: true
  }
  // ... rest of mock data ...
];

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляція завантаження
    setTimeout(() => {
      setArticles(mockArticles);
      setFilteredArticles(mockArticles);
      setLoading(false);
    }, 1000);
  }, []); // Empty dependency array is now safe since mockArticles is outside component

  useEffect(() => {
    let filtered = articles;

    // Фільтр за категорією
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Пошук
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, searchQuery]);

  // ... existing code ... <rest of the component>
}
