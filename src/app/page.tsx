"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import DashboardView from "@/components/views/DashboardView";
import BrowseView from "@/components/views/BrowseView";
import DocumentViewer from "@/components/ui/DocumentViewer";
import SearchView from "@/components/views/SearchView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previousTab, setPreviousTab] = useState("dashboard");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPreviousTab(activeTab === "search" ? "dashboard" : activeTab);
    setActiveTab("search");
  };

  const handleBackFromSearch = () => {
    setActiveTab(previousTab);
    setSearchQuery("");
  };

  // Map sidebar tabs to BrowseView filters
  const getBrowseFilter = () => {
    switch (activeTab) {
      case "receipts": return "Receipts";
      case "subscriptions": return "Subscriptions";
      case "browse": return "All";
      default: return "All";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar activeTab={activeTab === "search" ? previousTab : activeTab} onTabChange={setActiveTab} />

      {viewingDocId && (
        <DocumentViewer documentId={viewingDocId} onClose={() => setViewingDocId(null)} />
      )}

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onSearch={handleSearch} />

        <main className="flex-1 overflow-hidden">
          {activeTab === "dashboard" && <DashboardView onViewDoc={setViewingDocId} />}

          {["browse", "receipts", "subscriptions"].includes(activeTab) && (
            <BrowseView key={activeTab} initialFilter={getBrowseFilter()} onViewDoc={setViewingDocId} />
          )}

          {activeTab === "search" && (
            <SearchView query={searchQuery} onBack={handleBackFromSearch} onViewDoc={setViewingDocId} />
          )}

          {activeTab === "warranties" && (
            <div className="flex h-full items-center justify-center text-gray-400">
              Warranties Work in progress
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
