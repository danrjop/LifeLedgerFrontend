"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import DashboardSidebar, { type FilterType } from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import EventCard from "@/components/ui/EventCard";
import DocumentCard from "@/components/ui/DocumentCard";
import DocumentViewer from "@/components/ui/DocumentViewer";
import EmptyState from "@/components/views/EmptyState";
import { documents } from "@/data/documents";

interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
  s3Key: string;
  uploadedAt: string;
  status: "uploading" | "uploaded" | "failed";
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_PREFIXES = ["image/"];

export default function DashboardPage() {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [viewerDocId, setViewerDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load previously uploaded photos on mount
  useEffect(() => {
    async function loadUploads() {
      try {
        const res = await fetch("/api/uploads");
        if (!res.ok) return;
        const data = await res.json();
        setUploadedPhotos(
          data.map((item: { id: string; filename: string; url: string; s3Key: string; createdAt: string }) => ({
            id: item.id,
            name: item.filename,
            url: item.url,
            s3Key: item.s3Key,
            uploadedAt: item.createdAt.split("T")[0],
            status: "uploaded" as const,
          }))
        );
      } catch (error) {
        console.error("Failed to load uploads:", error);
      }
    }
    loadUploads();
  }, []);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedPhotos.forEach((photo) => {
        if (photo.url.startsWith("blob:")) {
          URL.revokeObjectURL(photo.url);
        }
      });
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

    const pendingPhotos: UploadedPhoto[] = validFiles.map((file, i) => ({
      id: `upload_${Date.now()}_${i}`,
      name: file.name,
      url: URL.createObjectURL(file),
      s3Key: "",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "uploading" as const,
    }));

    setUploadedPhotos((prev) => [...prev, ...pendingPhotos]);

    await Promise.allSettled(
      validFiles.map(async (file, i) => {
        const photoId = pendingPhotos[i].id;

        try {
          const res = await fetch("/api/uploads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              fileSize: file.size,
            }),
          });

          if (!res.ok) throw new Error(`Failed to get upload URL: ${res.status}`);

          const { putUrl, getUrl, key } = await res.json();

          const uploadRes = await fetch(putUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });

          if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);

          await fetch("/api/uploads/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              s3Key: key,
              filename: file.name,
              contentType: file.type,
            }),
          });

          setUploadedPhotos((prev) =>
            prev.map((p) =>
              p.id === photoId
                ? { ...p, url: getUrl, s3Key: key, status: "uploaded" as const }
                : p
            )
          );

          URL.revokeObjectURL(pendingPhotos[i].url);
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          setUploadedPhotos((prev) =>
            prev.map((p) =>
              p.id === photoId ? { ...p, status: "failed" as const } : p
            )
          );
        }
      })
    );
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
                        {photo.status === "uploading" ? "Uploading..." : photo.status === "failed" ? "Failed" : "Uploaded"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-fg-primary line-clamp-1" title={photo.name}>
                        {photo.name}
                      </h3>
                      <span className="text-xs text-fg-tertiary">{photo.uploadedAt}</span>
                    </div>
                    <div className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
                      photo.status === "uploading" ? "text-info bg-info/10" :
                      photo.status === "failed" ? "text-red-500 bg-red-500/10" :
                      "text-green-500 bg-green-500/10"
                    }`}>
                      {photo.status === "uploading" ? "Uploading..." :
                       photo.status === "failed" ? "Upload Failed" : "Processing"}
                    </div>
                  </article>
                ))}

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
