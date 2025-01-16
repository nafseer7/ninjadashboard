"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (!isAuthenticated && !storedAuth) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, router]);

  return <>{isAuthenticated && children}</>;
};

export default ProtectedRoute;
