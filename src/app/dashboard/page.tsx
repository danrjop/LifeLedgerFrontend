"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import DashboardSidebar, { type FilterType } from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import EventCard from "@/components/ui/EventCard";
import DocumentCard from "@/components/ui/DocumentCard";
import DocumentViewer from "@/components/ui/DocumentViewer";
import EmptyState from "@/components/views/EmptyState";
import { documents, type Document } from "@/data/documents";

interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_PREFIXES = ["image/"];

export default function DashboardPage() {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [viewerDocId, setViewerDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedPhotos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: UploadedPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate MIME type
      if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
        alert(`"${file.name}" is not a valid image file. Please upload images only.`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }

      // TODO: Mock API call — replace with actual DB upload
      // e.g. const response = await uploadToServer(file);
      const objectUrl = URL.createObjectURL(file);

      newPhotos.push({
        id: `upload_${Date.now()}_${i}`,
        name: file.name,
        url: objectUrl,
        uploadedAt: new Date().toISOString().split("T")[0],
      });
    }

    if (newPhotos.length > 0) {
      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    }

    // Reset input so the same files can be re-selected
    e.target.value = "";
  }, []);

  // Filter documents by active filter types
  const filteredDocuments = activeFilters.size === 0
    ? documents
    : documents.filter((doc) => activeFilters.has(doc.type as FilterType));

  const hasContent = uploadedPhotos.length > 0 || documents.length > 0;

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

            {!hasContent ? (
              /* Empty State — large clickable upload box */
              <div className="rounded-2xl border-2 border-dashed border-bg-tertiary bg-bg-secondary/50 min-h-[400px] flex items-center justify-center">
                <EmptyState onUpload={triggerUpload} />
              </div>
            ) : (
              /* Photo Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Uploaded photos */}
                {uploadedPhotos.map((photo) => (
                  <article
                    key={photo.id}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-bg-tertiary/50 bg-bg-secondary p-6 transition-colors duration-200 hover:border-bg-tertiary"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-bg-tertiary">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 right-2 rounded-md bg-fg-primary/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        Uploaded
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-fg-primary line-clamp-1" title={photo.name}>
                        {photo.name}
                      </h3>
                      <span className="text-xs text-fg-tertiary">{photo.uploadedAt}</span>
                    </div>
                    <div className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium text-info bg-info/10">
                      Processing
                    </div>
                  </article>
                ))}

                {/* Mock documents */}
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
