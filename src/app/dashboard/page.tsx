"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import DashboardSidebar, { type FilterType } from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import EventCard from "@/components/ui/EventCard";
import DocumentCard from "@/components/ui/DocumentCard";
import DocumentViewer from "@/components/ui/DocumentViewer";
import EmptyState from "@/components/views/EmptyState";
import { uploadAndProcess, getDocuments, type Document } from "@/lib/api-client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_PREFIXES = ["image/"];

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [viewerDocId, setViewerDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents on mount
  useEffect(() => {
    async function loadDocuments() {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDocuments();
  }, []);

  const handleFilterToggle = useCallback((filter: FilterType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  }, []);

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
        alert(`"${file.name}" is not a valid image file. Please upload images only.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }

      validFiles.push(file);
    }

    e.target.value = "";
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload and process all files at once
      await uploadAndProcess(validFiles);

      // Refresh the document list
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Filter documents by active filter types
  const filteredDocuments = activeFilters.size === 0
    ? documents
    : documents.filter((doc) => activeFilters.has(doc.type as FilterType));

  const hasContent = documents.length > 0;

  return (
    <div className="flex h-full">
      <DashboardSidebar
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader onUploadClick={triggerUpload} />

        <main className="flex-1 overflow-auto p-8">
          {/* Event Radar */}
          <section className="mb-8">
            <h2 className="text-display font-semibold text-fg-primary tracking-heading mb-4">
              Event Radar
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setViewerDocId(doc.id)}
                  className="flex-shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-2xl"
                >
                  <EventCard
                    date={doc.primaryDate}
                    title={doc.primaryEntity}
                    docRef={doc.id}
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Main Content Area */}
          <section>
            <h2 className="text-display font-semibold text-fg-primary tracking-heading mb-4">
              Documents
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-fg-secondary">Loading documents...</div>
              </div>
            ) : !hasContent ? (
              /* Empty State — large clickable upload box */
              <div className="rounded-2xl border-2 border-dashed border-bg-tertiary bg-bg-secondary/50 min-h-[400px] flex items-center justify-center">
                <EmptyState onUpload={triggerUpload} />
              </div>
            ) : (
              /* Document Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    {...doc}
                    onClick={() => setViewerDocId(doc.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="fixed bottom-8 right-8 bg-bg-primary border border-bg-tertiary rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-fg-primary font-medium">Uploading & processing...</span>
            </div>
          )}
        </main>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Document Viewer Modal */}
      {viewerDocId && (
        <DocumentViewer
          documentId={viewerDocId}
          onClose={() => setViewerDocId(null)}
        />
      )}
    </div>
  );
}
