interface EventCardProps {
    date: string;
    title: string;
    docRef: string;
}

export default function EventCard({ date, title, docRef }: EventCardProps) {
    return (
        <div className="flex w-64 flex-shrink-0 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div>
                <div className="mb-2 text-xs font-medium text-gray-500">{date}</div>
                <div className="text-sm font-bold text-gray-900 line-clamp-2">
                    {title}
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">doc: {docRef}</div>
        </div>
    );
}
