import { useState } from "react";
import DocumentCard from "../ui/DocumentCard";
import { documents } from "@/data/documents";

interface SearchViewProps {
    query: string;
    onBack: () => void;
    onViewDoc: (id: string) => void;
}

export default function SearchView({ query, onBack, onViewDoc }: SearchViewProps) {
    // Mock logic to determine the "answer" and "candidates" based on the preset query
    const getMockResponse = () => {
        if (query.includes("food")) {
            return {
                answer: "You have spent a total of **$32.20** on food in the new year. This includes purchases at McDonald's ($26.60 (incl. tax)) and some snacks at Asia Mart.",
                candidateIds: ["doc_receipt_2", "doc_receipt_4"]
            };
        }
        if (query.includes("home supplies")) {
            return {
                answer: "You have spent **$126.55** on home supplies. This includes a hardware purchase at Zheng Hui ($112.45) and office supplies at Sam Sam Trading ($14.10).",
                candidateIds: ["doc_receipt_1", "doc_receipt_3"]
            };
        }
        if (query.includes("subscriptions")) {
            return {
                answer: "Your upcoming subscriptions are:\n- **Microsoft Azure** (approx $45.32) renewing in 5 days.\n- **Adobe Creative Cloud** ($19.99) renewing in 20 days.",
                candidateIds: ["doc_sub_azure", "doc_sub_adobe"]
            };
        }
        if (query.includes("fine")) {
            return {
                answer: "Your speeding fine from Comune di Roma for **€105.00** was issued approximately 2 weeks ago. If the 5-day reduced payment window has passed, verify the due date on the notice.",
                candidateIds: ["doc_ticket_rome"]
            };
        }
        return {
            answer: "I'm sorry, I couldn't find a specific answer for that in your documents.",
            candidateIds: []
        };
    };

    const { answer, candidateIds } = getMockResponse();
    const candidates = documents.filter(doc => candidateIds.includes(doc.id));

    return (
        <div className="flex h-full flex-col p-8 overflow-y-auto">
            {/* Header / Query */}
            <header className="mb-6 flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-medium text-gray-900">"{query}"</h1>
            </header>

            {/* AI Overview Box */}
            <section className="mb-10 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            ✨
                        </div>
                        <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">AI Overview</span>
                    </div>
                    <div className="prose prose-sm text-gray-800">
                        <p className="whitespace-pre-line leading-relaxed text-lg">{answer}</p>
                    </div>
                </div>
            </section>

            {/* Evidence / Candidates */}
            <section>
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Sources & Evidence</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {candidates.map((doc) => (
                        <div key={doc.id} className="relative group">
                            <DocumentCard {...doc} onClick={() => onViewDoc(doc.id)} />
                            {/* Focus Highlight Indicator (Mock) */}
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md z-10 scale-0 group-hover:scale-100 transition-transform">
                                View Source
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
