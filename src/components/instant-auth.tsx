"use client";

import { useAuth } from "@clerk/nextjs";
import { db } from "@/lib/instantdb";
import { useEffect, useRef } from "react";

export function InstantAuth() {
  const { getToken, isSignedIn } = useAuth();
  const hasSignedIn = useRef(false);

  useEffect(() => {
    const signInToInstant = async () => {
      // Only sign in if user is signed in to Clerk and hasn't already signed in to InstantDB
      if (!isSignedIn || hasSignedIn.current) return;

      const token = await getToken();
      if (token) {
        try {
          await db.auth.signInWithIdToken({
            clientName: process.env.NEXT_PUBLIC_CLERK_INSTANT!,
            idToken: token,
          });
          hasSignedIn.current = true;
        } catch (error) {
          console.error("InstantDB signInWithIdToken error:", error);
        }
      }
    };

    // Sign out of InstantDB when user signs out of Clerk
    if (!isSignedIn && hasSignedIn.current) {
      db.auth.signOut();
      hasSignedIn.current = false;
      return;
    }

    signInToInstant();
  }, [getToken, isSignedIn]);

  return null; // This component doesn't render anything
}
