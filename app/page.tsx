"use client"
import React from "react";
import { useRouter } from "next/navigation";

/**
 * Home Page Component
 * 
 * Displays the DocsMania landing page with a button to navigate to the dashboard.
 * 
 * Flow:
 * [User lands on Home] --> [Sees branding and developer info] --> [Clicks "Go to Dashboard"] --> [Navigates to /dashboard]
 * 
 * Error Handling:
 * - If navigation fails, logs error to console.
 * 
 * @module HomePage
 */

export default function Home() {
  const router = useRouter();

  /**
   * Handles navigation to the dashboard.
   * Logs the navigation attempt and any errors.
   */
  const handleGoToDashboard = () => {
    try {
      console.log("[Home] Navigating to /dashboard");
      router.push("/docs");
    } catch (error) {
      console.error("[Home] Failed to navigate to dashboard:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-sm">
        <div className="text-3xl font-extrabold tracking-tight">DocsMania</div>
        <div className="text-xs text-zinc-500">product by Novologic</div>
        <p className="mt-3 text-sm text-zinc-600">
          Developer: <span className="font-medium text-zinc-800">AmanVatsSharma</span>
        </p>
        {/* Button to go to dashboard */}
        <button
          className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2 text-white font-semibold hover:bg-zinc-800 transition"
          onClick={handleGoToDashboard}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

/**
 * Flow Chart:
 * 
 * [User lands on Home]
 *        |
 *        v
 * [Sees branding and developer info]
 *        |
 *        v
 * [Clicks "Go to Dashboard" button]
 *        |
 *        v
 * [handleGoToDashboard called]
 *        |
 *        v
 * [router.push("/dashboard")]
 *        |
 *        v
 * [Navigates to /dashboard]
 */
