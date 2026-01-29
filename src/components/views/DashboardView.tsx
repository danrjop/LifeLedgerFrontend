import EventCard from "../ui/EventCard";
import DocumentCard from "../ui/DocumentCard";

export default function DashboardView() {
    const events = [
        { date: "2026-02-05", title: "Return deadline (Nike)", docRef: "doc_002" },
        { date: "2026-02-12", title: "Lisbon trip check-in", docRef: "doc_003" },
        { date: "2026-03-12", title: "Adobe renewal", docRef: "doc_001" },
        { date: "2027-12-02", title: "Warranty expiry", docRef: "doc_004" },
    ];

    const documents = [
        {
            title: "Adobe Creative Cloud",
            subtitle: "Renews Mar 12, 2026 • $20.99",
            status: "Status: Done",
            badgeText: "Subscription",
        },
        {
            title: "Nike Store Receipt",
            subtitle: "Total $128.40 • Order #A1B2",
            status: "Status: Done",
            badgeText: "Receipt",
        },
        {
            title: "Lisbon Hotel Parking",
            subtitle: "Parking code inside • Check-in 5pm",
            status: "Status: Needs review",
            statusColor: "text-amber-600",
            badgeText: "Confirmations",
        },
        {
            title: "Laptop Warranty",
            subtitle: "Serial number + expiry date",
            status: "Status: Processing",
            statusColor: "text-blue-600",
            badgeText: "Warranty",
        },
    ];

    return (
        <div className="flex h-full flex-col gap-8 overflow-y-auto p-8">
            {/* Events Radar Section */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Events Radar</h2>
                    <span className="text-xs text-gray-400">Click an event → jump to source document</span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {events.map((evt, idx) => (
                        <EventCard key={idx} {...evt} />
                    ))}
                </div>
            </section>

            {/* Documents Layout - Main List + Detail Placeholder */}
            <section className="flex flex-1 gap-6 min-h-0">
                {/* Document List (Left) */}
                <div className="w-1/3 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                    <div className="flex flex-col gap-3">
                        {documents.map((doc, idx) => (
                            <DocumentCard key={idx} {...doc} />
                        ))}
                    </div>
                </div>

                {/* Detail View (Right) - Matching the mockup */}
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Adobe Creative Cloud</h2>
                            <p className="text-gray-500">Renews Mar 12, 2026 • $20.99</p>
                        </div>
                        <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Subscription</span>
                    </div>

                    {/* Extracted Data Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="text-xs text-gray-500 mb-1">Merchant</div>
                            <div className="font-semibold text-gray-900">Adobe</div>
                            <div className="text-xs text-gray-400 mt-1">conf: 0.92</div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="text-xs text-gray-500 mb-1">Amount</div>
                            <div className="font-semibold text-gray-900">$20.99</div>
                            <div className="text-xs text-gray-400 mt-1">conf: 0.88</div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="text-xs text-gray-500 mb-1">Date</div>
                            <div className="font-semibold text-gray-900">2026-03-12</div>
                            <div className="text-xs text-gray-400 mt-1">conf: 0.95</div>
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="text-xs text-gray-500 mb-1">Needs review?</div>
                            <div className="font-semibold text-gray-900">No</div>
                            <div className="text-xs text-gray-400 mt-1">conf: --</div>
                        </div>
                    </div>

                    {/* Evidence Placeholder */}
                    <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 bg-gray-50 text-sm">
                        Evidence overlay placeholder (bbox highlight on image)
                    </div>

                </div>
            </section>
        </div>
    );
}
