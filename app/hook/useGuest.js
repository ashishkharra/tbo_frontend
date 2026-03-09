'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useGuest() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    } else {
      setChecking(false);
    }
  }, []);

  return checking;
}
