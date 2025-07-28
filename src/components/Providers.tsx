"use client";

import { SimpleAuthProvider } from "@/components/SimpleAuthProvider";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  );
}
