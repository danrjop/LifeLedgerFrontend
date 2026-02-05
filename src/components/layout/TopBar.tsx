import { useState } from "react";

interface TopBarProps {
    onSearch?: (query: string) => void;
}

export default function TopBar({ onSearch }: TopBarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const presets = [
        "How much money have I spent on food in the new year?",
        "How much money have I spent on home supplies in the new year?",
        "What are my upcoming subscriptions?",
        "When is my speeding fine due?"
    ];

    const handleSelect = (query: string) => {
        setIsOpen(false);
        if (onSearch) onSearch(query);
    };

    return (
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-8 relative z-20">
            <div className="relative w-full max-w-4xl mx-auto">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full cursor-pointer items-center rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-500 mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <span className="text-sm text-gray-500">Ask a question about your documents...</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 ml-auto text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100">
                        {presets.map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(preset)}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between group"
                            >
                                <span>{preset}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-blue-500">Ask &rarr;</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
