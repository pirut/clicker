"use client";

import { useAuth } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { useEffect } from "react";

export function InstantAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    const signInToInstant = async () => {
      const token = await getToken();
      if (token) {
        try {
          db.auth.signInWithIdToken({
              clientName: process.env.NEXT_PUBLIC_CLERK_INSTANT!,
              idToken: token
          });
        } catch (error) {
          console.error("InstantDB signInWithIdToken error:", error);
        }
      }
    };
    signInToInstant();
  }, [getToken]);

  return null; // This component doesn't render anything
}
