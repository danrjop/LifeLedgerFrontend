export default function TopBar() {
    const placeholderText =
        "Ask a Question. Ask goal-style questions. LifeLedger answers with evidence and links you back to the source document.";

    return (
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-8">
            <div className="flex w-full max-w-4xl mx-auto rounded-lg bg-gray-100 px-4 py-2">
                {/* Simple search icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-500 mr-3 self-center"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                </svg>
                <input
                    type="text"
                    placeholder={placeholderText}
                    className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
                />
            </div>
        </header>
    );
}
