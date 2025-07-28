"use client";

import { useEffect, useState } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Remove any extension-added classes during hydration
  useEffect(() => {
    setMounted(true);
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  // Prevent hydration mismatch by using suppressHydrationWarning
  return (
    <div className="antialiased" suppressHydrationWarning>
      {children}
    </div>
  );
}
