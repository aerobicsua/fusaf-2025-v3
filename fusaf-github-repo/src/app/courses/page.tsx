"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
// ... existing code ... <other imports>

interface Course {
  id: string;
  title: string;
  description: string;
  type: "basic" | "advanced" | "judge" | "specialist";
  level: "beginner" | "intermediate" | "advanced" | "expert";
  duration: number; // в годинах
  price: number;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  maxParticipants: number;
  enrolled: number;
  prerequisites?: string[];
  certificate: string;
  schedule: {
    day: string;
    time: string;
    topics: string[];
  }[];
}

// Move mock data outside component to avoid dependency issues
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Базовий курс тренерів спортивної аеробіки",
    description: "Фундаментальна підготовка тренерів з основ спортивної аеробіки, методики викладання та техніки безпеки.",
    type: "basic",
    level: "beginner",
    duration: 40,
    price: 3500,
    startDate: "2024-07-15",
    endDate: "2024-07-19",
    location: "Київ, НСК Олімпійський",
    instructor: "Марина Коваленко",
    maxParticipants: 25,
    enrolled: 18,
    certificate: "Сертифікат тренера категорії C",
    schedule: [
      // ... schedule data ...
    ]
  }
  // ... rest of mock data ...
];

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляція завантаження
    setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []); // Empty dependency array is now safe since mockCourses is outside component

  useEffect(() => {
    let filtered = courses;

    // Фільтр за типом
    if (selectedType !== "all") {
      filtered = filtered.filter(course => course.type === selectedType);
    }

    // Фільтр за рівнем
    if (selectedLevel !== "all") {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Пошук
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, selectedType, selectedLevel, searchQuery]);

  // ... existing code ... <rest of the component>
}
