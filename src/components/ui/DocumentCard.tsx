interface DocumentCardProps {
    title: string;
    subtitle: string;
    status: string;
    statusColor?: string; // e.g., 'bg-green-100 text-green-700'
    badgeText?: string;
}

export default function DocumentCard({
    title,
    subtitle,
    status,
    statusColor = "text-gray-500",
    badgeText,
}: DocumentCardProps) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md cursor-pointer">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {badgeText && (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {badgeText}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500">{subtitle}</p>
                <p className={`text-xs mt-1 ${statusColor}`}>{status}</p>
            </div>
        </div>
    );
}
