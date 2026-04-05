"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("sessionToken") ||
      localStorage.getItem("session_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [router]);

  return checking;
}