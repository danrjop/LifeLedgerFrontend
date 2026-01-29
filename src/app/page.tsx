"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import EmptyState from "@/components/views/EmptyState";
import DashboardView from "@/components/views/DashboardView";

export default function Home() {
  const [hasUploaded, setHasUploaded] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />

        <main className="flex-1 overflow-hidden">
          {hasUploaded ? (
            <DashboardView />
          ) : (
            <EmptyState onUpload={() => setHasUploaded(true)} />
          )}
        </main>
      </div>
    </div>
  );
}
